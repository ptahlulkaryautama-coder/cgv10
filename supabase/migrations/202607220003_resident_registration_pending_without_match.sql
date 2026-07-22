-- Keep resident registrations visible to admins even when the house number needs manual review.

begin;

create or replace function public.submit_resident_registration_request(
  p_email text,
  p_display_name text,
  p_phone text,
  p_cluster text,
  p_block_or_unit text
)
returns table (request_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_email citext := lower(btrim(coalesce(p_email, '')))::citext;
  clean_name text := btrim(coalesce(p_display_name, ''));
  clean_phone text := btrim(coalesce(p_phone, ''));
  clean_cluster text := btrim(coalesce(p_cluster, ''));
  clean_block text := btrim(coalesce(p_block_or_unit, ''));
  normalized_cluster text := public.normalize_resident_cluster(p_cluster);
  normalized_block text := public.normalize_resident_unit(p_block_or_unit);
  numeric_unit_prefix text := substring(public.normalize_resident_unit(p_block_or_unit) from '^[0-9]+');
  matched_household uuid;
  match_note text := '';
  active_user_id uuid := auth.uid();
  created_request_id uuid;
begin
  if clean_email::text !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Email belum valid';
  end if;

  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception 'Nama warga harus berisi 2 sampai 120 karakter';
  end if;

  if char_length(clean_phone) < 6 or char_length(clean_phone) > 40 then
    raise exception 'Nomor WhatsApp belum valid';
  end if;

  if char_length(clean_cluster) < 2 or char_length(clean_cluster) > 120 then
    raise exception 'Blok atau cluster harus diisi';
  end if;

  if char_length(clean_block) < 1 or char_length(clean_block) > 80 then
    raise exception 'Nomor rumah harus diisi';
  end if;

  select id
  into matched_household
  from public.households
  where public.normalize_resident_cluster(cluster) = normalized_cluster
    and public.normalize_resident_unit(block_or_unit) = normalized_block
  limit 1;

  if matched_household is null and numeric_unit_prefix is not null and numeric_unit_prefix <> normalized_block then
    select id
    into matched_household
    from public.households
    where public.normalize_resident_cluster(cluster) = normalized_cluster
      and public.normalize_resident_unit(block_or_unit) = numeric_unit_prefix
    limit 1;

    if matched_household is not null then
      match_note := 'Nomor rumah dicocokkan otomatis memakai angka utama dari input warga.';
    end if;
  end if;

  if matched_household is null then
    match_note := 'Data rumah belum cocok otomatis. Pengurus perlu cek blok dan nomor rumah sebelum approve.';
  end if;

  insert into public.resident_registration_requests (
    requested_user_id,
    email,
    display_name,
    phone,
    cluster,
    block_or_unit,
    matched_household_id,
    status,
    admin_note
  )
  values (
    active_user_id,
    clean_email,
    clean_name,
    clean_phone,
    clean_cluster,
    clean_block,
    matched_household,
    'pending_review',
    match_note
  )
  returning id into created_request_id;

  return query select created_request_id, 'pending_review'::text;
end;
$$;

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
  current_user_id uuid := auth.uid();
  target_request public.resident_registration_requests%rowtype;
  target_user_id uuid;
  clean_note text := btrim(coalesce(p_admin_note, ''));
begin
  if current_user_id is null or not public.has_permission('resident:write') then
    raise exception 'Akses verifikasi warga diperlukan';
  end if;

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

  if target_request.matched_household_id is null then
    raise exception 'Data rumah belum cocok otomatis. Tolak dulu atau cocokkan rumah secara manual di Supabase.';
  end if;

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

  update public.profiles
  set display_name = target_request.display_name,
      email = target_request.email,
      phone = target_request.phone,
      status = 'active',
      updated_at = now()
  where id = target_user_id;

  update public.households
  set head_user_id = target_user_id,
      primary_contact_name = target_request.display_name,
      primary_phone = target_request.phone,
      occupancy_status = 'active',
      verification_status = 'verified',
      updated_at = now()
  where id = target_request.matched_household_id;

  insert into public.user_roles (user_id, role, assigned_by)
  values (target_user_id, 'warga', current_user_id)
  on conflict (user_id, role) do nothing;

  update public.resident_registration_requests
  set requested_user_id = target_user_id,
      status = 'approved',
      admin_note = concat_ws(E'\n', nullif(target_request.admin_note, ''), nullif(clean_note, '')),
      reviewed_by = current_user_id,
      reviewed_at = now()
  where id = p_request_id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, after_snapshot)
  values (
    current_user_id,
    'resident_registration.approved',
    'resident_registration_request',
    p_request_id,
    jsonb_build_object(
      'user_id', target_user_id,
      'household_id', target_request.matched_household_id,
      'email', target_request.email
    )
  );

  return target_user_id;
end;
$$;

grant execute on function public.submit_resident_registration_request(text, text, text, text, text) to anon, authenticated;
grant execute on function public.approve_resident_registration_request(uuid, text) to authenticated;

commit;
