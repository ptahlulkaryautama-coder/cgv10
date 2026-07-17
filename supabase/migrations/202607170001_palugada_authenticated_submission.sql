-- Require warga login for PALUGADA submissions while keeping approved listings public.

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
grant execute on function public.submit_palugada_listing(text, text, text, text, text, text, text) to authenticated;

revoke all on function public.is_valid_palugada_upload_path(text, uuid) from public;
grant execute on function public.is_valid_palugada_upload_path(text, uuid) to authenticated;

drop policy if exists "palugada_submission_storage_insert" on storage.objects;

create policy "palugada_submission_storage_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'palugada-submissions'
  and public.is_valid_palugada_upload_path(name)
);

drop policy if exists "palugada_attachments_public_insert" on public.attachments;
drop policy if exists "palugada_attachments_authenticated_insert" on public.attachments;

create policy "palugada_attachments_authenticated_insert"
on public.attachments for insert
to authenticated
with check (
  owner_user_id = auth.uid()
  and linked_type = 'palugada_listing'
  and visibility = 'admin_only'
  and moderation_status = 'pending'
  and file_size between 1 and 10485760
  and public.is_valid_palugada_upload_path(storage_path, linked_id)
);

commit;
