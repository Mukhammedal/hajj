# HajjCRM

Next.js 14 SaaS-платформа для хадж-операторов Казахстана: публичный каталог, кабинет паломника, CRM оператора и админ-панель.

## Что уже собрано

- `Next.js 14 App Router` каркас с русскоязычными публичными и защищёнными разделами
- `Prisma schema` для всех таблиц из спецификации
- `Supabase SQL migration` с таблицами, индексами, view `pilgrim_readiness_view`, RLS policies и bucket `documents`
- `Supabase Edge Functions` scaffold для `auto-reminders`, `quota-sync`, `contract-generator`
- `Webhook placeholder` для будущих Kaspi/Halyk callback'ов
- Mock-данные и UI-компоненты для демонстрации всех основных сценариев

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Скопируйте `.env.example` в `.env.local` и заполните:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
WHATSAPP_API_KEY=
WHAPI_BASE_URL=https://gate.whapi.cloud
```

3. Сгенерируйте Prisma client:

```bash
npx prisma generate
```

4. Примените SQL из [supabase/migrations/0001_init.sql](/Users/mukhammedali/Desktop/umrah/supabase/migrations/0001_init.sql:1) в Supabase SQL Editor.

5. Запустите проект:

```bash
npm run dev
```

## Важные примечания

- Реальный процессинг Kaspi/Halyk не реализован по требованиям v1, есть только endpoint-заглушка.
- Для реальной отправки WhatsApp добавьте `WHATSAPP_API_KEY` из Whapi.Cloud в `.env.local` и тот же secret в Vercel env.
- Если `WHATSAPP_API_KEY` не задан, CRM и cron продолжают безопасно логировать уведомления в `notifications`.
- Публичный профиль оператора показывает доступные группы на уровне UI; при жёстком соблюдении RLS это лучше отдавать через server-side слой с service role.
- `contract-generator` создаёт минимальный PDF-файл внутри Edge Function и сохраняет в `payments.contract_url` путь объекта в приватном bucket. Для скачивания в кабинете лучше выдавать signed URL на лету.
