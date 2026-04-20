"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, ExternalLink, FileUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_META,
  MAX_DOCUMENT_FILE_SIZE,
  computeReadinessPercent,
} from "@/lib/documents";
import { cn } from "@/lib/utils";
import type { DocumentRecord, DocumentType, PilgrimReadiness } from "@/types/domain";

type LocalDoc = Pick<DocumentRecord, "type" | "fileName" | "fileUrl" | "isVerified" | "uploadedAt"> & {
  isUploading?: boolean;
};

interface DocumentUploadBoardProps {
  initialDocuments: DocumentRecord[];
  paymentComplete: boolean;
  hasGroup: boolean;
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

export function DocumentUploadBoard({ initialDocuments, paymentComplete, hasGroup }: DocumentUploadBoardProps) {
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
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="shell-panel p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold">Загрузка документов</p>
            <p className="mt-2 text-sm text-muted-foreground">Валидация идёт сразу: формат PDF/JPG/PNG и размер до 5 МБ.</p>
          </div>
          <Badge variant="secondary">Моментальное обновление готовности</Badge>
        </div>

        <div className="grid gap-4">
          {DOCUMENT_META.map((item) => {
            const uploaded = localDocs.find((doc) => doc.type === item.type);
            const progress = progressByType[item.type] ?? 0;
            const error = errorByType[item.type];

            return (
              <div key={item.type} className="subtle-panel p-4">
                <input
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{item.title}</p>
                      {uploaded?.isVerified ? (
                        <Badge variant="success">Проверено</Badge>
                      ) : uploaded?.isUploading ? (
                        <Badge variant="secondary">Загрузка</Badge>
                      ) : uploaded ? (
                        <Badge variant="warning">На проверке</Badge>
                      ) : (
                        <Badge variant="muted">Не загружено</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.hint}</p>
                    {uploaded ? <p className="mt-2 text-sm text-foreground">{uploaded.fileName}</p> : null}
                    {uploaded?.fileUrl ? (
                      <a
                        href={uploaded.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Открыть файл
                      </a>
                    ) : null}
                    {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
                  </div>
                  <Button variant="outline" disabled={uploaded?.isUploading} onClick={() => triggerUpload(item.type)}>
                    <FileUp className="h-4 w-4" />
                    {uploaded?.isUploading ? "Загрузка..." : uploaded ? "Заменить" : "Загрузить"}
                  </Button>
                </div>
                {progress > 0 && progress < 100 ? <Progress className="mt-4" value={progress} /> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="shell-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-semibold">Готовность к вылету</p>
            <p className="mt-2 text-sm text-muted-foreground">Процент обновляется оптимистично сразу и затем подтверждается из БД.</p>
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-3xl text-primary">
            {readinessPercent}%
          </div>
        </div>

        <Progress className="mt-6" value={readinessPercent} />

        <div className="mt-8 grid gap-3">
          <StatusRow
            label="Полный пакет документов"
            complete={new Set(localDocs.map((doc) => doc.type)).size === DOCUMENT_META.length}
          />
          <StatusRow label="Оплата закрыта" complete={paymentComplete} />
          <StatusRow label="Группа назначена" complete={hasGroup} />
        </div>

        <div className="mt-8 subtle-panel p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Как только все 5 типов документов загружены, оплата отмечена как <span className="text-foreground">paid</span> и
            паломник привязан к группе, система переводит статус в <span className="text-foreground">ready</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3",
        complete ? "border-success/25 bg-success/10" : "border-white/10 bg-white/5",
      )}
    >
      <span className="text-sm">{label}</span>
      {complete ? (
        <span className="inline-flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Готово
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 text-sm text-warning">
          <Clock3 className="h-4 w-4" />
          В ожидании
        </span>
      )}
    </div>
  );
}
