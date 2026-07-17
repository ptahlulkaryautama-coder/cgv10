-- Public dues confirmation intake with private payment proof upload.

begin;

create table if not exists public.payment_upload_sessions (
  payment_id uuid primary key references public.payments(id) on delete cascade,
  upload_token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now()
);

alter table public.payment_upload_sessions enable row level security;

alter table public.payments
  alter column household_id drop not null;

create or replace function public.submit_dues_confirmation(
  p_name text,
  p_cluster text,
  p_block_or_unit text,
  p_phone text,
  p_period_month integer,
  p_period_year integer,
  p_amount integer,
  p_paid_at date,
  p_method text,
  p_reference_no text default '',
  p_note text default ''
)
returns table (payment_id uuid, upload_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := btrim(coalesce(p_name, ''));
  clean_cluster text := btrim(coalesce(p_cluster, ''));
  clean_block text := btrim(coalesce(p_block_or_unit, ''));
  clean_phone text := btrim(coalesce(p_phone, ''));
  clean_reference text := btrim(coalesce(p_reference_no, ''));
  clean_note text := btrim(coalesce(p_note, ''));
  matched_household_id uuid;
  created_payment_id uuid;
  created_upload_token uuid := gen_random_uuid();
begin
  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception 'Nama warga harus berisi 2 sampai 120 karakter';
  end if;

  if char_length(clean_cluster) < 2 or char_length(clean_cluster) > 120 then
    raise exception 'Cluster harus diisi';
  end if;

  if char_length(clean_block) < 1 or char_length(clean_block) > 80 then
    raise exception 'Blok atau nomor rumah harus diisi';
  end if;

  if char_length(clean_phone) < 6 or char_length(clean_phone) > 40 then
    raise exception 'Nomor WhatsApp belum valid';
  end if;

  if p_period_month not between 1 and 12 or p_period_year not between 2020 and 2100 then
    raise exception 'Periode iuran belum valid';
  end if;

  if p_amount < 1000 or p_amount > 100000000 then
    raise exception 'Nominal pembayaran belum valid';
  end if;

  if p_paid_at is null or p_paid_at > current_date + 1 then
    raise exception 'Tanggal bayar belum valid';
  end if;

  if p_method not in ('transfer', 'cash', 'qris', 'other') then
    raise exception 'Metode pembayaran belum valid';
  end if;

  select id
  into matched_household_id
  from public.households
  where lower(cluster) = lower(clean_cluster)
    and lower(block_or_unit) = lower(clean_block)
  limit 1;

  insert into public.payments (
    household_id,
    paid_at,
    amount,
    method,
    reference_no,
    payer_name,
    note,
    verification_status
  ) values (
    matched_household_id,
    p_paid_at::timestamptz,
    p_amount,
    p_method,
    nullif(clean_reference, ''),
    clean_name,
    concat_ws(
      E'\n',
      'Konfirmasi iuran warga',
      'Cluster/blok: ' || clean_cluster || ' / ' || clean_block,
      'WhatsApp: ' || clean_phone,
      'Periode: ' || lpad(p_period_month::text, 2, '0') || '-' || p_period_year::text,
      nullif(clean_note, '')
    ),
    'pending'
  )
  returning id into created_payment_id;

  insert into public.payment_upload_sessions (payment_id, upload_token)
  values (created_payment_id, created_upload_token);

  return query select created_payment_id, created_upload_token;
end;
$$;

revoke all on function public.submit_dues_confirmation(text, text, text, text, integer, integer, integer, date, text, text, text) from public;
grant execute on function public.submit_dues_confirmation(text, text, text, text, integer, integer, integer, date, text, text, text) to anon, authenticated;

create or replace function public.is_valid_payment_upload_path(
  object_name text,
  target_payment_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    split_part(object_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and split_part(object_name, '/', 2) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and split_part(object_name, '/', 3) <> ''
    and exists (
      select 1
      from public.payment_upload_sessions session
      where session.payment_id::text = split_part(object_name, '/', 1)
        and session.upload_token::text = split_part(object_name, '/', 2)
        and session.expires_at > now()
        and (target_payment_id is null or session.payment_id = target_payment_id)
    );
$$;

revoke all on function public.is_valid_payment_upload_path(text, uuid) from public;
grant execute on function public.is_valid_payment_upload_path(text, uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'application/pdf'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_proofs_public_insert" on storage.objects;
create policy "payment_proofs_public_insert"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'payment-proofs'
  and public.is_valid_payment_upload_path(name)
);

drop policy if exists "payment_proofs_admin_read" on storage.objects;
create policy "payment_proofs_admin_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and (public.has_permission('billing:read') or public.has_permission('finance:read'))
);

drop policy if exists "payment_proofs_admin_delete" on storage.objects;
create policy "payment_proofs_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'payment-proofs'
  and public.has_permission('billing:write')
);

drop policy if exists "payment_attachments_public_insert" on public.attachments;
create policy "payment_attachments_public_insert"
on public.attachments for insert
to anon, authenticated
with check (
  owner_user_id is null
  and linked_type = 'finance_confirmation'
  and visibility = 'admin_only'
  and moderation_status = 'pending'
  and file_size between 1 and 10485760
  and public.is_valid_payment_upload_path(storage_path, linked_id)
);

drop policy if exists "payments_public_insert" on public.payments;
drop policy if exists "payment_sessions_public_read" on public.payment_upload_sessions;

commit;
