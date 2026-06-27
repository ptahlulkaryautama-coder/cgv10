# Production QA

Live preview: https://thriving-bunny-9f4e92.netlify.app/

## Routes Checked

- `/`
- `/pengurus/`
- `/keuangan/`
- `/pengumuman/`
- `/palugada/`
- `/kontak/`

All routes returned HTTP 200 on the live Netlify preview during QA.

## Issues Found

- Header navigation showed `Kontak` twice on desktop: once in the main navigation and once as the primary contact CTA.
- Internal route links used extensionless paths while the project is configured for static export with trailing slashes.

## Fixes Applied

- Kept `Kontak` as the single header CTA and removed it from the repeated main navigation list.
- Updated internal navigation paths to use static-export-friendly trailing slash routes.
- Updated active navigation matching so it works with either trailing-slash or non-trailing-slash pathnames.

## Remaining Known Limitations

- Phase 1 remains a static public prototype.
- No login, database, payment, cart, checkout, admin dashboard, real complaint system, QR, WA integration, or active PALUGADA transaction flow is included.
- Placeholder data remains until pengurus-approved names, finance values, announcements, contacts, QR assets, and PALUGADA items are provided.

## Phase 1 Confirmation

CGV10 Phase 1 remains a public resident portal with PALUGADA CGV positioned as a priority campaign and catalogue preview. The Netlify deployment should publish the static export from `out`.
