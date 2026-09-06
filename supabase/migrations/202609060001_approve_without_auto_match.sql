-- Allow admin to approve registration requests even when matched_household_id is null.
-- The function will attempt to find a matching household at approval time,
-- and if still not found, will raise a clear error message with actionable guidance.
-- This supports the workflow where admin manually verifies cluster + block_or_unit.

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
  current_user_id  uuid := auth.uid();
  target_request   public.resident_registration_requests%rowtype;
  target_user_id   uuid;
  clean_note       text := btrim(coalesce(p_admin_note, ''));
  resolved_household_id uuid;
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

  -- Resolve household: use auto-matched if available, otherwise try to match now
  resolved_household_id := target_request.matched_household_id;

  if resolved_household_id is null then
    -- Try to find household based on the submitted cluster + block_or_unit
    select id
    into resolved_household_id
    from public.households
    where public.normalize_resident_cluster(cluster) = public.normalize_resident_cluster(target_request.cluster)
      and public.normalize_resident_unit(block_or_unit) = public.normalize_resident_unit(target_request.block_or_unit)
    limit 1;
  end if;

  if resolved_household_id is null then
    -- Fallback: try numeric prefix only
    select id
    into resolved_household_id
    from public.households
    where public.normalize_resident_cluster(cluster) = public.normalize_resident_cluster(target_request.cluster)
      and public.normalize_resident_unit(block_or_unit) =
          substring(public.normalize_resident_unit(target_request.block_or_unit) from '^[0-9]+')
    limit 1;
  end if;

  if resolved_household_id is null then
    raise exception
      'Rumah "% / %" belum ditemukan di database. Pastikan nama blok dan nomor rumah sudah benar di tabel Households, lalu coba approve lagi.',
      target_request.cluster, target_request.block_or_unit;
  end if;

  -- Find the auth user (by user_id or email)
  select id
  into target_user_id
  from public.profiles
  where id = target_request.requested_user_id
     or lower(email::text) = lower(target_request.email::text)
  order by case when id = target_request.requested_user_id then 0 else 1 end
  limit 1;

  if target_user_id is null then
    raise exception 'Akun Auth warga belum ditemukan. Minta warga menyelesaikan pendaftaran/login dulu.';
  end if;

  -- Update profile
  update public.profiles
  set display_name = target_request.display_name,
      email        = target_request.email,
      phone        = target_request.phone,
      status       = 'active',
      updated_at   = now()
  where id = target_user_id;

  -- Update household (link warga as head)
  update public.households
  set head_user_id           = target_user_id,
      primary_contact_name   = target_request.display_name,
      primary_phone          = target_request.phone,
      occupancy_status       = 'active',
      verification_status    = 'verified',
      updated_at             = now()
  where id = resolved_household_id;

  -- Assign warga role
  insert into public.user_roles (user_id, role, assigned_by)
  values (target_user_id, 'warga', current_user_id)
  on conflict (user_id, role) do nothing;

  -- Update request: store resolved household & approval info
  update public.resident_registration_requests
  set requested_user_id    = target_user_id,
      matched_household_id = resolved_household_id,
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
      'user_id',      target_user_id,
      'household_id', resolved_household_id,
      'email',        target_request.email,
      'auto_matched', (target_request.matched_household_id is not null)
    )
  );

  return target_user_id;
end;
$$;

-- Grant stays the same
revoke all on function public.approve_resident_registration_request(uuid, text) from public;
grant execute on function public.approve_resident_registration_request(uuid, text) to authenticated;

commit;
