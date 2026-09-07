-- In-app notification system.
-- Tabel notifications + RLS + triggers otomatis untuk:
--   1. Pendaftaran warga (approved/rejected)
--   2. Layanan/service request (status berubah)
--   3. Palugada listing (approved/rejected)

begin;

-- ============================================================
-- TABEL NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in (
    'registration_approved',
    'registration_rejected',
    'service_request_updated',
    'palugada_approved',
    'palugada_rejected',
    'general'
  )),
  title       text not null,
  body        text not null default '',
  entity_type text check (entity_type in (
    'resident_registration_request',
    'service_request',
    'palugada_listing'
  )),
  entity_id   uuid,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

-- Warga hanya bisa baca notif sendiri
drop policy if exists "notifications_own_read" on public.notifications;
create policy "notifications_own_read" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

-- Warga bisa update is_read milik sendiri
drop policy if exists "notifications_own_mark_read" on public.notifications;
create policy "notifications_own_mark_read" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Hanya service role (trigger security definer) yang bisa insert
drop policy if exists "notifications_service_insert" on public.notifications;
create policy "notifications_service_insert" on public.notifications
  for insert with check (true);

-- ============================================================
-- FUNCTION: mark_notification_read
-- ============================================================
create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set is_read = true
  where id = p_notification_id
    and user_id = auth.uid();
end;
$$;

revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;

-- ============================================================
-- FUNCTION: mark_all_notifications_read
-- ============================================================
create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set is_read = true
  where user_id = auth.uid()
    and is_read = false;
end;
$$;

revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_all_notifications_read() to authenticated;

-- ============================================================
-- TRIGGER: Notif saat pendaftaran warga disetujui/ditolak
-- ============================================================
create or replace function public.notify_on_registration_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  -- Hanya proses jika status berubah ke approved atau rejected
  if NEW.status not in ('approved', 'rejected') then
    return NEW;
  end if;
  if OLD.status = NEW.status then
    return NEW;
  end if;

  -- Cari user_id: dari requested_user_id atau lookup by email di profiles
  target_user_id := NEW.requested_user_id;

  if target_user_id is null then
    select id into target_user_id
    from public.profiles
    where lower(email::text) = lower(NEW.email::text)
    limit 1;
  end if;

  -- Skip jika warga belum punya akun sama sekali
  if target_user_id is null then
    return NEW;
  end if;

  if NEW.status = 'approved' then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    values (
      target_user_id,
      'registration_approved',
      'Pendaftaran warga disetujui',
      'Selamat! Pendaftaran Anda sebagai warga telah disetujui oleh pengurus RT.' ||
        case when NEW.admin_note <> '' then ' Catatan: ' || NEW.admin_note else '' end,
      'resident_registration_request',
      NEW.id
    );
  elsif NEW.status = 'rejected' then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    values (
      target_user_id,
      'registration_rejected',
      'Pendaftaran warga ditolak',
      'Pendaftaran Anda belum dapat disetujui.' ||
        case when NEW.admin_note <> '' then ' Alasan: ' || NEW.admin_note else '' end,
      'resident_registration_request',
      NEW.id
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_registration_status_change on public.resident_registration_requests;
create trigger on_registration_status_change
  after update on public.resident_registration_requests
  for each row
  execute function public.notify_on_registration_status();

-- ============================================================
-- TRIGGER: Notif saat status layanan/service request berubah
-- ============================================================
create or replace function public.notify_on_service_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  notif_title text;
  notif_body  text;
begin
  -- Hanya proses jika status berubah
  if OLD.status = NEW.status then
    return NEW;
  end if;

  -- Hanya kirim notif jika ada submitter
  if NEW.submitted_by is null then
    return NEW;
  end if;

  -- Jangan notif saat status 'draft' atau 'submitted' (belum diproses admin)
  if NEW.status in ('draft', 'submitted') then
    return NEW;
  end if;

  notif_title := case NEW.status
    when 'triage'      then 'Layanan sedang ditinjau'
    when 'in_progress' then 'Layanan sedang diproses'
    when 'resolved'    then 'Layanan selesai ditangani'
    when 'rejected'    then 'Layanan tidak dapat diproses'
    else 'Status layanan diperbarui'
  end;

  notif_body := 'Permintaan layanan "' || NEW.title || '" ' ||
    case NEW.status
      when 'triage'      then 'sedang ditinjau oleh pengurus RT.'
      when 'in_progress' then 'sedang dalam proses penanganan.'
      when 'resolved'    then 'telah selesai ditangani.'
      when 'rejected'    then 'tidak dapat diproses saat ini.'
      else 'statusnya telah diperbarui.'
    end;

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  values (
    NEW.submitted_by,
    'service_request_updated',
    notif_title,
    notif_body,
    'service_request',
    NEW.id
  );

  return NEW;
end;
$$;

drop trigger if exists on_service_request_status_change on public.service_requests;
create trigger on_service_request_status_change
  after update on public.service_requests
  for each row
  execute function public.notify_on_service_request_update();

-- ============================================================
-- TRIGGER: Notif saat palugada listing disetujui/ditolak
-- ============================================================
create or replace function public.notify_on_palugada_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.status = NEW.status then
    return NEW;
  end if;

  if NEW.seller_user_id is null then
    return NEW;
  end if;

  if NEW.status not in ('approved', 'rejected') then
    return NEW;
  end if;

  if NEW.status = 'approved' then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    values (
      NEW.seller_user_id,
      'palugada_approved',
      'Listing Palugada disetujui',
      'Listing "' || NEW.name || '" Anda telah disetujui dan sekarang tampil di halaman Palugada.',
      'palugada_listing',
      NEW.id
    );
  elsif NEW.status = 'rejected' then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    values (
      NEW.seller_user_id,
      'palugada_rejected',
      'Listing Palugada ditolak',
      'Listing "' || NEW.name || '" belum dapat disetujui. Silakan hubungi pengurus untuk informasi lebih lanjut.',
      'palugada_listing',
      NEW.id
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_palugada_status_change on public.palugada_listings;
create trigger on_palugada_status_change
  after update on public.palugada_listings
  for each row
  execute function public.notify_on_palugada_status();

commit;
