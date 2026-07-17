-- Production hardening for public PALUGADA submissions.

begin;

create or replace function public.submit_palugada_listing(
  p_name text,
  p_category text,
  p_cluster text,
  p_price_label text,
  p_description text,
  p_availability_note text,
  p_contact_method text
)
returns table (listing_id uuid, upload_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_listing_id uuid;
  created_upload_token uuid := gen_random_uuid();
  clean_name text := btrim(coalesce(p_name, ''));
  clean_cluster text := btrim(coalesce(p_cluster, ''));
  clean_description text := btrim(coalesce(p_description, ''));
  clean_contact text := btrim(coalesce(p_contact_method, ''));
begin
  if p_category not in ('barang', 'kuliner', 'jasa', 'properti', 'lainnya') then
    raise exception 'Kategori PALUGADA tidak valid';
  end if;

  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception 'Nama lapak harus berisi 2 sampai 120 karakter';
  end if;

  if char_length(clean_cluster) < 2 or char_length(clean_cluster) > 120 then
    raise exception 'Cluster atau blok harus berisi 2 sampai 120 karakter';
  end if;

  if char_length(clean_contact) < 6 or char_length(clean_contact) > 80 then
    raise exception 'Nomor WhatsApp belum valid';
  end if;

  if char_length(clean_description) < 10 or char_length(clean_description) > 3000 then
    raise exception 'Deskripsi lapak harus berisi 10 sampai 3000 karakter';
  end if;

  if char_length(btrim(coalesce(p_price_label, ''))) > 120
    or char_length(btrim(coalesce(p_availability_note, ''))) > 300 then
    raise exception 'Informasi harga atau ketersediaan terlalu panjang';
  end if;

  insert into public.palugada_listings (
    seller_user_id,
    seller_household_id,
    name,
    category,
    cluster,
    price_label,
    description,
    availability_note,
    contact_method,
    seller_status,
    seller_status_note,
    status,
    published_at
  ) values (
    null,
    null,
    clean_name,
    p_category,
    clean_cluster,
    btrim(coalesce(p_price_label, '')),
    clean_description,
    btrim(coalesce(p_availability_note, '')),
    clean_contact,
    'offline',
    'Menunggu verifikasi pengurus',
    'submitted',
    null
  )
  returning id into created_listing_id;

  insert into public.palugada_upload_sessions (listing_id, upload_token)
  values (created_listing_id, created_upload_token);

  return query select created_listing_id, created_upload_token;
end;
$$;

revoke all on function public.submit_palugada_listing(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_palugada_listing(text, text, text, text, text, text, text) to anon, authenticated;

drop policy if exists "palugada_listings_public_insert_intake" on public.palugada_listings;

alter table public.palugada_listings
  drop constraint if exists palugada_name_length_check,
  add constraint palugada_name_length_check
    check (char_length(btrim(name)) between 2 and 120) not valid;

alter table public.palugada_listings
  drop constraint if exists palugada_description_length_check,
  add constraint palugada_description_length_check
    check (char_length(description) <= 3000) not valid;

commit;
