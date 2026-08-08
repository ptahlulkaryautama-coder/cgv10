-- Add super-admin controls for admin login visibility and role feature access.

begin;

create or replace function public.has_production_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'ketua_rt', 'sekretaris', 'bendahara', 'palugada_reviewer')
  );
$$;

create or replace function public.get_admin_access_overview()
returns table (
  profile_id uuid,
  display_name text,
  email citext,
  status public.user_status,
  roles text[],
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null or not public.has_production_admin_role() then
    raise exception 'Akses daftar admin diperlukan';
  end if;

  return query
  select
    profile.id as profile_id,
    profile.display_name,
    profile.email,
    profile.status,
    coalesce(
      array_agg(distinct user_role.role::text order by user_role.role::text)
        filter (where user_role.role is not null),
      array[]::text[]
    ) as roles,
    auth_user.email_confirmed_at,
    auth_user.last_sign_in_at,
    auth_user.created_at
  from public.profiles profile
  join public.user_roles user_role on user_role.user_id = profile.id
  left join auth.users auth_user on auth_user.id = profile.id
  where user_role.role <> 'warga'
  group by
    profile.id,
    profile.display_name,
    profile.email,
    profile.status,
    auth_user.email_confirmed_at,
    auth_user.last_sign_in_at,
    auth_user.created_at
  order by auth_user.last_sign_in_at desc nulls last, profile.email asc;
end;
$$;

create or replace function public.set_role_feature_access(
  target_role public.app_role,
  target_permission text,
  enabled boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_permissions text[] := array[
    'resident:read',
    'resident:write',
    'services:read',
    'services:write',
    'finance:read',
    'finance:write',
    'billing:read',
    'billing:write',
    'billing:verify',
    'content:read',
    'content:write',
    'content:approve',
    'palugada:read',
    'palugada:write'
  ];
begin
  if auth.uid() is null or not public.has_permission('users:manage') then
    raise exception 'Akses super admin diperlukan';
  end if;

  if target_role in ('super_admin', 'warga', 'security') then
    raise exception 'Role ini tidak bisa diubah dari feature matrix';
  end if;

  if not (target_permission = any(allowed_permissions)) then
    raise exception 'Permission tidak dikenal atau tidak boleh diubah';
  end if;

  if enabled then
    insert into public.role_permissions (role, permission)
    values (target_role, target_permission)
    on conflict do nothing;
  else
    delete from public.role_permissions
    where role = target_role
      and permission = target_permission;
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, before_snapshot, after_snapshot)
  values (
    auth.uid(),
    case when enabled then 'role_permission_enabled' else 'role_permission_disabled' end,
    'role_permissions',
    jsonb_build_object('role', target_role, 'permission', target_permission),
    jsonb_build_object('enabled', enabled)
  );
end;
$$;

grant execute on function public.get_admin_access_overview() to authenticated;
grant execute on function public.has_production_admin_role() to authenticated;
grant execute on function public.set_role_feature_access(public.app_role, text, boolean) to authenticated;

commit;
