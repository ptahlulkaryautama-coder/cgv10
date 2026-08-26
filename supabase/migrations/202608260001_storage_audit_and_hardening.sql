-- Migration 202608260001: Storage Audit, Hardening & Multi-Photo Gallery Support for Portal Posts

begin;

-- 1. Ensure portal_posts table has gallery_images JSONB column
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portal_posts'
      and column_name = 'gallery_images'
  ) then
    alter table public.portal_posts
    add column gallery_images jsonb default '[]'::jsonb;
  end if;
end $$;

-- 2. Update attachments linked_type check constraint to support 'portal_post'
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'attachments'
      and constraint_name = 'attachments_linked_type_check'
  ) then
    alter table public.attachments drop constraint attachments_linked_type_check;
  end if;

  alter table public.attachments
  add constraint attachments_linked_type_check
  check (
    linked_type in (
      'service_request',
      'finance_confirmation',
      'palugada_listing',
      'household_profile',
      'kegiatan',
      'portal_post'
    )
  );
exception
  when undefined_object then null;
end $$;

-- 3. Harden portal-post-media and portal-post-attachments storage buckets
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'portal-post-media',
    'portal-post-media',
    true,
    26214400, -- 25 MB limit
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
  ),
  (
    'portal-post-attachments',
    'portal-post-attachments',
    true,
    31457280, -- 30 MB limit
    array[
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/pjpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream'
    ]
  )
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 4. Re-apply storage RLS policies for portal post storage
drop policy if exists "portal_post_storage_public_read" on storage.objects;
drop policy if exists "portal_post_storage_admin_insert" on storage.objects;
drop policy if exists "portal_post_storage_admin_update" on storage.objects;
drop policy if exists "portal_post_storage_admin_delete" on storage.objects;

create policy "portal_post_storage_public_read"
on storage.objects for select
to public
using (bucket_id in ('portal-post-media', 'portal-post-attachments'));

create policy "portal_post_storage_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and (
    public.has_permission('content:write')
    or public.has_permission('settings:manage')
    or public.has_role('super_admin')
  )
);

create policy "portal_post_storage_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and (
    public.has_permission('content:write')
    or public.has_permission('settings:manage')
    or public.has_role('super_admin')
  )
)
with check (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and (
    public.has_permission('content:write')
    or public.has_permission('settings:manage')
    or public.has_role('super_admin')
  )
);

create policy "portal_post_storage_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and (
    public.has_permission('content:write')
    or public.has_permission('settings:manage')
    or public.has_role('super_admin')
  )
);

commit;
