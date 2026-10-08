-- Migration: Support Edit & Delete for Resident Registrations and Households
-- Adds DELETE policy on resident_registration_requests for admins with resident:write permission
-- Adds RPC functions for secure deletion, editing, and audit logging

begin;

-- 1. Ensure admin can delete resident registration requests (e.g. for duplicates or invalid entries)
drop policy if exists "resident_registration_requests_admin_delete" on public.resident_registration_requests;
create policy "resident_registration_requests_admin_delete" on public.resident_registration_requests
for delete using (public.has_permission('resident:write'));

-- 2. Function to delete a resident registration request with audit logging
create or replace function public.admin_delete_resident_registration_request(
  p_request_id uuid,
  p_reason text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_request  public.resident_registration_requests%rowtype;
  clean_reason    text := btrim(coalesce(p_reason, ''));
begin
  if current_user_id is null or not public.has_permission('resident:write') then
    raise exception 'Akses pengelolaan pendaftaran warga diperlukan';
  end if;

  select *
  into target_request
  from public.resident_registration_requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Data pendaftaran tidak ditemukan';
  end if;

  -- Delete the request row
  delete from public.resident_registration_requests
  where id = p_request_id;

  -- Record audit log
  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_snapshot,
    after_snapshot
  )
  values (
    current_user_id,
    'resident_registration.deleted',
    'resident_registration_request',
    p_request_id,
    to_jsonb(target_request),
    jsonb_build_object(
      'reason', clean_reason,
      'deleted_by', current_user_id,
      'email', target_request.email,
      'display_name', target_request.display_name,
      'status', target_request.status
    )
  );
end;
$$;

revoke all on function public.admin_delete_resident_registration_request(uuid, text) from public;
grant execute on function public.admin_delete_resident_registration_request(uuid, text) to authenticated;

-- 3. Function to update a resident registration request
create or replace function public.admin_update_resident_registration_request(
  p_request_id uuid,
  p_display_name text,
  p_phone text,
  p_email text,
  p_cluster text,
  p_block_or_unit text,
  p_status text default null,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_request  public.resident_registration_requests%rowtype;
  clean_name      text := btrim(coalesce(p_display_name, ''));
  clean_phone     text := btrim(coalesce(p_phone, ''));
  clean_email     citext := lower(btrim(coalesce(p_email, '')))::citext;
  clean_cluster   text := btrim(coalesce(p_cluster, ''));
  clean_block     text := btrim(coalesce(p_block_or_unit, ''));
  clean_note      text := btrim(coalesce(p_admin_note, ''));
  new_status      text;
begin
  if current_user_id is null or not public.has_permission('resident:write') then
    raise exception 'Akses pengelolaan pendaftaran warga diperlukan';
  end if;

  if clean_name = '' then
    raise exception 'Nama warga tidak boleh kosong';
  end if;

  if clean_email::text !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Format email tidak valid';
  end if;

  select *
  into target_request
  from public.resident_registration_requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Data pendaftaran tidak ditemukan';
  end if;

  new_status := coalesce(nullif(p_status, ''), target_request.status);

  update public.resident_registration_requests
  set display_name = clean_name,
      phone        = clean_phone,
      email        = clean_email,
      cluster      = clean_cluster,
      block_or_unit= clean_block,
      status       = new_status,
      admin_note   = coalesce(nullif(clean_note, ''), admin_note),
      updated_at   = now()
  where id = p_request_id;

  -- If request is linked to a profile, update profile info too
  if target_request.requested_user_id is not null then
    update public.profiles
    set display_name = clean_name,
        phone        = clean_phone,
        updated_at   = now()
    where id = target_request.requested_user_id;
  end if;

  -- Record audit log
  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_snapshot,
    after_snapshot
  )
  values (
    current_user_id,
    'resident_registration.updated',
    'resident_registration_request',
    p_request_id,
    to_jsonb(target_request),
    jsonb_build_object(
      'display_name', clean_name,
      'email', clean_email,
      'phone', clean_phone,
      'cluster', clean_cluster,
      'block_or_unit', clean_block,
      'status', new_status,
      'admin_note', clean_note
    )
  );
end;
$$;

revoke all on function public.admin_update_resident_registration_request(uuid, text, text, text, text, text, text, text) from public;
grant execute on function public.admin_update_resident_registration_request(uuid, text, text, text, text, text, text, text) to authenticated;

-- 4. Function to update household details
create or replace function public.admin_update_household(
  p_household_id uuid,
  p_cluster text,
  p_block_or_unit text,
  p_unit_number text default null,
  p_primary_contact_name text default null,
  p_primary_phone text default null,
  p_occupancy_status text default null,
  p_verification_status text default null,
  p_family_count integer default 0,
  p_vehicle_count integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_household public.households%rowtype;
  clean_cluster   text := btrim(coalesce(p_cluster, ''));
  clean_block     text := btrim(coalesce(p_block_or_unit, ''));
  clean_unit      text := nullif(btrim(coalesce(p_unit_number, '')), '');
  clean_name      text := nullif(btrim(coalesce(p_primary_contact_name, '')), '');
  clean_phone     text := nullif(btrim(coalesce(p_primary_phone, '')), '');
  clean_occupancy text := coalesce(nullif(p_occupancy_status, ''), 'active');
  clean_verif     public.verification_status;
begin
  if current_user_id is null or not public.has_permission('resident:write') then
    raise exception 'Akses pengelolaan data rumah diperlukan';
  end if;

  select *
  into target_household
  from public.households
  where id = p_household_id
  for update;

  if target_household.id is null then
    raise exception 'Data rumah tidak ditemukan';
  end if;

  clean_verif := coalesce(p_verification_status::public.verification_status, target_household.verification_status);

  update public.households
  set cluster              = coalesce(nullif(clean_cluster, ''), cluster),
      block_or_unit        = coalesce(nullif(clean_block, ''), block_or_unit),
      unit_number          = clean_unit,
      primary_contact_name = clean_name,
      primary_phone        = clean_phone,
      occupancy_status     = clean_occupancy,
      verification_status  = clean_verif,
      family_count         = greatest(0, coalesce(p_family_count, family_count)),
      vehicle_count        = greatest(0, coalesce(p_vehicle_count, vehicle_count)),
      updated_at           = now()
  where id = p_household_id;

  -- Record audit log
  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_snapshot,
    after_snapshot
  )
  values (
    current_user_id,
    'household.updated',
    'household',
    p_household_id,
    to_jsonb(target_household),
    jsonb_build_object(
      'cluster', clean_cluster,
      'block_or_unit', clean_block,
      'primary_contact_name', clean_name,
      'primary_phone', clean_phone,
      'occupancy_status', clean_occupancy,
      'verification_status', clean_verif
    )
  );
end;
$$;

revoke all on function public.admin_update_household(uuid, text, text, text, text, text, text, text, integer, integer) from public;
grant execute on function public.admin_update_household(uuid, text, text, text, text, text, text, text, integer, integer) to authenticated;

commit;
