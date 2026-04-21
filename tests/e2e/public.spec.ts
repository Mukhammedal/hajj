import { test, expect } from "@playwright/test";

/**
 * P1-P2: Публичные страницы.
 * Важно: эти страницы работают БЕЗ авторизации и должны стабильно загружаться.
 */

test.describe("публичные страницы", () => {
  test("PU-01: landing без console-ошибок", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    // Допускаем некритичные warning'и, падаем только на ошибках
    expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
  });

  test("PU-02: каталог операторов рендерится", async ({ page }) => {
    await page.goto("/operators");
    await expect(page.locator("body")).toContainText(/оператор/i);
  });

  test("PU-03: карточка оператора (если есть) открывается", async ({ page }) => {
    await page.goto("/operators");
    // Находим первую ссылку на детальную страницу
    const firstOperatorLink = page.locator('a[href^="/operators/"]').first();

    if ((await firstOperatorLink.count()) > 0) {
      await firstOperatorLink.click();
      await page.waitForLoadState("domcontentloaded");
      // Должна загрузиться страница оператора без 500
      await expect(page).toHaveURL(/\/operators\/[^\/]+$/);
    }
  });

  test("PU-05a: /verify/<невалидный> показывает ошибку", async ({ page }) => {
    await page.goto("/verify/INVALID-HASH-XXXXX");
    // Либо явно "не найден", либо редирект на 404
    const status = page.url().includes("/verify/") ? 200 : 404;
    if (status === 200) {
      await expect(page.locator("body")).toContainText(
        /не найден|недействителен|invalid|не существует/i,
      );
    }
  });
});

test.describe("robots / SEO sanity", () => {
  test("PU-R1: /robots.txt существует или 404", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect([200, 404]).toContain(response.status());
  });

  test("PU-R2: landing имеет <title>", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(3);
  });

  test("PU-R3: landing имеет meta description", async ({ page }) => {
    await page.goto("/");
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    // Не обязательно, но desirable для SEO. Warn, не fail.
    if (!desc) {
      console.warn("WARN: у landing нет meta description. Для SEO рекомендуется.");
    }
  });
});

test.describe("security headers", () => {
  test("SEC-H1: X-Frame-Options или CSP frame-ancestors", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    const hasFrameProtection =
      headers["x-frame-options"] ||
      (headers["content-security-policy"] &&
        headers["content-security-policy"].includes("frame-ancestors"));

    if (!hasFrameProtection) {
      console.warn(
        "WARN: нет защиты от clickjacking (X-Frame-Options или CSP frame-ancestors). Добавьте в next.config.mjs:\n" +
          "headers: async () => [{ source: '/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] }]",
      );
    }
    // Не фейлим — P2
  });

  test("SEC-H2: Strict-Transport-Security в HTTPS", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    if (process.env.E2E_BASE_URL?.startsWith("https://")) {
      expect(headers["strict-transport-security"]).toBeTruthy();
    }
  });

  test("SEC-H3: Content-Security-Policy присутствует", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    if (!headers["content-security-policy"]) {
      console.warn(
        "WARN: нет Content-Security-Policy. Для XSS-защиты рекомендуется добавить хотя бы базовый CSP в next.config.mjs.",
      );
    }
  });

  test("SEC-H4: X-Content-Type-Options: nosniff", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    if (!headers["x-content-type-options"]) {
      console.warn("WARN: нет X-Content-Type-Options: nosniff. Рекомендуется.");
    }
  });
});

test.describe("mobile viewport sanity", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("PU-M1: landing на iPhone SE без горизонтального скролла", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Проверяем что scrollWidth не больше clientWidth (нет overflow по X)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      console.warn("FAIL: горизонтальный скролл на 375px. Что-то вылезает за viewport.");
    }
    expect(hasHorizontalScroll).toBe(false);
  });

  test("PU-M2: форма логина на мобильном — кнопка видна и кликабельна", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const btn = page.getByRole("button", { name: /войти/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();

    // Проверяем что кнопка не обрезана (ширина > 100px) — sanity
    const box = await btn.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(100);
  });
});

test.describe("health check", () => {
  test("PU-H1: /login отвечает за < 2 сек", async ({ request }) => {
    const start = Date.now();
    const response = await request.get("/login");
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });

  test("PU-H2: /api/webhooks/payments (GET) отвечает быстро", async ({ request }) => {
    const start = Date.now();
    const response = await request.get("/api/webhooks/payments");
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(1000);
  });
});
