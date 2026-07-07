# CGV10 Admin Access Plan

This plan separates the immediate soft-launch need from the production admin system.

## Current Status

The current project is a static Next.js export.

- Public website and PWA are static frontend pages.
- `/admin-preview/` is a static admin preview only.
- There is no production login yet.
- There is no protected database yet.
- There is no secure role-based admin access yet.

Do not place private resident data, real payment records, private phone numbers, or sensitive documents in `/admin-preview/`.

## Soft Launch Access

For the immediate soft launch, protect access at the hosting level.

Recommended temporary setup:

- Use hosting password protection for the preview site or `/admin-preview/`.
- Share access only with the small admin group.
- Keep `/admin-preview/` marked as demo/preview.
- Keep private data out of the static export.
- Continue using noindex/noarchive headers for admin preview pages.

Avoid:

- A frontend-only password screen as the only security layer.
- Storing admin passwords in client-side code.
- Publishing real resident records in static files.

## Initial Admin Users

| User | Role | Purpose |
| --- | --- | --- |
| Project owner | `super_admin` | Full control, user management, technical settings, emergency access. |
| Ketua RT | `ketua_rt` | Final operational review, approval, publication control, full visibility. |
| Sekretaris | `sekretaris` | Resident data, documents, announcements, activities, service coordination. |
| Bendahara | `bendahara` | Finance ledger, iuran confirmation, payment notes, financial reports. |

## Role Permissions

### `super_admin`

- Manage admin users and roles.
- View and edit all modules.
- Configure system settings.
- Handle deployment and technical operations.
- Access audit logs.

### `ketua_rt`

- View all operational modules.
- Review and approve public-facing updates.
- Review resident service status.
- Review PALUGADA moderation.
- View finance summaries.
- Publish official announcements.

### `sekretaris`

- Manage resident records.
- Manage documents.
- Draft and update announcements.
- Draft and update kegiatan records.
- Manage layanan intake and follow-up notes.
- View PALUGADA review status.

### `bendahara`

- Manage finance ledger.
- Review iuran confirmations.
- Update payment status.
- Prepare finance summaries.
- View resident/payment-related records needed for finance work.

## Production Architecture Recommendation

Use Supabase for production admin access.

Recommended stack:

- Supabase Auth for login.
- Supabase Postgres for data.
- Supabase Row Level Security for permissions.
- Supabase Storage for future file/image uploads.
- Static Next.js frontend for public pages and PWA.
- Protected admin UI that reads/writes only through Supabase policies.

Reason:

This project currently uses static export, so route protection cannot rely on Next.js server middleware. Real protection must happen at the data layer. Supabase Row Level Security can protect data even if someone opens the admin frontend.

## Proposed Production Routes

| Route | Purpose |
| --- | --- |
| `/admin/` | Production protected admin dashboard. |
| `/admin/login/` | Admin login entry. |
| `/admin-preview/` | Static demo only, no production data. |
| `/portal/` | Resident PWA shell. |

## Recommended Implementation Phases

### Phase 1 - Soft Launch Protection

- Deploy site to the approved hosting provider.
- Connect the domain.
- Enable hosting-level password protection for preview/admin access.
- Keep `/admin-preview/` noindex and no-store.
- Confirm the four initial admin participants.

### Phase 2 - Auth Foundation

- Create Supabase project.
- Create admin user profiles.
- Add roles: `super_admin`, `ketua_rt`, `sekretaris`, `bendahara`.
- Create login flow.
- Add role-aware admin navigation.
- Keep production data protected by Supabase policies.

### Phase 3 - Module Data Migration

- Move static admin preview data into database tables.
- Start with:
  - users/admin profiles
  - announcements
  - layanan requests
  - PALUGADA review items
  - finance records
- Keep public pages static where possible.

### Phase 4 - File/Image Workflows

- Add controlled upload for:
  - layanan evidence
  - PALUGADA product photos
  - documents
  - kegiatan documentation
- Store files in Supabase Storage.
- Apply role-based access rules.

### Phase 5 - Audit and Operations

- Add audit log for admin actions.
- Add publication status: draft, review, published, archived.
- Add export/reporting where needed.
- Prepare backup and recovery rules.

## Domain Plan

Target domain:

`portalwargacgv.id`

Owning this domain gives control over the public address and DNS routing. It does not by itself create admin security.

To establish full operational control, the project also needs:

- Domain DNS access.
- Hosting account access.
- SSL/HTTPS enabled.
- Admin authentication.
- Database access rules.
- Backup and recovery plan.
- Role ownership for the four initial admins.

## Soft Launch Rule

Until production auth is implemented:

`/admin-preview/` must be treated as a presentation/demo dashboard, not a secure operational dashboard.

