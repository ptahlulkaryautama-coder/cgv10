-- Support multi-period dues payments and private resident dues recap.

begin;

do $$
declare
  required_object text;
  required_objects text[] := array[
    'public.households',
    'public.household_members',
    'public.payments',
    'public.payment_upload_sessions',
    'public.billing_periods',
    'public.household_charges',
    'public.payment_allocations',
    'public.finance_transactions',
    'public.audit_logs'
  ];
begin
  foreach required_object in array required_objects loop
    if to_regclass(required_object) is null then
      raise exception 'Missing migration dependency: %', required_object;
    end if;
  end loop;

  if to_regprocedure('public.has_permission(text)') is null then
    raise exception 'Missing migration dependency: public.has_permission(text)';
  end if;

  if to_regprocedure('public.refresh_household_charge_status(uuid)') is null then
    raise exception 'Missing migration dependency: public.refresh_household_charge_status(uuid)';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name in ('due_period_month', 'due_period_year')
    group by table_schema, table_name
    having count(*) = 2
  ) then
    raise exception 'Missing migration dependency: payments.due_period_month/year';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'finance_transactions'
      and column_name in ('source_type', 'source_id')
    group by table_schema, table_name
    having count(*) = 2
  ) then
    raise exception 'Missing migration dependency: finance_transactions.source_type/source_id';
  end if;
end;
$$;

alter table public.payments
  add column if not exists period_count integer not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_period_count_range'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_period_count_range
      check (period_count between 1 and 120);
  end if;
end;
$$;

create index if not exists payments_household_period_idx
on public.payments (household_id, due_period_year desc, due_period_month desc, period_count);

drop function if exists public.submit_dues_confirmation(text, text, text, text, integer, integer, integer, date, text, text, text);

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
  p_note text default '',
  p_period_count integer default 1
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
  clean_period_count integer := coalesce(p_period_count, 1);
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

  if clean_period_count not between 1 and 120 then
    raise exception 'Jumlah periode iuran harus 1 sampai 120 bulan';
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
    period_count,
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
      'Periode mulai: ' || lpad(p_period_month::text, 2, '0') || '-' || p_period_year::text,
      'Jumlah periode: ' || clean_period_count::text || ' bulan',
      nullif(clean_note, '')
    ),
    p_period_month,
    p_period_year,
    clean_period_count,
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
  clean_period_count integer;
  period_index integer;
  period_date date;
  period_amount integer;
  base_period_amount integer;
  remainder_amount integer;
  first_period_label text;
  last_period_label text;
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
    order by pa.created_at
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

  clean_period_count := greatest(coalesce(target_payment.period_count, 1), 1);
  base_period_amount := target_payment.amount / clean_period_count;
  remainder_amount := target_payment.amount - (base_period_amount * clean_period_count);

  for period_index in 0..(clean_period_count - 1) loop
    period_date := (make_date(target_payment.due_period_year, target_payment.due_period_month, 1) + (period_index || ' months')::interval)::date;
    period_amount := base_period_amount + case when period_index = clean_period_count - 1 then remainder_amount else 0 end;

    if period_index = 0 then
      first_period_label := to_char(period_date, 'MM-YYYY');
    end if;
    last_period_label := to_char(period_date, 'MM-YYYY');

    insert into public.billing_periods (
      period_month,
      period_year,
      amount_default,
      status,
      created_by,
      note
    ) values (
      extract(month from period_date)::integer,
      extract(year from period_date)::integer,
      period_amount,
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
      period_amount,
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
      period_amount
    )
    on conflict (payment_id, household_charge_id) do update
    set amount_allocated = excluded.amount_allocated
    returning id into target_allocation_id;

    perform public.refresh_household_charge_status(target_charge_id);
  end loop;

  update public.payments
  set verification_status = 'verified',
      verified_by = current_user_id,
      verified_at = now(),
      void_reason = null
  where id = target_payment.id;

  period_label := case
    when clean_period_count = 1 then first_period_label
    else first_period_label || ' s.d. ' || last_period_label
  end;

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
      'period_count', clean_period_count,
      'billing_period_id', target_period_id,
      'household_charge_id', target_charge_id,
      'finance_transaction_id', target_transaction_id
    )
  );

  return query select target_payment.id, target_period_id, target_charge_id, target_transaction_id;
end;
$$;

create or replace function public.get_my_dues_recap()
returns table (
  household_id uuid,
  cluster text,
  block_or_unit text,
  unit_number text,
  primary_contact_name text,
  payment_id uuid,
  paid_at timestamptz,
  amount integer,
  method text,
  reference_no text,
  payer_name text,
  verification_status text,
  due_period_month integer,
  due_period_year integer,
  period_count integer,
  period_label text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_household_id uuid;
begin
  if current_user_id is null then
    raise exception 'Login warga diperlukan untuk melihat rekap iuran';
  end if;

  select h.id
  into current_household_id
  from public.households h
  where h.head_user_id = current_user_id
     or exists (
       select 1
       from public.household_members hm
       where hm.household_id = h.id
         and hm.user_id = current_user_id
     )
  order by h.created_at desc
  limit 1;

  if current_household_id is null then
    return;
  end if;

  return query
  select
    h.id as household_id,
    h.cluster,
    h.block_or_unit,
    h.unit_number,
    h.primary_contact_name,
    p.id as payment_id,
    p.paid_at,
    p.amount,
    p.method,
    p.reference_no,
    p.payer_name,
    p.verification_status,
    p.due_period_month,
    p.due_period_year,
    greatest(coalesce(p.period_count, 1), 1) as period_count,
    case
      when greatest(coalesce(p.period_count, 1), 1) = 1 then
        lpad(p.due_period_month::text, 2, '0') || '-' || p.due_period_year::text
      else
        lpad(p.due_period_month::text, 2, '0') || '-' || p.due_period_year::text ||
        ' s.d. ' ||
        to_char(
          (make_date(p.due_period_year, p.due_period_month, 1) + ((greatest(coalesce(p.period_count, 1), 1) - 1) || ' months')::interval)::date,
          'MM-YYYY'
        )
    end as period_label
  from public.households h
  join public.payments p on p.household_id = h.id
  where h.id = current_household_id
  order by p.paid_at desc, p.created_at desc
  limit 36;
end;
$$;

revoke all on function public.submit_dues_confirmation(text, text, text, text, integer, integer, integer, date, text, text, text, integer) from public;
grant execute on function public.submit_dues_confirmation(text, text, text, text, integer, integer, integer, date, text, text, text, integer) to authenticated;

revoke all on function public.get_my_dues_recap() from public;
grant execute on function public.get_my_dues_recap() to authenticated;

commit;
