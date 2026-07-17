-- Phase C2.2: activate the dedicated PALUGADA reviewer role.
-- Idempotent: safe to rerun after the initial auth/permissions migration.

begin;

do $$
begin
  if to_regclass('public.role_permissions') is null then
    raise exception 'Missing required table: public.role_permissions';
  end if;
end $$;

insert into public.role_permissions (role, permission)
values
  ('palugada_reviewer', 'palugada:read'),
  ('palugada_reviewer', 'palugada:write')
on conflict (role, permission) do nothing;

do $$
begin
  if not exists (
    select 1
    from public.role_permissions
    where role = 'palugada_reviewer'
      and permission = 'palugada:read'
  ) or not exists (
    select 1
    from public.role_permissions
    where role = 'palugada_reviewer'
      and permission = 'palugada:write'
  ) then
    raise exception 'PALUGADA reviewer permissions were not created';
  end if;
end $$;

commit;
