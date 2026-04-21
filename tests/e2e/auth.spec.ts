import { test, expect, loginAs } from "./helpers";

/**
 * P0: Authentication и role routing.
 * Regression report говорит, что тут были баги — значит уязвимое место.
 */

test.describe("auth: login happy path", () => {
  test("A-01a: admin → /admin/operators", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL("/admin/operators");
  });

  test("A-01b: operator → /crm/dashboard", async ({ page }) => {
    await loginAs(page, "operator");
    await expect(page).toHaveURL("/crm/dashboard");
  });

  test("A-01c: pilgrim → /cabinet/dashboard", async ({ page }) => {
    await loginAs(page, "pilgrim");
    await expect(page).toHaveURL("/cabinet/dashboard");
  });
});

test.describe("auth: login отказы", () => {
  test("A-02: неверный пароль — остаёмся на /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("operator@test.kz");
    await page.getByLabel(/пароль/i).fill("WrongPassword123");
    await page.getByRole("button", { name: /войти/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("body")).toContainText(/ошибка|неверн|некоррект/i);
  });

  test("A-02b: несуществующий email", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/пароль/i).fill("SomePassword123!");
    await page.getByRole("button", { name: /войти/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("auth: cross-role protection", () => {
  test("A-03a: operator → /admin → /unauthorized", async ({ operatorPage }) => {
    await operatorPage.goto("/admin/operators");
    await expect(operatorPage).toHaveURL("/unauthorized");
  });

  test("A-03b: operator → /cabinet → /unauthorized", async ({ operatorPage }) => {
    await operatorPage.goto("/cabinet/dashboard");
    await expect(operatorPage).toHaveURL("/unauthorized");
  });

  test("A-03c: pilgrim → /crm → /unauthorized", async ({ pilgrimPage }) => {
    await pilgrimPage.goto("/crm/dashboard");
    await expect(pilgrimPage).toHaveURL("/unauthorized");
  });

  test("A-03d: pilgrim → /admin → /unauthorized", async ({ pilgrimPage }) => {
    await pilgrimPage.goto("/admin/operators");
    await expect(pilgrimPage).toHaveURL("/unauthorized");
  });

  test("A-03e: admin → /crm → /unauthorized", async ({ adminPage }) => {
    await adminPage.goto("/crm/dashboard");
    await expect(adminPage).toHaveURL("/unauthorized");
  });

  test("A-03f: admin → /cabinet → /unauthorized", async ({ adminPage }) => {
    await adminPage.goto("/cabinet/dashboard");
    await expect(adminPage).toHaveURL("/unauthorized");
  });
});

test.describe("auth: redirect flow", () => {
  test("A-04: next сохраняется и возвращает после логина", async ({ page }) => {
    await page.goto("/crm/pilgrims");
    await expect(page).toHaveURL(/\/login\?next=%2Fcrm%2Fpilgrims/);

    await page.getByLabel(/email/i).fill(process.env.E2E_OPERATOR_EMAIL ?? "operator@test.kz");
    await page.getByLabel(/пароль/i).fill(process.env.E2E_OPERATOR_PASSWORD ?? "");
    await page.getByRole("button", { name: /войти/i }).click();

    await expect(page).toHaveURL(/\/crm\/pilgrims/, { timeout: 10000 });
  });
});

test.describe("auth: session lifecycle", () => {
  test("A-05: logout очищает сессию", async ({ operatorPage }) => {
    const logoutBtn = operatorPage
      .getByRole("button", { name: /выйти|logout/i })
      .or(operatorPage.getByRole("link", { name: /выйти|logout/i }));

    await expect(logoutBtn.first()).toBeVisible({ timeout: 5000 });
    await logoutBtn.first().click();

    await expect(operatorPage).toHaveURL(/\/login|\/$/, { timeout: 5000 });

    await operatorPage.goto("/crm/dashboard");
    await expect(operatorPage).toHaveURL(/\/login/);
  });

  test("A-06: expired session → редирект на login", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAs(page, "operator");
    await expect(page).toHaveURL("/crm/dashboard");

    await context.clearCookies();

    await page.goto("/crm/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});

test.describe("auth: password reset", () => {
  test("A-07: единый ответ для existing/non-existing email", async ({ page }) => {
    // Защита от email enumeration.
    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill("totally-nonexistent-user@example.com");
    await page.getByRole("button", { name: /отправить/i }).click();

    const messageNonExistent = await page
      .locator('[class*="emerald"]')
      .or(page.locator('div:has-text("зарегистрирован")'))
      .first()
      .textContent();

    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill(process.env.E2E_OPERATOR_EMAIL ?? "operator@test.kz");
    await page.getByRole("button", { name: /отправить/i }).click();

    const messageExistent = await page
      .locator('[class*="emerald"]')
      .or(page.locator('div:has-text("зарегистрирован")'))
      .first()
      .textContent();

    expect(messageNonExistent?.trim()).toBe(messageExistent?.trim());
  });
});
