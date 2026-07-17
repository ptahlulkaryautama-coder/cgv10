-- Seed current pengurus admin invite records and role mapping.
-- Auth users still need to be created/invited from Supabase Authentication.

begin;

with target(email, display_name, role, note) as (
  values
    (
      'dharma.doddy9@yahoo.co.uk'::citext,
      'Doddy Dharma',
      'ketua_rt'::public.app_role,
      'Ketua RT 010 trial access'
    ),
    (
      'Zulhendy@gmail.com'::citext,
      'Zulhendy Masruddin',
      'sekretaris'::public.app_role,
      'Sekretaris RT 010 trial access'
    )
)
insert into public.admin_invites (email, role, status, note)
select target.email, target.role, 'invited', target.note
from target
where not exists (
  select 1
  from public.admin_invites existing
  where existing.email = target.email
    and existing.role = target.role
);

with target(email, display_name, role) as (
  values
    ('dharma.doddy9@yahoo.co.uk'::citext, 'Doddy Dharma', 'ketua_rt'::public.app_role),
    ('Zulhendy@gmail.com'::citext, 'Zulhendy Masruddin', 'sekretaris'::public.app_role)
)
update public.profiles profile
set display_name = case
    when btrim(profile.display_name) = '' then target.display_name
    else profile.display_name
  end,
  status = 'active',
  updated_at = now()
from target
where profile.email = target.email;

with target(email, role) as (
  values
    ('dharma.doddy9@yahoo.co.uk'::citext, 'ketua_rt'::public.app_role),
    ('Zulhendy@gmail.com'::citext, 'sekretaris'::public.app_role)
)
insert into public.user_roles (user_id, role, assigned_by)
select profile.id, target.role, null
from target
join public.profiles profile on profile.email = target.email
on conflict (user_id, role) do nothing;

commit;
