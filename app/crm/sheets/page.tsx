import { CrmTopbar } from "@/components/crm/crm-topbar";
import { SheetsControls } from "@/components/crm/sheets-controls";
import { getSheetsHistoryRows, sheetsMappingRows, type SyncLogLike } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { resolveOperatorAccess } from "@/lib/operator-access";
import { createClient } from "@/lib/supabase/server";

export default async function CrmSheetsPage() {
  const crm = await loadCrmBundle();
  const access = await resolveOperatorAccess();

  if (!crm || !access.operatorId) {
    return null;
  }

  const supabase = createClient();
  let sheetState: {
    autoSyncEnabled: boolean;
    googleSheetId: string | null;
    lastSyncedAt: string | null;
  } = {
    autoSyncEnabled: false,
    googleSheetId: null,
    lastSyncedAt: null,
  };
  let logs: SyncLogLike[] = [];

  try {
    const [{ data: operatorState }, { data: syncLogs }] = await Promise.all([
      supabase
        .from("operators")
        .select("google_sheet_id, last_synced_at, auto_sync_enabled")
        .eq("id", access.operatorId)
        .maybeSingle(),
      supabase.from("sync_logs").select("*").eq("operator_id", access.operatorId).order("synced_at", { ascending: false }).limit(10),
    ]);

    sheetState = {
      autoSyncEnabled: operatorState?.auto_sync_enabled ?? false,
      googleSheetId: operatorState?.google_sheet_id ?? null,
      lastSyncedAt: operatorState?.last_synced_at ?? null,
    };
    logs = (syncLogs ?? []) as SyncLogLike[];
  } catch {
    logs = [];
  }

  const historyRows = getSheetsHistoryRows(logs);

  return (
    <>
      <CrmTopbar
        title={
          <>
            Google Sheets · <em>интеграция.</em>
          </>
        }
        actions={
          <a className="btn btn-ghost btn-sm" href="https://developers.google.com/sheets/api" rel="noreferrer" target="_blank">
            Документация API
          </a>
        }
      />

      <section className="sheets-hero">
        <span className="eyebrow dot">Интеграция · {sheetState.googleSheetId ? "активна" : "не подключена"}</span>
        <h1>
          Синхронизация с <em>Google Sheets.</em>
        </h1>
        <p>Подключите вашу таблицу — данные будут обновляться автоматически, новые паломники создаются, существующие обновляются, ошибки пишутся в лог.</p>
      </section>

      <div className="sheets-body">
        <div className={`gs-card ${sheetState.googleSheetId ? "ok" : ""}`}>
          <div className="gs-connected-grid">
            <div>
              <h3>Подключено: <em>{sheetState.googleSheetId ? "Google Sheet" : "таблица не выбрана"}</em></h3>
              <p className="desc">{sheetState.googleSheetId ?? "Вставьте ссылку на Google Sheets и подключите её к оператору."}</p>
              <div className="gs-kv-row">
                <div className="gs-kv">
                  <div className="k">Последняя синхронизация</div>
                  <div className="v">{sheetState.lastSyncedAt ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(sheetState.lastSyncedAt)) : "ещё не запускалась"}</div>
                </div>
                <div className="gs-kv">
                  <div className="k">Следующая синхронизация</div>
                  <div className="v">{sheetState.autoSyncEnabled ? "по cron / вручную" : "выключена"}</div>
                </div>
                <div className="gs-kv">
                  <div className="k">Частота</div>
                  <div className="v">каждые 15 минут</div>
                </div>
                <div className="gs-kv">
                  <div className="k">Webhook</div>
                  <div className="v">{sheetState.autoSyncEnabled ? "активен" : "не включён"}</div>
                </div>
              </div>
              <div className="gs-toggle">
                <div className="sw" />
                <div style={{ flex: 1 }}>
                  <div className="t">Автосинхронизация {sheetState.autoSyncEnabled ? "включена" : "выключена"}</div>
                  <div className="s">Система использует `connect/sync/sync-all` API и пишет результаты в `sync_logs`.</div>
                </div>
              </div>
              <SheetsControls connectedSheetId={sheetState.googleSheetId} operatorId={access.operatorId} />
            </div>

            <div className="gs-actions">
              <button className="gs-btn-outline" type="button">
                Открыть таблицу
              </button>
              <button className="gs-btn-outline" type="button">
                Проверить доступ
              </button>
              <div className="gs-progress">
                <i style={{ width: sheetState.googleSheetId ? "78%" : "18%" }} />
              </div>
              <div style={{ color: "var(--muted)", fontFamily: "var(--f-serif)", fontSize: 11, fontStyle: "italic", textAlign: "center" }}>
                {sheetState.googleSheetId ? "Интеграция активна и готова к синку." : "Ожидает подключения."}
              </div>
            </div>
          </div>
        </div>

        <div className="gs-card">
          <h3 style={{ marginBottom: 4 }}>Обнаруженные колонки</h3>
          <p className="desc">Система автоматически сопоставляет заголовки с полями CRM. Блок ниже повторяет mapping из sync-service.</p>
          <table className="gs-mapping">
            <thead>
              <tr>
                <th>Колонка в таблице</th>
                <th>Поле в системе</th>
                <th style={{ width: 140 }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {sheetsMappingRows.map((row) => (
                <tr key={row.header}>
                  <td><b>{row.header}</b></td>
                  <td><code>{row.crmField}</code></td>
                  <td><span className={`tag ${row.tone}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="gs-card">
          <h3 style={{ marginBottom: 16 }}>История синхронизаций</h3>
          <table className="gs-history">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Создано</th>
                <th>Обновлено</th>
                <th>Пропущено</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.length ? (
                historyRows.map((row) => (
                  <tr key={row.date}>
                    <td className="date">{row.date}</td>
                    <td>{row.created}</td>
                    <td>{row.updated}</td>
                    <td>{row.skipped}</td>
                    <td><span className={`tag ${row.hasErrors ? "danger" : "success"}`}>{row.hasErrors ? "Ошибка" : "Успешно"}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="date">—</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td><span className="tag">пусто</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="gs-instructions">
          <div className="head">
            <div className="gs-logo" style={{ borderRadius: 6, fontSize: 13, height: 28, width: 28 }}>G</div>
            <h4>Как подготовить таблицу?</h4>
            <span className="chev">развернуть ›</span>
          </div>
          <div className="content">
            <ol className="gs-steps">
              <li>Первая строка — заголовки колонок.</li>
              <li>Назовите колонки: <code>ФИО · Телефон · ИИН · Сумма · Статус · Группа</code>.</li>
              <li>Откройте доступ сервисному аккаунту или по ссылке для чтения.</li>
              <li>Вставьте URL выше и запустите подключение.</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
