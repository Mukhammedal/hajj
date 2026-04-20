alter table public.operators
  add column if not exists google_sheet_id text,
  add column if not exists last_synced_at timestamptz,
  add column if not exists auto_sync_enabled boolean not null default false;

create table if not exists public.sync_logs (
  id uuid default gen_random_uuid() primary key,
  operator_id uuid not null references public.operators(id) on delete cascade,
  sheet_id text not null,
  sheet_name text,
  synced_at timestamptz not null default timezone('utc', now()),
  rows_created integer not null default 0,
  rows_updated integer not null default 0,
  rows_skipped integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);

create index if not exists operators_google_sheet_id_idx on public.operators(google_sheet_id);
create index if not exists sync_logs_operator_id_idx on public.sync_logs(operator_id);
create index if not exists sync_logs_synced_at_idx on public.sync_logs(synced_at desc);

alter table public.sync_logs enable row level security;

create policy "sync_logs_select_policy"
on public.sync_logs
for select
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "sync_logs_insert_policy"
on public.sync_logs
for insert
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "sync_logs_update_policy"
on public.sync_logs
for update
using (public.is_admin())
with check (public.is_admin());

create policy "sync_logs_delete_policy"
on public.sync_logs
for delete
using (public.is_admin());
