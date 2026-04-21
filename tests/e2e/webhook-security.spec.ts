import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";

/**
 * P0 SECURITY: Webhook signature verification.
 *
 * Эти тесты валидны ТОЛЬКО после установки improvements pack
 * (защищённый /api/webhooks/payments с HMAC).
 *
 * До этого — провалятся. И это сигнал, что safety pack ещё не применён.
 */

const TEST_SECRET = process.env.E2E_TEST_WEBHOOK_SECRET ?? "";

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

test.describe("webhook security: верификация подписи", () => {
  test.skip(
    !TEST_SECRET,
    "E2E_TEST_WEBHOOK_SECRET не задан — пропускаем webhook security tests",
  );

  test("SEC-01: POST без подписи → 401", async ({ request }) => {
    const response = await request.post("/api/webhooks/payments", {
      data: {
        payment_id: "00000000-0000-0000-0000-000000000000",
        provider: "test",
        status: "paid",
        paid_amount: 100000,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    // Проверяем, что не раскрываем детали причины атакующему
    expect(body.error).toMatch(/signature|verification/i);
    expect(body.error).not.toMatch(/expected|secret|config/i);
  });

  test("SEC-01b: POST с невалидной подписью → 401", async ({ request }) => {
    const response = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": "sha256=" + "0".repeat(64),
      },
      data: {
        payment_id: "00000000-0000-0000-0000-000000000000",
        provider: "test",
        status: "paid",
      },
    });

    expect(response.status()).toBe(401);
  });

  test("SEC-01c: POST без provider → 400", async ({ request }) => {
    const response = await request.post("/api/webhooks/payments", {
      data: {
        payment_id: "00000000-0000-0000-0000-000000000000",
        status: "paid",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("SEC-01d: POST с unknown provider → 400", async ({ request }) => {
    const body = JSON.stringify({
      payment_id: "00000000-0000-0000-0000-000000000000",
      provider: "evil-provider",
      status: "paid",
    });
    const signature = signBody(body, TEST_SECRET);

    const response = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": `sha256=${signature}`,
      },
      data: body,
    });

    expect(response.status()).toBe(400);
  });

  test("SEC-01e: timing-safe compare — одинаковая длина, неверные байты", async ({
    request,
  }) => {
    // Полноразмерная hex-строка (64 символа), но неверная
    const fakeSignature = "a".repeat(64);

    const response = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": `sha256=${fakeSignature}`,
      },
      data: {
        payment_id: "00000000-0000-0000-0000-000000000000",
        provider: "test",
        status: "paid",
      },
    });

    expect(response.status()).toBe(401);
  });

  test("SEC-01f: POST с неверным JSON → 400", async ({ request }) => {
    const response = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": "sha256=" + "a".repeat(64),
      },
      data: "not-a-valid-json-string",
    });

    expect(response.status()).toBe(400);
  });

  test("SEC-01g: POST с невалидным форматом подписи → 401", async ({ request }) => {
    // Подпись должна быть hex 64 символа. Кормим что-то странное.
    const response = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": "not-a-hex-string-at-all",
      },
      data: {
        payment_id: "00000000-0000-0000-0000-000000000000",
        provider: "test",
        status: "paid",
      },
    });

    expect(response.status()).toBe(401);
  });
});

test.describe("cron security", () => {
  test("SEC-02: GET /api/cron/sync-sheets без Bearer → 401", async ({ request }) => {
    const response = await request.get("/api/cron/sync-sheets");
    expect(response.status()).toBe(401);
  });

  test("SEC-02b: GET с неверным Bearer → 401", async ({ request }) => {
    const response = await request.get("/api/cron/sync-sheets", {
      headers: { Authorization: "Bearer definitely-wrong-secret-value" },
    });
    expect(response.status()).toBe(401);
  });

  test("SEC-02c: GET с пустым Bearer → 401", async ({ request }) => {
    const response = await request.get("/api/cron/sync-sheets", {
      headers: { Authorization: "Bearer " },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("webhook idempotency (после safety pack)", () => {
  test.skip(
    !TEST_SECRET || !process.env.E2E_REAL_PAYMENT_ID,
    "Нужны E2E_TEST_WEBHOOK_SECRET и E2E_REAL_PAYMENT_ID (uuid реального платежа в тест-БД)",
  );

  test("P-06: повторный webhook с тем же статусом — idempotent", async ({ request }) => {
    const paymentId = process.env.E2E_REAL_PAYMENT_ID!;
    const body = JSON.stringify({
      payment_id: paymentId,
      provider: "test",
      status: "paid",
      paid_amount: 1000000,
    });
    const signature = signBody(body, TEST_SECRET);

    // Первая отправка
    const first = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": `sha256=${signature}`,
      },
      data: body,
    });
    expect([200, 202]).toContain(first.status());

    // Повторная — должна быть idempotent
    const second = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": `sha256=${signature}`,
      },
      data: body,
    });
    expect(second.status()).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.idempotent).toBe(true);
  });

  test("P-04b: webhook на несуществующий payment_id → 404", async ({ request }) => {
    const body = JSON.stringify({
      payment_id: "00000000-0000-0000-0000-000000000000",
      provider: "test",
      status: "paid",
      paid_amount: 1000000,
    });
    const signature = signBody(body, TEST_SECRET);

    const response = await request.post("/api/webhooks/payments", {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": `sha256=${signature}`,
      },
      data: body,
    });

    expect(response.status()).toBe(404);
  });
});
