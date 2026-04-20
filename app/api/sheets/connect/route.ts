import { NextResponse } from "next/server";
import { z } from "zod";

import { extractSheetIdFromUrl, fetchSheetSnapshot } from "@/lib/google-sheets";
import { resolveOperatorAccess } from "@/lib/operator-access";
import { detectMappedColumns } from "@/lib/sheet-mapper";
import { formatSheetsMigrationError } from "@/lib/sheets-errors";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const connectSchema = z.object({
  operator_id: z.string().uuid().optional(),
  sheet_url: z.string().min(1, "Передайте ссылку Google Sheets"),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = connectSchema.safeParse(payload);

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

  const sheetId = extractSheetIdFromUrl(parsed.data.sheet_url);

  if (!sheetId) {
    return NextResponse.json(
      {
        success: false,
        error: "Не удалось извлечь sheet ID из ссылки.",
      },
      { status: 400 },
    );
  }

  const snapshot = await fetchSheetSnapshot(sheetId);

  if (!snapshot.sheetName) {
    return NextResponse.json(
      {
        success: false,
        error: "Не удалось прочитать Google Sheet. Проверьте доступ сервисного аккаунта.",
      },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { error: updateError } = await supabase
    .from("operators")
    .update({
      google_sheet_id: sheetId,
      auto_sync_enabled: true,
    })
    .eq("id", access.operatorId);

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        error: formatSheetsMigrationError(updateError.message),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    sheet_name: snapshot.sheetName,
    columns_detected: detectMappedColumns(snapshot.headers),
  });
}
