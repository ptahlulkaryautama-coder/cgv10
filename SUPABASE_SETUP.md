# CGV10 Supabase Setup

This is the production database/auth foundation for `portalwargacgv.id`.

Use Supabase for selected admin users, Super Admin role management, resident/household data, service requests, finance records, PALUGADA review data, private attachments later, and audit logs.

## Immediate Architecture

Keep the current routes:

```text
https://portalwargacgv.id/                 Public portal
https://portalwargacgv.id/admin-preview/   Trial dashboard only
```

Production admin should be introduced as:

```text
https://portalwargacgv.id/admin/
```

or later:

```text
https://admin.portalwargacgv.id/
```

## Step 1 - Create Supabase Project

1. Create a Supabase project.
2. Save the Project URL, anon public key, and service role key.
3. Do not put the service role key in frontend code.

Future frontend env:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only env, never public:

```text
SUPABASE_SERVICE_ROLE_KEY=
```

## Step 2 - Apply Database Schema

Open Supabase SQL Editor and run:

```text
supabase/migrations/202607080001_initial_auth_permissions.sql
```

This creates profiles, user roles, permissions, admin invites, households, household members, service requests, finance, PALUGADA, portal posts, attachments metadata, audit logs, and RLS policies.

## Step 3 - Create First Super Admin

1. In Supabase Auth, create the project owner user.
2. Confirm the user can log in.
3. Copy the user UUID from `auth.users`.
4. Run this SQL once, replacing the placeholders:

```sql
insert into public.profiles (id, display_name, email, status)
values (
  'PASTE_AUTH_USER_UUID_HERE',
  'Project Owner',
  'owner@example.com',
  'active'
)
on conflict (id) do update
set display_name = excluded.display_name,
    email = excluded.email,
    status = 'active';

insert into public.user_roles (user_id, role)
values ('PASTE_AUTH_USER_UUID_HERE', 'super_admin')
on conflict do nothing;
```

After this, Super Admin can manage user permissions through the app once the UI is wired.

## Phase C1.5 - Apply portal_posts Slug Hardening Locally First

Do not push or deploy before this is validated locally.

1. Open the Supabase project SQL Editor.
2. Open this repository file:

```text
supabase/migrations/202607130001_portal_posts_slug_hardening.sql
```

3. Copy the full SQL file into the SQL Editor and run it once.
4. Verify the schema hardening with:

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'portal_posts'
  and column_name in ('slug', 'title', 'status', 'published_at', 'updated_at')
order by ordinal_position;
```

5. Verify existing rows received safe unique slugs:

```sql
select id, title, slug, status, updated_at
from public.portal_posts
order by updated_at desc;
```

6. Verify duplicate slugs are not present:

```sql
select slug, count(*)
from public.portal_posts
group by slug
having count(*) > 1;
```

This query should return zero rows.

7. Verify the original RLS policies are still present:

```sql
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'portal_posts'
order by policyname;
```

Expected policies remain:

- `portal_posts_public_published`
- `portal_posts_write_content_admin`

8. Run the local app and validate `/admin/portal-posts/` displays the real `slug` column for the authenticated admin. Public Kabar Warga remains static in this phase.

## Phase C1.6 - Apply portal_posts Media Fields

Run this after Phase C1.5:

```text
supabase/migrations/202607140001_portal_posts_media_fields.sql
```

Verify the media columns:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'portal_posts'
  and column_name in (
    'cover_image_url',
    'cover_image_alt',
    'attachment_url',
    'attachment_label'
  )
order by ordinal_position;
```

## Phase C1.7 - Apply Portal Post Storage Buckets

Run this after Phase C1.6:

```text
supabase/migrations/202607140002_portal_post_storage_buckets.sql
```

This creates public buckets for published portal content:

- `portal-post-media`
- `portal-post-attachments`

Admin upload is restricted by `content:write`. Because the buckets are public, do not upload private resident documents here.

Verify buckets:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('portal-post-media', 'portal-post-attachments')
order by id;
```

Verify storage policies:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'portal_post_storage_%'
order by policyname;
```

## Phase C1.8 - Storage MIME Hardening

Run this if image or attachment upload is blocked by file type, especially files from phones or Windows:

```text
supabase/migrations/202607140003_portal_post_storage_mime_hardening.sql
```

Verify MIME settings:

```sql
select id, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('portal-post-media', 'portal-post-attachments')
order by id;
```

## Phase C2.1 - Public Intake Insert Policies

Run this before testing public forms and PALUGADA daftar lapak:

```text
supabase/migrations/202607140004_public_intake_insert_policies.sql
```

This allows anonymous/public visitors to insert new rows only:

- `service_requests` with `status = submitted`
- `palugada_listings` with `status = submitted`

It does not allow public read of submitted rows or public status updates.

Verify policies:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and policyname in (
    'service_requests_public_insert_intake',
    'palugada_listings_public_insert_intake'
  )
order by policyname;
```

## Step 4 - Initial Admin Roles

## Phase C2.2 - PALUGADA Reviewer Permissions

Run this before assigning the dedicated `palugada_reviewer` role:

```text
supabase/migrations/202607150001_palugada_reviewer_permissions.sql
```

Verify the permissions:

```sql
select role, permission
from public.role_permissions
where role = 'palugada_reviewer'
order by permission;
```

Expected permissions are `palugada:read` and `palugada:write`. Super Admin and Ketua RT already receive these permissions from the initial migration.

## Phase C2.3 - Private PALUGADA Attachments

Run this after Phase C2.2:

```text
supabase/migrations/202607150002_palugada_private_attachments.sql
```

This creates:

- the private `palugada-submissions` Storage bucket;
- short-lived upload sessions tied to one PALUGADA listing;
- the safe public submission RPC;
- anonymous insert-only upload policies;
- authenticated admin read access through `palugada:read`;
- attachment metadata registration in `public.attachments`.

Verify the private bucket:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'palugada-submissions';
```

Verify policies:

```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where policyname in (
  'palugada_submission_storage_insert',
  'palugada_submission_storage_admin_read',
  'palugada_attachments_public_insert'
)
order by schemaname, tablename, policyname;
```

The bucket must remain private. Admin previews use signed URLs that expire after ten minutes.

## Phase C2.4 - PALUGADA Listing Lifecycle

Run this after Phase C2.3:

```text
supabase/migrations/202607150003_palugada_listing_lifecycle.sql
```

This migration:

- backfills images belonging to listings that were already approved during trial;
- lets the public catalog read only approved images from approved listings;
- immediately removes public image access when a listing is hidden or rejected;
- allows PALUGADA admins to delete listing files, attachment metadata, and the listing record.

The `palugada-submissions` bucket remains private. Public catalog and detail pages use expiring signed URLs, protected by listing and attachment approval policies.

Verify the lifecycle policies:

```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where policyname in (
  'palugada_attachments_public_approved_read',
  'palugada_submission_storage_public_approved_read',
  'palugada_attachments_admin_delete',
  'palugada_submission_storage_admin_delete',
  'palugada_listings_admin_delete'
)
order by schemaname, tablename, policyname;
```

## Phase C2.5 - Import Static PALUGADA Catalog

Run this after Phase C2.4 and before deploying the Supabase-only public catalog:

```text
supabase/migrations/202607150004_palugada_static_catalog_import.sql
```

This adds managed cover-image fields and imports the six original static PALUGADA listings as approved Supabase rows. The import uses stable `catalog_key` values and does not reset a listing status when the migration is rerun.

Verify the imported catalog:

```sql
select catalog_key, name, status, cover_image_url, published_at
from public.palugada_listings
where catalog_key is not null
order by catalog_key;
```

Expected result: six rows. After this phase, public catalog visibility is controlled by `palugada_listings.status`; hidden, rejected, or deleted rows no longer appear in the PALUGADA listing grid.

## Phase C2.6 - Layanan Photos And Public Intake Hardening

Run this after Phase C2.5:

```text
supabase/migrations/202607160001_service_request_private_attachments.sql
supabase/migrations/202607160002_palugada_submission_hardening.sql
```

This phase:

- creates the private `service-request-attachments` bucket;
- forces public layanan/contact submissions through the validated `submit_service_request` RPC;
- lets warga upload layanan photos only to a short-lived request path;
- keeps layanan photos admin-only and visible from `/admin/intake`;
- tightens PALUGADA public submission field lengths;
- removes direct anonymous inserts for layanan and PALUGADA listing tables.

Verify the new RPC and bucket:

```sql
select proname
from pg_proc
where proname in ('submit_service_request', 'submit_palugada_listing')
order by proname;

select id, public, file_size_limit
from storage.buckets
where id in ('service-request-attachments', 'palugada-submissions');
```

## Phase C2.7 - Resident Billing Foundation

Run this after Phase C2.6:

```text
supabase/migrations/202607160003_resident_billing_foundation.sql
```

This phase adds the internal data structure for monthly dues:

- enriches `households` with contact, unit, occupancy, and private notes fields;
- adds `billing_periods`, `household_charges`, `payments`, `payment_allocations`, and `charge_adjustments`;
- adds `billing:read`, `billing:write`, and `billing:verify` permissions;
- blocks direct edits/deletes of verified payments;
- refreshes charge status from verified payment allocations;
- exposes `billing_dashboard_summary` for `/admin/iuran`.

Verify the billing tables:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'billing_periods',
    'household_charges',
    'payments',
    'payment_allocations',
    'charge_adjustments'
  )
order by table_name;

select role, permission
from public.role_permissions
where permission like 'billing:%'
order by role, permission;
```

## Phase C2.8 - Public Dues Confirmation

Run this after Phase C2.7:

```text
supabase/migrations/202607160004_public_dues_confirmation.sql
```

This phase:

- adds `submit_dues_confirmation` for public iuran confirmation;
- allows pending `payments` without a matched household while bendahara verifies;
- creates private `payment-proofs` storage;
- allows public proof upload only through a short-lived payment upload path;
- stores proof metadata as admin-only finance attachments.

Verify the RPC and bucket:

```sql
select proname
from pg_proc
where proname in ('submit_dues_confirmation', 'is_valid_payment_upload_path')
order by proname;

select id, public, file_size_limit
from storage.buckets
where id = 'payment-proofs';
```

| Role | Permission intent |
| --- | --- |
| `super_admin` | Full control, add/remove admin roles, settings, audit logs |
| `ketua_rt` | Operational review, approval, services, PALUGADA, finance read |
| `sekretaris` | Resident data, services, documents, content drafts |
| `bendahara` | Finance transactions, iuran confirmation, finance read/write |

Super Admin can assign roles by inserting into `public.user_roles`.

Example:

```sql
insert into public.user_roles (user_id, role, assigned_by)
values (
  'TARGET_USER_UUID',
  'bendahara',
  'SUPER_ADMIN_UUID'
)
on conflict do nothing;
```

## Step 5 - Resident Database Rule

Do not import all resident data publicly.

Resident data must remain authenticated only, protected by RLS, visible to admins only by permission, never exposed through static files, and never committed into `lib/*.ts`.

Start with minimum fields:

- household cluster
- block/unit
- head user
- family count
- vehicle count
- verification status

## Step 6 - Super Admin User Management UI

Next implementation should add a production route:

```text
/admin/users/
```

Minimum actions:

- search users
- invite user by email
- assign role
- remove role
- suspend user
- view audit trail

Super Admin only:

- `users:manage`
- `settings:manage`
- `audit:read`

## Security Notes

The current `/admin-preview/` code gate is only for trial. Real security must use Supabase Auth, Row Level Security, server-side role checks where needed, no service role key in browser, and audit log for sensitive actions.

Do not enter private resident data into `/admin-preview/`.
