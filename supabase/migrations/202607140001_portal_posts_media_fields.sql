-- Phase C1.6: portal_posts media metadata foundation.
-- Adds URL-based cover image and attachment fields without changing storage buckets.

begin;

do $$
begin
  if to_regclass('public.portal_posts') is null then
    raise exception 'Missing required table: public.portal_posts';
  end if;
end $$;

alter table public.portal_posts
  add column if not exists cover_image_url text,
  add column if not exists cover_image_alt text,
  add column if not exists attachment_url text,
  add column if not exists attachment_label text;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portal_posts'
      and column_name = 'cover_image_url'
  ) then
    raise exception 'portal_posts media migration failed: cover_image_url missing';
  end if;
end $$;

commit;
