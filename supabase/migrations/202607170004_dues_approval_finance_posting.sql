-- Verify dues payments and post approved receipts into the finance ledger.

begin;

alter table public.payments
  add column if not exists due_period_month integer check (due_period_month is null or due_period_month between 1 and 12),
  add column if not exists due_period_year integer check (due_period_year is null or due_period_year between 2020 and 2100);

alter table public.finance_transactions
  add column if not exists source_type text,
  add column if not exists source_id uuid;

create unique index if not exists finance_transactions_source_unique
on public.finance_transactions (source_type, source_id)
where source_type is not null and source_id is not null;

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

  if matched_household_id is null then
    raise exception 'Data rumah belum ditemukan. Minta pengurus memverifikasi profil rumah terlebih dahulu.';
  end if;

  insert into public.payments (
    household_id,
    paid_at,
    amount,
    method,
    reference_no,
    payer_name,
    note,
    due_period_month,
    due_period_year,
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
    p_period_month,
    p_period_year,
    'pending'
  )
  returning id into created_payment_id;

  insert into public.payment_upload_sessions (payment_id, upload_token)
  values (created_payment_id, created_upload_token);

  return query select created_payment_id, created_upload_token;
end;
$$;

create or replace function public.approve_dues_payment(
  p_payment_id uuid,
  p_publish_to_public_summary boolean default true
)
returns table (
  payment_id uuid,
  billing_period_id uuid,
  household_charge_id uuid,
  finance_transaction_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_payment public.payments%rowtype;
  target_period_id uuid;
  target_charge_id uuid;
  target_allocation_id uuid;
  target_transaction_id uuid;
  period_label text;
begin
  if current_user_id is null or not public.has_permission('billing:verify') then
    raise exception 'Akses verifikasi iuran diperlukan';
  end if;

  select *
  into target_payment
  from public.payments
  where id = p_payment_id
  for update;

  if target_payment.id is null then
    raise exception 'Pembayaran tidak ditemukan';
  end if;

  if target_payment.verification_status = 'verified' then
    select id
    into target_transaction_id
    from public.finance_transactions
    where source_type = 'dues_payment'
      and source_id = target_payment.id
    limit 1;

    select pa.household_charge_id
    into target_charge_id
    from public.payment_allocations pa
    where pa.payment_id = target_payment.id
    limit 1;

    select hc.billing_period_id
    into target_period_id
    from public.household_charges hc
    where hc.id = target_charge_id;

    return query select target_payment.id, target_period_id, target_charge_id, target_transaction_id;
    return;
  end if;

  if target_payment.verification_status not in ('pending', 'rejected') then
    raise exception 'Status pembayaran tidak bisa disetujui';
  end if;

  if target_payment.due_period_month is null or target_payment.due_period_year is null then
    raise exception 'Periode iuran belum tersimpan pada pembayaran ini';
  end if;

  insert into public.billing_periods (
    period_month,
    period_year,
    amount_default,
    status,
    created_by,
    note
  ) values (
    target_payment.due_period_month,
    target_payment.due_period_year,
    target_payment.amount,
    'issued',
    current_user_id,
    'Dibuat otomatis dari approval konfirmasi iuran'
  )
  on conflict (period_month, period_year) do update
  set status = case
      when public.billing_periods.status = 'draft' then 'issued'
      else public.billing_periods.status
    end,
    updated_at = now()
  returning id into target_period_id;

  insert into public.household_charges (
    household_id,
    billing_period_id,
    amount,
    status,
    created_by,
    note
  ) values (
    target_payment.household_id,
    target_period_id,
    target_payment.amount,
    'unpaid',
    current_user_id,
    'Tagihan dibuat otomatis dari konfirmasi iuran'
  )
  on conflict (household_id, billing_period_id) do update
  set amount = greatest(public.household_charges.amount, excluded.amount),
      updated_at = now()
  returning id into target_charge_id;

  insert into public.payment_allocations (
    payment_id,
    household_charge_id,
    amount_allocated
  ) values (
    target_payment.id,
    target_charge_id,
    target_payment.amount
  )
  on conflict (payment_id, household_charge_id) do update
  set amount_allocated = excluded.amount_allocated
  returning id into target_allocation_id;

  update public.payments
  set verification_status = 'verified',
      verified_by = current_user_id,
      verified_at = now(),
      void_reason = null
  where id = target_payment.id;

  perform public.refresh_household_charge_status(target_charge_id);

  period_label := lpad(target_payment.due_period_month::text, 2, '0') || '-' || target_payment.due_period_year::text;

  insert into public.finance_transactions (
    transaction_date,
    description,
    category,
    amount,
    direction,
    visibility,
    created_by,
    approved_by,
    source_type,
    source_id
  ) values (
    target_payment.paid_at::date,
    'Iuran warga ' || period_label || coalesce(' - ' || nullif(target_payment.payer_name, ''), ''),
    'Iuran warga',
    target_payment.amount,
    'income',
    case when p_publish_to_public_summary then 'public_summary' else 'internal' end,
    current_user_id,
    current_user_id,
    'dues_payment',
    target_payment.id
  )
  on conflict (source_type, source_id) where source_type is not null and source_id is not null
  do update set
    transaction_date = excluded.transaction_date,
    description = excluded.description,
    category = excluded.category,
    amount = excluded.amount,
    direction = excluded.direction,
    visibility = excluded.visibility,
    approved_by = excluded.approved_by,
    updated_at = now()
  returning id into target_transaction_id;

  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_snapshot
  ) values (
    current_user_id,
    'dues_payment.approved',
    'payments',
    target_payment.id,
    jsonb_build_object(
      'payment_id', target_payment.id,
      'billing_period_id', target_period_id,
      'household_charge_id', target_charge_id,
      'finance_transaction_id', target_transaction_id
    )
  );

  return query select target_payment.id, target_period_id, target_charge_id, target_transaction_id;
end;
$$;

create or replace function public.reject_dues_payment(
  p_payment_id uuid,
  p_reason text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_reason text := btrim(coalesce(p_reason, ''));
  target_payment public.payments%rowtype;
begin
  if current_user_id is null or not public.has_permission('billing:verify') then
    raise exception 'Akses verifikasi iuran diperlukan';
  end if;

  select *
  into target_payment
  from public.payments
  where id = p_payment_id
  for update;

  if target_payment.id is null then
    raise exception 'Pembayaran tidak ditemukan';
  end if;

  if target_payment.verification_status = 'verified' then
    raise exception 'Pembayaran terverifikasi tidak bisa ditolak. Gunakan void/koreksi.';
  end if;

  update public.payments
  set verification_status = 'rejected',
      verified_by = current_user_id,
      verified_at = now(),
      void_reason = nullif(clean_reason, '')
  where id = target_payment.id;

  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    after_snapshot
  ) values (
    current_user_id,
    'dues_payment.rejected',
    'payments',
    target_payment.id,
    jsonb_build_object('payment_id', target_payment.id, 'reason', nullif(clean_reason, ''))
  );

  return target_payment.id;
end;
$$;

revoke all on function public.approve_dues_payment(uuid, boolean) from public;
grant execute on function public.approve_dues_payment(uuid, boolean) to authenticated;

revoke all on function public.reject_dues_payment(uuid, text) from public;
grant execute on function public.reject_dues_payment(uuid, text) to authenticated;

commit;
