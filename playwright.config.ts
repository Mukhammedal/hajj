import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config для HajjCRM e2e тестов.
 *
 * Запуск:
 *   npm run test:e2e              — все тесты
 *   npm run test:e2e -- smoke     — только smoke
 *   npm run test:e2e -- --ui      — interactive UI
 *   npm run test:e2e -- --headed  — с видимым браузером
 *
 * В CI: npm run test:e2e -- --reporter=html,github
 */

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3004";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,

  // Уменьшаем flakiness: в CI ретраим 1 раз, локально не ретраим
  retries: process.env.CI ? 1 : 0,

  // Локально — 4 воркера, в CI — 1 (чтобы БД не конфликтовала)
  workers: process.env.CI ? 1 : 4,

  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "ru-RU",
    timezoneId: "Asia/Almaty",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-iphone",
      use: { ...devices["iPhone 13"] },
    },
  ],

  webServer: BASE_URL.includes("localhost")
    ? {
        command: "npm run dev -- --port 3004",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120 * 1000,
      }
    : undefined,
});
