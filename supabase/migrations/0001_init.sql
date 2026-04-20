create extension if not exists pgcrypto with schema extensions;

create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company_name text not null,
  license_number text not null unique,
  license_expiry date not null,
  is_verified boolean not null default false,
  rating numeric(2, 1) not null default 0,
  total_reviews integer not null default 0,
  phone text,
  address text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilgrim_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  operator_id uuid not null references public.operators(id) on delete cascade,
  full_name text not null,
  iin text not null unique,
  phone text,
  date_of_birth date,
  gender text,
  status text not null check (
    status in ('new', 'docs_pending', 'docs_complete', 'payment_pending', 'payment_partial', 'ready', 'departed')
  ),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  pilgrim_id uuid not null references public.pilgrim_profiles(id) on delete cascade,
  type text not null check (
    type in ('passport', 'medical_certificate', 'photo', 'questionnaire', 'vaccination')
  ),
  file_url text not null,
  file_name text not null,
  is_verified boolean not null default false,
  uploaded_at timestamptz not null default timezone('utc', now()),
  unique (pilgrim_id, type)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  name text not null,
  flight_date date not null,
  return_date date not null,
  hotel_mecca text,
  hotel_medina text,
  quota_total integer not null check (quota_total > 0),
  quota_filled integer not null default 0 check (quota_filled >= 0),
  guide_name text,
  guide_phone text,
  departure_city text not null check (
    departure_city in ('Almaty', 'Astana', 'Shymkent', 'Turkestan', 'Aktau')
  ),
  status text not null check (status in ('forming', 'full', 'departed', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilgrim_groups (
  pilgrim_id uuid not null references public.pilgrim_profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (pilgrim_id, group_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  pilgrim_id uuid not null references public.pilgrim_profiles(id) on delete cascade,
  operator_id uuid not null references public.operators(id) on delete cascade,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
  payment_method text not null check (payment_method in ('kaspi', 'halyk', 'cash', 'transfer')),
  installment_plan boolean not null default false,
  installment_months integer,
  status text not null check (status in ('pending', 'partial', 'paid')),
  contract_url text,
  qr_code text unique,
  contract_generated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.operator_reviews (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  pilgrim_id uuid not null references public.pilgrim_profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  pilgrim_id uuid not null references public.pilgrim_profiles(id) on delete cascade,
  operator_id uuid not null references public.operators(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'sms', 'email', 'in_app')),
  type text not null check (
    type in ('reminder_docs', 'reminder_payment', 'reminder_flight', 'welcome', 'checklist')
  ),
  message text not null,
  status text not null check (status in ('queued', 'sent', 'failed')),
  scheduled_at timestamptz not null,
  sent_at timestamptz
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  pilgrim_id uuid not null references public.pilgrim_profiles(id) on delete cascade,
  item_name text not null,
  category text not null check (category in ('documents', 'health', 'clothing', 'finance', 'spiritual')),
  is_checked boolean not null default false
);

create index if not exists operators_user_id_idx on public.operators(user_id);
create index if not exists pilgrim_profiles_operator_id_idx on public.pilgrim_profiles(operator_id);
create index if not exists pilgrim_profiles_user_id_idx on public.pilgrim_profiles(user_id);
create index if not exists documents_pilgrim_id_idx on public.documents(pilgrim_id);
create index if not exists groups_operator_id_idx on public.groups(operator_id);
create index if not exists pilgrim_groups_group_id_idx on public.pilgrim_groups(group_id);
create index if not exists payments_pilgrim_id_idx on public.payments(pilgrim_id);
create index if not exists payments_operator_id_idx on public.payments(operator_id);
create index if not exists operator_reviews_operator_id_idx on public.operator_reviews(operator_id);
create index if not exists notifications_operator_id_idx on public.notifications(operator_id);
create index if not exists notifications_pilgrim_id_idx on public.notifications(pilgrim_id);
create index if not exists checklist_items_pilgrim_id_idx on public.checklist_items(pilgrim_id);

create or replace function public.app_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'authenticated');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.app_role() = 'admin';
$$;

create or replace function public.current_operator_id()
returns uuid
language sql
stable
as $$
  select id
  from public.operators
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_pilgrim_id()
returns uuid
language sql
stable
as $$
  select id
  from public.pilgrim_profiles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace view public.pilgrim_readiness_view
with (security_invoker = true)
as
with doc_counts as (
  select pilgrim_id, count(distinct type) as docs_count
  from public.documents
  group by pilgrim_id
),
payment_state as (
  select pilgrim_id, bool_or(status = 'paid') as is_payment_complete
  from public.payments
  group by pilgrim_id
),
group_state as (
  select pilgrim_id, true as is_in_group
  from public.pilgrim_groups
  group by pilgrim_id
)
select
  p.id as pilgrim_id,
  coalesce(d.docs_count, 0) as docs_count,
  coalesce(pay.is_payment_complete, false) as is_payment_complete,
  coalesce(gs.is_in_group, false) as is_in_group,
  round(
    (
      (
        coalesce(d.docs_count, 0)::numeric
        + case when coalesce(pay.is_payment_complete, false) then 1 else 0 end
        + case when coalesce(gs.is_in_group, false) then 1 else 0 end
      ) / 7.0
    ) * 100
  )::int as readiness_percent,
  (
    coalesce(d.docs_count, 0) = 5
    and coalesce(pay.is_payment_complete, false)
    and coalesce(gs.is_in_group, false)
  ) as is_ready
from public.pilgrim_profiles p
left join doc_counts d on d.pilgrim_id = p.id
left join payment_state pay on pay.pilgrim_id = p.id
left join group_state gs on gs.pilgrim_id = p.id;

alter table public.operators enable row level security;
alter table public.pilgrim_profiles enable row level security;
alter table public.documents enable row level security;
alter table public.groups enable row level security;
alter table public.pilgrim_groups enable row level security;
alter table public.payments enable row level security;
alter table public.operator_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.checklist_items enable row level security;

create policy "operators_select_policy"
on public.operators
for select
using (
  public.is_admin()
  or user_id = auth.uid()
  or is_verified = true
);

create policy "operators_insert_policy"
on public.operators
for insert
with check (
  public.is_admin()
  or user_id = auth.uid()
);

create policy "operators_update_policy"
on public.operators
for update
using (
  public.is_admin()
  or user_id = auth.uid()
)
with check (
  public.is_admin()
  or user_id = auth.uid()
);

create policy "operators_delete_policy"
on public.operators
for delete
using (public.is_admin());

create policy "pilgrim_profiles_select_policy"
on public.pilgrim_profiles
for select
using (
  public.is_admin()
  or user_id = auth.uid()
  or operator_id = public.current_operator_id()
);

create policy "pilgrim_profiles_insert_policy"
on public.pilgrim_profiles
for insert
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
  or user_id = auth.uid()
);

create policy "pilgrim_profiles_update_policy"
on public.pilgrim_profiles
for update
using (
  public.is_admin()
  or user_id = auth.uid()
  or operator_id = public.current_operator_id()
)
with check (
  public.is_admin()
  or user_id = auth.uid()
  or operator_id = public.current_operator_id()
);

create policy "documents_select_policy"
on public.documents
for select
using (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = documents.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "documents_insert_policy"
on public.documents
for insert
with check (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = documents.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "documents_update_policy"
on public.documents
for update
using (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = documents.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
)
with check (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = documents.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "groups_select_policy"
on public.groups
for select
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "groups_insert_policy"
on public.groups
for insert
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "groups_update_policy"
on public.groups
for update
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
)
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "groups_delete_policy"
on public.groups
for delete
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "pilgrim_groups_select_policy"
on public.pilgrim_groups
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = pilgrim_groups.pilgrim_id
      and (pp.user_id = auth.uid() or pp.operator_id = public.current_operator_id())
  )
);

create policy "pilgrim_groups_insert_policy"
on public.pilgrim_groups
for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = pilgrim_groups.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "pilgrim_groups_delete_policy"
on public.pilgrim_groups
for delete
using (
  public.is_admin()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = pilgrim_groups.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "payments_select_policy"
on public.payments
for select
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
  or pilgrim_id = public.current_pilgrim_id()
);

create policy "payments_insert_policy"
on public.payments
for insert
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "payments_update_policy"
on public.payments
for update
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
)
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "operator_reviews_select_policy"
on public.operator_reviews
for select
using (
  is_visible = true
  or public.is_admin()
  or exists (
    select 1
    from public.operators o
    where o.id = operator_reviews.operator_id
      and o.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = operator_reviews.pilgrim_id
      and pp.user_id = auth.uid()
  )
);

create policy "operator_reviews_insert_policy"
on public.operator_reviews
for insert
with check (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
);

create policy "operator_reviews_update_policy"
on public.operator_reviews
for update
using (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
)
with check (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
);

create policy "notifications_select_policy"
on public.notifications
for select
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
  or pilgrim_id = public.current_pilgrim_id()
);

create policy "notifications_insert_policy"
on public.notifications
for insert
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "notifications_update_policy"
on public.notifications
for update
using (
  public.is_admin()
  or operator_id = public.current_operator_id()
)
with check (
  public.is_admin()
  or operator_id = public.current_operator_id()
);

create policy "checklist_items_select_policy"
on public.checklist_items
for select
using (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = checklist_items.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "checklist_items_insert_policy"
on public.checklist_items
for insert
with check (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = checklist_items.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create policy "checklist_items_update_policy"
on public.checklist_items
for update
using (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = checklist_items.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
)
with check (
  public.is_admin()
  or pilgrim_id = public.current_pilgrim_id()
  or exists (
    select 1
    from public.pilgrim_profiles pp
    where pp.id = checklist_items.pilgrim_id
      and pp.operator_id = public.current_operator_id()
  )
);

create or replace function public.sync_group_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group_id uuid;
begin
  if tg_op = 'INSERT' then
    target_group_id := new.group_id;

    update public.groups
    set quota_filled = quota_filled + 1
    where id = target_group_id;
  elsif tg_op = 'DELETE' then
    target_group_id := old.group_id;

    update public.groups
    set quota_filled = greatest(quota_filled - 1, 0)
    where id = target_group_id;
  end if;

  update public.groups
  set status = case
    when quota_filled >= quota_total then 'full'
    when status = 'full' then 'forming'
    else status
  end
  where id = target_group_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_group_quota on public.pilgrim_groups;
create trigger trg_sync_group_quota
after insert or delete on public.pilgrim_groups
for each row
execute function public.sync_group_quota();

create or replace function public.refresh_operator_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_operator uuid;
begin
  affected_operator := coalesce(new.operator_id, old.operator_id);

  update public.operators
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 1)
      from public.operator_reviews
      where operator_id = affected_operator
        and is_visible = true
    ), 0),
    total_reviews = (
      select count(*)
      from public.operator_reviews
      where operator_id = affected_operator
        and is_visible = true
    )
  where id = affected_operator;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_refresh_operator_rating on public.operator_reviews;
create trigger trg_refresh_operator_rating
after insert or update or delete on public.operator_reviews
for each row
execute function public.refresh_operator_rating();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "documents_bucket_select_policy"
on storage.objects
for select
using (
  bucket_id = 'documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_pilgrim_id()::text
    or exists (
      select 1
      from public.pilgrim_profiles pp
      where pp.id::text = (storage.foldername(name))[1]
        and pp.operator_id = public.current_operator_id()
    )
  )
);

create policy "documents_bucket_insert_policy"
on storage.objects
for insert
with check (
  bucket_id = 'documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_pilgrim_id()::text
    or exists (
      select 1
      from public.pilgrim_profiles pp
      where pp.id::text = (storage.foldername(name))[1]
        and pp.operator_id = public.current_operator_id()
    )
  )
);

create policy "documents_bucket_update_policy"
on storage.objects
for update
using (
  bucket_id = 'documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_pilgrim_id()::text
    or exists (
      select 1
      from public.pilgrim_profiles pp
      where pp.id::text = (storage.foldername(name))[1]
        and pp.operator_id = public.current_operator_id()
    )
  )
)
with check (
  bucket_id = 'documents'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_pilgrim_id()::text
    or exists (
      select 1
      from public.pilgrim_profiles pp
      where pp.id::text = (storage.foldername(name))[1]
        and pp.operator_id = public.current_operator_id()
    )
  )
);
