-- Phase C2.4: PALUGADA public images and complete moderation lifecycle.

begin;

update public.attachments attachment
set moderation_status = 'approved',
    visibility = 'public_after_approval'
where attachment.linked_type = 'palugada_listing'
  and exists (
    select 1
    from public.palugada_listings listing
    where listing.id = attachment.linked_id
      and listing.status = 'approved'
  );

drop policy if exists "palugada_attachments_public_approved_read" on public.attachments;

create policy "palugada_attachments_public_approved_read"
on public.attachments for select
to anon, authenticated
using (
  linked_type = 'palugada_listing'
  and visibility = 'public_after_approval'
  and moderation_status = 'approved'
  and exists (
    select 1
    from public.palugada_listings listing
    where listing.id = attachments.linked_id
      and listing.status = 'approved'
  )
);

drop policy if exists "palugada_submission_storage_public_approved_read" on storage.objects;

create policy "palugada_submission_storage_public_approved_read"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'palugada-submissions'
  and exists (
    select 1
    from public.attachments attachment
    join public.palugada_listings listing
      on listing.id = attachment.linked_id
    where attachment.storage_path = storage.objects.name
      and attachment.linked_type = 'palugada_listing'
      and attachment.visibility = 'public_after_approval'
      and attachment.moderation_status = 'approved'
      and listing.status = 'approved'
  )
);

drop policy if exists "palugada_attachments_admin_delete" on public.attachments;

create policy "palugada_attachments_admin_delete"
on public.attachments for delete
to authenticated
using (
  linked_type = 'palugada_listing'
  and public.has_permission('palugada:write')
);

drop policy if exists "palugada_submission_storage_admin_delete" on storage.objects;

create policy "palugada_submission_storage_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'palugada-submissions'
  and public.has_permission('palugada:write')
);

drop policy if exists "palugada_listings_admin_delete" on public.palugada_listings;

create policy "palugada_listings_admin_delete"
on public.palugada_listings for delete
to authenticated
using (public.has_permission('palugada:write'));

commit;
