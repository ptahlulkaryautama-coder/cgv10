# CGV10

CGV10 — Portal Digital Warga  
Cipta Greenville • RT 010 / RW 021

CGV10 is a Next.js App Router static public prototype.

Current product position:

Phase 1 — Public Resident Portal + PALUGADA CGV Priority Campaign

Phase 1 focuses on public resident information, pengurus structure, kas transparency structure, pengumuman structure, kontak penting, and PALUGADA CGV as a Marketplace Warga campaign. It is not the final full resident app.

## Public Routes

- `/`
- `/pengurus`
- `/keuangan`
- `/pengumuman`
- `/palugada`
- `/kontak`

## Local Development

```bash
npm.cmd run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm.cmd run lint
npm.cmd run build
```

## Production Preview

```bash
npm.cmd run build
npm.cmd run start
```

Default local preview URL: `http://localhost:3000`.

## Deployment Notes

- Framework: Next.js
- Package manager: npm
- Install command: `npm install`
- Build command: `npm run build`
- Local Windows build command: `npm.cmd run build`
- Output: standard Next.js production build in `.next/`
- Required environment variables: none for the current static prototype
- Suggested hosts: Vercel or Netlify with platform default Next.js handling

## Key Documents

- `PROJECT_BRIEF.md`
- `PHASE_1_SCOPE.md`
- `ROADMAP.md`
- `BRAND_SYSTEM.md`
- `LOGO_PROMPTS.md`
- `CONTENT_CHECKLIST.md`
- `DEPLOYMENT.md`

## Public Assets

Current public assets are referenced from:

- `public/cgv10-portal-preview.svg`
- `public/assets/brand/`
- `public/assets/placeholders/`

Keep proposal logo PNGs as temporary review assets. Final approved brand files can replace the current assets later while preserving the same paths where practical.

## Content Safety

Do not publish private or unconfirmed community data.

The current prototype must not include real phone numbers, real QR codes, confirmed financial values, active marketplace listings, login flows, private dashboards, active PALUGADA transactions, or non-public pengurus data unless explicitly approved for publication.
