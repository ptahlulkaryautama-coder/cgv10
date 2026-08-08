-- Check whether pengurus Auth users, profiles, roles, and key permissions are ready.
-- Run in Supabase SQL Editor before asking pengurus to test login.

with target(email, expected_role) as (
  values
    ('dharma.doddy9@yahoo.co.uk', 'ketua_rt'),
    ('Zulhendy@gmail.com', 'sekretaris'),
    ('nikodiponako7@gmail.com', 'bendahara')
),
auth_target as (
  select
    target.email as expected_email,
    target.expected_role,
    auth_user.id as auth_user_id,
    auth_user.email as auth_email,
    auth_user.email_confirmed_at,
    auth_user.last_sign_in_at
  from target
  left join auth.users auth_user on lower(auth_user.email) = lower(target.email)
),
role_summary as (
  select
    profile.email,
    array_agg(distinct user_role.role::text order by user_role.role::text) filter (where user_role.role is not null) as roles,
    array_agg(distinct role_permission.permission order by role_permission.permission) filter (where role_permission.permission is not null) as permissions
  from public.profiles profile
  left join public.user_roles user_role on user_role.user_id = profile.id
  left join public.role_permissions role_permission on role_permission.role = user_role.role
  group by profile.email
)
select
  auth_target.expected_email,
  auth_target.expected_role,
  case
    when auth_target.auth_user_id is null then 'missing_auth_user'
    when profile.id is null then 'missing_profile'
    when not coalesce(role_summary.roles, array[]::text[]) @> array[auth_target.expected_role] then 'missing_expected_role'
    when profile.status <> 'active' then 'profile_not_active'
    when auth_target.email_confirmed_at is null then 'email_not_confirmed'
    else 'ready'
  end as readiness,
  auth_target.auth_user_id,
  auth_target.auth_email,
  profile.status as profile_status,
  auth_target.email_confirmed_at,
  auth_target.last_sign_in_at,
  coalesce(role_summary.roles, array[]::text[]) as roles,
  coalesce(role_summary.permissions, array[]::text[]) as permissions
from auth_target
left join public.profiles profile on profile.id = auth_target.auth_user_id
left join role_summary on lower(role_summary.email::text) = lower(auth_target.expected_email)
order by auth_target.expected_role;

