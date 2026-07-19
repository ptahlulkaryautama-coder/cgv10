-- Ensure current pengurus roles and module permissions are active in existing databases.
-- Auth users still need to exist in Supabase Authentication before user_roles can attach.

begin;

with target(email, display_name, role, note) as (
  values
    (
      'dharma.doddy9@yahoo.co.uk'::citext,
      'Doddy Dharma',
      'ketua_rt'::public.app_role,
      'Ketua RT 010 production access'
    ),
    (
      'Zulhendy@gmail.com'::citext,
      'Zulhendy Masruddin',
      'sekretaris'::public.app_role,
      'Sekretaris RT 010 production access'
    ),
    (
      'nikodiponako7@gmail.com'::citext,
      'Niko Diponako',
      'bendahara'::public.app_role,
      'Bendahara RT 010 production access'
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
    ('Zulhendy@gmail.com'::citext, 'Zulhendy Masruddin', 'sekretaris'::public.app_role),
    ('nikodiponako7@gmail.com'::citext, 'Niko Diponako', 'bendahara'::public.app_role)
)
update public.profiles profile
set display_name = case
    when btrim(coalesce(profile.display_name, '')) = '' then target.display_name
    else profile.display_name
  end,
  status = 'active',
  updated_at = now()
from target
where profile.email = target.email;

with target(email, role) as (
  values
    ('dharma.doddy9@yahoo.co.uk'::citext, 'ketua_rt'::public.app_role),
    ('Zulhendy@gmail.com'::citext, 'sekretaris'::public.app_role),
    ('nikodiponako7@gmail.com'::citext, 'bendahara'::public.app_role)
)
insert into public.user_roles (user_id, role, assigned_by)
select profile.id, target.role, null
from target
join public.profiles profile on profile.email = target.email
on conflict (user_id, role) do nothing;

insert into public.role_permissions (role, permission) values
  ('ketua_rt', 'billing:read'),
  ('ketua_rt', 'billing:verify'),
  ('sekretaris', 'content:read'),
  ('sekretaris', 'content:write'),
  ('sekretaris', 'palugada:read'),
  ('sekretaris', 'billing:read'),
  ('bendahara', 'resident:read'),
  ('bendahara', 'services:read'),
  ('bendahara', 'finance:read'),
  ('bendahara', 'finance:write'),
  ('bendahara', 'billing:read'),
  ('bendahara', 'billing:write'),
  ('bendahara', 'billing:verify')
on conflict do nothing;

commit;
