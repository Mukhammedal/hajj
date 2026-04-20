import { NextResponse } from "next/server";

import { formatSheetsMigrationError } from "@/lib/sheets-errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncSheetToSupabase } from "@/lib/sync-service";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createAdminClient();
  const { data: operators, error } = await supabase
    .from("operators")
    .select("id, google_sheet_id, auto_sync_enabled")
    .not("google_sheet_id", "is", null)
    .eq("auto_sync_enabled", true);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: formatSheetsMigrationError(error.message),
      },
      { status: 500 },
    );
  }

  const results = [];
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const operator of operators ?? []) {
    const sheetId = operator.google_sheet_id as string | null;

    if (!sheetId) {
      continue;
    }

    const result = await syncSheetToSupabase(operator.id as string, sheetId);
    totalCreated += result.created;
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    totalErrors += result.errors.length;
    results.push({
      operator_id: operator.id,
      ...result,
    });
  }

  return NextResponse.json({
    success: true,
    operators_synced: results.length,
    total_created: totalCreated,
    total_updated: totalUpdated,
    total_skipped: totalSkipped,
    total_errors: totalErrors,
    results,
  });
}
