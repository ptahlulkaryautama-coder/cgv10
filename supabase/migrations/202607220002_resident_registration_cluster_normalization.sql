-- Make resident registration matching tolerant to common CGV cluster spelling variants.

begin;

create or replace function public.normalize_resident_cluster(p_cluster text)
returns text
language sql
immutable
as $$
  select case
    when regexp_replace(lower(btrim(coalesce(p_cluster, ''))), '[^a-z0-9]', '', 'g')
      in ('colosseum', 'colloseum', 'coloseum', 'colosium', 'koloseum') then 'colosseum'
    else regexp_replace(lower(btrim(coalesce(p_cluster, ''))), '[^a-z0-9]', '', 'g')
  end;
$$;

create or replace function public.normalize_resident_unit(p_block_or_unit text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(btrim(coalesce(p_block_or_unit, ''))), '[^a-z0-9]', '', 'g');
$$;

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
  matched_household uuid;
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

  if matched_household is null then
    raise exception 'Data rumah belum cocok. Silakan cek kembali atau hubungi pengurus.';
  end if;

  insert into public.resident_registration_requests (
    requested_user_id,
    email,
    display_name,
    phone,
    cluster,
    block_or_unit,
    matched_household_id,
    status
  )
  values (
    active_user_id,
    clean_email,
    clean_name,
    clean_phone,
    clean_cluster,
    clean_block,
    matched_household,
    'pending_review'
  )
  returning id into created_request_id;

  return query select created_request_id, 'pending_review'::text;
end;
$$;

grant execute on function public.normalize_resident_cluster(text) to anon, authenticated;
grant execute on function public.normalize_resident_unit(text) to anon, authenticated;
grant execute on function public.submit_resident_registration_request(text, text, text, text, text) to anon, authenticated;

commit;
