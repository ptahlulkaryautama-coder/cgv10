-- Migration: PALUGADA Photo Owner Delete
-- Description: Allows listing owners to delete their own product photo attachments
-- (rows in public.attachments) and the corresponding files in portal-post-media storage.

begin;

-- 1. Allow owner to delete their own attachment records
drop policy if exists "palugada_attachments_owner_delete" on public.attachments;

create policy "palugada_attachments_owner_delete"
on public.attachments for delete
to authenticated
using (
  owner_user_id = auth.uid()
  and linked_type = 'palugada_listing'
);

-- 2. Allow owner to delete their own files from portal-post-media storage
--    Only allow deletion of files under the palugada/ prefix they own.
drop policy if exists "palugada_media_storage_owner_delete" on storage.objects;

create policy "palugada_media_storage_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portal-post-media'
  and name like 'palugada/%'
  and (
    exists (
      select 1
      from public.palugada_listings l
      where l.seller_user_id = auth.uid()
        and name like 'palugada/' || l.id::text || '/%'
    )
    or public.has_permission('palugada:write')
    or public.has_permission('content:write')
  )
);

commit;
