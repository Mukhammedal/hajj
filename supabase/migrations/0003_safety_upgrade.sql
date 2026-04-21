-- Migration: 0003_safety_upgrade.sql
-- Назначение: закрыть критичные gaps из архитектурного ревью.
--
-- ЧТО ДЕЛАЕТ:
--   1. audit_events — глобальный audit log.
--   2. notifications.idempotency_key + unique — защита от дублей рассылок.
--   3. Soft-delete (deleted_at) для ключевых таблиц.
--   4. Банковские реквизиты в operators — нужны для PDF-договора.
--   5. payment_transactions — поддержка нескольких траншей / возвратов.
--
-- ВАЖНО: миграция IDEMPOTENT — можно применять повторно.
-- Перед применением сделайте backup! (Supabase Dashboard → Database → Backups)

-- ===========================================================================
-- 1. AUDIT EVENTS
-- ===========================================================================

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_type text not null check (actor_type in ('user', 'webhook', 'cron', 'system')),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_audit_events_entity
  on public.audit_events(entity_type, entity_id, created_at desc);

create index if not exists idx_audit_events_actor
  on public.audit_events(actor_user_id, created_at desc)
  where actor_user_id is not null;

create index if not exists idx_audit_events_action
  on public.audit_events(action, created_at desc);

alter table public.audit_events enable row level security;

-- Читать audit могут только админы и тот оператор, которого касается запись.
-- Админам — всё. Для оператора — только события его сущностей (пилигримы/группы/платежи).
-- Пока ограничимся админами — более тонкая политика по мере надобности.

drop policy if exists "audit_events_admin_read" on public.audit_events;
create policy "audit_events_admin_read"
  on public.audit_events
  for select
  using (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

-- Insert разрешён всем server-side через service_role.
-- Обычные юзеры (auth.role() = 'authenticated') писать не могут напрямую.
drop policy if exists "audit_events_service_insert" on public.audit_events;
create policy "audit_events_service_insert"
  on public.audit_events
  for insert
  with check (auth.role() = 'service_role');


-- ===========================================================================
-- 2. NOTIFICATIONS — IDEMPOTENCY
-- ===========================================================================

alter table public.notifications
  add column if not exists idempotency_key text;

-- Уникальность по (pilgrim_id, idempotency_key) предотвращает дубли рассылок.
-- Null-значения допустимы (для старых записей), unique-индекс их игнорирует.
create unique index if not exists idx_notifications_idempotency
  on public.notifications(pilgrim_id, idempotency_key)
  where idempotency_key is not null;


-- ===========================================================================
-- 3. SOFT DELETE
-- ===========================================================================

alter table public.operators
  add column if not exists deleted_at timestamptz;

alter table public.pilgrim_profiles
  add column if not exists deleted_at timestamptz;

alter table public.groups
  add column if not exists deleted_at timestamptz;

alter table public.payments
  add column if not exists deleted_at timestamptz;

create index if not exists idx_operators_deleted_at
  on public.operators(deleted_at) where deleted_at is null;
create index if not exists idx_pilgrim_profiles_deleted_at
  on public.pilgrim_profiles(deleted_at) where deleted_at is null;
create index if not exists idx_groups_deleted_at
  on public.groups(deleted_at) where deleted_at is null;

-- ВАЖНО: RLS-политики нужно обновить, чтобы deleted_at IS NULL было в условии.
-- Делаем это в следующей миграции 0004 после проверки, что код везде использует soft-delete.


-- ===========================================================================
-- 4. BANK DETAILS OPERATORS — для PDF-договора
-- ===========================================================================

alter table public.operators add column if not exists bank_name text;
alter table public.operators add column if not exists bank_bin text;   -- БИН юрлица
alter table public.operators add column if not exists bank_iik text;   -- ИИК расчётного счёта
alter table public.operators add column if not exists bank_bic text;   -- БИК банка
alter table public.operators add column if not exists bank_kbe text;   -- Код бенефициара


-- ===========================================================================
-- 5. PAYMENT TRANSACTIONS — несколько траншей, возвраты
-- ===========================================================================

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  -- on delete restrict: физически не удаляем финансовую историю.
  amount numeric(12, 2) not null check (amount <> 0),  -- положительное = приход, отрицательное = возврат
  method text not null check (method in ('kaspi', 'halyk', 'cash', 'transfer')),
  provider_transaction_id text,  -- ID транзакции от платёжного провайдера (для сверки)
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded')),
  occurred_at timestamptz not null default timezone('utc', now()),
  note text,
  created_by_user_id uuid
);

create index if not exists idx_payment_transactions_payment
  on public.payment_transactions(payment_id, occurred_at desc);

create unique index if not exists idx_payment_transactions_provider
  on public.payment_transactions(provider_transaction_id)
  where provider_transaction_id is not null;

alter table public.payment_transactions enable row level security;

-- Читать транзакции может оператор, которому принадлежит платёж.
drop policy if exists "payment_transactions_operator_read" on public.payment_transactions;
create policy "payment_transactions_operator_read"
  on public.payment_transactions
  for select
  using (
    exists (
      select 1 from public.payments p
      join public.operators o on o.id = p.operator_id
      where p.id = payment_transactions.payment_id
        and o.user_id = auth.uid()
    )
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

-- Писать может сам оператор (для ручной отметки) или service_role (webhook).
drop policy if exists "payment_transactions_write" on public.payment_transactions;
create policy "payment_transactions_write"
  on public.payment_transactions
  for insert
  with check (
    exists (
      select 1 from public.payments p
      join public.operators o on o.id = p.operator_id
      where p.id = payment_transactions.payment_id
        and o.user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );


-- ===========================================================================
-- 6. TRIGGER: авто-пересчёт payments.paid_amount при изменении transactions
-- ===========================================================================

create or replace function public.sync_payment_paid_amount()
returns trigger
language plpgsql
security definer
as $$
declare
  total numeric(12, 2);
begin
  select coalesce(sum(amount), 0)
    into total
    from public.payment_transactions
   where payment_id = coalesce(new.payment_id, old.payment_id)
     and status = 'completed';

  update public.payments
     set paid_amount = greatest(0, total),
         status = case
           when total >= total_amount then 'paid'
           when total > 0 then 'partial'
           else 'pending'
         end
   where id = coalesce(new.payment_id, old.payment_id);

  return null;
end;
$$;

drop trigger if exists trg_sync_payment_paid_amount on public.payment_transactions;
create trigger trg_sync_payment_paid_amount
  after insert or update or delete on public.payment_transactions
  for each row execute function public.sync_payment_paid_amount();


-- ===========================================================================
-- 7. PERSONS + PILGRIM_ENROLLMENTS (опционально, см. комментарий)
-- ===========================================================================
--
-- РЕФАКТОР уникальности ИИН. Сейчас pilgrim_profiles.iin UNIQUE глобально,
-- что не даёт одному человеку быть у двух операторов в разных сезонах.
--
-- Этот блок ЗАКОММЕНТИРОВАН, потому что требует аккуратной миграции кода:
-- все места, где читается pilgrim_profiles.iin, должны перейти на persons.iin.
--
-- План миграции (когда будете готовы):
--   1. Применить блок ниже — создадутся persons + pilgrim_enrollments пустые.
--   2. Скопировать уникальных людей из pilgrim_profiles в persons.
--   3. Обновить код: loadPilgrimById(pilgrim_enrollment_id) вместо (pilgrim_id).
--   4. Дропнуть UNIQUE(iin) с pilgrim_profiles, оставить как обычную колонку.
--   5. В финале (через 1-2 релиза) — полностью перевести FK со старых pilgrim_profiles.id
--      на pilgrim_enrollments.id и переименовать.

/*
create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  iin text not null unique,
  full_name text not null,
  date_of_birth date,
  gender text check (gender in ('male', 'female')),
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilgrim_enrollments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete restrict,
  operator_id uuid not null references public.operators(id) on delete restrict,
  user_id uuid,  -- Supabase auth user
  season text,   -- 'hajj-2026', 'umrah-ramadan-2026'
  status text not null check (status in (
    'new', 'docs_pending', 'docs_complete', 'payment_pending',
    'payment_partial', 'ready', 'departed'
  )),
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (person_id, operator_id, season)
);

create index if not exists idx_pilgrim_enrollments_operator
  on public.pilgrim_enrollments(operator_id) where deleted_at is null;
create index if not exists idx_pilgrim_enrollments_person
  on public.pilgrim_enrollments(person_id);
create index if not exists idx_pilgrim_enrollments_user
  on public.pilgrim_enrollments(user_id) where user_id is not null;

alter table public.pilgrim_enrollments enable row level security;

-- RLS: оператор видит свои записи; пилигрим видит свои через user_id.
drop policy if exists "pilgrim_enrollments_read" on public.pilgrim_enrollments;
create policy "pilgrim_enrollments_read"
  on public.pilgrim_enrollments
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.operators o
      where o.id = pilgrim_enrollments.operator_id and o.user_id = auth.uid()
    )
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );
*/


-- ===========================================================================
-- 8. ПРОВЕРКА
-- ===========================================================================

do $$
begin
  raise notice 'Migration 0003_safety_upgrade applied successfully.';
  raise notice 'New objects: audit_events, payment_transactions, notifications.idempotency_key, operators bank fields, soft-delete columns.';
  raise notice 'Persons/enrollments refactor is scaffolded in a commented block — uncomment when ready to migrate code.';
end $$;
