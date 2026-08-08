-- Resident import staging.
-- Keeps XLSX-derived rows reviewable before any data is promoted into households
-- or household_members.

begin;

create table if not exists public.resident_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file_name text not null,
  source_file_path text not null default '',
  source_file_sha256 text,
  status text not null default 'dry_run'
    check (status in ('dry_run', 'reviewing', 'approved', 'promoted', 'archived')),
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resident_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.resident_import_batches(id) on delete cascade,
  source_sheet text not null,
  source_row integer not null check (source_row > 0),
  resident_name_raw text not null default '',
  address_raw text not null default '',
  cluster_raw text not null default '',
  cluster_normalized text not null default '',
  unit_number_raw text not null default '',
  unit_number_normalized text not null default '',
  phone_raw text not null default '',
  household_key text not null default '',
  confidence integer not null default 0 check (confidence between 0 and 100),
  review_status text not null default 'needs_review'
    check (review_status in ('auto_matched', 'needs_review', 'approved', 'rejected', 'promoted')),
  review_reason text[] not null default '{}'::text[],
  import_note text[] not null default '{}'::text[],
  raw_values jsonb not null default '[]'::jsonb,
  matched_household_id uuid references public.households(id) on delete set null,
  reviewer_note text not null default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, source_sheet, source_row)
);

create index if not exists resident_import_batches_status_idx
  on public.resident_import_batches (status, created_at desc);

create index if not exists resident_import_rows_batch_status_idx
  on public.resident_import_rows (batch_id, review_status, confidence desc);

create index if not exists resident_import_rows_household_key_idx
  on public.resident_import_rows (household_key)
  where household_key <> '';

create index if not exists resident_import_rows_cluster_unit_idx
  on public.resident_import_rows (cluster_normalized, unit_number_normalized);

drop trigger if exists resident_import_batches_set_updated_at on public.resident_import_batches;
create trigger resident_import_batches_set_updated_at
before update on public.resident_import_batches
for each row execute function public.set_updated_at();

drop trigger if exists resident_import_rows_set_updated_at on public.resident_import_rows;
create trigger resident_import_rows_set_updated_at
before update on public.resident_import_rows
for each row execute function public.set_updated_at();

alter table public.resident_import_batches enable row level security;
alter table public.resident_import_rows enable row level security;

drop policy if exists "resident_import_batches_admin_read" on public.resident_import_batches;
create policy "resident_import_batches_admin_read" on public.resident_import_batches
for select using (public.has_permission('resident:read'));

drop policy if exists "resident_import_batches_admin_write" on public.resident_import_batches;
create policy "resident_import_batches_admin_write" on public.resident_import_batches
for all using (public.has_permission('resident:write'))
with check (public.has_permission('resident:write'));

drop policy if exists "resident_import_rows_admin_read" on public.resident_import_rows;
create policy "resident_import_rows_admin_read" on public.resident_import_rows
for select using (public.has_permission('resident:read'));

drop policy if exists "resident_import_rows_admin_write" on public.resident_import_rows;
create policy "resident_import_rows_admin_write" on public.resident_import_rows
for all using (public.has_permission('resident:write'))
with check (public.has_permission('resident:write'));

commit;
