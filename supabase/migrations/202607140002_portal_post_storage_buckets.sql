-- Phase C1.7: portal post storage buckets.
-- Public buckets are used because published portal posts need public media URLs.
-- Do not upload private resident documents here.

begin;

do $$
begin
  if to_regclass('storage.buckets') is null then
    raise exception 'Missing Supabase storage.buckets table';
  end if;

  if to_regclass('storage.objects') is null then
    raise exception 'Missing Supabase storage.objects table';
  end if;
end $$;

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
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'portal-post-attachments',
    'portal-post-attachments',
    true,
    20971520,
    array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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
  and public.has_permission('content:write')
);

create policy "portal_post_storage_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and public.has_permission('content:write')
)
with check (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and public.has_permission('content:write')
);

create policy "portal_post_storage_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('portal-post-media', 'portal-post-attachments')
  and public.has_permission('content:write')
);

commit;
