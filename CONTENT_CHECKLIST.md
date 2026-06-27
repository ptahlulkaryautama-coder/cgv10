# CGV10 Content Checklist

Use this checklist before replacing placeholder content with public data.
Do not publish private data unless it has been provided by pengurus and explicitly approved for public display.

Approved public identity:

CGV10 — Portal Digital Warga  
Cipta Greenville • RT 010 / RW 021

## Required Before Public Launch

- [ ] Logo Cipta Greenville final asset
- [ ] Logo RT final asset
- [ ] Official pengurus names and roles
- [ ] Confirmed finance numbers
- [ ] Announcement content
- [ ] PALUGADA item data
- [ ] WA contact numbers
- [ ] QR images
- [ ] Jumlah KK
- [ ] Kegiatan terdekat
- [ ] Official wording approval

## Content Update Location

Update static placeholder content in:

`lib/portal-data.ts`

Keep these rules when updating:

- Use only official data approved for publication.
- Keep unconfirmed values as `Data resmi menyusul`, `Menunggu konfirmasi pengurus`, `WA belum tersedia`, or `QR menunggu data resmi`.
- Do not add names, financial values, phone numbers, QR images, PALUGADA items, or announcement details from memory.
- Do not mention any city name unless approved later.
- Review all pages after updates: `/`, `/pengurus`, `/keuangan`, `/pengumuman`, `/palugada`, and `/kontak`.
