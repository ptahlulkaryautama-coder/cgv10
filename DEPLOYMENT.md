# CGV10 Deployment Preview

Approved public identity:

CGV10 — Portal Digital Warga  
Cipta Greenville • RT 010 / RW 021

This project is a static public prototype built with Next.js App Router. It is ready for online preview deployment on a standard Next.js hosting platform.

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
- Environment variables: none required at this stage.

## Public Routes

The preview should expose these static public routes:

- `/`
- `/pengurus`
- `/keuangan`
- `/pengumuman`
- `/palugada`
- `/kontak`

## Asset And Metadata Notes

- Favicon is configured through Next.js metadata at `/assets/brand/favicon.svg`.
- Brand assets live under `public/assets/brand/`.
- Placeholder QR/profile assets live under `public/assets/placeholders/`.
- The portal preview illustration is `public/cgv10-portal-preview.svg`.

## Public Prototype Notice

This project is a static public prototype. It does not include login, database, payment, admin dashboard, real complaint system, real QR, real WA integration, or active PALUGADA transactions.

Do not publish private or unconfirmed community data. Do not add real names, financial values, phone numbers, QR images, or PALUGADA item data unless they are approved for public release.

## Pre-Deploy Checklist

Run these checks before sharing a preview URL:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run start
```

Then verify the six public routes in the browser and confirm there are no broken images or unexpected private data.
