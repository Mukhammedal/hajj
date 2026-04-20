export function formatSheetsMigrationError(message: string) {
  if (
    message.includes("google_sheet_id") ||
    message.includes("last_synced_at") ||
    message.includes("auto_sync_enabled") ||
    message.includes("sync_logs")
  ) {
    return "Google Sheets sync migration не применена. Выполните supabase/migrations/0002_google_sheets_sync.sql в Supabase SQL Editor.";
  }

  return message;
}
