import type { DocumentRecord, DocumentType, PilgrimReadiness } from "@/types/domain";

export const DOCUMENT_META: { type: DocumentType; title: string; hint: string }[] = [
  { type: "passport", title: "Паспорт", hint: "PDF или JPG, разворот" },
  { type: "medical_certificate", title: "Медицинская справка", hint: "PDF, заверенная клиникой" },
  { type: "photo", title: "Фотография", hint: "JPG или PNG, светлый фон" },
  { type: "questionnaire", title: "Анкета", hint: "PDF, подписанный вариант" },
  { type: "vaccination", title: "Вакцинация", hint: "PDF или JPG" },
];

export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_DOCUMENT_FILE_SIZE = 5 * 1024 * 1024;

export function isAllowedDocumentMimeType(value: string) {
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(value as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number]);
}

export function isStorageObjectPath(value: string) {
  return Boolean(value) && !/^https?:\/\//i.test(value) && !value.startsWith("data:");
}

export function buildDocumentStoragePath(pilgrimId: string, type: DocumentType, fileName: string) {
  const cleanName = sanitizeDocumentFileName(fileName);
  return `${pilgrimId}/${type}/${Date.now()}-${cleanName}`;
}

export function sanitizeDocumentFileName(fileName: string) {
  const trimmed = fileName.trim();
  const parts = trimmed.split(".");
  const extension = parts.length > 1 ? parts.pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ?? "" : "";
  const baseName = (parts.join(".") || trimmed)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const normalizedBase = baseName || "document";
  return extension ? `${normalizedBase}.${extension}` : normalizedBase;
}

export function computeReadinessPercent(docsCount: number, isPaymentComplete: boolean, isInGroup: boolean) {
  return Math.round(((docsCount + Number(isPaymentComplete) + Number(isInGroup)) / 7) * 100);
}

export function computeReadinessFromDocuments(
  pilgrimId: string,
  documents: Pick<DocumentRecord, "type">[],
  isPaymentComplete: boolean,
  isInGroup: boolean,
): PilgrimReadiness {
  const docsCount = new Set(documents.map((document) => document.type)).size;

  return {
    pilgrimId,
    docsCount,
    isPaymentComplete,
    isInGroup,
    readinessPercent: computeReadinessPercent(docsCount, isPaymentComplete, isInGroup),
    isReady: docsCount === DOCUMENT_META.length && isPaymentComplete && isInGroup,
  };
}
