import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveOperatorAccess } from "@/lib/operator-access";
import { formatSheetsMigrationError } from "@/lib/sheets-errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncSheetToSupabase } from "@/lib/sync-service";

export const runtime = "nodejs";

const syncSchema = z.object({
  operator_id: z.string().uuid(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = syncSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const access = await resolveOperatorAccess(parsed.data.operator_id);

  if (!access.operatorId) {
    return NextResponse.json(
      {
        success: false,
        error: access.error,
      },
      { status: access.status },
    );
  }

  const supabase = createAdminClient();
  const { data: operator, error: operatorError } = await supabase
    .from("operators")
    .select("google_sheet_id")
    .eq("id", access.operatorId)
    .maybeSingle();

  if (operatorError || !operator?.google_sheet_id) {
    return NextResponse.json(
      {
        success: false,
        error: formatSheetsMigrationError(operatorError?.message ?? "У оператора не подключён Google Sheet."),
      },
      { status: 400 },
    );
  }

  const result = await syncSheetToSupabase(access.operatorId, operator.google_sheet_id);

  return NextResponse.json({
    success: true,
    ...result,
  });
}
