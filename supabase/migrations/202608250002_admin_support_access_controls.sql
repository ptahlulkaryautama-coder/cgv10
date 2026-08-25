-- Limits Admin Support 1-5 to operational modules selected by Super Admin.

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
      and role in (
        'super_admin',
        'ketua_rt',
        'sekretaris',
        'bendahara',
        'palugada_reviewer',
        'admin_support_1',
        'admin_support_2',
        'admin_support_3',
        'admin_support_4',
        'admin_support_5'
      )
  );
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
  support_permissions text[] := array[
    'services:read',
    'services:write',
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

  if target_role in (
    'admin_support_1',
    'admin_support_2',
    'admin_support_3',
    'admin_support_4',
    'admin_support_5'
  ) and not (target_permission = any(support_permissions)) then
    raise exception 'Admin Support hanya dapat diberi akses Permintaan, Konten Portal, atau PALUGADA';
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

grant execute on function public.has_production_admin_role() to authenticated;
grant execute on function public.set_role_feature_access(public.app_role, text, boolean) to authenticated;

commit;
