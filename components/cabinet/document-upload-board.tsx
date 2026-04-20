"use client";

import { useMemo, useRef, useState } from "react";

import { DesignIcon } from "@/components/shell/design-icons";
import { DOCUMENT_META, ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_FILE_SIZE, computeReadinessPercent } from "@/lib/documents";
import { buildDocumentRows, formatShortDate, mapNotificationTone } from "@/lib/design-cabinet";
import { cn } from "@/lib/utils";
import type { DocumentRecord, DocumentType, NotificationRecord, PilgrimReadiness } from "@/types/domain";

type LocalDoc = Pick<DocumentRecord, "type" | "fileName" | "fileUrl" | "isVerified" | "uploadedAt"> & {
  isUploading?: boolean;
};

interface DocumentUploadBoardProps {
  hasGroup: boolean;
  initialDocuments: DocumentRecord[];
  notifications?: NotificationRecord[];
  paymentComplete: boolean;
}

interface UploadResponse {
  document: DocumentRecord;
  readiness: PilgrimReadiness;
}

const isLiveUploadEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function replaceDocumentByType(documents: LocalDoc[], nextDocument: LocalDoc) {
  const filtered = documents.filter((document) => document.type !== nextDocument.type);
  return [...filtered, nextDocument];
}

function keepLatestDocuments(documents: DocumentRecord[]) {
  return documents.reduce<LocalDoc[]>((accumulator, document) => {
    if (accumulator.some((entry) => entry.type === document.type)) {
      return accumulator;
    }

    return [
      ...accumulator,
      {
        type: document.type,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        isVerified: document.isVerified,
        uploadedAt: document.uploadedAt,
      },
    ];
  }, []);
}

function uploadDocument(type: DocumentType, file: File, onProgress: (progress: number) => void) {
  return new Promise<UploadResponse>((resolve, reject) => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/cabinet/documents/upload");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(99, Math.max(8, Math.round((event.loaded / event.total) * 100))));
        return;
      }

      onProgress(55);
    };

    xhr.onerror = () => reject(new Error("Сеть недоступна. Повторите попытку."));

    xhr.onload = () => {
      const payload = xhr.response as UploadResponse | { error?: string } | null;

      if (xhr.status >= 200 && xhr.status < 300 && payload && "document" in payload) {
        onProgress(100);
        resolve(payload);
        return;
      }

      reject(new Error(payload && "error" in payload && payload.error ? payload.error : "Не удалось загрузить документ."));
    };

    xhr.send(formData);
  });
}

function resolveActionType(documents: LocalDoc[]) {
  return DOCUMENT_META.find((meta) => !documents.some((document) => document.type === meta.type))?.type ?? "vaccination";
}

export function DocumentUploadBoard({
  hasGroup,
  initialDocuments,
  notifications = [],
  paymentComplete,
}: DocumentUploadBoardProps) {
  const [localDocs, setLocalDocs] = useState<LocalDoc[]>(keepLatestDocuments(initialDocuments));
  const [confirmedReadinessPercent, setConfirmedReadinessPercent] = useState<number | null>(null);
  const [progressByType, setProgressByType] = useState<Record<string, number>>({});
  const [errorByType, setErrorByType] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const readinessPercent = useMemo(() => {
    if (confirmedReadinessPercent !== null) {
      return confirmedReadinessPercent;
    }

    const docsCount = new Set(localDocs.map((doc) => doc.type)).size;
    return computeReadinessPercent(docsCount, paymentComplete, hasGroup);
  }, [confirmedReadinessPercent, hasGroup, localDocs, paymentComplete]);

  const docsCount = new Set(localDocs.map((document) => document.type)).size;
  const progressPercent = Math.round((docsCount / DOCUMENT_META.length) * 100);
  const preferredType = resolveActionType(localDocs);
  const documentRows = buildDocumentRows(localDocs as DocumentRecord[]);
  const uploadInProgress = Object.values(progressByType).some((value) => value > 0 && value < 100);
  const activityItems = [
    ...notifications.map((notification) => ({
      detail: notification.message,
      time: formatShortDate(notification.sentAt ?? notification.scheduledAt),
      title: notification.status === "sent" ? "Уведомление отправлено" : "Напоминание поставлено",
      tone: mapNotificationTone(notification.status),
    })),
    ...localDocs
      .filter((document) => document.uploadedAt)
      .slice(0, 4)
      .map((document) => ({
        detail: `${DOCUMENT_META.find((meta) => meta.type === document.type)?.title ?? document.type} · ${document.fileName}`,
        time: formatShortDate(document.uploadedAt),
        title: document.isVerified ? "Документ принят куратором" : "Документ отправлен на проверку",
        tone: document.isVerified ? "ok" : "warn",
      })),
  ].slice(0, 5);

  function triggerUpload(type: DocumentType) {
    inputRefs.current[type]?.click();
  }

  async function handleFile(type: DocumentType, file: File | null) {
    if (!file) {
      return;
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
      setErrorByType((prev) => ({ ...prev, [type]: "Разрешены только PDF, JPG и PNG." }));
      return;
    }

    if (file.size > MAX_DOCUMENT_FILE_SIZE) {
      setErrorByType((prev) => ({ ...prev, [type]: "Максимальный размер файла — 5 МБ." }));
      return;
    }

    const previousDocument = localDocs.find((document) => document.type === type);
    const optimisticDocument: LocalDoc = {
      type,
      fileName: file.name,
      fileUrl: previousDocument?.fileUrl ?? "",
      isVerified: false,
      uploadedAt: new Date().toISOString(),
      isUploading: true,
    };

    setErrorByType((prev) => ({ ...prev, [type]: "" }));
    setConfirmedReadinessPercent(null);
    setProgressByType((prev) => ({ ...prev, [type]: 8 }));
    setLocalDocs((prev) => replaceDocumentByType(prev, optimisticDocument));

    if (!isLiveUploadEnabled) {
      window.setTimeout(() => setProgressByType((prev) => ({ ...prev, [type]: 67 })), 250);
      window.setTimeout(() => {
        setProgressByType((prev) => ({ ...prev, [type]: 100 }));
        setLocalDocs((prev) =>
          replaceDocumentByType(prev, {
            ...optimisticDocument,
            isUploading: false,
          }),
        );
      }, 550);
      return;
    }

    try {
      const response = await uploadDocument(type, file, (progress) => {
        setProgressByType((prev) => ({ ...prev, [type]: progress }));
      });

      setLocalDocs((prev) =>
        replaceDocumentByType(prev, {
          type: response.document.type,
          fileName: response.document.fileName,
          fileUrl: response.document.fileUrl,
          isVerified: response.document.isVerified,
          uploadedAt: response.document.uploadedAt,
          isUploading: false,
        }),
      );
      setConfirmedReadinessPercent(response.readiness.readinessPercent);
      window.setTimeout(() => {
        setProgressByType((prev) => ({ ...prev, [type]: 0 }));
      }, 350);
    } catch (error) {
      setProgressByType((prev) => ({ ...prev, [type]: 0 }));
      setErrorByType((prev) => ({
        ...prev,
        [type]: error instanceof Error ? error.message : "Не удалось загрузить документ.",
      }));
      setLocalDocs((prev) => {
        const filtered = prev.filter((document) => document.type !== type);
        return previousDocument ? [...filtered, previousDocument] : filtered;
      });
    }
  }

  return (
    <>
      {DOCUMENT_META.map((item) => (
        <input
          key={item.type}
          ref={(node) => {
            inputRefs.current[item.type] = node;
          }}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(event) => {
            void handleFile(item.type, event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
        />
      ))}

      <button type="button" className="dropzone" onClick={() => triggerUpload(preferredType)}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--cream-2)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 12px",
            color: "var(--muted)",
          }}
        >
          <DesignIcon name="doc" size={18} />
        </div>
        <h4>{uploadInProgress ? "Загрузка в Supabase Storage…" : "Перетащите файл сюда или выберите с диска"}</h4>
        <p>PDF, JPG, PNG · до 5 МБ · приоритетный тип: {preferredType}</p>
      </button>

      <div className="docs-body">
        <div className="docs-list">
          <div className="doc-total">
            <div>
              <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 700, color: "var(--muted)" }}>
                Прогресс
              </div>
              <div className="v">{docsCount} из 5 документов</div>
            </div>
            <div style={{ flex: 1, maxWidth: 240, marginLeft: 24 }}>
              <div className="bar em">
                <i style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 22 }}>{progressPercent}%</div>
          </div>

          {documentRows.map((row) => {
            const currentDocument = localDocs.find((document) => document.type === row.type);
            const progress = progressByType[row.type] ?? 0;
            const error = errorByType[row.type];
            const statusClass = !currentDocument ? "danger" : currentDocument.isVerified ? "success" : currentDocument.isUploading ? "warning" : "warning";
            const statusLabel = !currentDocument ? "Не загружено" : currentDocument.isVerified ? "✓ Принят" : currentDocument.isUploading ? "Загрузка" : "На проверке";

            return (
              <div key={row.type} className="doc-row">
                <div
                  className={cn("ic", !currentDocument && "border border-transparent")}
                  style={!currentDocument ? { background: "var(--danger-bg)", color: "var(--danger)" } : undefined}
                >
                  <DesignIcon name="doc" size={18} />
                </div>
                <div className="meta">
                  <h5>{row.title}</h5>
                  <div className="d">{row.detail}</div>
                  {currentDocument?.fileUrl ? (
                    <a
                      href={currentDocument.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--emerald)] no-underline"
                    >
                      Открыть файл
                    </a>
                  ) : null}
                  {progress > 0 && progress < 100 ? (
                    <div style={{ marginTop: 10 }}>
                      <div className="bar em">
                        <i style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : null}
                  {error ? <div className="mt-2 text-[11px] text-[var(--danger)]">{error}</div> : null}
                </div>
                <span className={cn("tag", statusClass)}>{statusLabel}</span>
                <button
                  type="button"
                  className={cn("btn btn-sm", currentDocument ? "btn-ghost" : "btn-dark")}
                  disabled={currentDocument?.isUploading}
                  onClick={() => triggerUpload(row.type)}
                >
                  {currentDocument?.isUploading ? "Загрузка…" : currentDocument ? "Заменить" : "Загрузить"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="activity">
          <h5>История действий</h5>
          {activityItems.map((item, index) => (
            <div key={`${item.title}-${item.time}-${index}`} className="activity-item">
              <div className={cn("dot", item.tone)} />
              <div>
                <div className="t">{item.title}</div>
                <div className="d">{item.detail}</div>
              </div>
              <div className="when">{item.time}</div>
            </div>
          ))}
          <div className="mt-5 rounded-[6px] border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-[12px] text-[var(--muted)]">
            Готовность сейчас подтверждена на <span className="text-[var(--ink)]">{readinessPercent}%</span>. После пятого документа система автоматически проверит
            статус `ready`.
          </div>
        </div>
      </div>
    </>
  );
}
