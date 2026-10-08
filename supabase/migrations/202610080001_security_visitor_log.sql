-- ====================================================================
-- CGV10 Buku Tamu Security (Visitor Log) Migration
-- File: supabase/migrations/202610080001_security_visitor_log.sql
-- ====================================================================

begin;

-- 1. Ensure security permissions exist in role_permissions table
insert into public.role_permissions (role, permission) values
  ('security', 'security:read'),
  ('security', 'security:write'),
  ('security', 'security:checkout'),
  ('super_admin', 'security:read'),
  ('super_admin', 'security:write'),
  ('super_admin', 'security:checkout'),
  ('ketua_rt', 'security:read'),
  ('ketua_rt', 'security:write'),
  ('ketua_rt', 'security:checkout'),
  ('sekretaris', 'security:read'),
  ('sekretaris', 'security:write'),
  ('sekretaris', 'security:checkout')
on conflict do nothing;

-- 2. Create visitor_logs table
create table if not exists public.visitor_logs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text unique,
  visitor_name text not null,
  destination_type text not null default 'house' check (destination_type in ('house', 'facility', 'other')),
  cluster text not null,
  unit_number text not null default '',
  facility_name text not null default '',
  visit_type text not null check (visit_type in ('kurir', 'tamu', 'teknisi', 'lainnya')),
  purpose text not null,
  institution text not null default '',
  vehicle_plate text not null default '',
  visitor_photo_path text not null default '',
  id_card_photo_path text not null default '',
  id_card_required boolean not null default false,
  notes text not null default '',
  status text not null default 'active' check (status in ('active', 'checked_out')),
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references public.profiles(id) on delete set null,
  checked_in_by_name text not null default '',
  checked_out_at timestamptz,
  checked_out_by uuid references public.profiles(id) on delete set null,
  checked_out_by_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraints on length
alter table public.visitor_logs
  drop constraint if exists visitor_logs_name_check,
  add constraint visitor_logs_name_check check (char_length(btrim(visitor_name)) between 2 and 120);

alter table public.visitor_logs
  drop constraint if exists visitor_logs_purpose_check,
  add constraint visitor_logs_purpose_check check (char_length(btrim(purpose)) between 2 and 250);

-- Indexes for fast lookup & filtering
create index if not exists visitor_logs_status_checked_in_idx on public.visitor_logs (status, checked_in_at desc);
create index if not exists visitor_logs_cluster_unit_idx on public.visitor_logs (cluster, unit_number);
create index if not exists visitor_logs_checked_in_at_idx on public.visitor_logs (checked_in_at desc);
create index if not exists visitor_logs_visit_type_idx on public.visitor_logs (visit_type);
create index if not exists visitor_logs_visitor_name_idx on public.visitor_logs (visitor_name);

-- Automatic updated_at trigger
drop trigger if exists visitor_logs_set_updated_at on public.visitor_logs;
create trigger visitor_logs_set_updated_at
  before update on public.visitor_logs
  for each row execute function public.set_updated_at();

-- 3. Row Level Security (RLS) on visitor_logs
alter table public.visitor_logs enable row level security;

drop policy if exists "visitor_logs_select_authorized" on public.visitor_logs;
create policy "visitor_logs_select_authorized" on public.visitor_logs
  for select to authenticated
  using (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:read')
  );

drop policy if exists "visitor_logs_insert_authorized" on public.visitor_logs;
create policy "visitor_logs_insert_authorized" on public.visitor_logs
  for insert to authenticated
  with check (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
  );

drop policy if exists "visitor_logs_update_authorized" on public.visitor_logs;
create policy "visitor_logs_update_authorized" on public.visitor_logs
  for update to authenticated
  using (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
    or public.has_permission('security:checkout')
  )
  with check (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
    or public.has_permission('security:checkout')
  );

-- 4. Stored Procedure: create_visitor_log (Idempotent Arrival Logging)
create or replace function public.create_visitor_log(
  p_idempotency_key text,
  p_visitor_name text,
  p_destination_type text,
  p_cluster text,
  p_unit_number text,
  p_facility_name text,
  p_visit_type text,
  p_purpose text,
  p_institution text default '',
  p_vehicle_plate text default '',
  p_visitor_photo_path text default '',
  p_id_card_photo_path text default '',
  p_id_card_required boolean default false,
  p_notes text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_officer_name text := '';
  v_existing record;
  v_new record;
  v_clean_name text := btrim(coalesce(p_visitor_name, ''));
  v_clean_purpose text := btrim(coalesce(p_purpose, ''));
  v_clean_cluster text := btrim(coalesce(p_cluster, ''));
  v_clean_unit text := btrim(coalesce(p_unit_number, ''));
  v_clean_facility text := btrim(coalesce(p_facility_name, ''));
begin
  if v_user_id is null or not (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
  ) then
    raise exception 'Akses petugas security atau pengurus diperlukan untuk mencatat kunjungan';
  end if;

  -- Idempotency check: if already submitted with the same idempotency key, return existing record
  if p_idempotency_key is not null and btrim(p_idempotency_key) <> '' then
    select * into v_existing from public.visitor_logs where idempotency_key = btrim(p_idempotency_key);
    if found then
      return to_jsonb(v_existing);
    end if;
  end if;

  -- Input validations
  if char_length(v_clean_name) < 2 or char_length(v_clean_name) > 120 then
    raise exception 'Nama pengunjung wajib diisi (2 - 120 karakter)';
  end if;

  if p_destination_type not in ('house', 'facility', 'other') then
    raise exception 'Tipe tujuan tidak valid';
  end if;

  if p_destination_type = 'house' then
    if v_clean_cluster = '' then
      raise exception 'Blok/cluster tujuan wajib dipilih';
    end if;
    if v_clean_unit = '' then
      raise exception 'Nomor rumah/unit wajib diisi untuk kunjungan ke rumah';
    end if;
  else
    if v_clean_facility = '' then
      raise exception 'Detail fasilitas/tujuan wajib diisi untuk kunjungan non-rumah';
    end if;
  end if;

  if p_visit_type not in ('kurir', 'tamu', 'teknisi', 'lainnya') then
    raise exception 'Jenis kunjungan tidak valid';
  end if;

  if char_length(v_clean_purpose) < 2 or char_length(v_clean_purpose) > 250 then
    raise exception 'Keperluan kunjungan wajib diisi (2 - 250 karakter)';
  end if;

  if coalesce(p_visitor_photo_path, '') = '' then
    raise exception 'Foto pengunjung wajib diambil sebelum menyimpan';
  end if;

  if p_id_card_required and coalesce(p_id_card_photo_path, '') = '' then
    raise exception 'Foto identitas wajib diambil sesuai kebijakan pos';
  end if;

  select coalesce(display_name, email, 'Petugas Security') into v_officer_name
  from public.profiles where id = v_user_id;

  insert into public.visitor_logs (
    idempotency_key,
    visitor_name,
    destination_type,
    cluster,
    unit_number,
    facility_name,
    visit_type,
    purpose,
    institution,
    vehicle_plate,
    visitor_photo_path,
    id_card_photo_path,
    id_card_required,
    notes,
    status,
    checked_in_at,
    checked_in_by,
    checked_in_by_name
  ) values (
    nullif(btrim(p_idempotency_key), ''),
    v_clean_name,
    p_destination_type,
    coalesce(v_clean_cluster, 'Umum'),
    v_clean_unit,
    v_clean_facility,
    p_visit_type,
    v_clean_purpose,
    btrim(coalesce(p_institution, '')),
    upper(btrim(coalesce(p_vehicle_plate, ''))),
    coalesce(p_visitor_photo_path, ''),
    coalesce(p_id_card_photo_path, ''),
    coalesce(p_id_card_required, false),
    btrim(coalesce(p_notes, '')),
    'active',
    now(),
    v_user_id,
    v_officer_name
  )
  returning * into v_new;

  return to_jsonb(v_new);
end;
$$;

revoke all on function public.create_visitor_log(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text) from public;
grant execute on function public.create_visitor_log(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text) to authenticated;

-- 5. Stored Procedure: checkout_visitor (Idempotent Check-out)
create or replace function public.checkout_visitor(p_visitor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_officer_name text := '';
  v_log record;
begin
  if v_user_id is null or not (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:checkout')
    or public.has_permission('security:write')
  ) then
    raise exception 'Akses petugas security atau pengurus diperlukan untuk mencatat keluar';
  end if;

  select * into v_log from public.visitor_logs where id = p_visitor_id;
  if not found then
    raise exception 'Catatan kunjungan tidak ditemukan';
  end if;

  -- Idempotent check: if already checked out, do not change original checked_out_at or checked_out_by
  if v_log.status = 'checked_out' then
    return jsonb_build_object(
      'id', v_log.id,
      'status', 'checked_out',
      'checked_out_at', v_log.checked_out_at,
      'checked_out_by', v_log.checked_out_by,
      'checked_out_by_name', v_log.checked_out_by_name,
      'already_checked_out', true
    );
  end if;

  select coalesce(display_name, email, 'Petugas Security') into v_officer_name
  from public.profiles where id = v_user_id;

  update public.visitor_logs
  set
    status = 'checked_out',
    checked_out_at = now(),
    checked_out_by = v_user_id,
    checked_out_by_name = v_officer_name,
    updated_at = now()
  where id = p_visitor_id
  returning * into v_log;

  return jsonb_build_object(
    'id', v_log.id,
    'status', 'checked_out',
    'checked_out_at', v_log.checked_out_at,
    'checked_out_by', v_log.checked_out_by,
    'checked_out_by_name', v_log.checked_out_by_name,
    'already_checked_out', false
  );
end;
$$;

revoke all on function public.checkout_visitor(uuid) from public;
grant execute on function public.checkout_visitor(uuid) to authenticated;

-- 6. Stored Procedure: delete_visitor_log (Deletion of Visitor Record)
create or replace function public.delete_visitor_log(p_visitor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted record;
begin
  if v_user_id is null or not (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
  ) then
    raise exception 'Akses petugas security atau pengurus diperlukan untuk menghapus log kunjungan';
  end if;

  delete from public.visitor_logs
  where id = p_visitor_id
  returning * into v_deleted;

  if not found then
    raise exception 'Catatan kunjungan tidak ditemukan atau sudah dihapus';
  end if;

  return jsonb_build_object(
    'id', v_deleted.id,
    'visitor_name', v_deleted.visitor_name,
    'success', true
  );
end;
$$;

revoke all on function public.delete_visitor_log(uuid) from public;
grant execute on function public.delete_visitor_log(uuid) to authenticated;

-- Delete Policy for visitor_logs
drop policy if exists "visitor_logs_delete_authorized" on public.visitor_logs;
create policy "visitor_logs_delete_authorized" on public.visitor_logs
  for delete to authenticated
  using (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
  );

-- 7. Private Storage Bucket: security-visitor-attachments
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'security-visitor-attachments',
  'security-visitor-attachments',
  false,
  10485760, -- 10MB
  array[
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "security_attachments_select" on storage.objects;
create policy "security_attachments_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'security-visitor-attachments'
  and (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:read')
  )
);

drop policy if exists "security_attachments_insert" on storage.objects;
create policy "security_attachments_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'security-visitor-attachments'
  and (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
  )
);

drop policy if exists "security_attachments_delete" on storage.objects;
create policy "security_attachments_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'security-visitor-attachments'
  and (
    public.has_role('security')
    or public.has_production_admin_role()
    or public.has_permission('security:write')
  )
);

commit;

