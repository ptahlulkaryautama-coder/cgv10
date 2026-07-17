-- Resident and monthly dues foundation.
-- Adds accounting-friendly billing tables without replacing the older finance summary tables.

begin;

alter table public.households
  add column if not exists unit_number text,
  add column if not exists primary_contact_name text,
  add column if not exists primary_phone text,
  add column if not exists occupancy_status text not null default 'active'
    check (occupancy_status in ('active', 'vacant', 'moved', 'unknown')),
  add column if not exists notes_private text;

create table if not exists public.billing_periods (
  id uuid primary key default gen_random_uuid(),
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null check (period_year between 2020 and 2100),
  due_date date,
  amount_default integer not null check (amount_default >= 0),
  status text not null default 'draft' check (status in ('draft', 'issued', 'closed')),
  note text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_month, period_year)
);

create table if not exists public.household_charges (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  billing_period_id uuid not null references public.billing_periods(id) on delete cascade,
  amount integer not null check (amount >= 0),
  discount integer not null default 0 check (discount >= 0),
  penalty integer not null default 0 check (penalty >= 0),
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid', 'waived', 'void')),
  note text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, billing_period_id),
  check (amount + penalty >= discount)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete restrict,
  paid_at timestamptz not null default now(),
  amount integer not null check (amount > 0),
  method text not null check (method in ('transfer', 'cash', 'qris', 'other')),
  reference_no text,
  payer_name text,
  note text not null default '',
  proof_attachment_id uuid references public.attachments(id) on delete set null,
  received_by uuid references public.profiles(id) on delete set null,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected', 'void')),
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  void_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  household_charge_id uuid not null references public.household_charges(id) on delete restrict,
  amount_allocated integer not null check (amount_allocated > 0),
  created_at timestamptz not null default now(),
  unique (payment_id, household_charge_id)
);

create table if not exists public.charge_adjustments (
  id uuid primary key default gen_random_uuid(),
  household_charge_id uuid not null references public.household_charges(id) on delete cascade,
  adjustment_type text not null check (adjustment_type in ('discount', 'penalty', 'waive', 'correction')),
  amount integer not null default 0 check (amount >= 0),
  reason text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

insert into public.role_permissions (role, permission) values
  ('super_admin', 'billing:read'),
  ('super_admin', 'billing:write'),
  ('super_admin', 'billing:verify'),
  ('ketua_rt', 'billing:read'),
  ('ketua_rt', 'billing:verify'),
  ('bendahara', 'billing:read'),
  ('bendahara', 'billing:write'),
  ('bendahara', 'billing:verify'),
  ('sekretaris', 'billing:read')
on conflict do nothing;

create index if not exists households_occupancy_status_idx on public.households (occupancy_status);
create index if not exists billing_periods_status_idx on public.billing_periods (status, period_year desc, period_month desc);
create index if not exists household_charges_household_idx on public.household_charges (household_id);
create index if not exists household_charges_period_status_idx on public.household_charges (billing_period_id, status);
create index if not exists payments_household_paid_idx on public.payments (household_id, paid_at desc);
create index if not exists payments_verification_idx on public.payments (verification_status, paid_at desc);
create index if not exists payment_allocations_charge_idx on public.payment_allocations (household_charge_id);

drop trigger if exists billing_periods_set_updated_at on public.billing_periods;
create trigger billing_periods_set_updated_at before update on public.billing_periods
for each row execute function public.set_updated_at();

drop trigger if exists household_charges_set_updated_at on public.household_charges;
create trigger household_charges_set_updated_at before update on public.household_charges
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();

create or replace function public.prevent_verified_payment_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.verification_status = 'verified' then
      raise exception 'Pembayaran terverifikasi tidak boleh dihapus. Gunakan void dengan alasan.';
    end if;
    return old;
  end if;

  if old.verification_status = 'verified' and (
    new.household_id is distinct from old.household_id
    or new.paid_at is distinct from old.paid_at
    or new.amount is distinct from old.amount
    or new.method is distinct from old.method
    or new.reference_no is distinct from old.reference_no
    or new.proof_attachment_id is distinct from old.proof_attachment_id
  ) then
    raise exception 'Pembayaran terverifikasi tidak boleh diubah. Gunakan void atau adjustment.';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_prevent_verified_mutation on public.payments;
create trigger payments_prevent_verified_mutation
before update or delete on public.payments
for each row execute function public.prevent_verified_payment_mutation();

create or replace function public.refresh_household_charge_status(target_charge_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  charge_total integer;
  paid_total integer;
begin
  select greatest(amount + penalty - discount, 0)
  into charge_total
  from public.household_charges
  where id = target_charge_id;

  if charge_total is null then
    return;
  end if;

  select coalesce(sum(pa.amount_allocated), 0)
  into paid_total
  from public.payment_allocations pa
  join public.payments p on p.id = pa.payment_id
  where pa.household_charge_id = target_charge_id
    and p.verification_status = 'verified';

  update public.household_charges
  set status = case
      when status = 'waived' or status = 'void' then status
      when paid_total <= 0 then 'unpaid'
      when paid_total < charge_total then 'partial'
      else 'paid'
    end
  where id = target_charge_id;
end;
$$;

create or replace function public.refresh_charge_status_from_allocation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_charge_id uuid;
begin
  target_charge_id := coalesce(new.household_charge_id, old.household_charge_id);
  perform public.refresh_household_charge_status(target_charge_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists payment_allocations_refresh_charge on public.payment_allocations;
create trigger payment_allocations_refresh_charge
after insert or update or delete on public.payment_allocations
for each row execute function public.refresh_charge_status_from_allocation();

alter table public.billing_periods enable row level security;
alter table public.household_charges enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.charge_adjustments enable row level security;

drop policy if exists "billing_periods_admin_read" on public.billing_periods;
create policy "billing_periods_admin_read" on public.billing_periods for select
using (public.has_permission('billing:read') or public.has_permission('finance:read'));

drop policy if exists "billing_periods_admin_write" on public.billing_periods;
create policy "billing_periods_admin_write" on public.billing_periods for all
using (public.has_permission('billing:write'))
with check (public.has_permission('billing:write'));

drop policy if exists "household_charges_admin_read" on public.household_charges;
create policy "household_charges_admin_read" on public.household_charges for select
using (public.has_permission('billing:read') or public.has_permission('finance:read'));

drop policy if exists "household_charges_admin_write" on public.household_charges;
create policy "household_charges_admin_write" on public.household_charges for all
using (public.has_permission('billing:write'))
with check (public.has_permission('billing:write'));

drop policy if exists "payments_admin_read" on public.payments;
create policy "payments_admin_read" on public.payments for select
using (public.has_permission('billing:read') or public.has_permission('finance:read'));

drop policy if exists "payments_admin_write" on public.payments;
create policy "payments_admin_write" on public.payments for insert
with check (public.has_permission('billing:write'));

drop policy if exists "payments_admin_update" on public.payments;
create policy "payments_admin_update" on public.payments for update
using (public.has_permission('billing:write') or public.has_permission('billing:verify'))
with check (public.has_permission('billing:write') or public.has_permission('billing:verify'));

drop policy if exists "payment_allocations_admin_read" on public.payment_allocations;
create policy "payment_allocations_admin_read" on public.payment_allocations for select
using (public.has_permission('billing:read') or public.has_permission('finance:read'));

drop policy if exists "payment_allocations_admin_write" on public.payment_allocations;
create policy "payment_allocations_admin_write" on public.payment_allocations for all
using (public.has_permission('billing:write'))
with check (public.has_permission('billing:write'));

drop policy if exists "charge_adjustments_admin_read" on public.charge_adjustments;
create policy "charge_adjustments_admin_read" on public.charge_adjustments for select
using (public.has_permission('billing:read') or public.has_permission('finance:read'));

drop policy if exists "charge_adjustments_admin_write" on public.charge_adjustments;
create policy "charge_adjustments_admin_write" on public.charge_adjustments for insert
with check (public.has_permission('billing:write'));

create or replace view public.billing_dashboard_summary
with (security_invoker = true)
as
select
  bp.id as billing_period_id,
  bp.period_month,
  bp.period_year,
  bp.status as period_status,
  count(hc.id) as charge_count,
  coalesce(sum(greatest(hc.amount + hc.penalty - hc.discount, 0)), 0) as billed_total,
  coalesce(sum(case when hc.status = 'paid' then greatest(hc.amount + hc.penalty - hc.discount, 0) else 0 end), 0) as paid_charge_total,
  count(*) filter (where hc.status in ('unpaid', 'partial')) as outstanding_count
from public.billing_periods bp
left join public.household_charges hc on hc.billing_period_id = bp.id
group by bp.id, bp.period_month, bp.period_year, bp.status;

commit;
