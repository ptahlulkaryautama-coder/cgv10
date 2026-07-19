# CGV10 Supabase Migration Safety

This project uses ordered SQL migrations. Apply them by filename order unless a
project owner explicitly marks a migration as already applied in Supabase.

## Current Dependency Chain

Core foundation:

```text
202607080001_initial_auth_permissions.sql
```

Portal content:

```text
202607130001_portal_posts_slug_hardening.sql
202607140001_portal_posts_media_fields.sql
202607140002_portal_post_storage_buckets.sql
202607140003_portal_post_storage_mime_hardening.sql
```

Public intake and PALUGADA:

```text
202607140004_public_intake_insert_policies.sql
202607150001_palugada_reviewer_permissions.sql
202607150002_palugada_private_attachments.sql
202607150003_palugada_listing_lifecycle.sql
202607150004_palugada_static_catalog_import.sql
202607160001_service_request_private_attachments.sql
202607160002_palugada_submission_hardening.sql
202607170001_palugada_authenticated_submission.sql
202607170002_service_request_authenticated_submission.sql
```

Iuran and resident billing:

```text
202607160003_resident_billing_foundation.sql
202607160004_public_dues_confirmation.sql
202607170003_dues_confirmation_authenticated_submission.sql
202607170004_dues_approval_finance_posting.sql
202607180001_multi_period_dues_personal_recap.sql
```

Admin access:

```text
202607170005_pengurus_admin_invites.sql
```

## Iuran Dependencies

`202607180001_multi_period_dues_personal_recap.sql` requires these objects:

- `public.households`
- `public.household_members`
- `public.payments`
- `public.payment_upload_sessions`
- `public.billing_periods`
- `public.household_charges`
- `public.payment_allocations`
- `public.finance_transactions`
- `public.audit_logs`
- `public.has_permission(text)`
- `public.refresh_household_charge_status(uuid)`
- `payments.due_period_month`
- `payments.due_period_year`
- `finance_transactions.source_type`
- `finance_transactions.source_id`

The migration contains a preflight guard and will stop before writing if these
dependencies are missing.

## Preflight Query

Run this before applying a new iuran migration:

```sql
select
  'public.households' as object_name,
  to_regclass('public.households') is not null as ok
union all select 'public.household_members', to_regclass('public.household_members') is not null
union all select 'public.payments', to_regclass('public.payments') is not null
union all select 'public.payment_upload_sessions', to_regclass('public.payment_upload_sessions') is not null
union all select 'public.billing_periods', to_regclass('public.billing_periods') is not null
union all select 'public.household_charges', to_regclass('public.household_charges') is not null
union all select 'public.payment_allocations', to_regclass('public.payment_allocations') is not null
union all select 'public.finance_transactions', to_regclass('public.finance_transactions') is not null
union all select 'public.audit_logs', to_regclass('public.audit_logs') is not null
union all select 'public.has_permission(text)', to_regprocedure('public.has_permission(text)') is not null
union all select 'public.refresh_household_charge_status(uuid)', to_regprocedure('public.refresh_household_charge_status(uuid)') is not null;
```

Every row should return `ok = true`.

Check key columns:

```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'payments' and column_name in ('due_period_month', 'due_period_year', 'period_count'))
    or (table_name = 'finance_transactions' and column_name in ('source_type', 'source_id'))
  )
order by table_name, column_name;
```

Before `202607180001` is applied, `period_count` may be absent. After apply, it
must be present.

## Post-Apply Verification

After applying `202607180001_multi_period_dues_personal_recap.sql`, run:

```sql
select column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'payments'
  and column_name in ('due_period_month', 'due_period_year', 'period_count')
order by column_name;
```

```sql
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('submit_dues_confirmation', 'approve_dues_payment', 'reject_dues_payment', 'get_my_dues_recap')
order by proname, args;
```

```sql
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('payments', 'payment_allocations', 'household_charges')
order by tablename, policyname;
```

## Rules For Future Migrations

- Use timestamped filenames and never edit an applied production migration.
- Prefer additive changes: `add column if not exists`, `create index if not exists`,
  `create table if not exists`, `create or replace function`.
- Wrap risky changes in `begin; ... commit;`.
- Add a preflight `do $$ ... $$;` block when a migration depends on objects from
  previous migrations.
- Name constraints explicitly when they may be referenced later.
- Avoid dropping tables, columns, policies, or functions unless a replacement is
  created in the same transaction and the frontend has been updated.
- For RPC signature changes, keep frontend and database rollout together. If the
  old frontend may still call the old signature, keep a compatibility wrapper.
- Keep private resident data protected by RLS and RPCs. Do not expose household
  member names, phones, documents, or payment proof URLs through public views.
