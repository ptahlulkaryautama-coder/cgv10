-- Approval fully bypasses auth/profile check.
-- Form pendaftaran warga bersifat anonim (tidak perlu akun dulu).
-- Admin approve/reject berdasarkan data yang diisi warga.
--
-- Jika auth user sudah ada (email match di auth.users) -> profile di-create/update & role diberikan.
-- Jika auth user belum ada -> request tetap approved, household tetap di-link.
-- Ketika warga nanti daftar akun, trigger handle_new_auth_user akan auto-link via email.

begin;

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
      -- Auto-create profile from auth.users data
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
  -- If target_user_id is still null: warga belum daftar akun.
  -- Approval tetap dilanjutkan. Role & profile akan diset saat warga daftar nanti.

  -- Update household if found
  if resolved_household_id is not null then
    update public.households
    set primary_contact_name = target_request.display_name,
        primary_phone        = target_request.phone,
        occupancy_status     = 'active',
        verification_status  = 'verified',
        updated_at           = now()
    where id = resolved_household_id;

    -- Only set head_user_id if we have a real user
    if target_user_id is not null then
      update public.households
      set head_user_id = target_user_id
      where id = resolved_household_id;
    end if;
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
      'pending_auth',     (target_user_id is null)
    )
  );

  -- Return user_id if found, null if warga belum daftar akun (approval tetap berhasil)
  return target_user_id;
end;
$$;

revoke all on function public.approve_resident_registration_request(uuid, text) from public;
grant execute on function public.approve_resident_registration_request(uuid, text) to authenticated;

commit;
