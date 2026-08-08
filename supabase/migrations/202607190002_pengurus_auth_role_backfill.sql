-- Backfill and harden pengurus role assignment for Auth users created after invite migrations.

begin;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.email,
    'active'
  )
  on conflict (id) do update
  set email = excluded.email,
      status = 'active',
      updated_at = now();

  insert into public.user_roles (user_id, role, assigned_by)
  select new.id, invite.role, null
  from public.admin_invites invite
  where lower(invite.email::text) = lower(new.email)
    and invite.status in ('invited', 'accepted', 'active')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

with target(email, display_name, role) as (
  values
    ('dharma.doddy9@yahoo.co.uk'::citext, 'Doddy Dharma', 'ketua_rt'::public.app_role),
    ('Zulhendy@gmail.com'::citext, 'Zulhendy Masruddin', 'sekretaris'::public.app_role),
    ('nikodiponako7@gmail.com'::citext, 'Niko Diponako', 'bendahara'::public.app_role)
),
auth_target as (
  select auth_user.id, auth_user.email, target.display_name, target.role
  from auth.users auth_user
  join target on lower(auth_user.email) = lower(target.email::text)
)
insert into public.profiles (id, display_name, email, status)
select id, display_name, email, 'active'
from auth_target
on conflict (id) do update
set display_name = case
    when btrim(coalesce(public.profiles.display_name, '')) = '' then excluded.display_name
    else public.profiles.display_name
  end,
  email = excluded.email,
  status = 'active',
  updated_at = now();

with target(email, role) as (
  values
    ('dharma.doddy9@yahoo.co.uk'::citext, 'ketua_rt'::public.app_role),
    ('Zulhendy@gmail.com'::citext, 'sekretaris'::public.app_role),
    ('nikodiponako7@gmail.com'::citext, 'bendahara'::public.app_role)
)
insert into public.user_roles (user_id, role, assigned_by)
select profile.id, target.role, null
from target
join public.profiles profile on lower(profile.email::text) = lower(target.email::text)
on conflict (user_id, role) do nothing;

commit;

