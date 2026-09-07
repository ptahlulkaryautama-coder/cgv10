-- Fix: 1 household bisa punya banyak anggota terdaftar (multi-registrant).
-- head_user_id hanya diset saat pertama kali (tidak overwrite).
-- Setiap approval menambahkan entry di household_members.
-- Tambah unique constraint (household_id, full_name) agar ON CONFLICT bisa dipakai.

begin;

-- Tambah unique constraint di household_members jika belum ada
-- (pakai full_name sebagai deduplication key karena user_id bisa null)
alter table public.household_members
  drop constraint if exists household_members_household_full_name_unique;

alter table public.household_members
  add constraint household_members_household_full_name_unique
  unique (household_id, full_name);

-- Tambah kolom approved_via jika belum ada
-- (untuk tracking apakah member ini masuk via approval atau manual)
alter table public.household_members
  add column if not exists approved_via_request_id uuid
  references public.resident_registration_requests(id) on delete set null;

-- Rewrite approve function: multi-member aware
create or replace function public.approve_resident_registration_request(
  p_request_id uuid,
  p_admin_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id       uuid := auth.uid();
  target_request        public.resident_registration_requests%rowtype;
  target_user_id        uuid;
  clean_note            text := btrim(coalesce(p_admin_note, ''));
  resolved_household_id uuid;
  auth_user_id          uuid;
  existing_head_id      uuid;
begin
  -- Permission check
  if current_user_id is null or not public.has_permission('resident:write') then
    raise exception 'Akses verifikasi warga diperlukan';
  end if;

  -- Fetch and lock the request row
  select *
  into target_request
  from public.resident_registration_requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Pendaftaran warga tidak ditemukan';
  end if;

  if target_request.status <> 'pending_review' then
    raise exception 'Pendaftaran ini sudah diproses';
  end if;

  -- Resolve household (best-effort, not required)
  resolved_household_id := target_request.matched_household_id;

  if resolved_household_id is null then
    select id into resolved_household_id
    from public.households
    where public.normalize_resident_cluster(cluster) = public.normalize_resident_cluster(target_request.cluster)
      and public.normalize_resident_unit(block_or_unit) = public.normalize_resident_unit(target_request.block_or_unit)
    limit 1;
  end if;

  if resolved_household_id is null then
    select id into resolved_household_id
    from public.households
    where public.normalize_resident_cluster(cluster) = public.normalize_resident_cluster(target_request.cluster)
      and public.normalize_resident_unit(block_or_unit) =
          substring(public.normalize_resident_unit(target_request.block_or_unit) from '^[0-9]+')
    limit 1;
  end if;

  -- Try to find existing profile (by user_id or email match)
  select id into target_user_id
  from public.profiles
  where id = target_request.requested_user_id
     or lower(email::text) = lower(target_request.email::text)
  order by case when id = target_request.requested_user_id then 0 else 1 end
  limit 1;

  -- If no profile, check auth.users by email
  if target_user_id is null then
    select id into auth_user_id
    from auth.users
    where lower(email) = lower(target_request.email::text)
    limit 1;

    if auth_user_id is not null then
      insert into public.profiles (id, email, display_name, phone, status, created_at, updated_at)
      values (
        auth_user_id,
        target_request.email,
        target_request.display_name,
        target_request.phone,
        'active',
        now(),
        now()
      )
      on conflict (id) do update
        set display_name = excluded.display_name,
            phone        = excluded.phone,
            status       = 'active',
            updated_at   = now();

      target_user_id := auth_user_id;
    end if;
  end if;

  -- If profile exists: activate it and grant warga role
  if target_user_id is not null then
    update public.profiles
    set display_name = target_request.display_name,
        email        = target_request.email,
        phone        = target_request.phone,
        status       = 'active',
        updated_at   = now()
    where id = target_user_id;

    insert into public.user_roles (user_id, role, assigned_by)
    values (target_user_id, 'warga', current_user_id)
    on conflict (user_id, role) do nothing;
  end if;

  -- Update household if found
  if resolved_household_id is not null then
    -- Cek apakah head_user_id sudah terisi
    select head_user_id into existing_head_id
    from public.households
    where id = resolved_household_id;

    -- Update kontak & status (selalu)
    update public.households
    set primary_contact_name = coalesce(nullif(primary_contact_name, ''), target_request.display_name),
        primary_phone        = coalesce(nullif(primary_phone, ''), target_request.phone),
        occupancy_status     = 'active',
        verification_status  = 'verified',
        updated_at           = now()
    where id = resolved_household_id;

    -- Set head_user_id HANYA jika belum ada (tidak overwrite anggota sebelumnya)
    if existing_head_id is null and target_user_id is not null then
      update public.households
      set head_user_id = target_user_id
      where id = resolved_household_id;
    end if;

    -- Insert ke household_members (idempotent by full_name)
    insert into public.household_members (
      household_id,
      user_id,
      full_name,
      relationship,
      verification_status,
      approved_via_request_id
    )
    values (
      resolved_household_id,
      target_user_id,
      target_request.display_name,
      'penghuni',
      'verified',
      p_request_id
    )
    on conflict (household_id, full_name) do update
      set user_id                 = coalesce(excluded.user_id, household_members.user_id),
          verification_status     = 'verified',
          approved_via_request_id = excluded.approved_via_request_id,
          updated_at              = now();
  end if;

  -- Mark request as approved
  update public.resident_registration_requests
  set requested_user_id    = coalesce(target_user_id, target_request.requested_user_id),
      matched_household_id = coalesce(resolved_household_id, target_request.matched_household_id),
      status               = 'approved',
      admin_note           = concat_ws(E'\n',
                               nullif(target_request.admin_note, ''),
                               nullif(clean_note, '')),
      reviewed_by          = current_user_id,
      reviewed_at          = now()
  where id = p_request_id;

  -- Audit log
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, after_snapshot)
  values (
    current_user_id,
    'resident_registration.approved',
    'resident_registration_request',
    p_request_id,
    jsonb_build_object(
      'user_id',          target_user_id,
      'household_id',     resolved_household_id,
      'email',            target_request.email,
      'auto_matched',     (resolved_household_id is not null),
      'profile_created',  (target_request.requested_user_id is null and target_user_id is not null),
      'pending_auth',     (target_user_id is null),
      'head_overwritten', false
    )
  );

  return target_user_id;
end;
$$;

revoke all on function public.approve_resident_registration_request(uuid, text) from public;
grant execute on function public.approve_resident_registration_request(uuid, text) to authenticated;

commit;
