import { Buffer } from "node:buffer";

import { NextResponse } from "next/server";

import {
  MAX_DOCUMENT_FILE_SIZE,
  buildDocumentStoragePath,
  computeReadinessFromDocuments,
  isAllowedDocumentMimeType,
  isStorageObjectPath,
} from "@/lib/documents";
import { createClient } from "@/lib/supabase/server";
import type { DocumentRecord, DocumentType, PilgrimReadiness } from "@/types/domain";

type DocumentRow = {
  file_name: string;
  file_url: string;
  id: string;
  is_verified: boolean;
  pilgrim_id: string;
  type: DocumentType;
  uploaded_at: string;
};

type ReadinessRow = {
  docs_count: number;
  is_in_group: boolean;
  is_payment_complete: boolean;
  is_ready: boolean;
  pilgrim_id: string;
  readiness_percent: number;
};

export const runtime = "nodejs";

function toDocumentRecord(row: DocumentRow, fileUrl: string): DocumentRecord {
  return {
    id: row.id,
    pilgrimId: row.pilgrim_id,
    type: row.type,
    fileUrl,
    fileName: row.file_name,
    isVerified: row.is_verified,
    uploadedAt: row.uploaded_at,
  };
}

function toReadiness(row: ReadinessRow): PilgrimReadiness {
  return {
    pilgrimId: row.pilgrim_id,
    docsCount: row.docs_count,
    isPaymentComplete: row.is_payment_complete,
    isInGroup: row.is_in_group,
    readinessPercent: row.readiness_percent,
    isReady: row.is_ready,
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function resolveFallbackReadiness(supabase: ReturnType<typeof createClient>, pilgrimId: string) {
  const [{ data: documentRows }, { data: paymentRows }, { data: groupRows }] = await Promise.all([
    supabase.from("documents").select("type").eq("pilgrim_id", pilgrimId),
    supabase.from("payments").select("status").eq("pilgrim_id", pilgrimId),
    supabase.from("pilgrim_groups").select("group_id").eq("pilgrim_id", pilgrimId).limit(1),
  ]);

  return computeReadinessFromDocuments(
    pilgrimId,
    ((documentRows ?? []) as { type: DocumentType }[]).map((row) => ({ type: row.type })),
    ((paymentRows ?? []) as { status: string }[]).some((row) => row.status === "paid"),
    Boolean(groupRows?.length),
  );
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Требуется авторизация.", 401);
  }

  const { data: pilgrimProfile } = await supabase.from("pilgrim_profiles").select("id").eq("user_id", user.id).maybeSingle();

  if (!pilgrimProfile?.id) {
    return jsonError("Профиль паломника не найден.", 404);
  }

  const formData = await request.formData();
  const typeValue = formData.get("type");
  const fileValue = formData.get("file");

  if (typeof typeValue !== "string") {
    return jsonError("Не указан тип документа.", 400);
  }

  if (!(fileValue instanceof File)) {
    return jsonError("Файл не найден.", 400);
  }

  const type = typeValue as DocumentType;

  if (!["passport", "medical_certificate", "photo", "questionnaire", "vaccination"].includes(type)) {
    return jsonError("Неверный тип документа.", 400);
  }

  if (!isAllowedDocumentMimeType(fileValue.type)) {
    return jsonError("Разрешены только PDF, JPG и PNG.", 400);
  }

  if (fileValue.size > MAX_DOCUMENT_FILE_SIZE) {
    return jsonError("Максимальный размер файла — 5 МБ.", 400);
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("documents")
    .select("*")
    .eq("pilgrim_id", pilgrimProfile.id)
    .eq("type", type)
    .order("uploaded_at", { ascending: false });

  if (existingError) {
    return jsonError("Не удалось проверить текущий документ.", 500);
  }

  const existingRow = (existingRows?.[0] as DocumentRow | undefined) ?? null;
  const oldStoragePath = existingRow?.file_url ?? "";
  const storagePath = buildDocumentStoragePath(pilgrimProfile.id, type, fileValue.name);
  const fileBuffer = Buffer.from(await fileValue.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, fileBuffer, {
    cacheControl: "3600",
    contentType: fileValue.type,
    upsert: false,
  });

  if (uploadError) {
    return jsonError("Не удалось загрузить файл в хранилище.", 500);
  }

  let persistedRow: DocumentRow | null = null;

  if (existingRow) {
    const { data: updatedRow, error: updateError } = await supabase
      .from("documents")
      .update({
        file_name: fileValue.name,
        file_url: storagePath,
        is_verified: false,
        uploaded_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id)
      .select("*")
      .maybeSingle();

    if (updateError || !updatedRow) {
      await supabase.storage.from("documents").remove([storagePath]);
      return jsonError("Не удалось обновить запись документа.", 500);
    }

    persistedRow = updatedRow as DocumentRow;
  } else {
    const { data: insertedRow, error: insertError } = await supabase
      .from("documents")
      .insert({
        pilgrim_id: pilgrimProfile.id,
        type,
        file_url: storagePath,
        file_name: fileValue.name,
        is_verified: false,
      })
      .select("*")
      .maybeSingle();

    if (insertError || !insertedRow) {
      await supabase.storage.from("documents").remove([storagePath]);
      return jsonError("Не удалось создать запись документа.", 500);
    }

    persistedRow = insertedRow as DocumentRow;
  }

  if (existingRow && isStorageObjectPath(oldStoragePath) && oldStoragePath !== storagePath) {
    await supabase.storage.from("documents").remove([oldStoragePath]);
  }

  if (!persistedRow) {
    return jsonError("Не удалось сохранить документ.", 500);
  }

  const [{ data: signedUrlData }, { data: readinessRow, error: readinessError }] = await Promise.all([
    supabase.storage.from("documents").createSignedUrl(storagePath, 60 * 60),
    supabase.from("pilgrim_readiness_view").select("*").eq("pilgrim_id", pilgrimProfile.id).maybeSingle(),
  ]);

  const readiness =
    !readinessError && readinessRow
      ? toReadiness(readinessRow as ReadinessRow)
      : await resolveFallbackReadiness(supabase, pilgrimProfile.id);

  return NextResponse.json({
    document: toDocumentRecord(persistedRow, signedUrlData?.signedUrl ?? storagePath),
    readiness,
  });
}
