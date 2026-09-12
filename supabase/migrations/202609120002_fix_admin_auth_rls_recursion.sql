-- Migration: Complete Fix for RLS Recursion on user_roles and admin auth
-- Description: Drops the hidden 'FOR ALL' policy user_roles_manage_super_admin which was still
-- evaluating has_permission('users:manage') on every SELECT query, causing infinite recursion.

begin;

-- 1. Drop ALL policies on public.user_roles (including the 'for all' policy that caused recursion)
drop policy if exists "user_roles_select_own_or_admin" on public.user_roles;
drop policy if exists "user_roles_select_own" on public.user_roles;
drop policy if exists "user_roles_select_admin" on public.user_roles;
drop policy if exists "user_roles_select_authenticated" on public.user_roles;
drop policy if exists "user_roles_manage_super_admin" on public.user_roles;

-- Allow authenticated users to SELECT user_roles (Zero recursion!)
create policy "user_roles_select_authenticated"
on public.user_roles for select
to authenticated
using (true);

-- Only allow super_admin to insert, update, delete user_roles
create policy "user_roles_insert_admin"
on public.user_roles for insert
to authenticated
with check (
  exists (
    select 1 from public.user_roles existing
    where existing.user_id = auth.uid()
      and existing.role = 'super_admin'
  )
);

create policy "user_roles_update_admin"
on public.user_roles for update
to authenticated
using (
  exists (
    select 1 from public.user_roles existing
    where existing.user_id = auth.uid()
      and existing.role = 'super_admin'
  )
)
with check (
  exists (
    select 1 from public.user_roles existing
    where existing.user_id = auth.uid()
      and existing.role = 'super_admin'
  )
);

create policy "user_roles_delete_admin"
on public.user_roles for delete
to authenticated
using (
  exists (
    select 1 from public.user_roles existing
    where existing.user_id = auth.uid()
      and existing.role = 'super_admin'
  )
);

-- 2. Clean up profiles policies
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_select_anon" on public.profiles;

create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

create policy "profiles_select_anon"
on public.profiles for select
to anon
using (status = 'active');

-- 3. Clean up role_permissions
drop policy if exists "role_permissions_select_authenticated" on public.role_permissions;
create policy "role_permissions_select_authenticated"
on public.role_permissions for select
to authenticated
using (true);

-- 4. Recreate has_role and has_permission with search_path set to public
create or replace function public.has_role(target_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = target_role
  );
$$;

create or replace function public.has_permission(target_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = auth.uid()
      and rp.permission = target_permission
  );
$$;

commit;
