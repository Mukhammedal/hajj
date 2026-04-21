import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Верификация webhook-подписи по HMAC-SHA256.
 *
 * Использование:
 *   1. Получаем raw body (string или Buffer) ДО парсинга JSON.
 *   2. Читаем заголовок подписи (имя зависит от провайдера: X-Signature / X-Kaspi-Signature / и т.п.).
 *   3. Вызываем verifyWebhookSignature(body, signature, secret).
 *   4. Только если вернулось true — обрабатываем payload.
 *
 * Secret хранится в env: PAYMENTS_WEBHOOK_SECRET (разный для kaspi/halyk — используем разные env vars).
 */

export interface WebhookVerificationResult {
  ok: boolean;
  reason?: string;
}

export function verifyWebhookSignature(
  rawBody: string | Buffer,
  providedSignature: string | null | undefined,
  secret: string | undefined,
): WebhookVerificationResult {
  if (!secret) {
    return { ok: false, reason: "Webhook secret не сконфигурирован на сервере." };
  }

  if (!providedSignature) {
    return { ok: false, reason: "Отсутствует заголовок подписи." };
  }

  // Нормализуем формат. Некоторые провайдеры шлют "sha256=abc..." — отрезаем префикс.
  const cleanSignature = providedSignature.replace(/^sha256=/i, "").trim();

  if (!/^[a-f0-9]{64}$/i.test(cleanSignature)) {
    return { ok: false, reason: "Формат подписи некорректен." };
  }

  const expected = createHmac("sha256", secret)
    .update(typeof rawBody === "string" ? rawBody : rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(cleanSignature, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return { ok: false, reason: "Длина подписи не совпадает." };
  }

  const match = timingSafeEqual(expectedBuffer, providedBuffer);

  return match ? { ok: true } : { ok: false, reason: "Подпись не совпадает." };
}

/**
 * Достаёт raw body из Request — нужно именно до вызова request.json(),
 * иначе подпись посчитается по другой байт-строке (лишние пробелы, порядок ключей).
 */
export async function readRawBody(request: Request): Promise<string> {
  return await request.text();
}
