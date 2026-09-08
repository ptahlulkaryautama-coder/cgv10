-- Migration: PALUGADA Instant Publish & Resident Self-Management
-- Description: Sets PALUGADA listings to publish immediately on resident submission,
-- enables owners to manage (update, delete, upload cover) their own listings,
-- and preserves admin post-moderation capabilities.

begin;

-- 1. Update submit_palugada_listing function to instantly approve listings
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
  current_user_id uuid := auth.uid();
  clean_name text := btrim(coalesce(p_name, ''));
  clean_cluster text := btrim(coalesce(p_cluster, ''));
  clean_description text := btrim(coalesce(p_description, ''));
  clean_contact text := btrim(coalesce(p_contact_method, ''));
begin
  if current_user_id is null then
    raise exception 'Login warga diperlukan untuk mendaftarkan lapak PALUGADA';
  end if;

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
    current_user_id,
    null,
    clean_name,
    p_category,
    clean_cluster,
    btrim(coalesce(p_price_label, '')),
    clean_description,
    btrim(coalesce(p_availability_note, '')),
    clean_contact,
    'online',
    'Buka · Lapak aktif',
    'approved',
    timezone('utc', now())
  )
  returning id into created_listing_id;

  insert into public.palugada_upload_sessions (listing_id, upload_token)
  values (created_listing_id, created_upload_token);

  return query select created_listing_id, created_upload_token;
end;
$$;

revoke all on function public.submit_palugada_listing(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_palugada_listing(text, text, text, text, text, text, text) to authenticated;

-- 2. Update RLS policies for owner self-management (delete & update)
drop policy if exists "palugada_listings_admin_delete" on public.palugada_listings;

create policy "palugada_listings_owner_or_admin_delete"
on public.palugada_listings for delete
to authenticated
using (
  seller_user_id = auth.uid()
  or public.has_permission('palugada:write')
);

drop policy if exists "palugada_listings_update_owner_or_admin" on public.palugada_listings;

create policy "palugada_listings_update_owner_or_admin"
on public.palugada_listings for update
to authenticated
using (
  seller_user_id = auth.uid()
  or public.has_permission('palugada:write')
)
with check (
  seller_user_id = auth.uid()
  or public.has_permission('palugada:write')
);

-- 3. Storage policy: allow owners & admins to upload media to portal-post-media bucket
drop policy if exists "palugada_media_storage_owner_admin_insert" on storage.objects;

create policy "palugada_media_storage_owner_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portal-post-media'
  and (
    name like 'palugada/%'
    or public.has_permission('content:write')
    or public.has_permission('palugada:write')
  )
);

commit;
