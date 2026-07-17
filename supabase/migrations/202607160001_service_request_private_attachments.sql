-- Production hardening: validated public service intake with private photo attachments.
-- Public visitors submit through a constrained RPC and receive a short-lived upload token.

begin;

create table if not exists public.service_request_upload_sessions (
  request_id uuid primary key references public.service_requests(id) on delete cascade,
  upload_token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now()
);

alter table public.service_request_upload_sessions enable row level security;

create or replace function public.submit_service_request(
  p_category text,
  p_title text,
  p_description text,
  p_priority text default 'normal'
)
returns table (request_id uuid, upload_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_request_id uuid;
  created_upload_token uuid := gen_random_uuid();
  clean_title text := btrim(coalesce(p_title, ''));
  clean_description text := btrim(coalesce(p_description, ''));
begin
  if p_category not in ('administrasi', 'pengaduan', 'keamanan', 'iuran', 'aspirasi', 'palugada', 'lainnya') then
    raise exception 'Kategori layanan tidak valid';
  end if;

  if p_priority not in ('normal', 'high', 'urgent') then
    raise exception 'Prioritas layanan tidak valid';
  end if;

  if char_length(clean_title) < 3 or char_length(clean_title) > 160 then
    raise exception 'Judul layanan harus berisi 3 sampai 160 karakter';
  end if;

  if char_length(clean_description) < 10 or char_length(clean_description) > 5000 then
    raise exception 'Detail layanan harus berisi 10 sampai 5000 karakter';
  end if;

  insert into public.service_requests (
    household_id,
    submitted_by,
    category,
    title,
    description,
    status,
    priority,
    assigned_to
  ) values (
    null,
    null,
    p_category,
    clean_title,
    clean_description,
    'submitted',
    p_priority,
    null
  )
  returning id into created_request_id;

  insert into public.service_request_upload_sessions (request_id, upload_token)
  values (created_request_id, created_upload_token);

  return query select created_request_id, created_upload_token;
end;
$$;

revoke all on function public.submit_service_request(text, text, text, text) from public;
grant execute on function public.submit_service_request(text, text, text, text) to anon, authenticated;

create or replace function public.is_valid_service_upload_path(
  object_name text,
  target_request_id uuid default null
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
      from public.service_request_upload_sessions session
      where session.request_id::text = split_part(object_name, '/', 1)
        and session.upload_token::text = split_part(object_name, '/', 2)
        and session.expires_at > now()
        and (target_request_id is null or session.request_id = target_request_id)
    );
$$;

revoke all on function public.is_valid_service_upload_path(text, uuid) from public;
grant execute on function public.is_valid_service_upload_path(text, uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-request-attachments',
  'service-request-attachments',
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
    'image/heif'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "service_request_storage_public_insert" on storage.objects;
drop policy if exists "service_request_storage_admin_read" on storage.objects;
drop policy if exists "service_request_storage_admin_delete" on storage.objects;

create policy "service_request_storage_public_insert"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'service-request-attachments'
  and public.is_valid_service_upload_path(name)
);

create policy "service_request_storage_admin_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'service-request-attachments'
  and public.has_permission('services:read')
);

create policy "service_request_storage_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'service-request-attachments'
  and public.has_permission('services:write')
);

drop policy if exists "service_attachments_public_insert" on public.attachments;

create policy "service_attachments_public_insert"
on public.attachments for insert
to anon, authenticated
with check (
  owner_user_id is null
  and linked_type = 'service_request'
  and visibility = 'admin_only'
  and moderation_status = 'pending'
  and file_size between 1 and 10485760
  and public.is_valid_service_upload_path(storage_path, linked_id)
);

-- Anonymous writes now use the validated RPC above instead of unrestricted direct inserts.
drop policy if exists "service_requests_public_insert_intake" on public.service_requests;

alter table public.service_requests
  drop constraint if exists service_requests_title_length_check,
  add constraint service_requests_title_length_check
    check (char_length(btrim(title)) between 3 and 160) not valid;

alter table public.service_requests
  drop constraint if exists service_requests_description_length_check,
  add constraint service_requests_description_length_check
    check (char_length(description) <= 5000) not valid;

commit;
