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

## Step 4 - Initial Admin Roles

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
