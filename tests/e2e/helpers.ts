import { test as base, expect, type Page } from "@playwright/test";

/**
 * Тестовые аккаунты. Храним в env, не в коде.
 *
 * В CI задаём через secrets:
 *   E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 *   E2E_OPERATOR_EMAIL, E2E_OPERATOR_PASSWORD
 *   E2E_PILGRIM_EMAIL, E2E_PILGRIM_PASSWORD
 */
export const testAccounts = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@hajjcrm.kz",
    password: process.env.E2E_ADMIN_PASSWORD ?? "",
    expectedDashboard: "/admin/operators",
  },
  operator: {
    email: process.env.E2E_OPERATOR_EMAIL ?? "operator@test.kz",
    password: process.env.E2E_OPERATOR_PASSWORD ?? "",
    expectedDashboard: "/crm/dashboard",
  },
  pilgrim: {
    email: process.env.E2E_PILGRIM_EMAIL ?? "pilgrim@test.kz",
    password: process.env.E2E_PILGRIM_PASSWORD ?? "",
    expectedDashboard: "/cabinet/dashboard",
  },
} as const;

export type Role = keyof typeof testAccounts;

/**
 * Логин через UI. Реальный flow, чтобы покрыть middleware + session cookies.
 */
export async function loginAs(page: Page, role: Role) {
  const account = testAccounts[role];
  if (!account.password) {
    throw new Error(
      `Password для роли ${role} не задан. Установите E2E_${role.toUpperCase()}_PASSWORD.`,
    );
  }

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(account.email);
  await page.getByLabel(/пароль/i).fill(account.password);
  await page.getByRole("button", { name: /войти/i }).click();
  await page.waitForURL(account.expectedDashboard, { timeout: 10000 });
}

export async function logout(page: Page) {
  const logoutBtn = page
    .getByRole("button", { name: /выйти/i })
    .or(page.getByRole("link", { name: /выйти/i }));

  if ((await logoutBtn.count()) > 0) {
    await logoutBtn.first().click();
    await page.waitForURL("/login", { timeout: 5000 });
  }
}

type AuthFixtures = {
  adminPage: Page;
  operatorPage: Page;
  pilgrimPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, "admin");
    await use(page);
    await context.close();
  },
  operatorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, "operator");
    await use(page);
    await context.close();
  },
  pilgrimPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, "pilgrim");
    await use(page);
    await context.close();
  },
});

export { expect };
