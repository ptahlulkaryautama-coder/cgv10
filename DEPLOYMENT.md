# CGV10 Deployment

Approved public identity:

CGV10 - Portal Digital Warga
Cipta Greenville RT 010 / RW 021

This project uses Next.js App Router with static export. Public pages are prerendered, while admin and intake forms use Supabase client-side access protected by Supabase Auth, RLS, and database policies.

## Local Development

```bash
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

## Production Build

```bash
npm.cmd run build
```

## Production Preview

```bash
npm.cmd run start
```

Default production preview URL:

```text
http://localhost:3000
```

## Suggested Deploy Target

Use Netlify or Vercel for the deployment preview.

Recommended settings:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output / publish directory: use the platform default for Next.js unless the hosting provider requires specific configuration.
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_ANALYTICS_ENDPOINT` optional, only if the consent-based analytics receiver is already prepared.

## Approved Domain

Primary public domain:

```text
https://portalwargacgv.id/
```

Keep HTTPS enabled and point DNS to the selected hosting provider before sharing the production address.

## Public Routes

The production site should expose these public routes:

- `/`
- `/kabar-warga`
- `/kegiatan`
- `/pengurus`
- `/keuangan`
- `/pengumuman`
- `/palugada`
- `/palugada/daftar`
- `/layanan`
- `/kontak`
- `/masuk`
- `/portal`
- `/portal/profil-rumah`
- `/privasi`

## Supabase Migration Order

Before deploying intake/photo features, apply the SQL migrations in order through Supabase SQL Editor or the approved Supabase deployment flow:

```text
supabase/migrations/202607150004_palugada_static_catalog_import.sql
supabase/migrations/202607160001_service_request_private_attachments.sql
supabase/migrations/202607160002_palugada_submission_hardening.sql
supabase/migrations/202607160003_resident_billing_foundation.sql
supabase/migrations/202607160004_public_dues_confirmation.sql
```

The first migration makes the original PALUGADA catalog visible from Supabase. The next two migrations harden public submission RPCs and private photo uploads for layanan and PALUGADA. The last two migrations add the resident billing foundation and public dues confirmation flow for `/keuangan` and `/admin/iuran`.

## Asset And Metadata Notes

- Favicon is configured through Next.js metadata at `/assets/brand/favicon.svg`.
- PWA assets live under `public/assets/pwa/`.
- Brand assets live under `public/assets/brand/`.
- Static export now includes `/robots.txt` and `/sitemap.xml`.

## Production Data Notice

Do not publish private or unconfirmed community data. Do not add real names, financial values, phone numbers, QR images, or PALUGADA item data unless they are approved for public release.

## Pre-Deploy Checklist

Run these checks before sharing a production URL:

```bash
npm.cmd run lint
npm.cmd run build
```

Then verify the public routes in the browser and confirm there are no broken images or unexpected private data.
