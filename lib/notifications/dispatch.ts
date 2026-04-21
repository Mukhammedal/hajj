import "server-only";

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isWhapiConfigured, normalizeWhatsAppRecipient, sendWhapiTextMessage } from "@/lib/whatsapp";

const BATCH_SIZE = 5;
const MIN_BATCH_DELAY_MS = 1000;
const SEND_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

export type NotificationChannel = "whatsapp" | "sms" | "in_app";
export type NotificationType =
  | "reminder_docs"
  | "reminder_payment"
  | "reminder_flight"
  | "welcome"
  | "checklist";

export interface DispatchTarget {
  id: string;
  phone: string | null;
}

export interface DispatchResult {
  totalCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  queuedCount: number;
  whapiEnabled: boolean;
  error: Error | null;
}

interface DispatchArgs {
  supabase: SupabaseClient;
  operatorId: string;
  pilgrims: DispatchTarget[];
  channel: NotificationChannel;
  type: NotificationType;
  message: string;
  idempotencyWindow?: "hour" | "day";
}

function normalizeMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ");
}

function computeIdempotencyKey(
  pilgrimId: string,
  type: NotificationType,
  message: string,
  window: "hour" | "day",
): string {
  const now = new Date();
  const bucket =
    window === "hour"
      ? `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}`
      : `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;

  return createHash("sha256")
    .update(`${pilgrimId}:${type}:${normalizeMessage(message)}:${bucket}`)
    .digest("hex");
}

async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function sendWithTimeout(to: string, body: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await Promise.race([
      sendWhapiTextMessage({ to, body }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Whapi timeout")), timeoutMs + 500),
      ),
    ]);
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}

async function sendWithRetry(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await sendWithTimeout(to, body, SEND_TIMEOUT_MS);
      return { ok: true };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_RETRIES) {
        await sleep(300 * Math.pow(3, attempt));
      }
    }
  }

  return { ok: false, error: lastError };
}

export async function dispatchNotifications({
  channel,
  message,
  operatorId,
  pilgrims,
  supabase,
  type,
  idempotencyWindow = "hour",
}: DispatchArgs): Promise<DispatchResult> {
  const whapiEnabled = channel === "whatsapp" && isWhapiConfigured();
  const totalCount = pilgrims.length;

  const rowsToInsert = pilgrims.map((pilgrim) => ({
    pilgrim_id: pilgrim.id,
    operator_id: operatorId,
    channel,
    type,
    message,
    status: "queued" as const,
    scheduled_at: new Date().toISOString(),
    sent_at: null,
    idempotency_key: computeIdempotencyKey(pilgrim.id, type, message, idempotencyWindow),
  }));

  const { data: insertedRows, error: insertError } = await supabase
    .from("notifications")
    .upsert(rowsToInsert, {
      onConflict: "pilgrim_id,idempotency_key",
      ignoreDuplicates: true,
    })
    .select("id, pilgrim_id, idempotency_key");

  if (insertError) {
    return {
      totalCount,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
      queuedCount: 0,
      whapiEnabled,
      error: new Error(insertError.message),
    };
  }

  const insertedByPilgrim = new Map((insertedRows ?? []).map((row) => [row.pilgrim_id, row]));
  const skippedCount = totalCount - insertedByPilgrim.size;

  if (!whapiEnabled) {
    return {
      totalCount,
      sentCount: 0,
      failedCount: 0,
      skippedCount,
      queuedCount: insertedByPilgrim.size,
      whapiEnabled,
      error: null,
    };
  }

  let sentCount = 0;
  let failedCount = 0;
  const statusUpdates: Array<{ id: string; status: "sent" | "failed"; sent_at: string | null }> =
    [];
  const nowIso = () => new Date().toISOString();

  const targets = pilgrims.filter((p) => insertedByPilgrim.has(p.id));

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batchStart = Date.now();
    const batch = targets.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (pilgrim) => {
        const notificationRow = insertedByPilgrim.get(pilgrim.id);
        if (!notificationRow) return null;

        const recipient = normalizeWhatsAppRecipient(pilgrim.phone ?? "");
        if (!recipient) {
          return { id: notificationRow.id, status: "failed" as const, sent_at: null };
        }

        const result = await sendWithRetry(recipient, message);
        return result.ok
          ? { id: notificationRow.id, status: "sent" as const, sent_at: nowIso() }
          : { id: notificationRow.id, status: "failed" as const, sent_at: null };
      }),
    );

    for (const result of batchResults) {
      if (!result) continue;
      statusUpdates.push(result);
      if (result.status === "sent") sentCount += 1;
      else failedCount += 1;
    }

    const elapsed = Date.now() - batchStart;
    if (i + BATCH_SIZE < targets.length && elapsed < MIN_BATCH_DELAY_MS) {
      await sleep(MIN_BATCH_DELAY_MS - elapsed);
    }
  }

  const sentIds = statusUpdates.filter((u) => u.status === "sent").map((u) => u.id);
  const failedIds = statusUpdates.filter((u) => u.status === "failed").map((u) => u.id);

  if (sentIds.length) {
    await supabase
      .from("notifications")
      .update({ status: "sent", sent_at: nowIso() })
      .in("id", sentIds);
  }
  if (failedIds.length) {
    await supabase.from("notifications").update({ status: "failed" }).in("id", failedIds);
  }

  return {
    totalCount,
    sentCount,
    failedCount,
    skippedCount,
    queuedCount: 0,
    whapiEnabled,
    error: null,
  };
}
