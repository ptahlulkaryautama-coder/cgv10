## CURRENT ACTIVE DIRECTION

CGV10 public website is in presentation demo mode for pengurus review.

The website must feel premium, alive, executive, and consistent.

Roadmap remains internal only and must not appear on the public website.

PALUGADA CGV uses Ma'niez Donut as the first pilot lapak.

Approved WA pilot for Ma'niez Donut:
+62 812-9125-4064

Keuangan page uses simulation dashboard data and must remain clearly labeled as demo/review data.

Do not add backend, database, login, payment, checkout, CMS, upload system, real form submission, or active admin dashboard.

## Task 39 — Premium Brand Popover and Image Preview System

Use the ui-ux-pro-max skill.

Goal:
Add a premium image/brand preview interaction so CGV10 feels more executive and less static.

Scope:
Frontend-only static interaction.
No backend.
No database.
No CMS.
No upload system.

Part A — Portal logo popover

1. Add a hover/focus/click popover to the main CGV10/Portal logo area in the shared header.
2. The popover should show a larger Portal Warga CGV brand preview.
3. Inspect available assets first and use the best matching logo from:
   public/assets/brand/
4. Prefer one of these if available:
   - official-cgv-logo.png
   - cgv10-logo-proposal.png
   - cgv10-wordmark.svg
5. Popover content:
   - Larger logo preview
   - Title: Portal Warga CGV
   - Subtitle: Terhubung • Terlibat • Terpercaya
   - Small note: Identitas portal digital warga
6. Keep header clean and unchanged in layout.
7. Make sure it works on desktop hover/focus and mobile tap.

Part B — Keep RT identity popover

1. Preserve the existing RT official logo popover.
2. Make its behavior visually consistent with the new portal logo popover.
3. Do not make either popover too large or intrusive.

Part C — Create reusable image preview/lightbox

1. Create a reusable component if helpful:
   - ImagePreview
   - MediaPreview
   - LightboxPreview
2. It should support:
   - click to enlarge
   - close button
   - keyboard accessible close if practical
   - clean overlay
   - premium rounded modal
   - image title/caption
3. Keep it static and client-side only.

Part D — Apply image preview selectively

Apply the preview/enlarge feature to:
1. PALUGADA listing images
2. PALUGADA detail gallery images
3. Kegiatan documentation card images
4. Pengurus profile photo if available

Do not apply to every decorative image or icon.

Part E — Visual behavior

1. Add subtle cue on previewable images:
   - cursor pointer
   - small “Lihat besar” or magnifier icon on hover
2. Avoid making the page noisy.
3. Keep premium green, cream, and warm gold style.
4. Ensure mobile remains clean.

Part F — Quality checks

Run:
npm.cmd run lint
npm.cmd run build

Confirm out folder is generated.

Summarize:
- changed files
- reusable component created or updated
- where image preview was applied
- which portal logo asset was used

Recommended commit message:
add premium brand popover and image preview

## Task 38 — Unified Header and Brand Identity Fix

Use the ui-ux-pro-max skill.

Goal:
Fix header/logo inconsistency across the whole CGV10 website and integrate the proposed brand assets properly.

Current issue:
Homepage header and Keuangan/page headers do not feel fully aligned. Logo updates also did not appear after the previous prompt, likely because the header is duplicated, hardcoded, or using the wrong asset path.

Scope:
Header, navigation, brand identity, footer consistency only.

Do not redesign the whole website.
Do not change page content unless needed for header/footer consistency.
Do not add new features.

Required work:

1. Inspect brand assets
Inspect:
public/assets/brand/
public/assets/

Find available logo files related to:
- CGV10
- Portal Warga CGV
- RT 010
- Cipta Greenville
- official RT/logo identity

Do not assume filenames. Inspect actual files first.

2. Create or enforce one shared header component
Ensure all pages use one consistent header/navigation component.

If there are duplicate headers inside individual page files, consolidate or align them.

Header must be visually consistent on:
- /
- /layanan/
- /pengurus/
- /keuangan/
- /pengumuman/
- /kegiatan/
- /palugada/
- /kontak/

3. Header brand structure
Use this structure:

Left:
- CGV10 compact mark/icon
- Text: CGV10
- Subtext: Portal Digital Warga

Center/right:
- Navigation:
  Beranda
  Layanan
  Pengurus
  Keuangan
  Pengumuman
  Kegiatan
  PALUGADA

Identity badge:
- Cipta Greenville
- RT 010 / RW 021

Right CTA:
- Hubungi Pengurus
- Link: /pengurus/#kontak-pengurus

4. Official logo handling
Do not show the words “Logo resmi” as placeholder.

If an official RT/Cipta Greenville logo asset exists and is suitable:
- use it subtly as an identity badge or in footer/brand section
- do not force a large complex logo into the small header

If no suitable official logo file exists:
- keep clean text badges only:
  Cipta Greenville
  RT 010 / RW 021

5. Proposed logo usage
The full “Portal Warga CGV” logo may be used in a brand preview area or footer if suitable, but should not break the header layout.

The complex RT 010 emblem may be used as supporting official identity visual, not as the main small header logo unless it remains readable.

6. Responsive consistency
Fix responsive behavior so header does not look like a different design on Keuangan compared to homepage.

Ensure desktop/tablet/mobile header states feel like one system.

7. Footer consistency
Footer should consistently show:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Optional:
Add small official identity mark only if it looks clean.

8. Quality checks
Run:
npm.cmd run lint
npm.cmd run build

Confirm out folder is generated.

Summarize:
- which logo files were found
- which logo files were used
- which header/footer files changed
- whether all pages now share consistent header

Recommended commit message:
fix unified header and brand identity

## Task 37A — Combine Pengurus and Kontak + Prepare Layanan Entry

Use the ui-ux-pro-max skill.

Goal:
Simplify CGV10 navigation by combining Pengurus and Kontak into one trust-focused page, then prepare Layanan as the next resident-service hub.

This is an information architecture polish task, not a full feature build.

Scope:
Static public demo only.

Do not build backend, database, login, CMS, real form submission, admin dashboard, payment, or active service system.

Part A — Combine Pengurus and Kontak

1. Keep /pengurus/ as the main page for:
   - Struktur pengurus
   - Ketua RT profile
   - Roles waiting for confirmation
   - Official contact publication status
   - QR/contact approval state

2. Move or merge the useful content from /kontak/ into the lower section of /pengurus/.

3. Add an anchor section in /pengurus/:
   id="kontak-pengurus"

4. Section title idea:
   “Kontak resmi pengurus”

5. Keep contact numbers/QR pending unless approved.
   Do not invent phone numbers.
   Do not add fake QR codes.

6. Make the section feel intentional and premium, not like an empty placeholder:
   - Ketua RT
   - Sekretaris
   - Bendahara
   - Keamanan
   Each can show:
   “Kontak resmi menunggu persetujuan publikasi”
   “QR akan tampil setelah disetujui pengurus”

Part B — Navigation cleanup

1. Remove “Kontak” as a standalone main navigation item if it exists.
2. Keep the right-side CTA button, but change label from “Kontak” to:
   “Hubungi Pengurus”
3. Link the CTA to:
   /pengurus/#kontak-pengurus

4. Header navigation should become:
   Beranda
   Layanan
   Pengurus
   Keuangan
   Pengumuman
   Kegiatan
   PALUGADA

If the header feels too crowded, keep visual spacing clean and prioritize readability.

Part C — Keep /kontak/ safe

Do not break existing /kontak/ route.

Update /kontak/ into a simple transition page that says:
“Kontak resmi kini digabung dalam halaman Pengurus.”

Add button:
“Buka Kontak Pengurus”

Button link:
/ pengurus/#kontak-pengurus

Use correct path without space:
/pengurus/#kontak-pengurus

Part D — Prepare Layanan entry

1. Add “Layanan” to navigation.
2. Create /layanan/ as a simple hub preview page.
3. Do not create all detail service pages yet.
4. Layanan page should introduce future static demo modules:
   - Pengaduan warga
   - Pendaftaran warga
   - Iuran bulanan
   - Donasi / kontribusi warga
   - Administrasi / permohonan surat
   - Keamanan lingkungan
   - Usulan / aspirasi warga

5. Each card should be marked:
   “Mode Tinjauan Pengurus”
   or
   “Simulasi layanan”

6. No real forms yet.
7. No submit button that implies real submission.
8. If button is needed, use:
   “Tinjau format”
   not
   “Kirim”

Part E — Homepage link consistency

1. Any homepage “Portal Warga” / “Layanan” card should link to /layanan/.
2. Any “Hubungi Pengurus” CTA should link to /pengurus/#kontak-pengurus.
3. Do not incorrectly route generic “Tinjau portal” to Pengurus.

Part F — Quality

1. Keep premium green, cream, and warm gold style.
2. Keep desktop and mobile navigation clean.
3. Maintain static export compatibility with Netlify publish directory out.

Quality checks:
1. Run npm.cmd run lint
2. Run npm.cmd run build
3. Confirm out folder is generated
4. Summarize changed files

Recommended commit message:
combine pengurus kontak and prepare layanan hub

## Task 36 — Upgrade Halaman Keuangan dengan Dummy Data dan Grafik Premium

Use the ui-ux-pro-max skill.

Goal:
Upgrade the keuangan page so it feels more premium, alive, and presentation-ready using the approved dummy financial data below. Add visual graphics and dashboard treatment inspired by the richer DKM dashboard style, but still aligned with CGV10 public website simplicity.

Approved dummy financial data:

1. Dana kas RT — qty 1 — satuan 2.000.000 — subtotal 2.000.000
2. Pendaftaran Calon Doddy — qty 1 — satuan 500.000 — subtotal 500.000
3. Pendaftaran Calon Fikri — qty 1 — satuan 500.000 — subtotal 500.000
4. Pendaftaran Calon Meyer — qty 1 — satuan 500.000 — subtotal 500.000
5. Dari KPU Sebelumnya — qty 1 — satuan 1.000.000 — subtotal 1.000.000
6. Dari Sumbangan Warga - Mandeville 09 — qty 1 — satuan 1.000.000 — subtotal 1.000.000

Total pemasukan simulasi: Rp 5.500.000

Assume:

* Kas keluar: Rp 0
* Saldo akhir simulasi: Rp 5.500.000
* Jumlah transaksi: 6

Required work:

1. Upgrade /keuangan page visual quality
   Make it feel more premium, structured, and alive — not just a plain table section.

2. Add summary cards at the top
   Include:

* Kas Masuk → Rp 5.500.000
* Kas Keluar → Rp 0
* Saldo Akhir → Rp 5.500.000
* Jumlah Transaksi → 6
  Optionally:
* Sumber Dana Aktif → 6

3. Add premium charts/graphics
   Add at least 2 visual graphics:

* Donut chart for distribusi sumber dana
* Bar chart (or similar) for nominal kontribusi per sumber

Suggested donut source breakdown:

* Dana kas RT → 2.000.000
* Calon Doddy → 500.000
* Calon Fikri → 500.000
* Calon Meyer → 500.000
* KPU Sebelumnya → 1.000.000
* Sumbangan Warga - Mandeville 09 → 1.000.000

4. Add a recent transaction / activity panel
   Show the 6 dummy transactions as premium list items, similar to a compact activity feed.

5. Keep or improve the detailed table
   Display:

* No
* Deskripsi
* Jumlah
* Satuan
* Sub Total

6. Improve content hierarchy
   The page should visually balance:

* summary
* charts
* transaction list
* detailed table

7. Keep honesty and clarity
   The page must clearly state that this is simulation content:

* Mode Tinjauan Pengurus
* Data simulasi untuk review — bukan data resmi

8. Match design language
   Stay consistent with:

* green / cream / soft gold palette
* rounded cards
* premium spacing
* clean shadows
* editorial but readable public-portal design

Important:
Do not make it look like an accountant ERP dashboard.
Do not make it too crowded.
Do not add fake expenses or fake official claims beyond the approved dummy values.

Quality checks:

1. Run npm.cmd run lint
2. Run npm.cmd run build
3. Confirm output builds successfully
4. Summarize changed files

Recommended commit message:
upgrade keuangan page with premium dummy dashboard


## Task 35 — Homepage Premium Experience Upgrade

Use the ui-ux-pro-max skill.

Goal:
Make the homepage feel significantly more premium, alive, and presentation-ready for pengurus review.

This must be a high-impact homepage upgrade, not minor copy polish.

Focus primarily on:

* app/page.tsx
* shared data/components only if needed

Do not redesign the whole website from zero.
Do not change PALUGADA detail flow unless needed for homepage links.
Do not add roadmap back.

Required improvements:

1. Upgrade the hero portal preview
   Replace the current generic portal illustration with a more alive premium “portal preview board”.

The preview board should visually show:

* Saldo Kas RT: Rp 23.000.000
* Jumlah KK: 128 KK
* Pengaduan Aktif: 2 laporan
* Kegiatan Terdekat: Kerja bakti lingkungan
* PALUGADA Pilot: Ma'niez Donut
* Dokumentasi Kegiatan

Use richer UI treatment:

* small cards
* status chips
* miniature image thumbnails where available
* soft shadows
* premium green/cream/gold accents
* subtle ornamental shapes or layered panels
* visual rhythm that feels like a real portal preview, not a placeholder.

Use local images if useful:

* /assets/palugada/maniez-donut-main.png
* /assets/kegiatan/kerja-bakti.png
* /assets/kegiatan/kegiatan-keluarga.png

2. Fix homepage CTA routing
   The “Tinjau portal” button must not incorrectly go to Pengurus unless the label clearly says “Tinjau struktur pengurus”.

Preferred fix:

* Main hero CTA: “Lihat ringkasan portal” → scroll/link to Info Cepat or Highlight Portal section.
* Secondary CTA: “Buka PALUGADA CGV” → /palugada/

For Fokus Tahap Awal cards:

* Portal Warga → “Lihat ringkasan portal” or “Tinjau info cepat”
* PALUGADA CGV → /palugada/
* Dokumentasi Kegiatan → /kegiatan/

3. Upgrade Fokus Tahap Awal section
   Make the three cards feel more premium and alive.

Each card should include:

* stronger title
* clearer CTA
* small visual motif or image thumbnail where appropriate
* better hierarchy
* less generic wording

Cards:

* Portal Warga
* PALUGADA CGV
* Dokumentasi Kegiatan

4. Upgrade Info Cepat section
   Keep simulation values:

* Saldo Kas RT: Rp 23.000.000
* Jumlah KK: 128 KK
* Pengaduan Aktif: 2 laporan
* Kegiatan Terdekat: Kerja bakti lingkungan

Make this section feel like a premium dashboard snapshot:

* stronger visual hierarchy
* darker or richer accent treatment
* subtle “Mode Tinjauan” status
* less repetitive warning boxes
* concise label: “Data simulasi untuk review — bukan data resmi”

5. Upgrade Highlight Portal section
   Make it less generic by using visual proof.

Cards:

* Ma'niez Donut pilot → use Ma'niez image thumbnail and link to /palugada/donat-kentang-warga/
* Dokumentasi kegiatan warga → use kegiatan image thumbnail and link to /kegiatan/
* Transparansi kas demo → use premium financial summary visual and link to /keuangan/

Each card must feel like a feature preview, not a plain text card.

6. Reduce stiffness
   Reduce repetitive text-heavy blocks.
   Use more visual hierarchy, spacing, image thumbnails, badges, and structured preview panels.

7. Keep honesty
   All simulated values must remain clearly labeled:
   “Data simulasi untuk review — bukan data resmi.”

Do not imply official final data.
Do not add fake official names, phone numbers, QR codes, or final financial claims.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm out folder is generated.
4. Summarize changed files.

Recommended commit message:
upgrade homepage premium experience


## Task 34 — High Impact Homepage and Kegiatan Demo Upgrade

Use the ui-ux-pro-max skill.

Goal:
Make CGV10 feel significantly more complete and less static for pengurus presentation.

This is a high-impact visual and interaction polish sprint.

Scope:
Static public demo only.

Part A — Homepage upgrade:
1. Replace weak placeholder feel on homepage with stronger demo content.
2. Make the hero visual feel like a real portal preview, not generic illustration.
3. Convert the “Fokus Tahap Awal” cards into clickable program cards:
   - Portal Warga → /pengurus/
   - PALUGADA CGV → /palugada/
   - Dokumentasi Kegiatan → /kegiatan/
4. Improve “Info Cepat” using simulation values:
   - Saldo Kas RT: Rp 23.000.000
   - Jumlah KK: 128 KK
   - Pengaduan Aktif: 2 laporan
   - Kegiatan Terdekat: Kerja bakti lingkungan
5. Clearly label all values as:
   “Data simulasi untuk review — bukan data resmi.”
6. Add a small “Highlight Portal” section if useful:
   - Ma'niez Donut pilot
   - Dokumentasi kegiatan warga
   - Transparansi kas demo
7. Keep premium green, cream, and warm gold style.

Part B — Kegiatan page upgrade:
1. Make each Kegiatan card clickable.
2. Add “Lihat dokumentasi” button to each card.
3. Create static detail pages:
   - /kegiatan/kerja-bakti-lingkungan/
   - /kegiatan/rapat-warga/
   - /kegiatan/kegiatan-sosial/
   - /kegiatan/keamanan-kebersihan/
   - /kegiatan/kegiatan-keluarga/
4. Use existing local images from:
   /assets/kegiatan/
5. Each detail page should include:
   - large hero image
   - badge “Contoh dokumentasi”
   - title
   - short description
   - gallery preview section
   - caption examples
   - approval status note
   - back link to /kegiatan/
6. Do not claim these are real official event records.
7. Keep wording as review/demo:
   - “Contoh dokumentasi”
   - “Bukan data resmi”
   - “Menunggu persetujuan publikasi”
8. Keep static export compatible with Netlify publish directory out.

Part C — Presentation impact:
1. Reduce repeated warning boxes.
2. Make pages feel more visual and less text-only.
3. Improve desktop and mobile readability.
4. Do not redesign from zero.
5. Do not change PALUGADA pilot flow unless necessary for homepage linking.

Quality checks:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm out folder is generated.
4. Summarize changed files.

Recommended commit message:
upgrade homepage and kegiatan demo experience

## Task 33 — Final Presentation QA and Deploy Readiness

Use the ui-ux-pro-max skill.

Goal:
Prepare CGV10 for pengurus presentation.

Scope:
Final QA and polish only. Do not add new major features.

Check these pages:

* /
* /pengurus/
* /keuangan/
* /pengumuman/
* /kegiatan/
* /palugada/
* /palugada/donat-kentang-warga/
* /kontak/

Required checks:

1. Ensure PALUGADA pilot Ma'niez Donut shows:

   * name: Ma'niez Donut
   * category: Kuliner
   * cluster: Cluster Colloseum
   * price: Rp 20.000
   * WA: +62 812-9125-4064
   * button: Hubungi WA Pilot
2. Ensure only Ma'niez Donut has active WA pilot link.
3. Other PALUGADA items must remain demo/inactive.
4. Ensure wording is consistent:

   * Mode Tinjauan Pengurus
   * Contoh tampilan
   * Bukan data resmi
   * Pilot lapak
5. Remove excessive placeholder feel where possible.
6. Keep Kegiatan page as documentation preview, not final archive.
7. Ensure no roadmap appears publicly.
8. Ensure no fake official names, phone numbers, QR codes, or financial claims are added.
9. Check desktop and mobile readability.
10. Keep premium green, cream, and warm gold style.
11. Keep static export compatible with Netlify publish directory out.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm out folder is generated.
4. Summarize changed files.

Recommended commit message:
final presentation qa for pengurus review


## Task 32 — Dokumentasi Kegiatan Warga Page

Use the ui-ux-pro-max skill.

Focus on adding a new public page for resident activity documentation.

Goal:
Add a “Kegiatan” page so CGV10 feels more like a complete resident portal, not only a PALUGADA marketplace preview.

Route:
Create /kegiatan/

Navigation:
Add “Kegiatan” to the main navigation if it fits cleanly.

Concept:

* Pengumuman = official information before or during events.
* Kegiatan = documentation/archive of activities after they happen.
* PALUGADA = resident marketplace/catalogue campaign.

Scope:
Static public demo only.

Do not build backend, database, login, upload system, gallery CMS, admin dashboard, or dynamic posting system.

Required page content:

1. Hero section:
   Title idea:
   “Dokumentasi kegiatan warga untuk arsip bersama.”
2. Subtitle:
   Explain that this page will become a curated archive of RT/community activities after photos and captions are approved.
3. Add a “Mode Tinjauan Pengurus” note.
4. Add visual documentation cards for example categories:

   * Kerja bakti lingkungan
   * Rapat warga
   * Kegiatan sosial
   * Keamanan dan kebersihan
   * Kegiatan anak-anak / keluarga
5. Each card should feel visual and premium.
6. If no real photos are available, use polished visual placeholder treatment, but avoid making it feel empty.
7. Label example content as “Contoh dokumentasi”.
8. Do not invent exact dates, real names, or real event claims.
9. Add a simple approval workflow section:

   * Foto kegiatan dikumpulkan
   * Pengurus memilih dokumentasi yang layak tampil
   * Caption disetujui
   * Dokumentasi dipublikasikan
10. Keep premium green, cream, and warm gold visual style.
11. Ensure mobile layout is clean.
12. Keep static export compatible with Netlify publish directory out.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files.

Recommended commit message:
add kegiatan documentation page


## Task 31 — PALUGADA Donat Kentang Pilot Demo

Use the ui-ux-pro-max skill.

Read CURRENT ACTIVE DIRECTION first.

Focus only on PALUGADA pilot demo.

Goal:
Turn Donat Kentang Warga into the primary PALUGADA pilot lapak demo, so pengurus can review one complete example before PALUGADA is expanded to more warga listings.

Scope:
Static public demo only.

Do not build backend, database, login, seller account, payment, checkout, cart, active WhatsApp, transaction flow, or roadmap.

Strategic direction:
PALUGADA Phase 1 should start with one curated pilot lapak.
The pilot is managed by admin/pengurus, not seller self-service.

Required changes:

1. On /palugada/, visually highlight Donat Kentang Warga as:
   “Pilot Lapak PALUGADA”
2. Make Donat Kentang the primary featured listing.
3. Keep other listings as secondary “contoh tampilan”.
4. On /palugada/donat-kentang-warga/, make the detail page feel more complete and pilot-ready.
5. Add or refine these detail sections:

   * Ringkasan lapak
   * Detail produk
   * Varian contoh
   * Format pesanan
   * Area layanan
   * Status transaksi
   * Profil penyedia — contoh tampilan
   * Alur validasi admin
6. Use available local donat image assets from public/assets/palugada/.
7. Do not publish real seller name, phone number, or WA link unless already approved.
8. Keep WA inactive and labeled:
   “WA nonaktif untuk demo”
9. Add a clear note:
   “Pilot ini digunakan untuk meninjau format katalog sebelum data resmi dan kontak penjual dipublikasikan.”
10. Keep premium green, cream, and warm gold visual style.
11. Improve desktop and mobile readability.

Suggested pilot content:

* Nama lapak: Donat Kentang Warga
* Kategori: Kuliner
* Cluster: Cluster Greenwich
* Harga contoh: Rp 35.000
* Varian contoh: Coklat meses, keju, red velvet
* Format pesanan: Box kecil, box keluarga, pesanan acara warga
* Status: Contoh pilot — bukan transaksi aktif
* Kontak: WA nonaktif untuk demo

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files.

Recommended commit message:
add palugada donat pilot demo


## Task 30 — PALUGADA Detail Page Content Depth

Use the ui-ux-pro-max skill.

Read CURRENT ACTIVE DIRECTION first.

Focus only on PALUGADA static detail pages.

Goal:
Make each PALUGADA detail page feel more complete, useful, and presentation-ready after users click “Tinjau detail”.

Scope:
Static public demo only.

Do not build backend, database, login, seller account, payment, checkout, cart, active WhatsApp, transaction flow, or roadmap.

Required improvement:

1. Keep the current detail page hero with large image and item title.
2. Keep the left column as quick summary:

   * category
   * cluster
   * price/status
   * WA inactive demo button
   * transaction inactive note
3. Add a new right-column card above “Profil Penyedia” called:
   “Detail Produk — Contoh Tampilan”
4. The detail card should include:

   * short item/service description
   * example variants or service scope
   * availability/order note
   * demo status note
5. Keep “Profil Penyedia — Contoh Tampilan” below product detail.
6. Keep “Mini Katalog” below provider profile.
7. Add detail content for these pages:

   * Donat Kentang Warga
   * Jasa Laundry Kiloan
   * Catering Rumahan
   * Jasa Servis AC
8. Keep all wording honest:

   * Contoh tampilan
   * Mode Tinjauan Pengurus
   * Bukan transaksi aktif
   * WA nonaktif untuk demo
9. Do not imply real active seller operation.
10. Keep premium green, cream, and warm gold visual style.
11. Improve desktop and mobile readability.

Static export:
Keep Next.js static export compatible with Netlify publish directory out.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files.

Recommended commit message:
add palugada detail page content depth


## Task 29 — PALUGADA Static Detail Pages Demo

Use the ui-ux-pro-max skill.

Focus only on PALUGADA.

Goal:
Add a clickable catalogue detail experience so PALUGADA feels more like a real resident marketplace preview, while remaining a static demo.

Scope:
Static public demo only.

Do not build backend, database, login, seller account, payment, checkout, cart, active WhatsApp, transaction flow, or roadmap.

Required changes:

1. Add “Lihat detail” or “Tinjau detail” button/link on PALUGADA listing cards.
2. Create static detail pages for:

   * Donat Kentang Warga
   * Jasa Laundry Kiloan
   * Catering Rumahan
   * Jasa Servis AC
3. Suggested routes:

   * /palugada/donat-kentang-warga/
   * /palugada/jasa-laundry-kiloan/
   * /palugada/catering-rumahan/
   * /palugada/jasa-servis-ac/
4. Keep static export compatible with Netlify output directory `out`.
5. Use available local images from public/assets/palugada/.
6. Detail page structure:

   * large hero image
   * “Contoh tampilan” badge
   * item name
   * category
   * cluster
   * sample price/status
   * short description
   * “Profil penyedia — contoh tampilan”
   * mini catalogue/gallery area if suitable
   * inactive WA demo button
   * back link to PALUGADA
7. Make it clear this is not an active transaction system.
8. Keep premium green, cream, and warm gold visual style.
9. Improve desktop and mobile presentation quality.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm out folder is generated.
4. Summarize changed files.

Recommended commit message:
add palugada static detail pages demo


## Task 28 — PALUGADA Real Image Integration Pass

Use the ui-ux-pro-max skill.

Focus only on the PALUGADA page.

Goal:
Use the provided local PALUGADA images to make the PALUGADA page feel premium, visual, alive, and presentation-ready for pengurus review.

Important:
Do not create new images.
Do not create SVG thumbnails.
Do not download external images.
Use only the local image files already available in public/assets/palugada/.

Scope:
Static public demo only.

Do not redesign the whole website.
Do not change unrelated pages.
Do not add roadmap back.
Do not build backend, login, database, payment, checkout, cart, seller account, active WhatsApp transaction, or real marketplace functionality.

Required changes:

1. Inspect public/assets/palugada/ and identify the available image files.
2. Use the best PALUGADA collage/hero image in the top hero campaign section.
3. Use available product/service images for listing cards:

   * Donat Kentang Warga
   * Jasa Laundry Kiloan
   * Catering Rumahan
   * Jasa Servis AC
4. If Tanaman Hias Rumah or Info Properti Warga has no matching image, keep them as polished visual placeholder cards, but make them visually consistent.
5. Replace blank placeholder bars in listing cards with real image thumbnails.
6. Make listing cards feel like premium marketplace catalogue cards:

   * large visual thumbnail
   * Contoh tampilan badge
   * category
   * item name
   * cluster
   * sample price/status
   * inactive WA demo button
7. Make the hero section more visual and less text-heavy.
8. Use the provided hero/collage image as visual proof of PALUGADA categories.
9. Keep all labels honest:

   * Mode Tinjauan Pengurus
   * Contoh tampilan
   * Bukan transaksi aktif
   * WA nonaktif untuk demo
10. Keep WhatsApp inactive.
11. Do not imply active transaction.
12. Keep premium green, cream, and warm gold CGV10 visual style.
13. Keep static export compatible with Netlify publish directory out.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files.
4. Recommended commit message:
   integrate palugada real image catalogue


# CGV10 Codex Task List

## Task 01 — Technical Foundation Fix

Use the ui-ux-pro-max skill.

Proceed with technical foundation fix only. Edit code only where necessary.

Tasks:

1. Set the correct Turbopack project root in next.config.ts so the project root is C:\Users\lenovo\Desktop\cgv10, not C:\Users\lenovo.
2. Do not redesign the page yet.
3. Do not change app/page.tsx, app/layout.tsx, or app/globals.css unless required for the build fix.
4. Run npm.cmd run lint.
5. Run npm.cmd run build.
6. Summarize changed files and results.

Approval rule:
Only edit next.config.ts unless another file is technically required.

---

## Task 02 — Design System Planning Only

Use the ui-ux-pro-max skill.

Do not edit code yet.

Create a premium design-system plan for CGV10.

Include:

1. Brand direction.
2. Color tokens.
3. Typography direction.
4. Layout system.
5. Section rhythm.
6. Button styles.
7. Responsive rules.
8. Accessibility rules.
9. What files should be changed later.

Wait for approval before editing code.

---

## Task 03 — Build Landing Page First Draft

Use the ui-ux-pro-max skill.

Build the first premium responsive landing page for CGV10.

Rules:

1. Use existing Next.js App Router.
2. Use Tailwind CSS.
3. Keep code clean.
4. Create premium visual hierarchy.
5. Avoid generic AI-looking design.
6. Avoid unnecessary animation.
7. Run npm.cmd run lint.
8. Run npm.cmd run build.
9. Summarize changed files and design rationale.

## Task 04 — Visual Refinement

Use the ui-ux-pro-max skill.

Refine the existing CGV10 public landing page first draft.

Keep the scope as public landing page only.

Do not build login, auth, database, backend, payment, marketplace functionality, or admin dashboard.

Goals:
1. Make the page feel more premium, warmer, and more convincing for residents and RT/RW stakeholders.
2. Improve the hero section with stronger hierarchy, better spacing, and more civic/community trust.
3. Improve the right-side portal preview so it feels more polished and less generic.
4. Add more human/community-oriented messaging without using fake testimonials or fake metrics.
5. Add a section explaining why CGV10 is needed for residents.
6. Add clear audience blocks: warga, pengurus, keamanan, UMKM warga.
7. Improve the modules section with small meaningful icons or visual hierarchy.
8. Improve the roadmap section so it feels more intentional and less empty.
9. Add a stronger final CTA section.
10. Keep the approved identity exactly:
   CGV10 — Portal Digital Warga
   Cipta Greenville • RT 010 / RW 021

Design direction:
- Premium civic community portal
- Warm, trusted, organized
- Green, cream, warm gold
- Resident-friendly
- Mobile-first
- Clean but not empty
- Professional but not corporate cold

Avoid:
- Jakarta Selatan or any city name
- Generic SaaS look
- Fake metrics
- Heavy animation
- Heavy glassmorphism
- Overly futuristic dashboard style

After editing:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files and design rationale.

## Task 05 — Public Copy and Final Polish

Use the ui-ux-pro-max skill.

Refine the existing CGV10 Task 04 landing page without redesigning from zero.

Scope:
Public landing page only.

Do not build login, auth, database, backend, payment, marketplace functionality, admin dashboard, forms, or real app features.

Goals:
1. Remove internal/developer wording such as "Task", "Refinement", "MVP", "backend", "PWA", or overly technical language from visible public copy.
2. Rewrite the copy so it sounds natural for residents, RT/RW stakeholders, and community members.
3. Keep the tone warm, trusted, civic, organized, and professional.
4. Strengthen the final CTA so it feels more relevant than "Kembali ke atas".
5. Improve section rhythm and spacing only where needed.
6. Keep the visual direction from Task 04.
7. Keep the approved identity exactly:
   CGV10 — Portal Digital Warga
   Cipta Greenville • RT 010 / RW 021
8. Do not mention any city name.
9. Do not add fake metrics, testimonials, or claims.

Suggested copy direction:
- Replace technical phrases with resident-friendly language.
- Use "tahap awal" instead of "MVP".
- Use "rencana pengembangan" instead of "fitur aktif/backend".
- Use "layanan warga" instead of technical app terms.
- Use "diskusi bersama warga dan pengurus" for CTA language.

After editing:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files and design rationale.

## Task 06 — Align Landing Page with Pengurus Portal Structure

Use the ui-ux-pro-max skill.

Refine the existing CGV10 Task 05 landing page based on input from pengurus.

Scope:
Public landing page / portal prototype only.

Do not build login, auth, database, backend, payment, checkout, transaction system, complaint system, admin dashboard, or real app functionality.

Main direction:
CGV10 is the main Portal Digital Warga.
PALUGADA CGV is a sub-brand marketplace warga.

Pengurus requested structure:

Header:

* Use clean CGV10 identity for now.
* Prepare space/structure for Cipta Greenville logo and RT logo, but do not use complex logo images unless proper assets are already available in public/.
* Menu items:

  1. Beranda
  2. Pengurus
  3. Keuangan
  4. Pengumuman
  5. PALUGADA
  6. Kontak

Info Cepat section:
Create a section or card group for:

1. Saldo Kas RT
2. Jumlah KK
3. Pengaduan Aktif
4. Kegiatan Terdekat

Important:
If real data is not available, do not invent numbers. Use safe placeholder wording such as:

* Data menunggu konfirmasi pengurus
* Akan diperbarui setelah data resmi tersedia
* Rencana fitur tahap berikutnya

Pengurus section:
Show a clean public structure for:

1. Ketua RT
2. Sekretaris
3. Bendahara
4. Semua seksi
5. Koordinator cluster

Use placeholder names only if real names are not provided.
Do not invent real names.

Keuangan section:
Show a transparent finance summary structure:

1. Saldo awal
2. Pemasukan
3. Pengeluaran
4. Saldo akhir

Do not invent real financial values.
Use placeholder or “data resmi menyusul” wording.

Pengumuman section:
Add a public announcement preview section with 2–3 placeholder announcement cards.
Use neutral copy such as:

* Jadwal kegiatan lingkungan
* Informasi keamanan
* Pengumuman layanan warga

PALUGADA CGV section:
Create a dedicated PALUGADA CGV marketplace warga section.

Categories:

1. Barang
2. Kuliner
3. Jasa
4. Properti
5. Lainnya, optional if layout allows

Each item card should show:

* Nama
* Harga
* Cluster
* Tombol WA

Important:
Do not create real transaction, checkout, payment, cart, or database functionality.
If there are no real items, use placeholder examples clearly marked as contoh tampilan or use empty-state copy.

Kontak section:
Create a contact section for:

1. Ketua RT
2. Sekretaris
3. Bendahara
4. Keamanan

Add QR placeholder cards only.
Do not generate real QR codes.
Do not invent phone numbers.

Design goals:

1. Keep the current Task 05 premium green / cream / gold civic direction.
2. Make the page feel more like a real resident portal structure, not only a concept landing page.
3. Keep it warm, trusted, organized, resident-friendly, and professional.
4. Keep the page clean and readable for mixed-age residents.
5. Avoid fake metrics, fake people, fake financial values, fake contact numbers, and fake QR codes.
6. Avoid heavy animation or excessive visual decoration.
7. Keep the approved identity exactly:
   CGV10 — Portal Digital Warga
   Cipta Greenville • RT 010 / RW 021
8. Do not mention any city name.

After editing:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files and design rationale.

## Task 07 — Static Multi-Page Portal Prototype

Use the ui-ux-pro-max skill.

Convert the existing CGV10 Task 06 single-page portal into a static multi-page portal prototype using the Next.js App Router.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Main objective:
Turn the current one-page structure into separate public pages that match the pengurus-requested navigation.

Required routes:

1. `/` — Beranda
2. `/pengurus` — Pengurus
3. `/keuangan` — Keuangan
4. `/pengumuman` — Pengumuman
5. `/palugada` — PALUGADA CGV
6. `/kontak` — Kontak

Header:
Use the current clean CGV10 identity for now.
Keep space/structure for future Cipta Greenville logo and RT logo, but do not use complex uploaded logo images directly unless proper simplified assets are available in `public/`.

Header menu:

1. Beranda
2. Pengurus
3. Keuangan
4. Pengumuman
5. PALUGADA
6. Kontak

Beranda page:
Keep the premium hero section.
Keep Info Cepat cards:

1. Saldo Kas RT
2. Jumlah KK
3. Pengaduan Aktif
4. Kegiatan Terdekat

Use safe placeholder wording only:

* Data menunggu konfirmasi pengurus
* Akan diperbarui setelah data resmi tersedia
* Rencana fitur tahap berikutnya

Pengurus page:
Create a dedicated public structure for:

1. Ketua RT
2. Sekretaris
3. Bendahara
4. Semua seksi
5. Koordinator cluster

Do not invent names.
Use placeholder copy until official data is provided.

Keuangan page:
Create a dedicated transparent finance summary page:

1. Saldo awal
2. Pemasukan
3. Pengeluaran
4. Saldo akhir

Do not invent financial values.
Use “Data resmi menyusul” or equivalent safe wording.

Pengumuman page:
Create a dedicated announcement preview page with 3 neutral placeholder announcement cards:

1. Jadwal kegiatan lingkungan
2. Informasi keamanan
3. Pengumuman layanan warga

Make it clear these are preview/placeholder structures, not active official announcements.

PALUGADA page:
Create a dedicated PALUGADA CGV marketplace warga prototype page.

Categories:

1. Barang
2. Kuliner
3. Jasa
4. Properti
5. Lainnya

Each item card should show:

* Nama
* Harga
* Cluster
* Tombol WA

Important:
Do not create real transactions, checkout, cart, payment, database, seller account, or functional marketplace system.
If no real item data exists, use cards clearly marked as contoh tampilan, with “WA belum tersedia”.

Kontak page:
Create a dedicated contact directory page for:

1. Ketua RT
2. Sekretaris
3. Bendahara
4. Keamanan

Add QR placeholder cards only.
Do not generate real QR codes.
Do not invent phone numbers.

Shared structure:
Create reusable components if useful, for example:

* SiteHeader
* SiteFooter
* PageHero
* SectionHeading
* InfoCard
* PlaceholderNotice

Keep code clean and readable.
Do not over-engineer.

Design goals:

1. Preserve the current Task 06 green / cream / gold civic direction.
2. Make the portal feel more real and navigable.
3. Keep it warm, trusted, organized, resident-friendly, and professional.
4. Keep the page readable for mixed-age residents.
5. Avoid fake metrics, fake names, fake financial values, fake contact numbers, fake QR codes, and fake PALUGADA items that look active.
6. Avoid heavy animation or excessive decoration.
7. Keep the approved identity exactly:
   CGV10 — Portal Digital Warga
   Cipta Greenville • RT 010 / RW 021
8. Do not mention any city name.

Technical rules:

1. Use existing Next.js App Router.
2. Use TypeScript and Tailwind CSS.
3. Prefer shared static data if it keeps the code cleaner.
4. Keep all pages static and public.
5. Do not add new libraries unless absolutely necessary.

After editing:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files, new routes, and design rationale.

## Task 08 — Navigation Smoothness and Performance Polish

Use the ui-ux-pro-max skill.

Improve the smoothness and perceived performance of the existing CGV10 Task 07 static multi-page portal prototype.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Main goals:
1. Make page-to-page navigation feel smoother.
2. Reduce choppy interactions.
3. Improve shared layout consistency.
4. Keep the current Task 07 visual direction.
5. Do not redesign from zero.
6. Do not change the approved content structure unless needed for smoothness.

Check and improve:
1. Ensure internal navigation uses Next.js Link from `next/link`, not plain `<a>` for route navigation.
2. Ensure shared header/footer/layout components are reused consistently across pages.
3. Add lightweight `loading.tsx` route-level loading UI if appropriate.
4. Add subtle active navigation state for the current page.
5. Avoid heavy animation.
6. Avoid layout shifts.
7. Reduce excessive shadows/blur if they affect responsiveness.
8. Keep SVG/image usage optimized and lightweight.
9. Keep all pages static and public.
10. Ensure mobile navigation remains readable and easy to tap.

Routes to verify:
1. `/`
2. `/pengurus`
3. `/keuangan`
4. `/pengumuman`
5. `/palugada`
6. `/kontak`

Technical rules:
1. Use existing Next.js App Router.
2. Use TypeScript and Tailwind CSS.
3. Prefer reusable shared components.
4. Do not add new libraries unless absolutely necessary.
5. Do not add complex page transition libraries.
6. Do not use heavy framer-motion style animation.
7. Keep accessibility: focus-visible states, 44px touch targets, readable contrast.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent data, names, financial values, phone numbers, QR codes, or PALUGADA items.

After editing:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. If possible, run a local production check with npm.cmd run start.
4. Summarize changed files, performance rationale, and verification results.

## Task 09 — Content Readiness and Static Data Structure

Use the ui-ux-pro-max skill.

Prepare the CGV10 static multi-page portal so future official data from pengurus can be inserted cleanly.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Main goals:
1. Centralize placeholder content into clean static data files.
2. Make future official data easier to update.
3. Keep all current pages and visual direction from Task 08.
4. Do not redesign from zero.
5. Do not invent names, numbers, financial values, phone numbers, QR codes, or PALUGADA items.

Create or improve static data structure for:
1. Info Cepat:
   - Saldo Kas RT
   - Jumlah KK
   - Pengaduan Aktif
   - Kegiatan Terdekat

2. Pengurus:
   - Ketua RT
   - Sekretaris
   - Bendahara
   - Semua seksi
   - Koordinator cluster

3. Keuangan:
   - Saldo awal
   - Pemasukan
   - Pengeluaran
   - Saldo akhir

4. Pengumuman:
   - Jadwal kegiatan lingkungan
   - Informasi keamanan
   - Pengumuman layanan warga

5. PALUGADA CGV:
   - Barang
   - Kuliner
   - Jasa
   - Properti
   - Lainnya
   - Item card fields: Nama, Harga, Cluster, Tombol WA

6. Kontak:
   - Ketua RT
   - Sekretaris
   - Bendahara
   - Keamanan
   - QR placeholder

Suggested technical direction:
1. Create a clean static data file such as `lib/portal-data.ts` or similar.
2. Reuse the data across pages.
3. Keep all pages static.
4. Keep copy resident-friendly.
5. Use clear placeholder labels:
   - Data resmi menyusul
   - Menunggu konfirmasi pengurus
   - WA belum tersedia
   - QR menunggu data resmi
6. Add comments in the data file to show where pengurus data should be inserted later.

Also create a documentation file:
`CONTENT_CHECKLIST.md`

This checklist should list all data needed from pengurus before public launch:
1. Logo Cipta Greenville final asset
2. Logo RT final asset
3. Official pengurus names and roles
4. Confirmed finance numbers
5. Announcement content
6. PALUGADA item data
7. WA contact numbers
8. QR images
9. Jumlah KK
10. Kegiatan terdekat
11. Official wording approval

Do not expose private data in the website unless provided and approved.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.

After editing:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files, data structure, and how to update content later.

## Task 10 — Brand Breakdown System for CGV10 and PALUGADA CGV

Use the ui-ux-pro-max skill.

Refine the CGV10 brand and asset structure based on the logo concepts from pengurus.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Context:
Pengurus provided complex logo concepts for:

1. CGV10 — Portal Digital Warga
2. PALUGADA CGV — Marketplace Warga

Important design decision:
Do not use the complex logo concepts as one single header logo.
They are too detailed for small-size website use.

Break the brand into a clean brand system:

Brand architecture:

1. CGV10 = parent brand / main resident portal
2. PALUGADA CGV = sub-brand / marketplace warga
3. Cipta Greenville + RT 010 / RW 021 = identity badges, not part of the main logo lockup
4. Feature icons = separate UI icon system, not embedded inside the logo

Main CGV10 brand elements:

1. Simple CGV10 mark
2. CGV10 wordmark
3. Portal Digital Warga descriptor
4. Cipta Greenville identity badge
5. RT 010 / RW 021 identity badge

CGV10 feature icon system:

1. Warga
2. Layanan
3. Keuangan
4. Informasi
5. Keamanan

PALUGADA CGV brand elements:

1. Simple PALUGADA CGV wordmark
2. Marketplace Warga descriptor
3. Simple cart/community icon
4. Category icon system:

   * Barang
   * Kuliner
   * Jasa
   * Properti
   * Lainnya

Tasks:

1. Create a clean brand asset structure under `public/assets/brand/`.
2. Create simple SVG placeholder assets for:

   * `cgv10-mark.svg`
   * `cgv10-wordmark.svg`
   * `palugada-mark.svg`
   * `palugada-wordmark.svg`
   * `favicon.svg`
3. Create simple SVG icon placeholders under `public/assets/icons/` for:

   * warga
   * layanan
   * keuangan
   * informasi
   * keamanan
   * barang
   * kuliner
   * jasa
   * properti
   * lainnya
4. Keep all SVGs simple, flat, readable, and scalable.
5. Do not create complicated emblem-style logos.
6. Update the header so the visual hierarchy is:

   * CGV10 clean mark + wordmark
   * Cipta Greenville badge
   * RT 010 / RW 021 badge
   * future official logo slot
7. Do not place the complex JPG logo concepts directly in the header.
8. Add or update a short internal documentation file named `BRAND_SYSTEM.md`.

`BRAND_SYSTEM.md` should explain:

1. CGV10 is the parent brand.
2. PALUGADA CGV is a sub-brand.
3. Complex logo concepts are reference/emblem concepts only.
4. Header should use simplified marks.
5. Feature icons should be separate from the logo.
6. Final approved logo files can replace the placeholder SVGs later.

Design direction:

1. Premium civic community portal.
2. Green / cream / warm gold.
3. Clean, trusted, organized.
4. Resident-friendly.
5. Scalable for website, mobile, favicon, dashboard, and printed material.

Do not:

1. Mix all services into one logo.
2. Use tiny unreadable text inside the logo.
3. Use heavy 3D effects.
4. Use fake official seals.
5. Invent city name.
6. Invent data, names, phone numbers, QR codes, or PALUGADA items.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

After editing:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files, created assets, and how final official logos should replace placeholders later.

## Task 11 — Responsive QA and Production Polish

Use the ui-ux-pro-max skill.

Perform a full responsive QA and production polish pass for the existing CGV10 static multi-page portal.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Main goals:

1. Check and polish all public routes.
2. Improve mobile responsiveness.
3. Improve tablet and desktop spacing consistency.
4. Ensure header navigation remains clean and readable.
5. Ensure brand assets from Task 10 are displayed cleanly and not oversized.
6. Ensure pages feel consistent as one portal system.
7. Do not redesign from zero.
8. Do not add new features.

Routes to check:

1. `/`
2. `/pengurus`
3. `/keuangan`
4. `/pengumuman`
5. `/palugada`
6. `/kontak`

Responsive widths to verify:

1. 375px mobile
2. 768px tablet
3. 1024px laptop
4. 1440px desktop

Checkpoints:

1. No horizontal scroll.
2. Header does not break on mobile.
3. Menu remains usable and readable.
4. CTA buttons are at least 44px tall.
5. Cards do not feel cramped.
6. Text hierarchy is clear.
7. Section spacing is consistent.
8. Footer is clean.
9. PALUGADA item cards are readable.
10. Contact QR placeholder cards look intentional.
11. Finance table/card layout works on mobile.
12. Pengurus cards are easy to scan.
13. Announcement cards are clear.
14. Brand marks and icons stay sharp and lightweight.

Production polish:

1. Use Next.js Link for internal navigation if not already used.
2. Ensure active navigation state is visible.
3. Reduce layout shifts.
4. Keep images/SVGs optimized.
5. Keep focus-visible states accessible.
6. Keep contrast readable.
7. Avoid heavy animation.
8. Avoid excessive shadow/blur.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent data, names, financial values, phone numbers, QR codes, or PALUGADA items.

After editing:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. If possible, run production check with npm.cmd run start.
4. Summarize changed files, responsive improvements, and verification results.

## Task 12 — Logo Direction and Prompt Kit

Use the ui-ux-pro-max skill.

Create a logo direction and prompt kit for CGV10 and PALUGADA CGV.

Scope:
Documentation and brand direction only.

Do not redesign the website.
Do not change app pages unless absolutely necessary.
Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Context:
Pengurus provided complex logo concept references for:

1. CGV10 — Portal Digital Warga
2. PALUGADA CGV — Marketplace Warga

Important:
The complex reference logos should not be used directly as header logos.
They are too detailed and mix too many ideas into one mark.

Main goal:
Create a clean logo generation prompt kit that separates:

1. Parent brand
2. Sub-brand
3. Feature icons
4. Category icons

Brand architecture:

1. CGV10 = parent brand / main resident portal
2. PALUGADA CGV = sub-brand / marketplace warga
3. Cipta Greenville + RT 010 / RW 021 = identity badges, not part of the main small logo
4. Feature icons are separate UI assets, not embedded inside the logo

Create a new documentation file:
`LOGO_PROMPTS.md`

The file should include:

A. CGV10 Main Logo Prompt
Direction:

* Clean premium vector logo
* Simple CGV10 wordmark
* Small icon combining community, house, and trust
* Green / cream / warm gold palette
* Must be readable in website header, mobile, favicon, and print
* No complex emblem
* No 3D
* No tiny text
* No slogan inside logo
* No too many icons

B. PALUGADA CGV Logo Prompt
Direction:

* Clean marketplace warga sub-brand logo
* Simple wordmark: PALUGADA CGV
* Descriptor: Marketplace Warga
* Icon concept: cart + community / local neighborhood
* Friendly but still premium
* Green / gold / cream palette
* No overloaded category icons inside logo
* No 3D
* No tiny text
* No crowded composition

C. CGV10 Feature Icon Set Prompt
Icons:

1. Warga
2. Layanan
3. Keuangan
4. Informasi
5. Keamanan

Direction:

* Consistent line icons
* Simple SVG-ready style
* Green/gold accents
* Clear at small sizes
* No 3D
* No detailed illustration

D. PALUGADA Category Icon Set Prompt
Icons:

1. Barang
2. Kuliner
3. Jasa
4. Properti
5. Lainnya

Direction:

* Consistent marketplace category icons
* Simple, friendly, readable
* SVG-ready
* No 3D
* No complex pictorial detail

E. Usage Guidance
Explain:

1. Use simplified CGV10 logo in header.
2. Use PALUGADA logo only on PALUGADA page/section.
3. Use complex pengurus logo concepts only as reference/emblem/poster direction.
4. Do not put all features inside one logo.
5. Keep logos scalable and readable.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.

After editing:

1. Run npm.cmd run lint if code was changed.
2. Run npm.cmd run build only if code was changed.
3. Summarize created documentation and logo direction.

## Task 13 — Integrate Temporary Proposal Logos

Use the ui-ux-pro-max skill.

Integrate the temporary proposal logos into the CGV10 static portal carefully.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Context:
Two temporary proposal logo images have been provided:

1. `public/assets/brand/cgv10-logo-proposal.png`
2. `public/assets/brand/palugada-logo-proposal.png`

Brand usage:

1. CGV10 proposal logo is the temporary parent-brand visual.
2. PALUGADA CGV proposal logo is the temporary marketplace sub-brand visual.
3. These are proposal assets for review, not final approved vector logos.

Important logo rules:

1. Do not force the complex logo into a tiny header if readability becomes poor.
2. Keep the header clean and readable.
3. Use the existing simplified CG mark in the header if the proposal logo is too detailed at small size.
4. Use the CGV10 proposal logo in an appropriate brand preview area, hero support area, or footer/brand section.
5. Use the PALUGADA proposal logo only on the PALUGADA page or PALUGADA section.
6. Do not distort, stretch, crop badly, or over-enlarge the logos.
7. Preserve aspect ratio.
8. Add clear alt text.

Implementation goals:

1. Add a clean “Logo proposal” or “Brand preview” treatment where appropriate.
2. Show the CGV10 logo proposal as a temporary identity reference.
3. Show the PALUGADA CGV logo proposal inside the PALUGADA page.
4. Keep current navigation and content structure.
5. Keep visual direction premium, clean, green, cream, and warm gold.
6. Do not redesign from zero.
7. Keep all pages static and public.

Fallback:
If the image files are not found, do not break the build.
Keep the current SVG placeholder marks and summarize that the PNG proposal files need to be placed in `public/assets/brand/`.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent data, names, financial values, phone numbers, QR codes, or PALUGADA items.

After editing:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files, where the proposal logos appear, and any readability concerns.

## Task 14 — Header Logo Integration

Use the ui-ux-pro-max skill.

Refine the website header branding so the top-left logo better reflects the approved temporary CGV10 proposal identity.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, admin dashboard, or real app functionality.

Context:
The current top-left header still uses a simplified fallback mark.
We now want the header branding to feel closer to the temporary CGV10 proposal logo, but still remain clean, readable, and appropriate for small-size header use.

Main objective:
Replace or refine the current top-left header brand so it uses a proposal-based CGV10 header identity.

Important rules:
1. Do not place the full complex CGV10 proposal logo into the tiny header unchanged if it becomes too small or unreadable.
2. Create a cleaner header-friendly brand lockup derived from the proposal identity.
3. Keep the header compact, elegant, and readable.
4. Preserve visual consistency with the rest of the website.

Brand direction:
1. Use the CGV10 proposal logo as the identity reference.
2. Keep the parent brand text:
   - CGV10
   - Portal Digital Warga
3. If needed, use:
   - a cropped / simplified icon from the proposal logo
   - the wordmark CGV10
   - a small descriptor "Portal Digital Warga"
4. Do not include Cipta Greenville or RT 010 / RW 021 inside the small main header logo lockup unless it remains exceptionally clear.
5. Identity badges can stay separate from the small logo.

Implementation goals:
1. Replace the current default-looking mark in the top-left header with a more proposal-based identity.
2. Keep readability strong on desktop and mobile.
3. Preserve spacing and navbar alignment.
4. Ensure the logo does not appear blurry, stretched, oversized, or cramped.
5. Keep the current logo proposal preview sections elsewhere if they still help review.

Fallback logic:
If the full proposal PNG is too detailed for the header, use a simplified crop/lockup derived from it.
Prioritize readability and premium appearance over literal full-logo placement.

Design goals:
1. Premium civic community portal
2. Clean, trustworthy, organized
3. Green / cream / warm gold
4. Scalable for header and mobile
5. Do not redesign the entire site from zero

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent data, names, phone numbers, QR codes, or financial values.

After editing:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files, how the new header logo was handled, and whether a simplified fallback was required.

## Task 15 — Brand Copy Consistency and Final QA

Use the ui-ux-pro-max skill.

Perform a final brand consistency and QA pass after the Task 14 header logo integration.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, admin dashboard, or real app functionality.

Goals:
1. Check all visible brand copy after header logo integration.
2. Fix outdated wording that says the header still uses the old placeholder logo.
3. Update brand preview copy so it accurately says the header uses a simplified proposal-based CGV10 mark.
4. Keep the full CGV10 proposal logo as a visual reference only.
5. Keep the PALUGADA proposal logo only on PALUGADA-related page/section.
6. Do not redesign from zero.
7. Do not change the core layout unless required for consistency.

Check all routes:
- /
- /pengurus
- /keuangan
- /pengumuman
- /palugada
- /kontak

Verify:
1. Header logo is readable on desktop and mobile.
2. CGV10 identity remains clear.
3. PALUGADA remains a sub-brand, not the parent brand.
4. No city name appears.
5. No fake data, phone numbers, QR codes, or financial values appear.
6. Navigation remains smooth.
7. No horizontal scroll.
8. Mobile header remains usable.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

After editing:
1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files and QA result.

## Task 17 — Deploy Preview Support

Use the ui-ux-pro-max skill.

Prepare the CGV10 static portal for online deployment preview.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, transaction system, real complaint system, admin dashboard, or real app functionality.

Main goals:

1. Ensure the project is ready to deploy to Netlify or Vercel.
2. Confirm all public routes are build-safe:

   * /
   * /pengurus
   * /keuangan
   * /pengumuman
   * /palugada
   * /kontak
3. Check package.json scripts.
4. Check Next.js config.
5. Check public asset paths.
6. Check metadata and favicon references.
7. Check README deployment instructions.
8. Do not redesign the website.
9. Do not add new features.

Deployment documentation:
Create or update `DEPLOYMENT.md`.

The file should include:

1. Local development command:
   npm run dev

2. Production build command:
   npm.cmd run build

3. Production preview command:
   npm.cmd run start

4. Suggested deploy target:
   Netlify or Vercel

5. Build command for deployment:
   npm run build

6. Output / publish directory guidance for Next.js deployment:
   Use platform default for Next.js unless the hosting provider requires specific configuration.

7. Environment variables:
   None required at this stage.

8. Public prototype notice:
   This project is a static public prototype. It does not include login, database, payment, admin dashboard, real complaint system, real QR, real WA integration, or active PALUGADA transactions.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. If possible, run npm.cmd run start and verify localhost response.
4. Summarize any warnings clearly.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent data, names, financial values, phone numbers, QR codes, or PALUGADA items.

After editing:

1. Summarize changed files.
2. Confirm deployment readiness.
3. Provide recommended manual deployment steps.

## Task 18 — Phase 1 Scope Lock and PALUGADA Priority Campaign

Use the ui-ux-pro-max skill.

Treat this as product-direction refinement, not a reset.

All completed work from Task 1 to Task 17 remains valid and must be preserved.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Strategic direction:
CGV10 should be understood as a phased product roadmap.

Phase 1 is the current focus:
A public resident portal for Cipta Greenville RT 010 / RW 021 with PALUGADA CGV as a priority campaign.

PALUGADA CGV is a priority campaign from the elected RT direction and should be treated as an important early public-facing module.

Main Phase 1 focus:

1. Public resident portal
2. Pengurus information structure
3. Keuangan / kas transparency structure
4. Pengumuman structure
5. Kontak penting structure
6. PALUGADA CGV campaign and catalogue preview
7. Roadmap context for future product evolution

PALUGADA Phase 1 direction:

1. Position PALUGADA CGV as “Marketplace Warga”
2. Present it as a resident promotion / directory space
3. Categories:

   * Barang
   * Kuliner
   * Jasa
   * Properti
   * Lainnya
4. Item card fields:

   * Nama
   * Harga
   * Cluster
   * Tombol WA
5. If official item data is not available, use safe placeholder or clearly marked contoh tampilan.
6. Do not make PALUGADA look like an active transaction system yet.

Roadmap direction:
Keep the full roadmap as future context:

1. Phase 1 — Public portal + PALUGADA campaign
2. Phase 2 — Login warga + profil rumah
3. Phase 3 — Community feed
4. Phase 4 — PALUGADA katalog
5. Phase 5 — Keluhan, lapor RT, security
6. Phase 6 — Group chat basic
7. Phase 7 — Push notification + moderation
8. Phase 8 — Full resident app

Deliverables:

1. Create or update `PHASE_1_SCOPE.md`.
2. Explain current Phase 1 scope versus future roadmap.
3. Explain why PALUGADA is treated as a priority campaign in Phase 1.
4. Recommend which website sections/pages should be refined next.
5. Do not redesign the website yet.
6. Do not implement major UI changes yet.
7. Wait for approval before major implementation changes.

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent names, financial values, phone numbers, QR codes, or active PALUGADA items.

After editing:

1. Run npm.cmd run lint only if code was changed.
2. Run npm.cmd run build only if code was changed.
3. Summarize created documentation and recommended next implementation task.

## Task 19 — Phase 1 Homepage and PALUGADA Campaign Reframing

Use the ui-ux-pro-max skill.

Treat this as product-direction implementation based on Task 18.

All completed work from Task 1 to Task 18 remains valid and must be preserved.

Scope:
Static public prototype only.

Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Strategic direction:
CGV10 is a phased product roadmap.

Current focus:
Phase 1 — Public Resident Portal + PALUGADA CGV Priority Campaign

Main objective:
Refine the existing website copy and narrative so visitors understand that:

1. The current website is Phase 1.
2. Phase 1 focuses on public resident information.
3. PALUGADA CGV is a priority campaign from the RT direction.
4. Future app features will be developed gradually after the public portal foundation is clear.

Tasks:

1. Create `ROADMAP.md` if it does not exist.
2. Document the official 8-phase roadmap:

   * Phase 1 — Public portal + PALUGADA campaign
   * Phase 2 — Login warga + profil rumah
   * Phase 3 — Community feed
   * Phase 4 — PALUGADA katalog
   * Phase 5 — Keluhan, lapor RT, security
   * Phase 6 — Group chat basic
   * Phase 7 — Push notification + moderation
   * Phase 8 — Full resident app
3. Update homepage copy so it clearly frames the current site as Phase 1, not the final full app.
4. Add or refine a concise Phase 1 focus section on the homepage.
5. Strengthen PALUGADA CGV positioning as a priority campaign / marketplace warga.
6. Refine the PALUGADA page so it feels like an important campaign page, not only a placeholder directory.
7. Keep all placeholder warnings honest:

   * no real transaction yet
   * no payment
   * no cart
   * no database
   * no seller account
   * data and WA contacts require pengurus confirmation
8. Keep the design direction from Task 15/16/17/18.
9. Do not redesign from zero.
10. Do not remove existing routes.

Recommended wording direction:

* Use “Phase 1” or “Tahap 1” carefully and clearly.
* Use “Portal Warga Publik” for the current scope.
* Use “PALUGADA CGV — Marketplace Warga” as the priority campaign label.
* Use “Dari warga, untuk warga” if suitable.
* Use “bertahap” and “berkesinambungan” to explain future development.
* Avoid overpromising active app functionality.

Routes to review:

* /
* /palugada

Optional minor updates if needed:

* /pengumuman
* /keuangan
* /kontak

Approved identity:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Do not mention any city name.
Do not invent names, financial values, phone numbers, QR codes, or active PALUGADA items.

After editing:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files, roadmap documentation, and how Phase 1 vs future roadmap is now communicated.

## Task 20 — GitHub Baseline Commit Preparation

Use the ui-ux-pro-max skill.

Prepare the CGV10 project for a clean GitHub baseline commit after Task 19.

Scope:
Repository preparation only.

Do not redesign the website.
Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Context:
The project is now positioned as:
Phase 1 — Public Resident Portal + PALUGADA CGV Priority Campaign.

All completed work from Task 1 to Task 19 remains valid and must be preserved.

Main goals:

1. Check repository cleanliness.
2. Check `.gitignore`.
3. Ensure generated/cache folders are not committed.
4. Ensure important documentation exists and is updated.
5. Ensure README reflects the current Phase 1 direction.
6. Ensure deployment notes remain accurate.
7. Run final lint/build before commit.
8. Recommend exact Git commands for the user to commit and push.

Required documentation to verify:

* README.md
* PROJECT_BRIEF.md
* PHASE_1_SCOPE.md
* ROADMAP.md
* BRAND_SYSTEM.md
* LOGO_PROMPTS.md
* CONTENT_CHECKLIST.md
* DEPLOYMENT.md

If a document is missing, create or update it only if relevant.

Important:
Do not include private data.
Do not include real phone numbers, QR codes, financial values, names, or PALUGADA items unless already officially approved.
Do not mention any city name.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Check `git status`.
4. Summarize changed files.
5. Provide recommended commit message.

Suggested commit message:
phase 1 public portal and palugada campaign baseline

After editing/checking:

1. Summarize repository readiness.
2. Summarize remaining items before public deploy.
3. Provide safe manual GitHub push steps.

## Task 21 — Production QA and Navigation Polish

Use the ui-ux-pro-max skill.

Treat this as production QA after the first successful Netlify deployment.

Current live preview:
https://thriving-bunny-9f4e92.netlify.app/

Scope:
Production polish only.

Do not redesign the website from zero.
Do not change the approved brand direction.
Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Current product direction:
CGV10 Phase 1 — Public Resident Portal + PALUGADA CGV Priority Campaign.

Main goals:

1. Review all public routes for static export compatibility:

   * /
   * /pengurus/
   * /keuangan/
   * /pengumuman/
   * /palugada/
   * /kontak/
2. Ensure internal navigation works correctly on Netlify static export.
3. Ensure all navigation links use static-export-friendly paths.
4. Check whether any navigation item appears duplicated, especially “Kontak”.
5. Remove or fix duplicated navigation if found.
6. Check header behavior on desktop and mobile.
7. Check footer links and identity text.
8. Check PALUGADA page positioning and make sure it still reads as a Phase 1 priority campaign, not an active transaction system.
9. Confirm placeholder warnings remain honest and visible.
10. Confirm no city name is introduced.
11. Confirm no fake phone numbers, QR codes, financial values, names, or active PALUGADA items are introduced.
12. Keep the site visually consistent with the current premium green/cream/gold system.
13. Do not add major new sections unless required to fix clarity.

Static export requirement:
This project is currently deployed as a static export for Netlify.
Keep `output: "export"` in `next.config.ts`.
Keep deployment output compatible with Netlify publish directory `out`.

Documentation:
Create or update `PRODUCTION_QA.md`.

The document should include:

1. Live preview URL.
2. Routes checked.
3. Issues found.
4. Fixes applied.
5. Remaining known limitations.
6. Confirmation that Phase 1 remains static public portal only.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm the `out` folder is generated.
4. Summarize changed files.
5. Provide recommended commit message.

Recommended commit message:
production qa and navigation polish

After completion:

1. Summarize what was fixed.
2. Tell the user if the Netlify deploy should be triggered again.

## Task 22 — Remove Public Roadmap and Strengthen Phase 1 Portal Narrative

Use the ui-ux-pro-max skill.

Treat this as public narrative refinement after Task 21.

All completed work from Task 1 to Task 21 remains valid and must be preserved.

Strategic decision:
The detailed phased product roadmap should not be published on the public website at this stage.

Reason:
The public website should feel like a more focused resident portal and PALUGADA campaign, not a long future product concept.

Scope:
Public website copy and section refinement only.

Do not redesign the website from zero.
Do not remove the internal ROADMAP.md documentation.
Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Main objectives:

1. Remove or hide any public-facing detailed roadmap section from the website.
2. Remove public mentions of detailed future phases such as:

   * Login warga
   * Community feed
   * Group chat
   * Push notification
   * Full resident app
3. Keep ROADMAP.md as internal product planning documentation.
4. Keep PHASE_1_SCOPE.md as internal scope documentation.
5. Strengthen the public narrative around:

   * Portal Warga Publik
   * Informasi resmi warga
   * Pengurus
   * Keuangan / kas transparency structure
   * Pengumuman
   * Kontak penting
   * PALUGADA CGV as priority campaign / marketplace warga
6. Keep PALUGADA CGV as the priority campaign focus.
7. Make the website feel more like a Phase 1 portal ready for review, not a future-app concept.
8. Keep placeholder warnings honest and visible.
9. Do not invent names, financial values, phone numbers, QR codes, or active PALUGADA items.
10. Do not mention any city name.

Recommended public wording direction:
Use:

* “Portal Warga”
* “Tahap awal”
* “Disiapkan bertahap”
* “Kampanye prioritas PALUGADA CGV”
* “Informasi, pengumuman, transparansi, dan direktori warga”

Avoid:

* “8 phase roadmap”
* “full resident app”
* “community feed”
* “group chat”
* “push notification”
* “login warga”
* “future app ecosystem”

Routes to review:

* /
* /palugada/
* /pengurus/
* /keuangan/
* /pengumuman/
* /kontak/

Static export requirement:
Keep `output: "export"` in `next.config.ts`.
Keep deployment output compatible with Netlify publish directory `out`.

Documentation:
Update `PRODUCTION_QA.md` or create a short note that detailed roadmap remains internal and is not shown publicly.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm the `out` folder is generated.
4. Summarize changed files.
5. Provide recommended commit message.

Recommended commit message:
remove public roadmap narrative

## Task 23 — Phase 1 Review Readiness Polish

Use the ui-ux-pro-max skill.

Treat this as public review readiness polish after removing the public roadmap.

Current live preview:
https://thriving-bunny-9f4e92.netlify.app/

Current public direction:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Main objective:
Make the public website feel more ready for pengurus review, while keeping it honest as a Phase 1 public portal.

Scope:
Public website polish only.

Do not redesign the website from zero.
Do not add roadmap section back.
Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Focus areas:

1. Review homepage clarity after roadmap removal.
2. Make the website feel like a resident portal, not a product concept.
3. Strengthen PALUGADA CGV as the priority campaign.
4. Improve empty states and placeholder messages so they look professional, not unfinished.
5. Replace rough placeholder wording with polished public-safe wording such as:

   * “Data resmi dalam proses konfirmasi pengurus”
   * “Informasi akan diperbarui setelah validasi”
   * “Kontak resmi menunggu persetujuan publikasi”
6. Keep transparency that data is not final yet.
7. Do not invent names, phone numbers, financial values, QR codes, PALUGADA items, or seller data.
8. Keep all routes:

   * /
   * /pengurus/
   * /keuangan/
   * /pengumuman/
   * /palugada/
   * /kontak/
9. Check mobile readability.
10. Check CTA wording so it feels suitable for pengurus/warga review.
11. Keep premium green/cream/gold civic visual style.
12. Keep PALUGADA page as campaign priority, but do not make it look like active transaction system.

Documentation:
Create or update `PENGURUS_REVIEW_CHECKLIST.md`.

The checklist should include the official data still needed before wider public sharing:

1. Approved pengurus names and roles.
2. Approved financial summary format.
3. Approved announcement categories.
4. Approved official contact numbers.
5. Approved QR codes if needed.
6. PALUGADA seller/item submission rules.
7. PALUGADA item approval flow.
8. Public launch approval from pengurus.

Static export requirement:
Keep `output: "export"` in `next.config.ts`.
Keep deployment output compatible with Netlify publish directory `out`.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm the `out` folder is generated.
4. Summarize changed files.
5. Provide recommended commit message.

Recommended commit message:
polish phase 1 review readiness
## Task 24 — Presentation Demo Content and Premium Polish

Use the ui-ux-pro-max skill.

Treat this as urgent presentation-readiness polish for pengurus review.

Current live preview:
https://thriving-bunny-9f4e92.netlify.app/

Current public direction:
CGV10 — Portal Digital Warga
Cipta Greenville • RT 010 / RW 021

Main objective:
Make the website feel more premium, complete, and ready to present to pengurus, while clearly marking non-official data as example/demo content.

Scope:
Static public presentation preview only.

Do not redesign the website from zero.
Do not add roadmap back.
Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Important presentation rule:
The website may use example/demo content for presentation clarity, but it must be clearly labeled as:

* Contoh tampilan
* Data simulasi untuk review
* Format demo
* Data resmi menunggu konfirmasi pengurus

Do not present demo content as official final data.

Focus areas:

1. Make the homepage feel more premium and review-ready.
2. Strengthen the hero section so it feels like a real resident portal preview.
3. Improve quick info cards so they feel useful, not empty.
4. Add refined demo examples where helpful, clearly labeled as “Contoh tampilan” or “Data simulasi untuk review”.
5. Improve Pengurus page:

   * Keep Doddy Dharma as Ketua RT profile.
   * Keep profile photo larger and premium.
   * Keep hover zoom effect on profile photo.
   * Other roles may remain “menunggu konfirmasi”, but should look polished.
6. Improve Keuangan page:

   * Show a professional demo format for financial transparency.
   * If using sample values, label clearly as “Simulasi format — bukan data kas resmi”.
   * Do not make sample financial values look official.
7. Improve Pengumuman page:

   * Add polished example announcement cards.
   * Label them as contoh pengumuman / simulasi konten.
8. Improve PALUGADA page:

   * Make PALUGADA feel like a priority campaign.
   * Add refined example item cards if useful.
   * Label all items clearly as contoh tampilan.
   * Do not make it look like active transaction system.
   * No real checkout, payment, cart, seller account, or active WA transaction.
9. Improve Kontak page:

   * Keep official contacts pending if not approved.
   * Do not invent phone numbers.
   * Make the pending contact state look intentional and professional.
10. Improve spacing, hierarchy, card polish, and visual consistency where needed.
11. Check mobile presentation quality.
12. Keep premium green/cream/gold civic visual style.

Allowed demo examples:

* Example announcement titles
* Example PALUGADA item categories
* Example financial table format
* Example contact approval state
* Example public information layout

Not allowed:

* Fake official phone numbers
* Fake QR codes
* Fake confirmed pengurus names besides approved Ketua RT data
* Fake active transactions
* Fake official financial claims without “simulasi” label
* City names
* Public roadmap section

Static export requirement:
Keep `output: "export"` in `next.config.ts`.
Keep deployment output compatible with Netlify publish directory `out`.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm the `out` folder is generated.
4. Summarize changed files.
5. Provide recommended commit message.

Recommended commit message:
polish presentation demo content

## Task 25 — Replace Placeholder Feel with Presentation Demo Mode

Use the ui-ux-pro-max skill.

Treat this as urgent presentation polish for pengurus review.

Current live preview:
https://thriving-bunny-9f4e92.netlify.app/

Main objective:
Reduce the “empty placeholder” feeling and make the website feel like a polished presentation demo for pengurus review.

Scope:
Static public presentation preview only.

Do not redesign the website from zero.
Do not add roadmap back.
Do not build login, auth, database, backend, API routes, payment, checkout, cart, transaction system, real complaint system, admin dashboard, group chat, push notification, or real app functionality.

Strategic direction:
Use “Mode Tinjauan Pengurus” as the public framing.
The site may show demo/example content for presentation clarity, but all non-official content must be clearly labeled as simulation or example.

Important wording rule:
Do not use the word “dummy” on the website.

Use:

* Mode Tinjauan Pengurus
* Contoh tampilan
* Simulasi format
* Data simulasi untuk review
* Bukan data resmi
* Menunggu persetujuan publikasi

Avoid overusing:

* Placeholder
* Belum tersedia
* Menunggu validasi
* Kosong
* Data belum ada

Homepage:

1. Make the hero feel more confident and presentation-ready.
2. Replace overly weak placeholder wording with “Mode Tinjauan Pengurus”.
3. Keep a clear note that some data is simulation for review.
4. Keep CTA buttons focused on:

   * Tinjau struktur pengurus
   * Buka PALUGADA CGV
5. Make quick info cards feel more useful with demo-style states, not empty states.

Pengurus page:

1. Keep Doddy Dharma as Ketua RT.
2. Keep the larger profile photo and hover zoom effect.
3. Keep other roles pending, but make them look like structured approval cards, not empty cards.
4. Do not invent additional pengurus names.

Keuangan page:

1. Add a professional financial transparency demo.
2. Use sample values only if clearly labeled as:
   “Simulasi format — bukan data kas resmi.”
3. Suggested example values:

   * Saldo awal: Rp 8.500.000
   * Pemasukan: Rp 20.250.000
   * Pengeluaran: Rp 5.750.000
   * Saldo akhir: Rp 23.000.000
4. Add a visible note that all numbers are sample format for review only.
5. Do not present these numbers as official RT cash data.

Pengumuman page:

1. Add polished example announcement cards.
2. Label them as “Contoh pengumuman”.
3. Suggested example content:

   * Jadwal kerja bakti lingkungan
   * Pendataan warga dan kendaraan
   * Informasi keamanan lingkungan
   * Pengingat administrasi warga
4. Avoid exact official dates unless labeled as example.

PALUGADA page:

1. Make PALUGADA feel more like a priority campaign.
2. Add refined example item cards under categories.
3. Label all items as “Contoh tampilan”.
4. Suggested example items:

   * Donat kentang warga — Kuliner
   * Jasa laundry kiloan — Jasa
   * Tanaman hias rumah — Barang
   * Info properti warga — Properti
5. If using prices, label as example price or use “Harga contoh”.
6. Do not activate real WA links.
7. Do not add cart, checkout, payment, seller account, or transaction flow.

Kontak page:

1. Do not invent phone numbers.
2. Keep QR/contact as approval state.
3. Make cards feel intentional:

   * Kontak resmi menunggu persetujuan publikasi
   * QR akan ditampilkan setelah disetujui pengurus

Visual polish:

1. Reduce repetitive warning boxes.
2. Use one strong “Mode Tinjauan Pengurus” notice per page where needed.
3. Improve hierarchy, spacing, card density, and readability.
4. Keep premium green/cream/gold civic visual style.
5. Check desktop and mobile presentation quality.

Static export requirement:
Keep `output: "export"` in `next.config.ts`.
Keep deployment output compatible with Netlify publish directory `out`.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Confirm the `out` folder is generated.
4. Summarize changed files.
5. Provide recommended commit message.

Recommended commit message:
upgrade presentation demo content

## Task 26 — PALUGADA Visual Campaign Enrichment

Use the ui-ux-pro-max skill.

Focus only on the PALUGADA page.

Goal:
Make PALUGADA CGV feel more alive, visual, premium, and presentation-ready for pengurus review.

Current issue:
The page is clean but still feels too generic and text-heavy.

Scope:
Static public demo only.

Do not redesign the whole website.
Do not change other pages unless required for shared components.
Do not add roadmap back.
Do not build backend, login, database, payment, checkout, cart, seller account, active WhatsApp transaction, or real marketplace functionality.

Improve the PALUGADA page:

1. Add stronger visual storytelling.
2. Make PALUGADA feel like a priority campaign, not just a text directory.
3. Add a more engaging campaign hero or visual preview area.
4. Add richer category cards with icons, short descriptions, and better visual hierarchy.
5. Add featured example listing cards with more visual treatment.
6. Use tasteful visual placeholders, illustration-style product blocks, or premium icon cards if real product images are not available.
7. Add 4–6 example listings:

   * Donat Kentang Warga — Kuliner — Cluster Greenwich — Harga contoh: Rp 35.000
   * Jasa Laundry Kiloan — Jasa — Cluster Oxford — Harga sesuai berat cucian
   * Tanaman Hias Rumah — Barang — Cluster Windsor — Harga contoh: Rp 25.000
   * Info Properti Warga — Properti — Cluster Cambridge — Informasi menyusul
   * Catering Rumahan — Kuliner — Cluster Chelsea — Harga menu saat rilis
   * Jasa Servis AC — Jasa — Cluster Somerset — Harga menunggu konfirmasi
8. Every listing must be clearly labeled as “Contoh tampilan”.
9. WhatsApp buttons must remain inactive and clearly labeled for demo only.
10. Keep the page honest: no real transaction, no payment, no cart, no seller account, no active WA.
11. Keep premium green, cream, and warm gold visual system.
12. Improve spacing, rhythm, card hierarchy, and mobile readability.

Static export:
Keep Next.js static export compatible with Netlify publish directory `out`.

Quality checks:

1. Run npm.cmd run lint.
2. Run npm.cmd run build.
3. Summarize changed files.
4. Recommended commit message: enrich palugada visual campaign
