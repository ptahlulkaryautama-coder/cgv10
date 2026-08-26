-- Manage the public homepage slideshow without exposing direct table writes.

begin;

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_settings enable row level security;

insert into public.site_settings (setting_key, setting_value)
values (
  'home_hero',
  jsonb_build_object(
    'enabled', true,
    'interval_ms', 6500,
    'slides', jsonb_build_array()
  )
)
on conflict (setting_key) do nothing;

create or replace function public.get_home_hero_settings()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select setting_value
      from public.site_settings
      where setting_key = 'home_hero'
    ),
    '{"enabled":true,"interval_ms":6500,"slides":[]}'::jsonb
  );
$$;

create or replace function public.set_home_hero_settings(settings jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  slide_count integer;
  interval_value integer;
begin
  if auth.uid() is null or not (
    public.has_permission('content:write') or
    public.has_permission('settings:manage') or
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  ) then
    raise exception 'Anda tidak memiliki izin untuk mengubah tampilan beranda';
  end if;

  if jsonb_typeof(settings) <> 'object'
    or jsonb_typeof(settings->'enabled') <> 'boolean'
    or jsonb_typeof(settings->'slides') <> 'array' then
    raise exception 'Format pengaturan slideshow tidak valid';
  end if;

  slide_count := jsonb_array_length(settings->'slides');
  interval_value := (settings->>'interval_ms')::integer;

  if slide_count > 6 then
    raise exception 'Maksimal 6 gambar untuk slideshow beranda';
  end if;

  if interval_value < 4000 or interval_value > 15000 then
    raise exception 'Jeda slideshow harus antara 4 dan 15 detik';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(settings->'slides') slide
    where nullif(trim(slide->>'src'), '') is null
       or nullif(trim(slide->>'alt'), '') is null
  ) then
    raise exception 'Setiap gambar harus memiliki alamat gambar dan deskripsi';
  end if;

  insert into public.site_settings (setting_key, setting_value, updated_at, updated_by)
  values ('home_hero', settings, now(), auth.uid())
  on conflict (setting_key) do update
  set setting_value = excluded.setting_value,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by;
end;
$$;

grant execute on function public.get_home_hero_settings() to anon, authenticated;
grant execute on function public.set_home_hero_settings(jsonb) to authenticated;

commit;
