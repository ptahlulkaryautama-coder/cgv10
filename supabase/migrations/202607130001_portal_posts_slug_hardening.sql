-- Phase C1.5: portal_posts slug foundation.
-- Safe-run migration:
-- - Additive only.
-- - Runs in one transaction.
-- - Raises an error before commit if validation fails.
-- - Keeps existing updated_at values unchanged during slug backfill.
-- - Preserves status values, existing permissions, and RLS policies.

begin;

do $$
begin
  if to_regclass('public.portal_posts') is null then
    raise exception 'Missing required table: public.portal_posts';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portal_posts'
      and policyname = 'portal_posts_public_published'
  ) then
    raise exception 'Missing expected RLS policy: portal_posts_public_published';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portal_posts'
      and policyname = 'portal_posts_write_content_admin'
  ) then
    raise exception 'Missing expected RLS policy: portal_posts_write_content_admin';
  end if;

  if to_regprocedure('public.set_updated_at()') is null then
    raise exception 'Missing required function: public.set_updated_at()';
  end if;
end $$;

alter table public.portal_posts
  add column if not exists slug text;

drop trigger if exists portal_posts_set_updated_at on public.portal_posts;

create or replace function public.portal_post_slugify(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select trim(
    both '-' from regexp_replace(
      regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'),
      '-+',
      '-',
      'g'
    )
  );
$$;

update public.portal_posts
set slug = concat(
  coalesce(nullif(public.portal_post_slugify(title), ''), 'portal-post'),
  '-',
  left(id::text, 8)
)
where slug is null
   or btrim(slug) = '';

update public.portal_posts
set slug = public.portal_post_slugify(slug)
where slug is distinct from public.portal_post_slugify(slug);

update public.portal_posts
set slug = concat('portal-post-', left(id::text, 8))
where slug is null
   or btrim(slug) = '';

with numbered_slugs as (
  select
    id,
    slug,
    row_number() over (partition by slug order by id) as slug_position,
    count(*) over (partition by slug) as slug_count
  from public.portal_posts
)
update public.portal_posts post
set slug = concat(numbered_slugs.slug, '-', left(post.id::text, 8))
from numbered_slugs
where post.id = numbered_slugs.id
  and numbered_slugs.slug_count > 1
  and numbered_slugs.slug_position > 1;

do $$
begin
  if exists (
    select 1
    from public.portal_posts
    where slug is null
       or btrim(slug) = ''
  ) then
    raise exception 'portal_posts slug backfill failed: empty slug remains';
  end if;

  if exists (
    select 1
    from public.portal_posts
    where slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) then
    raise exception 'portal_posts slug backfill failed: invalid slug format remains';
  end if;

  if exists (
    select slug
    from public.portal_posts
    group by slug
    having count(*) > 1
  ) then
    raise exception 'portal_posts slug backfill failed: duplicate slug remains';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'portal_posts_slug_format_check'
      and conrelid = 'public.portal_posts'::regclass
  ) then
    alter table public.portal_posts
      add constraint portal_posts_slug_format_check
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

alter table public.portal_posts
  alter column slug set not null;

create unique index if not exists portal_posts_slug_uidx
  on public.portal_posts (slug);

create trigger portal_posts_set_updated_at
before update on public.portal_posts
for each row execute function public.set_updated_at();

create or replace function public.set_portal_post_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base_slug := public.portal_post_slugify(new.title);
  else
    base_slug := public.portal_post_slugify(new.slug);
  end if;

  if base_slug is null or base_slug = '' then
    base_slug := 'portal-post';
  end if;

  candidate_slug := base_slug;

  while exists (
    select 1
    from public.portal_posts existing
    where existing.slug = candidate_slug
      and existing.id is distinct from new.id
  ) loop
    suffix := suffix + 1;
    candidate_slug := concat(base_slug, '-', suffix);
  end loop;

  new.slug := candidate_slug;
  return new;
end;
$$;

drop trigger if exists portal_posts_set_slug on public.portal_posts;

create trigger portal_posts_set_slug
before insert or update of title, slug on public.portal_posts
for each row execute function public.set_portal_post_slug();

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'portal_posts'
      and indexname = 'portal_posts_slug_uidx'
  ) then
    raise exception 'portal_posts slug hardening failed: unique index was not created';
  end if;

  if not exists (
    select 1
    from information_schema.triggers
    where event_object_schema = 'public'
      and event_object_table = 'portal_posts'
      and trigger_name = 'portal_posts_set_updated_at'
  ) then
    raise exception 'portal_posts slug hardening failed: updated_at trigger was not recreated';
  end if;

  if not exists (
    select 1
    from information_schema.triggers
    where event_object_schema = 'public'
      and event_object_table = 'portal_posts'
      and trigger_name = 'portal_posts_set_slug'
  ) then
    raise exception 'portal_posts slug hardening failed: slug trigger was not created';
  end if;
end $$;

commit;
