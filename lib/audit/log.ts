import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Audit log — фиксируем любое значимое изменение сущности.
 *
 * Когда логировать:
 * - Изменение статуса платежа (webhook, ручной mark-as-paid)
 * - Создание/удаление паломника, группы, оператора
 * - Верификация / отзыв верификации оператора
 * - Генерация/перегенерация договора
 * - Admin-действия (любые)
 *
 * Не логировать:
 * - Read-only операции
 * - Upload документа (это в своей собственной таблице)
 * - Регулярные cron-сервисы (иначе шумно)
 *
 * Таблица audit_events создаётся миграцией 0003.
 */

export type AuditActorType = "user" | "webhook" | "cron" | "system";

export interface AuditEvent {
  actorUserId: string | null;  // Supabase auth.users.id, null для webhook/cron
  actorType: AuditActorType;
  action: string;              // "payment.status_changed", "operator.verified", etc.
  entityType: string;          // "payment", "operator", "pilgrim", "group"
  entityId: string;
  diff?: Record<string, unknown> | null;
}

export async function logAudit(
  supabase: SupabaseClient,
  event: AuditEvent,
): Promise<void> {
  const { error } = await supabase.from("audit_events").insert({
    actor_user_id: event.actorUserId,
    actor_type: event.actorType,
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId,
    diff: event.diff ?? {},
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Не бросаем — audit не должен ломать основную операцию.
    // Но пишем в console — мониторинг должен цеплять.
    console.error("[audit] insert failed", {
      error: error.message,
      action: event.action,
      entityId: event.entityId,
    });
  }
}

/**
 * Утилита: вычислить diff между двумя объектами.
 * Полезно для логирования изменений без перечисления всех полей вручную.
 */
export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: T,
): { from: Partial<T>; to: Partial<T> } {
  const from: Partial<T> = {};
  const to: Partial<T> = {};

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    const k = key as keyof T;
    if (before[k] !== after[k]) {
      from[k] = before[k];
      to[k] = after[k];
    }
  }

  return { from, to };
}
