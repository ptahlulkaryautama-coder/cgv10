-- Migration: PALUGADA Attachments & Media RLS Fix
-- Description: Fixes Row-Level Security policies on public.attachments and storage.objects
-- to allow authenticated warga to insert, view, update, and manage product photo attachments
-- and cover photos for their PALUGADA listings.

begin;

-- 1. Drop outdated/restrictive attachment policies for PALUGADA
drop policy if exists "palugada_attachments_public_insert" on public.attachments;
drop policy if exists "palugada_attachments_authenticated_insert" on public.attachments;
drop policy if exists "palugada_attachments_public_approved_read" on public.attachments;
drop policy if exists "palugada_attachments_owner_delete" on public.attachments;
drop policy if exists "palugada_attachments_owner_update" on public.attachments;
drop policy if exists "palugada_attachments_admin_delete" on public.attachments;

-- 2. INSERT Policy: allow authenticated users to insert attachment records for their palugada listings
create policy "palugada_attachments_authenticated_insert"
on public.attachments for insert
to authenticated
with check (
  owner_user_id = auth.uid()
  and linked_type = 'palugada_listing'
  and file_size between 1 and 26214400
  and (
    -- Allow standard storage path in portal-post-media
    storage_path like 'palugada/' || linked_id::text || '/%'
    -- Or legacy token path in palugada-submissions
    or public.is_valid_palugada_upload_path(storage_path, linked_id)
    -- Or owned listing check
    or exists (
      select 1
      from public.palugada_listings listing
      where listing.id = linked_id
        and (listing.seller_user_id = auth.uid() or listing.seller_user_id is null)
    )
    or public.has_permission('palugada:write')
  )
);

-- 3. SELECT Policy: allow public to view approved listing attachments, and owners/admins to view all their attachments
create policy "palugada_attachments_public_approved_read"
on public.attachments for select
to anon, authenticated
using (
  linked_type = 'palugada_listing'
  and (
    (
      visibility = 'public_after_approval'
      and moderation_status = 'approved'
      and exists (
        select 1
        from public.palugada_listings listing
        where listing.id = attachments.linked_id
          and listing.status in ('approved', 'submitted')
      )
    )
    or (
      owner_user_id = auth.uid()
    )
    or (
      public.has_permission('palugada:read')
      or public.has_permission('palugada:write')
      or public.has_role('super_admin')
    )
  )
);

-- 4. UPDATE Policy: allow owners or admins to update attachments
create policy "palugada_attachments_owner_update"
on public.attachments for update
to authenticated
using (
  (owner_user_id = auth.uid() and linked_type = 'palugada_listing')
  or public.has_permission('palugada:write')
  or public.has_role('super_admin')
)
with check (
  (owner_user_id = auth.uid() and linked_type = 'palugada_listing')
  or public.has_permission('palugada:write')
  or public.has_role('super_admin')
);

-- 5. DELETE Policy: allow owners or admins to delete attachments
create policy "palugada_attachments_owner_delete"
on public.attachments for delete
to authenticated
using (
  (owner_user_id = auth.uid() and linked_type = 'palugada_listing')
  or public.has_permission('palugada:write')
  or public.has_role('super_admin')
);

-- 6. STORAGE POLICIES on portal-post-media: allow authenticated users to upload, update, and delete palugada media
drop policy if exists "palugada_media_storage_owner_admin_insert" on storage.objects;
drop policy if exists "palugada_media_storage_owner_admin_update" on storage.objects;
drop policy if exists "palugada_media_storage_owner_admin_delete" on storage.objects;
drop policy if exists "palugada_media_storage_owner_delete" on storage.objects;

create policy "palugada_media_storage_owner_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portal-post-media'
  and (
    name like 'palugada/%'
    or public.has_permission('content:write')
    or public.has_permission('palugada:write')
    or public.has_role('super_admin')
  )
);

create policy "palugada_media_storage_owner_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portal-post-media'
  and (
    name like 'palugada/%'
    or public.has_permission('content:write')
    or public.has_permission('palugada:write')
    or public.has_role('super_admin')
  )
)
with check (
  bucket_id = 'portal-post-media'
  and (
    name like 'palugada/%'
    or public.has_permission('content:write')
    or public.has_permission('palugada:write')
    or public.has_role('super_admin')
  )
);

create policy "palugada_media_storage_owner_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portal-post-media'
  and (
    name like 'palugada/%'
    or public.has_permission('content:write')
    or public.has_permission('palugada:write')
    or public.has_role('super_admin')
  )
);

commit;
