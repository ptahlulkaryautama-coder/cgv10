-- Phase C2.3: private PALUGADA intake attachments.
-- Anonymous uploads require a short-lived, unguessable token tied to one listing.

begin;

do $$
begin
  if to_regclass('public.palugada_listings') is null then
    raise exception 'Missing required table: public.palugada_listings';
  end if;
  if to_regclass('public.attachments') is null then
    raise exception 'Missing required table: public.attachments';
  end if;
  if to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    raise exception 'Supabase Storage is not available';
  end if;
end $$;

create table if not exists public.palugada_upload_sessions (
  listing_id uuid primary key references public.palugada_listings(id) on delete cascade,
  upload_token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now()
);

alter table public.palugada_upload_sessions enable row level security;

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
begin
  if btrim(coalesce(p_name, '')) = ''
    or btrim(coalesce(p_cluster, '')) = ''
    or btrim(coalesce(p_description, '')) = ''
    or btrim(coalesce(p_contact_method, '')) = '' then
    raise exception 'Required PALUGADA submission fields are missing';
  end if;

  if p_category not in ('barang', 'kuliner', 'jasa', 'properti', 'lainnya') then
    raise exception 'Invalid PALUGADA category';
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
    btrim(p_name),
    p_category,
    btrim(p_cluster),
    btrim(coalesce(p_price_label, '')),
    p_description,
    btrim(coalesce(p_availability_note, '')),
    btrim(p_contact_method),
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

create or replace function public.is_valid_palugada_upload_path(
  object_name text,
  target_listing_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    split_part(object_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and split_part(object_name, '/', 2) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and split_part(object_name, '/', 3) <> ''
    and exists (
      select 1
      from public.palugada_upload_sessions session
      where session.listing_id::text = split_part(object_name, '/', 1)
        and session.upload_token::text = split_part(object_name, '/', 2)
        and session.expires_at > now()
        and (target_listing_id is null or session.listing_id = target_listing_id)
    );
$$;

revoke all on function public.is_valid_palugada_upload_path(text, uuid) from public;
grant execute on function public.is_valid_palugada_upload_path(text, uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'palugada-submissions',
  'palugada-submissions',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'application/octet-stream'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "palugada_submission_storage_insert" on storage.objects;
drop policy if exists "palugada_submission_storage_admin_read" on storage.objects;

create policy "palugada_submission_storage_insert"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'palugada-submissions'
  and public.is_valid_palugada_upload_path(name)
);

create policy "palugada_submission_storage_admin_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'palugada-submissions'
  and public.has_permission('palugada:read')
);

drop policy if exists "palugada_attachments_public_insert" on public.attachments;

create policy "palugada_attachments_public_insert"
on public.attachments for insert
to anon, authenticated
with check (
  owner_user_id is null
  and linked_type = 'palugada_listing'
  and visibility = 'admin_only'
  and moderation_status = 'pending'
  and file_size between 1 and 10485760
  and public.is_valid_palugada_upload_path(storage_path, linked_id)
);

do $$
begin
  if not exists (
    select 1 from storage.buckets
    where id = 'palugada-submissions' and public = false
  ) then
    raise exception 'Private PALUGADA submission bucket was not created';
  end if;
end $$;

commit;
