-- Require warga login for dues confirmation submissions.

begin;

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
  current_user_id uuid := auth.uid();
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
  if current_user_id is null then
    raise exception 'Login warga diperlukan untuk konfirmasi iuran';
  end if;

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
      'Submitted by: ' || current_user_id::text,
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
grant execute on function public.submit_dues_confirmation(text, text, text, text, integer, integer, integer, date, text, text, text) to authenticated;

revoke all on function public.is_valid_payment_upload_path(text, uuid) from public;
grant execute on function public.is_valid_payment_upload_path(text, uuid) to authenticated;

drop policy if exists "payment_proofs_public_insert" on storage.objects;
drop policy if exists "payment_proofs_authenticated_insert" on storage.objects;

create policy "payment_proofs_authenticated_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and public.is_valid_payment_upload_path(name)
);

drop policy if exists "payment_attachments_public_insert" on public.attachments;
drop policy if exists "payment_attachments_authenticated_insert" on public.attachments;

create policy "payment_attachments_authenticated_insert"
on public.attachments for insert
to authenticated
with check (
  owner_user_id = auth.uid()
  and linked_type = 'finance_confirmation'
  and visibility = 'admin_only'
  and moderation_status = 'pending'
  and file_size between 1 and 10485760
  and public.is_valid_payment_upload_path(storage_path, linked_id)
);

commit;
