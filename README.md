# CGV10 — Portal Digital Warga
**Cipta Greenville • RT 010 / RW 021**

Portal digital terintegrasi untuk warga dan pengurus lingkungan Cipta Greenville, menghadirkan transparansi keuangan, layanan mandiri warga, konfirmasi iuran terotomatisasi, direktori UMKM PALUGADA, kabar warga dengan galeri multimedia, dan Progressive Web App (PWA) modern.

---

## 📚 Panduan Pengguna & SOP
- 📖 [Panduan Pengguna Lengkap (User Manual Guide)](file:///c:/Users/lenovo/Desktop/cgv10/USER_MANUAL.md) — Panduan bergambar untuk warga & pengurus RT.
- 📋 [SOP Operasional Pengurus Portal](file:///c:/Users/lenovo/Desktop/cgv10/docs/SOP_PORTAL_PENGURUS.md) — Prosedur standar operasional pengurus, verifikasi iuran, pendaftaran warga, dan kurasi konten.
- ⚙️ [Panduan Setup Supabase Database](file:///c:/Users/lenovo/Desktop/cgv10/SUPABASE_SETUP.md) — Skema database, migrations, Row-Level Security (RLS), dan trigger otomatis.

---

## 🌐 Struktur Navigasi & Rute

### Halaman Publik
- `/` — Beranda dengan Hero Slideshow dinamis, Berita Terkini, Ringkasan Kas, dan Akses Cepat
- `/pengumuman` & `/kabar-warga` — Portal berita warga, agenda kegiatan, galeri multi-foto & pemutar video
- `/keuangan` — Laporan transparansi kas RT, penerimaan iuran, dan alokasi anggaran
- `/palugada` — Direktori etalase UMKM & usaha warga Cipta Greenville
- `/pengurus` — Struktur kepengurusan resmi RT 010 / RW 021
- `/kontak` — Kontak darurat lingkungan & kontak privat pengurus (setelah verifikasi)

### Portal Warga & Akun
- `/masuk` — Autentikasi Magic Link email & password
- `/portal` — Dashboard layanan mandiri warga & status hunian
- `/portal/profil-rumah` — Profil hunian, upload avatar mandiri, anggota keluarga & riwayat iuran
- `/layanan` — Pengajuan surat pengantar, pengaduan lingkungan, keamanan & aspirasi

### Admin Dashboard (Pengurus)
- `/admin` — Pusat kendali pengurus RT dengan statistik operasional
- `/admin/warga` — Verifikasi pendaftaran warga baru & master data rumah tangga (`households`)
- `/admin/iuran` — Verifikasi bukti transfer iuran, auto-posting kas keuangan & multi-bulan billing
- `/admin/intake` — Manajemen disposisi & tracking status tiket layanan warga
- `/admin/portal-posts` — Manajemen konten kabar warga, galeri foto & video
- `/admin/palugada` — Kurasi & persetujuan lapak UMKM warga
- `/admin/pengaturan` — Konfigurasi banner hero slideshow, edit display name, dan manajemen peran admin

---

## 🚀 Pengembangan Lokal (Local Development)

```bash
# Jalankan server pengembangan
npm run dev
```

Buka `http://localhost:3000` di browser Anda.

### Uji Kualitas & Build

```bash
# Pemeriksaan linting
npm run lint

# Build bundle produksi
npm run build
```

---

## 🛠️ Stack Teknologi
- **Framework**: Next.js (App Router) & React
- **Styling**: Tailwind CSS & Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Row-Level Security)
- **PWA**: Progressive Web App dengan manifest & offline service worker support
- **Hosting / Deploy**: Vercel / Netlify

