import { test, expect } from "./helpers";

/**
 * Smoke suite — запускать после каждого деплоя.
 * Должен отрабатывать < 2 мин. Покрывает blast-radius.
 * Если хоть один fail — немедленный rollback.
 */

test.describe("smoke: публичные страницы", () => {
  test("S-01: landing загружается", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/hajj/i);
  });

  test("S-02: каталог операторов доступен публично", async ({ page }) => {
    const response = await page.goto("/operators");
    expect(response?.status()).toBe(200);
  });

  test("S-03: форма логина рендерится", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/пароль/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /войти/i })).toBeVisible();
  });
});

test.describe("smoke: защита роутов без авторизации", () => {
  test("S-04: /crm/dashboard → редирект на /login", async ({ page }) => {
    await page.goto("/crm/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fcrm%2Fdashboard/);
  });

  test("S-05: /admin/operators → редирект на /login", async ({ page }) => {
    await page.goto("/admin/operators");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Foperators/);
  });

  test("S-06: /cabinet/dashboard → редирект на /login", async ({ page }) => {
    await page.goto("/cabinet/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fcabinet%2Fdashboard/);
  });
});

test.describe("smoke: API webhooks", () => {
  test("S-07: GET webhook health check", async ({ request }) => {
    const response = await request.get("/api/webhooks/payments");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("S-08: POST webhook без подписи → 401", async ({ request }) => {
    const response = await request.post("/api/webhooks/payments", {
      data: {
        payment_id: "00000000-0000-0000-0000-000000000000",
        provider: "kaspi",
        status: "paid",
      },
    });
    // После установки safety pack должен быть 401.
    // Если 202/200 — webhook ещё не защищён, критичный баг.
    expect(response.status()).toBe(401);
  });
});
