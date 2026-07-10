-- CGV10 production auth, role, permission, and resident-data foundation.
-- Apply this in Supabase SQL Editor after creating the project.
-- The first super_admin must be bootstrapped manually after their Auth user exists.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.app_role as enum (
  'super_admin',
  'ketua_rt',
  'sekretaris',
  'bendahara',
  'warga',
  'security',
  'palugada_reviewer'
);

create type public.user_status as enum (
  'invited',
  'active',
  'suspended'
);

create type public.verification_status as enum (
  'draft',
  'review',
  'verified',
  'rejected'
);

create type public.publish_status as enum (
  'draft',
  'review',
  'published',
  'archived'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email citext unique,
  phone text,
  status public.user_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  role public.app_role not null,
  permission text not null,
  created_at timestamptz not null default now(),
  primary key (role, permission)
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  role public.app_role not null,
  invited_by uuid references public.profiles(id) on delete set null,
  status public.user_status not null default 'invited',
  note text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  head_user_id uuid references public.profiles(id) on delete set null,
  cluster text not null,
  block_or_unit text not null,
  family_count integer not null default 0 check (family_count >= 0),
  vehicle_count integer not null default 0 check (vehicle_count >= 0),
  verification_status public.verification_status not null default 'draft',
  visibility text not null default 'admin_only' check (visibility in ('private', 'admin_only')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cluster, block_or_unit)
);

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  relationship text not null,
  is_public boolean not null default false,
  verification_status public.verification_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete set null,
  submitted_by uuid references public.profiles(id) on delete set null,
  category text not null check (
    category in ('administrasi', 'pengaduan', 'keamanan', 'iuran', 'aspirasi', 'palugada', 'lainnya')
  ),
  title text not null,
  description text not null default '',
  status text not null default 'submitted' check (
    status in ('draft', 'submitted', 'triage', 'in_progress', 'resolved', 'rejected')
  ),
  priority text not null default 'normal' check (priority in ('normal', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null,
  description text not null,
  category text not null,
  amount integer not null check (amount >= 0),
  direction text not null check (direction in ('income', 'expense')),
  visibility text not null default 'internal' check (visibility in ('public_summary', 'internal')),
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finance_confirmations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete set null,
  submitted_by uuid references public.profiles(id) on delete set null,
  period text not null,
  amount integer not null check (amount >= 0),
  payment_date date,
  status text not null default 'submitted' check (
    status in ('submitted', 'matched', 'needs_review', 'rejected')
  ),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.palugada_listings (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid references public.profiles(id) on delete set null,
  seller_household_id uuid references public.households(id) on delete set null,
  name text not null,
  category text not null check (category in ('barang', 'kuliner', 'jasa', 'properti', 'lainnya')),
  cluster text not null,
  price_label text not null default '',
  description text not null default '',
  availability_note text not null default '',
  contact_method text not null default '',
  seller_status text not null default 'offline' check (seller_status in ('online', 'offline')),
  seller_status_note text not null default '',
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'review', 'approved', 'hidden', 'rejected')
  ),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('artikel', 'pengumuman', 'agenda')),
  excerpt text not null default '',
  body text not null default '',
  status public.publish_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id) on delete set null,
  linked_type text not null check (
    linked_type in ('service_request', 'finance_confirmation', 'palugada_listing', 'household_profile', 'kegiatan')
  ),
  linked_id uuid not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null check (file_size >= 0),
  storage_path text not null,
  thumbnail_path text,
  visibility text not null default 'private' check (
    visibility in ('private', 'admin_only', 'public_after_approval')
  ),
  moderation_status text not null default 'pending' check (
    moderation_status in ('pending', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);

insert into public.role_permissions (role, permission) values
  ('super_admin', 'users:read'),
  ('super_admin', 'users:manage'),
  ('super_admin', 'resident:read'),
  ('super_admin', 'resident:write'),
  ('super_admin', 'services:read'),
  ('super_admin', 'services:write'),
  ('super_admin', 'finance:read'),
  ('super_admin', 'finance:write'),
  ('super_admin', 'content:read'),
  ('super_admin', 'content:write'),
  ('super_admin', 'content:approve'),
  ('super_admin', 'palugada:read'),
  ('super_admin', 'palugada:write'),
  ('super_admin', 'settings:manage'),
  ('super_admin', 'audit:read'),
  ('ketua_rt', 'users:read'),
  ('ketua_rt', 'resident:read'),
  ('ketua_rt', 'services:read'),
  ('ketua_rt', 'services:write'),
  ('ketua_rt', 'finance:read'),
  ('ketua_rt', 'content:read'),
  ('ketua_rt', 'content:write'),
  ('ketua_rt', 'content:approve'),
  ('ketua_rt', 'palugada:read'),
  ('ketua_rt', 'palugada:write'),
  ('sekretaris', 'resident:read'),
  ('sekretaris', 'resident:write'),
  ('sekretaris', 'services:read'),
  ('sekretaris', 'services:write'),
  ('sekretaris', 'content:read'),
  ('sekretaris', 'content:write'),
  ('sekretaris', 'palugada:read'),
  ('bendahara', 'resident:read'),
  ('bendahara', 'services:read'),
  ('bendahara', 'finance:read'),
  ('bendahara', 'finance:write')
on conflict do nothing;

create index profiles_email_idx on public.profiles (email);
create index user_roles_role_idx on public.user_roles (role);
create index households_head_user_id_idx on public.households (head_user_id);
create index household_members_household_id_idx on public.household_members (household_id);
create index household_members_user_id_idx on public.household_members (user_id);
create index service_requests_status_idx on public.service_requests (status);
create index service_requests_submitted_by_idx on public.service_requests (submitted_by);
create index finance_transactions_date_idx on public.finance_transactions (transaction_date desc);
create index finance_confirmations_status_idx on public.finance_confirmations (status);
create index palugada_listings_status_idx on public.palugada_listings (status);
create index portal_posts_status_published_idx on public.portal_posts (status, published_at desc);
create index attachments_linked_idx on public.attachments (linked_type, linked_id);
create index audit_logs_actor_created_idx on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger households_set_updated_at before update on public.households for each row execute function public.set_updated_at();
create trigger household_members_set_updated_at before update on public.household_members for each row execute function public.set_updated_at();
create trigger service_requests_set_updated_at before update on public.service_requests for each row execute function public.set_updated_at();
create trigger finance_transactions_set_updated_at before update on public.finance_transactions for each row execute function public.set_updated_at();
create trigger finance_confirmations_set_updated_at before update on public.finance_confirmations for each row execute function public.set_updated_at();
create trigger palugada_listings_set_updated_at before update on public.palugada_listings for each row execute function public.set_updated_at();
create trigger portal_posts_set_updated_at before update on public.portal_posts for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.email,
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.has_role(target_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = target_role
  );
$$;

create or replace function public.has_permission(target_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = auth.uid()
      and rp.permission = target_permission
  );
$$;

alter table public.profiles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.admin_invites enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.service_requests enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_confirmations enable row level security;
alter table public.palugada_listings enable row level security;
alter table public.portal_posts enable row level security;
alter table public.attachments enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select
using (id = auth.uid() or public.has_permission('users:read') or public.has_permission('resident:read'));

create policy "profiles_update_own_or_admin" on public.profiles for update
using (id = auth.uid() or public.has_permission('users:manage'))
with check (id = auth.uid() or public.has_permission('users:manage'));

create policy "role_permissions_select_authenticated" on public.role_permissions for select
to authenticated using (true);

create policy "user_roles_select_own_or_admin" on public.user_roles for select
using (user_id = auth.uid() or public.has_permission('users:read'));

create policy "user_roles_manage_super_admin" on public.user_roles for all
using (public.has_permission('users:manage'))
with check (public.has_permission('users:manage'));

create policy "admin_invites_manage_super_admin" on public.admin_invites for all
using (public.has_permission('users:manage'))
with check (public.has_permission('users:manage'));

create policy "households_select_owner_or_admin" on public.households for select
using (head_user_id = auth.uid() or public.has_permission('resident:read'));

create policy "households_write_admin" on public.households for all
using (public.has_permission('resident:write'))
with check (public.has_permission('resident:write'));

create policy "household_members_select_related_or_admin" on public.household_members for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.households h
    where h.id = household_id
      and h.head_user_id = auth.uid()
  )
  or public.has_permission('resident:read')
);

create policy "household_members_write_admin" on public.household_members for all
using (public.has_permission('resident:write'))
with check (public.has_permission('resident:write'));

create policy "service_requests_select_own_or_admin" on public.service_requests for select
using (submitted_by = auth.uid() or public.has_permission('services:read'));

create policy "service_requests_insert_own_or_admin" on public.service_requests for insert
with check (submitted_by = auth.uid() or public.has_permission('services:write'));

create policy "service_requests_update_admin" on public.service_requests for update
using (public.has_permission('services:write'))
with check (public.has_permission('services:write'));

create policy "finance_transactions_admin_read" on public.finance_transactions for select
using (public.has_permission('finance:read'));

create policy "finance_transactions_admin_write" on public.finance_transactions for all
using (public.has_permission('finance:write'))
with check (public.has_permission('finance:write'));

create policy "finance_confirmations_select_own_or_finance" on public.finance_confirmations for select
using (submitted_by = auth.uid() or public.has_permission('finance:read'));

create policy "finance_confirmations_insert_own" on public.finance_confirmations for insert
with check (submitted_by = auth.uid());

create policy "finance_confirmations_update_finance" on public.finance_confirmations for update
using (public.has_permission('finance:write'))
with check (public.has_permission('finance:write'));

create policy "palugada_listings_public_approved" on public.palugada_listings for select
using (status = 'approved' or seller_user_id = auth.uid() or public.has_permission('palugada:read'));

create policy "palugada_listings_insert_own_or_admin" on public.palugada_listings for insert
with check (seller_user_id = auth.uid() or public.has_permission('palugada:write'));

create policy "palugada_listings_update_owner_or_admin" on public.palugada_listings for update
using (seller_user_id = auth.uid() or public.has_permission('palugada:write'))
with check (seller_user_id = auth.uid() or public.has_permission('palugada:write'));

create policy "portal_posts_public_published" on public.portal_posts for select
using (status = 'published' or public.has_permission('content:read'));

create policy "portal_posts_write_content_admin" on public.portal_posts for all
using (public.has_permission('content:write'))
with check (public.has_permission('content:write'));

create policy "attachments_select_owner_or_admin" on public.attachments for select
using (
  owner_user_id = auth.uid()
  or public.has_permission('services:read')
  or public.has_permission('finance:read')
  or public.has_permission('resident:read')
  or public.has_permission('palugada:read')
);

create policy "attachments_insert_owner" on public.attachments for insert
with check (owner_user_id = auth.uid());

create policy "attachments_update_admin" on public.attachments for update
using (
  public.has_permission('services:write')
  or public.has_permission('finance:write')
  or public.has_permission('resident:write')
  or public.has_permission('palugada:write')
)
with check (
  public.has_permission('services:write')
  or public.has_permission('finance:write')
  or public.has_permission('resident:write')
  or public.has_permission('palugada:write')
);

create policy "audit_logs_select_super_admin" on public.audit_logs for select
using (public.has_permission('audit:read'));

create policy "audit_logs_insert_authenticated_actor" on public.audit_logs for insert
with check (actor_user_id = auth.uid());
