# CGV10 PWA Architecture Plan

This plan defines the shared foundation for two installable app experiences:

- CGV10 Portal PWA for civic resident services.
- PALUGADA CGV PWA for the resident marketplace.

Both apps should connect to the same Admin Pengurus Dashboard and shared backend, but their public user experiences should stay focused so the portal does not become heavy or slow.

## Product Boundary

### CGV10 Portal PWA

Purpose:

- Resident identity and household profile.
- Announcements, kegiatan, pengurus, keuangan, contacts, and layanan.
- File/image capture for resident reports, iuran confirmation, documents, and kegiatan records.

Primary users:

- Warga.
- Pengurus.
- Bendahara.
- Sekretaris.
- Security/PIC layanan.

### PALUGADA CGV PWA

Purpose:

- Standalone marketplace-style experience for warga offerings.
- Catalogue, listing detail, seller submission, seller verification, and listing moderation.
- Installable app flow that feels separate from the portal while remaining under the CGV10 ecosystem.

Primary users:

- Warga buyers/browsers.
- Resident sellers/UMKM.
- PALUGADA reviewers.
- Pengurus/admin.

### Admin Pengurus Dashboard

Purpose:

- One operational back office for both apps.
- Review data changes, uploaded files, layanan reports, PALUGADA listings, and publication status.
- Maintain privacy boundaries between public, resident-only, and admin-only data.

## Recommended Architecture

Use one shared backend and two lightweight frontends:

- `CGV10 Portal PWA`: civic app shell, resident services, profile, public portal pages.
- `PALUGADA PWA`: marketplace app shell, catalogue, listing detail, seller submission.
- `Admin Dashboard`: protected operational interface.
- `Shared Backend`: auth, database, file storage, permissions, audit log, notifications.

The current static data files can remain for Phase 1 preview, but production PWA features should move to database-backed records.

## Route Direction

Initial route strategy inside the existing Next.js app:

- `/` public CGV10 portal.
- `/portal/` authenticated resident dashboard.
- `/portal/profil-rumah/` resident household profile.
- `/portal/layanan/` resident service intake.
- `/palugada/` public PALUGADA landing/catalogue.
- `/palugada/app/` installable PALUGADA PWA shell if the standalone experience needs a distinct entry.
- `/palugada/daftar/` seller/listing submission.
- `/admin/` protected production admin.
- `/admin-preview/` current static demo only, no production use.

Future domain strategy:

- `cgv10.id` or the approved portal domain for CGV10.
- `palugada.cgv10.id` for standalone PALUGADA when DNS/deployment is ready.

## Shared Data Model

### users

- `id`
- `display_name`
- `phone`
- `email`
- `role`: `warga`, `pengurus`, `bendahara`, `security`, `palugada_reviewer`, `super_admin`
- `status`: `invited`, `active`, `suspended`
- `created_at`
- `updated_at`

### households

- `id`
- `head_user_id`
- `cluster`
- `block_or_unit`
- `family_count`
- `vehicle_count`
- `visibility`: `private`, `admin_only`
- `verification_status`: `draft`, `review`, `verified`, `rejected`
- `created_at`
- `updated_at`

### household_members

- `id`
- `household_id`
- `name`
- `relationship`
- `is_public`: default `false`
- `verification_status`

### service_requests

- `id`
- `household_id`
- `submitted_by`
- `category`: `administrasi`, `pengaduan`, `keamanan`, `iuran`, `aspirasi`, `lainnya`
- `title`
- `description`
- `status`: `draft`, `submitted`, `triage`, `in_progress`, `resolved`, `rejected`
- `priority`: `normal`, `high`, `urgent`
- `assigned_to`
- `created_at`
- `updated_at`

### finance_confirmations

- `id`
- `household_id`
- `submitted_by`
- `period`
- `amount`
- `payment_date`
- `status`: `submitted`, `matched`, `needs_review`, `rejected`
- `reviewed_by`
- `reviewed_at`

### palugada_listings

- `id`
- `seller_user_id`
- `seller_household_id`
- `name`
- `category`: `barang`, `kuliner`, `jasa`, `properti`, `lainnya`
- `cluster`
- `price_label`
- `description`
- `availability_note`
- `contact_method`
- `status`: `draft`, `submitted`, `review`, `approved`, `hidden`, `rejected`
- `published_at`
- `created_at`
- `updated_at`

### attachments

- `id`
- `owner_user_id`
- `linked_type`: `service_request`, `finance_confirmation`, `palugada_listing`, `household_profile`, `kegiatan`
- `linked_id`
- `file_name`
- `file_type`
- `file_size`
- `storage_path`
- `thumbnail_path`
- `visibility`: `private`, `admin_only`, `public_after_approval`
- `moderation_status`: `pending`, `approved`, `rejected`
- `created_at`

### audit_logs

- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `before_snapshot`
- `after_snapshot`
- `created_at`

## File And Image Capture

Supported capture use cases:

- Layanan Warga: attach issue photos, document photos, supporting files.
- Iuran: attach proof of payment.
- PALUGADA: upload listing photos.
- Kegiatan: upload event documentation for review.
- Profil Rumah: attach optional verification document, admin-only.

Implementation rules:

- Accept camera capture and gallery selection on mobile.
- Validate file type and size before upload.
- Compress large images client-side when possible.
- Generate thumbnails for list/card views.
- Store original files privately by default.
- Make files public only after approval.
- Never expose private household documents or payment proof publicly.

Suggested limits:

- Image upload max: 5 MB per image before compression.
- Document upload max: 10 MB per file.
- PALUGADA listing photos: 1 required cover image, up to 6 gallery images.
- Service request attachments: up to 5 files.
- Finance confirmation attachments: 1-3 files.

## Approval Workflow

Public visibility should always pass through a status gate.

### Resident Profile Updates

1. Warga edits household profile.
2. Change becomes `review`.
3. Admin verifies.
4. Approved changes become `verified`.
5. Rejected changes keep prior verified data.

### Layanan Requests

1. Warga submits report/request.
2. Admin/PIC triages.
3. PIC updates status.
4. Warga sees status updates.
5. Attachments remain private unless explicitly published.

### PALUGADA Listings

1. Seller submits listing.
2. PALUGADA reviewer checks completeness, photos, category, and contact.
3. Approved listing appears publicly.
4. Hidden/rejected listing does not appear in PALUGADA app.
5. Edits to approved listings return to review if sensitive fields change.

### Public Portal Content

1. Admin drafts or updates content.
2. Reviewer approves publication.
3. Public portal reads only approved content.
4. Sensitive content remains admin-only.

## PWA UX Rules

### CGV10 Portal PWA

- Home screen should prioritize resident tasks, not every module.
- Use bottom navigation on mobile for: Home, Layanan, Kabar, Profil.
- Keep PALUGADA as a clear cross-link, not a full marketplace loaded inside the portal shell.
- Use short labels and familiar icons.
- Show upload/capture only in the workflow that needs it.

### PALUGADA PWA

- Home screen should prioritize search, categories, featured listings, and submit listing.
- Use bottom navigation on mobile for: Home, Cari, Kategori, Jual, Akun.
- Keep catalogue browsing fast and image-led.
- Listing cards should use thumbnails only, not original uploads.
- Listing detail loads gallery after the primary content.

### Admin Dashboard

- Keep admin as dense operational UI.
- Use filters, status tabs, tables, and review panels.
- Do not load admin code into public app shells.
- Default to queue-based work: pending profile updates, layanan intake, iuran review, PALUGADA review, public publish queue.

## Performance Rules

Heavy data and media will slow the app if loaded directly. These rules are required before production rollout:

- Lazy-load below-the-fold images.
- Use generated thumbnails for cards and lists.
- Paginate or cursor-load lists.
- Avoid loading full PALUGADA catalogue on CGV10 portal homepage.
- Keep public app shell JavaScript small.
- Do not bundle admin-only components into public routes.
- Cache app shell and critical static assets only.
- Do not precache every uploaded image.
- Use server-side search/filter when listing counts grow.
- Use skeleton states for slow network paths.
- Keep first screen focused on 1-2 primary actions.
- Add basic performance budgets before launch.

Initial budgets:

- Mobile first screen should stay visually usable within 2 seconds on normal 4G.
- Listing card thumbnails should be under 120 KB each when possible.
- Avoid pages rendering more than 20 listing cards at once.
- Avoid client-side filtering over hundreds of records in public pages.

## Security And Privacy Rules

- Auth is required for resident profile, upload, and admin workflows.
- Admin routes must be protected, not just noindexed.
- Uploaded documents default to private.
- Public listing photos require moderation.
- Payment proof is never public.
- Household and phone data are resident/admin only unless explicitly approved.
- Every approval, rejection, and sensitive edit must create an audit log.
- Use role checks server-side, not only in UI.

## Implementation Sequence

### Step 1: Foundation Plan And Schema

Deliverables:

- Finalize entities, statuses, roles, and approval rules.
- Choose backend/storage provider.
- Decide deployment/domain strategy.

Estimated time: 1-2 days.

### Step 2: Portal PWA Shell

Deliverables:

- Web app manifest.
- App icons.
- Theme color.
- Installable shell.
- Mobile navigation pattern.
- Lightweight caching strategy.

Estimated time: 1-2 days.

### Step 3: Upload/Capture Prototype

Deliverables:

- Camera/gallery/file fields for Layanan.
- Camera/gallery fields for PALUGADA daftar.
- Local previews.
- File validation.
- No production persistence unless backend is ready.

Estimated time: 2-4 days.

### Step 4: Production Backend And Storage

Deliverables:

- Auth.
- Database schema.
- File storage.
- Server-side permissions.
- Admin approval queues.
- Audit logs.

Estimated time: 1-3 weeks depending on provider and auth requirements.

### Step 5: PALUGADA Standalone PWA

Deliverables:

- Standalone PALUGADA app shell.
- Catalogue, search/filter, category pages, listing detail.
- Seller submission.
- Admin review integration.
- PWA install support.

Estimated time: 2-4 weeks after backend foundation.

### Step 6: Optimization And Launch QA

Deliverables:

- Mobile performance pass.
- Image compression and thumbnail verification.
- Route protection verification.
- Accessibility check.
- Installability check on Android and iOS.
- Admin workflow QA.

Estimated time: 3-5 days.

## Provider Decision Needed

Before production code starts, choose one backend/storage path:

- Supabase: strong fit for Postgres, auth, storage, row-level security, and admin workflows.
- Firebase: strong fit for mobile-like apps and realtime updates.
- Custom backend: more control, more time.

Recommended default for CGV10:

- Supabase for auth, Postgres, storage, row-level security, and audit-friendly data.

## Current Project Impact

Short term:

- Keep Phase 1 public portal static and stable.
- Add PWA planning and later app-shell code without breaking static export.
- Keep `/admin-preview/` as demo until real auth/backend exists.

Medium term:

- Introduce `/portal/` for authenticated resident workflows.
- Introduce production `/admin/` after auth exists.
- Make PALUGADA feel standalone while still sharing backend/admin operations.

Long term:

- If app store distribution becomes mandatory, wrap the PWA or evaluate a native shell after the web PWA proves the workflow.
