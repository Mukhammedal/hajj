# HajjCRM — QA kit

Регрессионный test plan + автоматизированные Playwright-тесты + CI.

## Что в пакете

```
qa/
├── REGRESSION_TEST_PLAN.md       — полный test plan (ручной + авто), ~80 кейсов
├── playwright.config.ts          — конфиг Playwright (desktop + mobile iPhone)
├── tests/e2e/
│   ├── helpers.ts                — loginAs() + фикстуры adminPage/operatorPage/pilgrimPage
│   ├── smoke.spec.ts             — S-01..S-08, 5 минут, после каждого деплоя
│   ├── auth.spec.ts              — A-01..A-07, role routing + password reset
│   ├── documents.spec.ts         — D-01..D-05, upload + validation + isolation
│   ├── webhook-security.spec.ts  — SEC-01..SEC-02 + идемпотентность
│   └── public.spec.ts            — PU-01..PU-05 + security headers + mobile viewport
└── ci/
    └── e2e.yml                   — GitHub Actions workflow
```

## Установка (15 минут)

### 1. Зависимости

```bash
cd <project-root>
npm install -D @playwright/test
npx playwright install chromium
```

### 2. Копирование файлов

```bash
# Конфиг
cp qa/playwright.config.ts ./

# Тесты
mkdir -p tests/e2e
cp qa/tests/e2e/*.ts tests/e2e/

# CI
mkdir -p .github/workflows
cp qa/ci/e2e.yml .github/workflows/
```

### 3. `package.json` scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:smoke": "playwright test smoke.spec.ts",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:prod": "E2E_BASE_URL=https://hajj-drab.vercel.app playwright test smoke.spec.ts",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 4. Env для локальных тестов

```bash
# .env.test (в .gitignore!)
cat > .env.test <<'EOF'
E2E_BASE_URL=http://localhost:3004

E2E_ADMIN_EMAIL=admin@hajjcrm.kz
E2E_ADMIN_PASSWORD=<admin pwd>

E2E_OPERATOR_EMAIL=operator@test.kz
E2E_OPERATOR_PASSWORD=<operator pwd>

E2E_PILGRIM_EMAIL=pilgrim@test.kz
E2E_PILGRIM_PASSWORD=<pilgrim pwd>

# Для security-тестов (после safety pack)
E2E_TEST_WEBHOOK_SECRET=<same as TEST_WEBHOOK_SECRET>
# E2E_REAL_PAYMENT_ID=<uuid реального платежа для idempotency-теста>
EOF
```

```bash
# Добавить в .gitignore
echo ".env.test" >> .gitignore
echo "playwright-report/" >> .gitignore
echo "test-results/" >> .gitignore
```

### 5. Первый прогон

```bash
set -a && source .env.test && set +a
npm run dev &           # запустить dev-сервер (если локально)
npm run test:e2e:smoke  # только smoke (быстро, диагностика)
```

Или всё сразу:
```bash
npm run test:e2e        # все тесты, ~5-10 минут
npm run test:e2e:report # открыть HTML-отчёт
```

## Что случится при первом прогоне

**Часть тестов упадёт — это нормально** и это сам по себе ценный результат. Типичные причины:

### 1. Локаторы не совпали с вёрсткой

Я писал тесты по логике, но не видел точных селекторов. Правка — 5-10 минут:

```ts
// Было: getByLabel(/email/i)
// Если лейбл у тебя "Электронная почта":
getByLabel(/электронная почта|email/i)

// Было: getByRole("button", { name: /войти/i })
// Если кнопка "Вход":
getByRole("button", { name: /вход|войти/i })
```

**Best practice:** добавь `data-testid` в критичные UI-элементы, используй `getByTestId()`. Стабильнее, чем текст.

### 2. Webhook security тесты SKIP

Это правильно, если улучшения ещё не установлены. После установки — задать `E2E_TEST_WEBHOOK_SECRET`, они активируются.

### 3. Падает A-02 (error message)

Если Supabase возвращает ошибку на английском, русский regex не сматчится. Починка: маппинг ошибок (см. `lib/errors/db-error-mapper.ts` из improvements pack).

### 4. Падает S-08 (webhook без подписи → 401)

Если улучшения **не установлены** → webhook вернёт 202 вместо 401. Это **критично**, `SEC-01` в прод-отчёте.

## Интерпретация результатов

После прогона:

| Что вижу | Что означает | Действие |
|---|---|---|
| Smoke зелёный | Core flow работает | Продолжать |
| Auth красный | Сломана авторизация или creds | Проверить email/пароли, потом middleware |
| Documents D-02/D-03 красный | Валидация не работает | **Критично**, чинить немедленно |
| Documents D-05 красный | Cross-pilgrim дыра | **Show-stopper**, чинить немедленно |
| Webhook SEC-01 красный (fail, не skip) | Webhook открыт всему миру | **Show-stopper**, ставить safety pack |
| Public PU-M1 красный | На iPhone SE горизонтальный скролл | P1, починить CSS |

## CI setup

### 1. Secrets в GitHub

Repository → Settings → Secrets and variables → Actions → New secret:

```
E2E_BASE_URL                     = https://hajj-drab.vercel.app
E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
E2E_OPERATOR_EMAIL, E2E_OPERATOR_PASSWORD
E2E_PILGRIM_EMAIL, E2E_PILGRIM_PASSWORD
E2E_TEST_WEBHOOK_SECRET          # после safety pack
E2E_REAL_PAYMENT_ID              # uuid тест-платежа для idempotency
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

### 2. Первый CI-run

Первый PR после копирования `.github/workflows/e2e.yml` автоматически прогонит тесты. В Artifacts — HTML-отчёт.

### 3. Branch protection

Settings → Branches → main → Require status checks:
- Отметить `Playwright E2E (on push/PR)`

Теперь мержить в main можно только когда тесты зелёные.

## Rollback strategy

Если smoke упал на проде (cron каждый час):

```bash
vercel rollback <previous-deployment-url>
# Или в Vercel UI: Deployments → пред. деплой → "Promote to Production"
```

В `ci/e2e.yml` есть `TODO` на Slack-алерт — рекомендую подключить. Пример:

```yaml
- name: Slack alert on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {"text":"🚨 Prod smoke failed: ${{ github.run_id }}"}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Как добавлять новые тесты

**Правило:** каждая новая user-story приходит с e2e-тестом. Иначе её не принимают в релиз.

Паттерн — по риск-зоне из `REGRESSION_TEST_PLAN.md`:

```ts
// tests/e2e/groups.spec.ts
import { test, expect } from "./helpers";

test.describe("groups: quota management", () => {
  test("G-02: добавление пилигрима инкрементит quota_filled", async ({ operatorPage }) => {
    // Prerequisite: создана группа с quota_total = 10, quota_filled = 0
    await operatorPage.goto("/crm/groups");
    // ...шаги
    await expect(operatorPage.locator('text=1 / 10')).toBeVisible();
  });
});
```

## Метрики QA (отслеживать еженедельно)

- **Flakiness rate** — % тестов, зелёных на retry, красных без. Цель < 5%. Больше — рефактор flaky тестов.
- **Coverage новых фич** — каждая story = минимум 1 e2e-тест. Нет теста = не merge.
- **Mean time to green** — время от красного build'а до починки. Цель < 2 часа.
- **Test duration** — smoke < 2 мин, full < 10 мин. Больше — параллелизовать или рефакторить.

## Что НЕ покрыто (осознанные пробелы)

- **Payment → contract PDF flow** — требует seed'а БД. Когда будет `scripts/seed-test-data.sql` — допишем.
- **Google Sheets sync** — требует реального service account. В manual-плане.
- **RLS через SQL** — лучше тестировать прямо в Supabase с разными `auth.uid()`. Отдельный спринт.
- **Load testing** — k6 / Artillery, 100 concurrent. Отдельная задача.
- **A11y (axe-core)** — когда будет утверждена UX-компоновка.
- **Visual regression** — Percy / Chromatic, когда вёрстка стабилизируется.

## Главные принципы (короткий reminder)

1. **Тест = документация в исполняемом виде.** Имя теста матчит ID из `REGRESSION_TEST_PLAN.md`.
2. **Не мокай то, что тестируешь.** Smoke гоняет реальный middleware + реальный Supabase Auth.
3. **Фикстуры вместо boilerplate.** `{ operatorPage }` переиспользует логин-контекст.
4. **Anti-enumeration.** `/forgot-password` возвращает одинаковое сообщение для существующего и несуществующего email.
5. **Cron smoke на проде.** Регрессии бывают не только от коммитов — Vercel падает, SSL истекает, Supabase out of quota.
6. **Playwright traces — золото.** При красном тесте в отчёте видна каждая сетевая запрос и DOM-снапшот. Смотрите artifacts.

---

Если тесты локально гоняются долго или flaky — скажи, помогу подкрутить таймауты и selectors.
