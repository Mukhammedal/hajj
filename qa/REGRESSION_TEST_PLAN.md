# HajjCRM — Регрессионный тест-план

**Версия:** 1.0
**Автор:** senior QA mentor pass
**Объект:** `hajj-drab.vercel.app` + локальный `localhost:3004`
**Последнее ревью кода:** апрель 2026

## Как читать документ

Тесты сгруппированы по **функциональным областям** и внутри каждой упорядочены по **приоритету**:

- **P0** — блокер. Любой fail = нельзя деплоить в прод.
- **P1** — критичное. Fail = откатываем релиз.
- **P2** — важное. Fail = баг-репорт, фикс в следующем спринте.
- **P3** — косметика. Трекаем, не блокируем.

Каждый тест-кейс имеет: ID, название, предусловия, шаги, ожидаемый результат, риск-зону из кода.

**80/20 правило:** если времени мало, прокрывайте все P0 + P1 — ~40% кейсов, ловят ~90% прод-инцидентов.

---

## 0. Smoke suite (5 минут, перед любым деплоем)

Минимальный «горит ли база вообще». Автоматизирован в `tests/e2e/smoke.spec.ts`.

| ID | Проверка | Ожидание |
|----|----------|----------|
| S-01 | GET `/` | 200, загружается landing |
| S-02 | GET `/operators` | 200, список операторов |
| S-03 | GET `/login` | 200, форма логина |
| S-04 | GET `/crm/dashboard` без auth | 302 → `/login?next=...` |
| S-05 | GET `/admin/operators` без auth | 302 → `/login?next=...` |
| S-06 | GET `/cabinet/dashboard` без auth | 302 → `/login?next=...` |
| S-07 | GET `/api/webhooks/payments` | 200, JSON `{ok: true}` |
| S-08 | POST `/api/webhooks/payments` без подписи | 401 |

---

## 1. Authentication & Authorization (P0–P1)

**Риск-зона:** `middleware.ts`, `lib/auth.ts`, `lib/actions/auth-actions.ts`. Regression report говорит, что это уже фиксили — значит, регрессия вероятна.

### P0

**A-01. Login с корректными кредами → редирект по роли.** Для admin → `/admin/operators`, operator → `/crm/dashboard`, pilgrim → `/cabinet/dashboard`.

**A-02. Login с неверным паролем.** Форма остаётся, сообщение на русском, URL не меняется.

**A-03. Cross-role доступ блокируется.** 6 пар (3 роли × 2 чужих пространства): в каждом случае редирект на `/unauthorized`, НЕ на `/login`, НЕ 500.

**A-04. Неавторизованный доступ.** 302 → `/login?next=<original-path>`, после логина — редирект обратно.

**A-05. Logout.** Cookies очищены, редирект `/login`. После logout попытка backward-navigation в браузере не должна показать защищённые данные (кэш).

**A-06. Expired session.** Вручную удалить cookie → обновить страницу → 302 → `/login?next=...`.

### P1

**A-07. Password reset request.** `/forgot-password` — сообщение **одинаковое** для существующего и несуществующего email (защита от enumeration).

**A-08. Password reset complete.** Ссылка из письма → `/reset-password` → новый пароль → редирект на свой dashboard, старый пароль не работает.

**A-09. Change password в кабинете.** Требует текущий пароль + новый + повтор.

**A-10. Роль в JWT, не в user_metadata.** Вручную установить `user_metadata.role = "admin"` пилигриму → `/admin` всё равно возвращает unauthorized (user_metadata игнорируется).

---

## 2. Pilgrim Onboarding & Documents (P0)

**Риск-зона:** `app/api/cabinet/documents/upload/route.ts`, `lib/documents.ts`, `pilgrim_readiness_view`.

### P0

**D-01. Upload — happy path.** Валидный PDF 1MB → запись в `documents`, файл в Storage, readiness увеличился.

**D-02. Rejection MIME.** `.exe` / `.txt` → 400, «Разрешены только PDF, JPG и PNG.»

**D-03. Rejection size.** Файл 6MB → 400, «Максимальный размер файла — 5 МБ.»

**D-04. Replace existing.** Загрузка документа поверх существующего → старый удалён из Storage, `is_verified` сброшен в false.

**D-05. Cross-pilgrim access blocked.** Пилигрим A не может подменить `pilgrim_id` в запросе и залить файл на пилигрима B.

**D-06. Readiness percent корректен.** 0/5 docs = 0%, 5/5 + группа + оплата = 100%, 3/5 + группа + не оплачено ≈ 42-50%.

### P1

**D-07. Upload offline.** Понятное сообщение, не spinner навечно.

**D-08. Signed URL валиден.** Кликнуть «Скачать» → открывается файл, URL истекает через час.

---

## 3. Group & Quota (P0)

**Риск-зона:** триггер `trg_sync_group_quota`, `createGroupAction`, `assignPilgrimsToGroupAction`.

### P0

**G-01. Создание группы.** Status `forming`, quota_filled = 0.

**G-02. Добавить пилигрима.** `quota_filled` стал 1 (триггер).

**G-03. Заполнение квоты.** 10 пилигримов в группу с quota_total = 10 → status = `full`.

**G-04. Превышение квоты.** 11-й пилигрим → ошибка или блок в UI. **Код-риск:** проверить, есть ли валидация. Если нет — баг.

**G-05. Удаление из группы.** `quota_filled` декрементирован, `full` → `forming`.

### P1

**G-06. Даты.** Возврат раньше вылета → validation error.

**G-07. Чужой пилигрим.** Оператор A не может добавить пилигрима оператора B в свою группу.

---

## 4. Payment → Contract (P0)

**Риск-зона:** `markPaymentPaidAction`, `generateContractForPayment`, webhook, PDF-генератор. Самое опасное — деньги и юрдокумент.

### P0

**P-01. Mark as paid вручную.** Статус = `paid`, paid_amount = total_amount, договор сгенерирован, `contract_url` не null. После установки safety pack — запись в `audit_events` и `payment_transactions`.

**P-02. Contract PDF — корректность.**
- Кириллица отображается (Куанышбаев, не Kuanyshbaev) — **после установки Noto Sans**
- QR как изображение
- Реквизиты оператора (BIN, IIK, BIC если заполнены)
- Реквизиты пилигрима
- Сумма в тенге правильно отформатирована

**P-03. QR-верификация.** Скан QR → `/verify/<hash>`, валидность + имя пилигрима. **Публичный доступ** (без auth).

**P-04. Webhook valid signature.**
```bash
SECRET=$KASPI_WEBHOOK_SECRET
BODY='{"payment_id":"<uuid>","provider":"kaspi","status":"paid","paid_amount":1550000}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
curl -X POST http://localhost:3004/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -H "X-Kaspi-Signature: sha256=$SIG" \
  -d "$BODY"
```
Ожидание: 200, платёж обновлён, договор сгенерирован.

**P-05. Webhook invalid signature → 401.** Причина НЕ раскрывается.

**P-06. Webhook идемпотентность.** Повтор → `{idempotent: true}`, договор НЕ перегенерирован.

**P-07. Partial payment.** paid_amount < total_amount → status `partial`, договор НЕ генерится.

**P-08. Overpayment.** paid_amount > total_amount — фиксируется, но нужен алерт оператору? Сейчас нет. Документировать как P2 баг.

### P1

**P-09. Контракт для pending платежа.** Ошибка «только для полностью оплаченного».

**P-10. Регенерация контракта.** Тот же qr_code, новый `contract_generated_at`.

---

## 5. Notifications (P0–P1)

**Риск-зона:** `sendBulkReminderAction`, `dispatchNotifications`, Whapi rate-limits.

### P0

**N-01. Bulk send happy path.** 10 пилигримов → 10 записей в notifications.

**N-02. Идемпотентность.** Повтор того же сообщения тем же пилигримам в течение часа → 0 новых строк (или «пропущено» в UI). После установки safety pack.

**N-03. Batching — нет timeout.** 50 пилигримов → action завершается < 60 сек (батчи 5/сек).

**N-04. Лимит 200.** 250 пилигримов → ошибка «не более 200 за раз».

**N-05. Чужие пилигримы.** Через devtools подсунуть ID чужого оператора → отфильтрован сервером.

### P1

**N-06. Missing phone.** `phone = null` → для этого fail, остальные ок.

**N-07. Auto-reminders edge function.** Группа с flight в 7 дней → пилигримы получают `reminder_flight` (или `reminder_docs`/`reminder_payment` по readiness).

---

## 6. Admin operations (P1)

**A-11. Verify operator.** Флаг `is_verified = true`, оператор появился в `/operators`.

**A-12. Revoke verification.** Оператор исчез из публичного каталога.

**A-13. Global stats.** Цифры в `/admin/analytics` совпадают с `SELECT count(*)`.

---

## 7. Google Sheets sync (P2)

**Не автоматизируется легко.** Ручной чек-лист:

- [ ] Привязка через URL и через ID работает
- [ ] Service account имеет доступ (иначе explicit error)
- [ ] Алиасы колонок ('ФИО', 'иин', 'сумма') детектятся
- [ ] Неизвестные колонки игнорируются без падения
- [ ] Дубли по ИИН — update, не insert
- [ ] `sync_logs` заполняется: created/updated/skipped/errors
- [ ] Cron `/api/cron/sync-sheets` триггерится с правильным `CRON_SECRET`
- [ ] `Authorization: Bearer wrong-secret` → 401

---

## 8. Public pages (P2)

**PU-01.** `/` загружается < 3 сек, 0 console-ошибок
**PU-02.** `/operators` — верифицированные операторы из БД (не моки в live-режиме)
**PU-03.** `/operators/[id]` — профиль оператора без JS-ошибок
**PU-04.** `/hotels/[slug]` — hotel lookup работает
**PU-05.** `/verify/[qr_code]` — валидный hash показывает контракт, невалидный — 404

---

## 9. Security regression (P0)

**SEC-01.** `/api/webhooks/payments` без signature header → 401 (после safety pack).

**SEC-02.** `/api/cron/sync-sheets` без `Bearer <CRON_SECRET>` → 401.

**SEC-03.** RLS: пилигрим A не видит документы B. Через Supabase SQL под `auth.uid() = A`: `SELECT * FROM documents WHERE pilgrim_id = <B>` → empty.

**SEC-04.** RLS: оператор A не видит пилигримов B.

**SEC-05.** Storage: прямой URL без signed → 403/404.

**SEC-06.** Нет ИИН в URL-параметрах.

**SEC-07.** CSRF: `Origin: https://evil.com` на server action → отклонён.

**SEC-08.** XSS: `full_name = <script>alert(1)</script>` → в UI как текст, не выполняется.

---

## 10. Performance regression (P2)

| Страница | Target p50 |
|---|---|
| `/` | < 500ms |
| `/crm/dashboard` (10 пилигримов) | < 1000ms |
| `/crm/pilgrims` (100 пилигримов) | < 2000ms |
| `/cabinet/dashboard` | < 800ms |
| Upload 1MB | < 3000ms |
| Bulk send 30 | < 10000ms |

Инструмент: Vercel Analytics или `curl -w "%{time_total}\n"` в цикле.

---

## 11. Mobile regression (P1) — ОТСУТСТВУЕТ в текущем проекте

Из REGRESSION_REPORT: «мобильный pass на 375px не выполнен». Критично для пилигримов.

Мобильный smoke (iPhone SE 375×667, iPhone 13 390×844):

- [ ] Landing читабельный
- [ ] Login форма — кнопка не обрезана
- [ ] Cabinet dashboard — все карточки видны
- [ ] Upload документа — file picker открывается
- [ ] Текст кнопок не переносится некрасиво
- [ ] Скролл горизонтальный отсутствует

**Инструмент:** Chrome DevTools Device Mode или реальный iPhone. Playwright config уже имеет project `mobile-iphone`.

---

## 12. Регрессионный smoke после каждого деплоя

1. Прогнать Playwright smoke (`npm run test:e2e:smoke`) — 5 мин.
2. Вручную: login под каждой из 3 ролей, dashboard открывается.
3. Вручную: загрузить тестовый документ, readiness обновился.
4. Вручную: отметить тестовый платёж оплаченным, скачать PDF, кириллица видна.
5. Sentry/логи на ошибки за последний час.

Если хоть один пункт красный — немедленный rollback (`vercel rollback`).

---

## Матрица тест-данных

**Операторы:**
- `op1@test.kz` — verified, 5 групп, 50 пилигримов
- `op2@test.kz` — verified, пустой (тест multi-tenant изоляции)
- `op3@test.kz` — unverified (не должен быть в публичном каталоге)

**Пилигримы:**
- `pilgrim-fresh@test.kz` — только создан, 0 документов
- `pilgrim-partial@test.kz` — 3/5 документов, partial payment
- `pilgrim-ready@test.kz` — всё загружено, оплачено, в группе, `is_ready = true`
- `pilgrim-departed@test.kz` — status = departed

**Платежи:** по одному pending, partial, paid (с контрактом).

SQL для seed → `scripts/seed-test-data.sql` (рекомендую добавить).

---

## Приоритизация исполнения

- **Сегодня (2ч):** smoke S-01..S-08 + P-01, P-04, P-05, D-01..D-04.
- **Завтра (4ч):** все P0 + N-01..N-04.
- **Эта неделя:** P1 + SEC-01..SEC-05.
- **До прода:** всё P0+P1, CI зелёный.

## Definition of Done

Релиз готов к проду если:
- ✅ Все P0 пройдены
- ✅ Все P1 пройдены или явно отклонены (owner + дата фикса)
- ✅ Smoke автоматизирован и зелёный в CI
- ✅ 0 критичных багов в Sentry за 24ч
- ✅ Mobile smoke на iPhone SE + 13 пройден
- ✅ SEC-01..SEC-05 зелёный
