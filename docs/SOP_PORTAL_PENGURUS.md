# SOP Portal CGV10 untuk Pengurus

Dokumen ini menjadi panduan operasional Portal Warga CGV10 untuk pengurus RT, sekretariat, bendahara, dan admin portal. Gunakan dokumen ini sebagai acuan saat membuat akun, menerima pendaftaran warga, memverifikasi iuran, mengelola layanan, dan menerbitkan konten.

## 1. Prinsip Operasional

- Portal publik boleh dibuka umum untuk informasi warga, kabar, pengurus, layanan, keuangan ringkas, dan katalog PALUGADA.
- Aksi yang mengirim data warga wajib melalui login, termasuk pengajuan layanan, konfirmasi iuran, dan pendaftaran PALUGADA.
- Data resmi warga, iuran, dan publikasi tidak langsung aktif sebelum diverifikasi pengurus.
- Admin hanya diberi akses sesuai peran. Jangan memakai akun bersama untuk operasional rutin.
- Bukti pembayaran, data rumah, nomor kontak, dan catatan internal hanya boleh dilihat oleh pengurus yang berwenang.

## 2. Akses dan Login

### 2.1 Portal Warga

Alamat utama:

- Portal warga: `/`
- Login warga/pengurus: `/masuk`
- Admin produksi: `/admin`
- Login admin langsung: `/admin/login`

Warga dan pengurus memakai sistem login yang sama. Setelah login, akun dengan role pengurus akan melihat akses admin.

Di HP atau PWA, admin dashboard dibuka lewat:

- buka halaman `/masuk`
- login memakai akun pengurus
- tekan tombol `Buka admin`

Jika tidak ada address bar di PWA, pengurus dapat membuka portal dari browser biasa lalu masuk ke `https://portalwargacgv.id/masuk` atau simpan shortcut khusus admin setelah halaman `/admin` terbuka.

### 2.2 Role Admin

Role yang digunakan:

| Jabatan | Role sistem | Akses utama |
| --- | --- | --- |
| Super Admin | `super_admin` | Semua modul, termasuk user, role, audit, pengaturan, konten, layanan, iuran, dan PALUGADA |
| Ketua RT | `ketua_rt` | Monitoring warga, layanan, approval konten, PALUGADA, baca iuran, verifikasi iuran |
| Sekretaris | `sekretaris` | Data warga, layanan, konten, baca iuran |
| Bendahara | `bendahara` | Iuran, pembayaran, keuangan, baca data warga dan layanan |
| Reviewer PALUGADA | `palugada_reviewer` | Review dan moderasi PALUGADA |
| Warga | `warga` | Akses warga setelah login dan verifikasi |

Email trial pengurus yang sudah disiapkan di migration:

| Jabatan | Email | Role sistem |
| --- | --- | --- |
| Ketua RT | `dharma.doddy9@yahoo.co.uk` | `ketua_rt` |
| Sekretaris | `Zulhendy@gmail.com` | `sekretaris` |
| Bendahara | Menunggu email resmi | `bendahara` |

## 3. Registrasi Admin Pengurus

Registrasi admin dilakukan oleh Super Admin atau pengelola database.

### 3.1 Buat User Auth

1. Buka Supabase Dashboard.
2. Masuk ke `Authentication` -> `Users`.
3. Pilih `Invite user` atau `Add user`.
4. Masukkan email pengurus.
5. Jika memakai `Invite user`, minta pengurus membuka email undangan dan membuat password sendiri.
6. Jika memakai `Add user`, gunakan password sementara lalu minta pengurus mengganti password.

### 3.2 Pastikan Profile Aktif

User baru biasanya otomatis dibuatkan profile oleh trigger database. Jika profile belum muncul, buat atau aktifkan profile dari SQL Editor.

```sql
insert into public.profiles (id, display_name, email, status)
select id, coalesce(raw_user_meta_data->>'display_name', email), email, 'active'
from auth.users
where lower(email) = lower('email-pengurus@example.com')
on conflict (id) do update
set email = excluded.email,
    status = 'active',
    updated_at = now();
```

### 3.3 Assign Role Pengurus

Ganti email di bawah sesuai pengurus yang akan dibuat.

```sql
with target(email, role) as (
  values
    ('email-ketua@example.com', 'ketua_rt'),
    ('email-sekretaris@example.com', 'sekretaris'),
    ('email-bendahara@example.com', 'bendahara')
)
insert into public.user_roles (user_id, role, assigned_by)
select p.id, target.role::public.app_role, null
from target
join public.profiles p on lower(p.email::text) = lower(target.email)
on conflict (user_id, role) do nothing;
```

Setelah role masuk, minta pengurus login ke `/masuk` atau `/admin/login`. Jika akses admin belum muncul, cek kembali:

- Email sudah terdaftar di Supabase Auth.
- `public.profiles.status` bernilai `active`.
- Role sudah masuk di `public.user_roles`.
- Browser tidak memakai session lama. Coba logout lalu login ulang.

## 4. SOP Registrasi Warga

### 4.1 Tujuan

Registrasi warga digunakan untuk membuat data rumah dan akun warga yang bisa dipakai untuk layanan, iuran, profil rumah, dan PALUGADA.

### 4.2 Alur Warga

1. Warga membuka Portal CGV10.
2. Warga login atau membuat akun sesuai arahan pengurus.
3. Warga membuka formulir pendaftaran atau update data warga.
4. Warga mengisi nama, nomor rumah, cluster/blok, kontak WhatsApp, dan data pendukung.
5. Warga mengirim data.
6. Sistem mencatat pengajuan sebagai data yang perlu diverifikasi.

### 4.3 Alur Pengurus

1. Sekretaris atau pengurus membuka Admin Dashboard.
2. Buka modul data warga atau intake layanan.
3. Cocokkan data warga dengan catatan RT, nomor rumah, dan kontak.
4. Jika valid, lengkapi atau buat data `households`.
5. Hubungkan akun warga ke rumah bila sudah tersedia.
6. Assign role `warga` ke akun tersebut.
7. Ubah status rumah menjadi `verified`.
8. Beri tahu warga bahwa akun sudah aktif.

### 4.4 Aturan Verifikasi

- Jangan set warga sebagai valid jika nomor rumah, cluster, atau kontak belum jelas.
- Jika ada data ganda, tahan dulu dan minta klarifikasi.
- Jika penghuni pindah, jangan hapus riwayat. Ubah status hunian menjadi pindah atau tidak aktif sesuai kebutuhan data.
- Data warga resmi hanya boleh diubah oleh role yang punya wewenang data warga.

## 5. SOP Layanan Warga

1. Warga login.
2. Warga membuka menu Layanan.
3. Warga memilih kategori layanan: administrasi, pengaduan, keamanan, iuran, aspirasi, PALUGADA, atau lainnya.
4. Warga mengisi detail dan lampiran bila diperlukan.
5. Admin intake meninjau permintaan masuk.
6. Pengurus menetapkan PIC atau tindak lanjut.
7. Status layanan diperbarui sesuai proses internal.
8. Jika layanan selesai, admin menutup permintaan dan menyimpan catatan penyelesaian.

Untuk warga yang belum login, portal hanya mengarahkan ke halaman masuk. Data layanan tidak boleh dikirim anonim.

## 5A. SOP Kontak Pengurus

Nomor pribadi pengurus tidak ditampilkan untuk publik. Nomor hanya muncul di halaman Kontak setelah warga login dan akunnya memiliki role `warga` atau role admin pengurus.

Kontak privat pengurus inti:

| Jabatan | Nama | Nomor |
| --- | --- | --- |
| Ketua RT | Doddy Dharma | `+62 813-1567-1999` |
| Sekretaris | Zulhendy Masruddin | `+62 813-7541-0997` |
| Bendahara | Niko Diponako | `+62 812-6610-3715` |

Jika warga sudah login tetapi nomor belum muncul, cek apakah akun tersebut sudah diberi role `warga` di `public.user_roles`.

## 6. SOP Iuran

### 6.1 Alur Konfirmasi Warga

1. Warga login.
2. Warga membuka menu Keuangan.
3. Warga memilih `Konfirmasi iuran`.
4. Warga mengisi periode iuran, nominal, tanggal bayar, metode bayar, nomor referensi, dan bukti pembayaran.
5. Sistem menyimpan data sebagai pembayaran dengan status `pending`.
6. Bendahara membuka Admin Dashboard -> Iuran.
7. Bendahara mencocokkan bukti pembayaran dengan mutasi rekening atau bukti kas.
8. Jika valid, bendahara menandai pembayaran sebagai terverifikasi.
9. Jika tidak valid, bendahara menolak atau meminta klarifikasi.

### 6.2 Status Saat Ini di Sistem

Fondasi database iuran sudah tersedia:

- `billing_periods` untuk periode iuran.
- `household_charges` untuk tagihan per rumah.
- `payments` untuk pembayaran masuk.
- `payment_allocations` untuk alokasi pembayaran ke tagihan.
- `billing_dashboard_summary` untuk ringkasan tagihan dan pembayaran.

Setelah migration approval iuran diterapkan di Supabase:

- Konfirmasi iuran warga masuk ke `payments` dengan status `pending`.
- Bendahara atau Ketua RT dengan izin `billing:verify` dapat menekan `Setujui & posting kas`.
- Sistem mengubah pembayaran menjadi `verified`.
- Sistem membuat atau memakai periode iuran yang sesuai.
- Sistem membuat atau memakai tagihan rumah untuk periode tersebut.
- Sistem membuat `payment_allocations`, yaitu pencocokan nominal pembayaran ke tagihan rumah/periode.
- Sistem membuat transaksi kas masuk di `finance_transactions`.

Catatan: ringkasan keuangan publik di halaman portal masih perlu disambungkan ke ledger database jika ingin sepenuhnya real-time. Saat ini fitur approval sudah membuat transaksi database, tetapi tampilan publik lama masih memakai data statis sampai modul publiknya diarahkan ke database.

### 6.3 Mekanisme Otomatis Approval

Saat tombol approval iuran dijalankan, sistem menjalankan proses berikut:

1. Update `payments.verification_status` menjadi `verified`.
2. Isi `verified_by` dan `verified_at`.
3. Buat atau pilih `payment_allocations` ke tagihan rumah/periode yang sesuai.
4. Refresh status tagihan menjadi `paid` atau `partial`.
5. Buat transaksi kas masuk di `finance_transactions` dengan kategori iuran.
6. Tandai transaksi tersebut sebagai sumber laporan publik bila sudah boleh ditampilkan.
7. Catat audit log agar siapa yang menyetujui pembayaran bisa dilacak.

Dengan pola ini, bendahara cukup klik approve sekali. Sistem otomatis memperbarui status iuran dan laporan keuangan.

## 7. SOP PALUGADA

1. Warga login.
2. Warga membuka PALUGADA dan memilih daftar lapak.
3. Warga mengisi nama usaha, kategori, kontak, deskripsi, dan media.
4. Data masuk sebagai draft atau submitted.
5. Reviewer PALUGADA/pengurus memeriksa kelayakan data, kontak, dan media.
6. Jika valid, status diubah menjadi approved.
7. Lampiran yang disetujui ditampilkan publik.
8. Jika tidak valid, lapak ditolak atau dikembalikan untuk revisi.

Katalog PALUGADA boleh terbuka umum, tetapi pendaftaran lapak wajib login.

## 8. SOP Konten Portal

1. Admin konten membuat draft pengumuman, kabar warga, atau artikel.
2. Periksa judul, isi, tanggal, gambar/video, dan kategori.
3. Jika konten sensitif, minta persetujuan Ketua RT.
4. Role dengan izin approval menerbitkan konten.
5. Setelah tayang, cek tampilan di desktop dan mobile.
6. Jika ada koreksi, update konten lalu verifikasi ulang.

Konten yang menyangkut keuangan, data warga, atau keputusan resmi sebaiknya tidak diterbitkan tanpa review pengurus inti.

## 9. SOP Upload Gambar dan Video

Untuk saat ini, file besar masih berisiko membebani portal. Rekomendasi operasional:

- Gambar kegiatan sebaiknya dikompres sebelum masuk portal.
- Video besar sebaiknya dikompres atau dipindahkan ke platform/video storage yang sesuai.
- File bukti pembayaran tetap disimpan private dan hanya bisa dibuka pengurus berwenang.

Target fitur berikutnya adalah kompres otomatis saat upload, terutama untuk admin yang tidak familiar dengan tools teknis.

## 10. Checklist Harian Pengurus

- Cek layanan masuk.
- Cek konfirmasi iuran pending.
- Cek pendaftaran/update warga.
- Cek draft PALUGADA baru.
- Cek konten yang perlu review.
- Pastikan tidak ada data sensitif tampil publik.

## 11. Checklist Bulanan

- Buat atau cek periode iuran.
- Rekonsiliasi pembayaran dengan mutasi rekening/kas.
- Tutup pembayaran yang sudah diverifikasi.
- Review tunggakan.
- Update ringkasan kas publik.
- Backup/export data penting bila diperlukan.
- Review akun admin yang masih aktif.

## 12. Catatan Implementasi Lanjutan

Fitur yang sebaiknya diprioritaskan berikutnya:

- Halaman Super Admin untuk kelola user dan role tanpa SQL.
- Menghubungkan ringkasan keuangan publik ke ledger database real-time.
- Alur registrasi warga yang lebih formal: daftar, review, approve, assign rumah, assign role warga.
- Kompres otomatis gambar dan video saat upload.
- Audit log untuk aksi admin penting.
