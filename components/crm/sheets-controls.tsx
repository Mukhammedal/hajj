"use client";

import { useState, useTransition } from "react";

interface SheetsControlsProps {
  connectedSheetId: string | null;
  operatorId: string;
}

export function SheetsControls({ connectedSheetId, operatorId }: SheetsControlsProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function connectSheet() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/sheets/connect", {
        body: JSON.stringify({
          operator_id: operatorId,
          sheet_url: sheetUrl,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as
        | {
            columns_detected?: string[];
            error?: string;
            sheet_name?: string;
            success?: boolean;
          }
        | null;

      if (!response.ok || !result?.success) {
        setMessage(result?.error ?? "Не удалось подключить таблицу.");
        return;
      }

      setMessage(`Подключено: ${result.sheet_name ?? "Google Sheet"}. Обнаружено колонок: ${result.columns_detected?.length ?? 0}.`);
      setSheetUrl("");
    });
  }

  function syncNow() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/sheets/sync", {
        body: JSON.stringify({
          operator_id: operatorId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as
        | {
            created?: number;
            error?: string;
            skipped?: number;
            success?: boolean;
            updated?: number;
          }
        | null;

      if (!response.ok || !result?.success) {
        setMessage(result?.error ?? "Синхронизация завершилась с ошибкой.");
        return;
      }

      setMessage(`Синк завершён: создано ${result.created ?? 0}, обновлено ${result.updated ?? 0}, пропущено ${result.skipped ?? 0}.`);
    });
  }

  return (
    <>
      <div className="row g12" style={{ marginTop: 18 }}>
        <input
          className="input"
          onChange={(event) => setSheetUrl(event.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          style={{ flex: 1, minWidth: 280 }}
          value={sheetUrl}
        />
        <button className="gs-btn-outline" disabled={pending || !sheetUrl.trim()} onClick={connectSheet} type="button">
          {pending ? "Подключаем..." : connectedSheetId ? "Переподключить" : "Подключить"}
        </button>
        <button className="gs-btn-outline" disabled={pending || !connectedSheetId} onClick={syncNow} type="button">
          {pending ? "Синхронизируем..." : "Синхронизировать сейчас"}
        </button>
      </div>
      {message ? (
        <div className="gs-helper" style={{ marginTop: 16 }}>
          <b>Статус:</b> {message}
        </div>
      ) : null}
    </>
  );
}
