-- Remove resident access from a household without deleting historical records.

begin;

create or replace function public.remove_resident_from_household(
  p_household_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_reason text := btrim(coalesce(p_reason, ''));
  target_household public.households%rowtype;
  has_other_roles boolean := false;
  note_entry text;
begin
  if current_user_id is null or not public.has_permission('resident:write') then
    raise exception 'Akses pengelolaan warga diperlukan';
  end if;

  if char_length(clean_reason) < 3 then
    raise exception 'Alasan remove warga perlu diisi';
  end if;

  select *
  into target_household
  from public.households
  where id = p_household_id
  for update;

  if target_household.id is null then
    raise exception 'Data rumah tidak ditemukan';
  end if;

  if target_household.head_user_id is not null then
    delete from public.user_roles
    where user_id = target_household.head_user_id
      and role = 'warga';

    select exists (
      select 1
      from public.user_roles
      where user_id = target_household.head_user_id
    )
    into has_other_roles;

    if not has_other_roles then
      update public.profiles
      set status = 'suspended',
          updated_at = now()
      where id = target_household.head_user_id;
    end if;
  end if;

  note_entry := concat(
    to_char(now(), 'YYYY-MM-DD HH24:MI TZ'),
    ' - Warga removed by ',
    current_user_id::text,
    ': ',
    clean_reason
  );

  update public.households
  set head_user_id = null,
      occupancy_status = 'moved',
      verification_status = 'review',
      notes_private = concat_ws(E'\n', nullif(notes_private, ''), note_entry),
      updated_at = now()
  where id = p_household_id;

  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_snapshot,
    after_snapshot
  )
  values (
    current_user_id,
    'resident.removed',
    'household',
    p_household_id,
    to_jsonb(target_household),
    jsonb_build_object(
      'reason', clean_reason,
      'removed_user_id', target_household.head_user_id,
      'profile_suspended', target_household.head_user_id is not null and not has_other_roles
    )
  );
end;
$$;

revoke all on function public.remove_resident_from_household(uuid, text) from public;
grant execute on function public.remove_resident_from_household(uuid, text) to authenticated;

commit;
