-- Phase C1.8: portal post storage MIME hardening.
-- Expands common browser/phone MIME variants for cover images and attachments.

begin;

update storage.buckets
set file_size_limit = 15728640,
    allowed_mime_types = array[
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
where id = 'portal-post-media';

update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array[
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
where id = 'portal-post-attachments';

do $$
begin
  if not exists (
    select 1
    from storage.buckets
    where id = 'portal-post-media'
      and 'image/heic' = any(allowed_mime_types)
  ) then
    raise exception 'portal-post-media MIME hardening failed';
  end if;
end $$;

commit;
