# Audit Teks Portal CGV10

Tanggal audit: 19 Juli 2026

Dokumen ini mengaudit copy publik Portal Warga CGV10 dan memberi proposal arah perubahan agar bahasanya lebih manusiawi, hangat, sesekali ringan, tetapi tetap rapi untuk konteks RT, data warga, iuran, dan layanan lingkungan.

## Ringkasan

Teks portal sudah informatif dan cukup aman secara struktur, tetapi banyak bagian terasa terlalu "rapi mesin": kalimat panjang, kata kerja pasif, frasa generik, dan pengulangan ide seperti "sebagai bentuk", "menjadi bagian", "dapat membantu", "terus berkembang", "informasi ... yang jelas". Efeknya portal terasa seperti brosur formal, bukan suara lingkungan yang ditulis oleh orang yang tinggal di sana.

Target perubahan:

- Lebih dekat: terasa seperti pengurus berbicara ke tetangga sendiri.
- Lebih spesifik: kurangi kalimat umum, ganti dengan detail yang bisa dibayangkan warga.
- Lebih ringan: sisipkan humor kecil di area non-sensitif seperti PALUGADA, kabar, dan empty state.
- Tetap aman: iuran, privasi, layanan darurat, dan kontak pribadi tetap tenang, jelas, dan tidak bercanda berlebihan.
- Lebih singkat: hero, kartu, dan microcopy harus cepat dipahami di layar HP.

## Voice Baru

Suara yang disarankan:

> "Pengurus yang sigap, tetangga yang ramah, dan portal yang tidak sok resmi."

Karakter bahasa:

- Pakai "warga" dan "pengurus" secara natural.
- Pakai kalimat aktif: "Kirim laporan" bukan "Laporan dapat dikirim".
- Gunakan kata sehari-hari yang tetap sopan: "cek", "pilih", "kirim", "catat", "bantu".
- Hindari bahasa terlalu institusional kecuali di dokumen resmi.
- Humor boleh kecil dan kontekstual, misalnya "biar tidak tenggelam di grup", "tidak perlu scroll chat sampai jempol pegal".

Contoh tone:

- Formal kaku: "Warga dapat mengirim konfirmasi iuran dengan nama, cluster, nomor WhatsApp, periode, nominal, dan bukti pembayaran."
- Humanis: "Bayar iuran? Kirim datanya di sini. Nama, rumah, periode, nominal, dan bukti bayar cukup sekali, biar bendahara tidak perlu tebak-tebakan."

## Prinsip Copy

1. Satu kalimat, satu tugas.
2. CTA harus mulai dengan kata kerja: "Ajukan", "Cek", "Lihat", "Kirim", "Daftarkan".
3. Kartu ringkasan tidak perlu terdengar seperti laporan. Buat ringkas dan jelas.
4. Untuk form, jelaskan kenapa field diminta.
5. Untuk status/error, jawab tiga hal: apa yang terjadi, kenapa mungkin terjadi, apa langkah berikutnya.
6. Untuk artikel, gunakan detail konkret, bukan pujian umum berulang.
7. Hindari kata "dapat" kalau tidak perlu.
8. Hindari "sebagai bentuk" kecuali benar-benar dokumen resmi.

## Frasa Yang Perlu Dikurangi

| Pola Saat Ini | Masalah | Pengganti |
| --- | --- | --- |
| "dapat menjadi" | Terasa generik dan tidak tegas | "bisa dipakai untuk", "jadi", "membantu" |
| "sebagai bentuk" | Terlalu surat resmi | "untuk", "supaya", "biar" |
| "terus berkembang" | Terlalu sering dan tidak spesifik | sebut detail: "jalan makin rapi", "kabar makin mudah dicari" |
| "informasi ... yang jelas" | Aman tapi datar | "warga tahu harus hubungi siapa" |
| "alur yang jelas" | Berulang di banyak halaman | "masuk ke meja pengurus yang tepat" |
| "terhubung" | Bisa terasa teknis | "nyambung", "masuk ke catatan", "tidak tercecer" |
| "resmi" | Terlalu sering | gunakan hanya untuk struktur RT, laporan, dan kebijakan |
| "Portal Digital Warga" | Terasa produk SaaS | kombinasikan dengan "rumah info warga" atau "pintu masuk warga" |

## Audit Per Area

### 1. Beranda

File utama:

- `app/page.tsx`
- `lib/portal-data.ts`

Masalah:

- Hero sudah jelas, tetapi masih terasa seperti landing page generik.
- "Temukan pengumuman, layanan, kegiatan, informasi keuangan..." informatif, tetapi belum punya rasa warga.
- "Portal aktif untuk" dan "Ritme Warga" cukup baik, namun bisa dibuat lebih hangat.
- Kartu "Akses Utama Warga" masih terasa administratif.

Proposal:

- Jadikan beranda sebagai "pintu masuk warga", bukan "produk digital".
- Tambahkan rasa lokal: grup warga, info iuran, kabar lingkungan, lapak tetangga.
- CTA utama bisa lebih manusiawi.

Contoh perubahan:

| Saat Ini | Usulan |
| --- | --- |
| Portal Digital Warga CGV10 | Portal Warga CGV10 |
| Temukan pengumuman, layanan, kegiatan, informasi keuangan, dan PALUGADA CGV dalam satu tempat. | Kabar lingkungan, layanan warga, kas RT, sampai lapak tetangga dikumpulkan di sini, biar tidak tercecer di chat. |
| Buka Layanan Warga | Ajukan Layanan |
| Lihat Kabar Warga | Cek Kabar Terbaru |
| Empat pintu utama untuk kebutuhan lingkungan. | Mau urus apa hari ini? Pilih pintunya di sini. |
| Pilihan dibuat ringkas agar pengurus dan warga bisa langsung menuju area yang dibutuhkan. | Dibuat pendek saja: warga cepat ketemu tujuan, pengurus juga tidak perlu tanya ulang dari awal. |

Prioritas: tinggi.

### 2. Portal Warga App Shell

File utama:

- `app/portal/page.tsx`
- `app/portal/admin-dashboard-shortcut.tsx`
- `app/portal/profil-rumah/page.tsx`

Masalah:

- Sudah lebih ringkas dari beranda, tetapi masih ada frasa "akses", "kebutuhan", "lebih mudah dijangkau" yang generik.
- "Pilihan lainnya" terasa placeholder.
- Profil rumah masih banyak memakai kata "prototipe", cocok untuk internal tapi kurang nyaman untuk warga.

Proposal:

- Gunakan bahasa utilitarian yang cepat: "Layanan", "Iuran", "Kabar", "Lapak Warga".
- Untuk fitur belum aktif, jangan terlalu teknis. Jelaskan dengan bahasa aman.

Contoh perubahan:

| Saat Ini | Usulan |
| --- | --- |
| Semua kebutuhan warga, lebih mudah dijangkau. | Yang sering dicari warga, taruh di depan. |
| Buka layanan, kabar, keuangan, dan PALUGADA dari satu tempat. | Urus layanan, cek iuran, baca kabar, atau cari lapak warga tanpa muter-muter. |
| Akses lainnya | Lainnya yang juga penting |
| Pilihan lainnya | Jalur cepat lain |
| Profil Rumah - Prototipe Fase Berikutnya | Profil Rumah Warga |
| Belum menjadi layanan aktif untuk warga. | Belum dibuka untuk umum. Kami rapikan dulu datanya. |

Prioritas: sedang.

### 3. Layanan Warga

File utama:

- `app/layanan/page.tsx`
- `app/layanan/service-request-form.tsx`

Masalah:

- Halaman layanan memakai tone yang cukup serius, cocok untuk laporan warga.
- Namun banyak kalimat masih pasif dan formal: "ditata sebagai pintu bantuan", "masuk ke alur yang jelas".
- Form summary terasa seperti template WhatsApp formal.
- Beberapa label bagus, tetapi helper bisa lebih konkret.

Proposal:

- Buat hero lebih praktis: "Ada yang perlu dibantu? Mulai dari sini."
- Field form diberi microcopy yang mengurangi ragu.
- Setelah submit, pesan sukses lebih hangat.

Contoh perubahan:

| Saat Ini | Usulan |
| --- | --- |
| Layanan warga yang rapi, jelas, dan mudah diakses. | Ada yang perlu dibantu? Mulai dari sini. |
| Layanan CGV10 ditata sebagai pintu bantuan warga... | Pilih jenis kebutuhan, tulis ceritanya singkat, lalu pengurus bisa menindaklanjuti dari catatan yang sama. |
| Ajukan Keluhan | Laporkan Kendala |
| Pendaftaran / Update Data | Update Data Warga |
| Judul kebutuhan | Judul singkat |
| Tulis lokasi, kronologi, atau informasi yang perlu diketahui pengurus. | Tulis lokasi, jam kejadian, atau detail penting. Tidak perlu panjang, yang penting jelas. |
| Permintaan sudah diterima. Nomor laporan... | Laporan masuk. Simpan nomor ini kalau nanti perlu tanya progres. |

Humor ringan yang aman:

- "Lampu padam, saluran mampet, atau hal lain yang bikin dahi berkerut, tulis di sini."
- Jangan dipakai untuk kategori keamanan darurat.

Prioritas: tinggi.

### 4. Kabar Warga dan Artikel

File utama:

- `app/kabar-warga/page.tsx`
- `app/kabar-warga/[slug]/page.tsx`
- `lib/portal-data.ts`

Masalah:

- Ini sumber utama rasa "AI language".
- Artikel lingkungan dan sedekah Jumat punya banyak paragraf yang memuji secara umum.
- Pola "lingkungan yang nyaman, tertata, dan..." berulang.
- Judul beberapa artikel panjang dan terasa SEO-heavy.
- Kalimat terasa seperti press release, bukan catatan warga.

Proposal:

- Ubah artikel menjadi gaya "catatan warga": pendek, konkret, ada detail visual.
- Gunakan subjudul yang berbunyi alami.
- Pangkas paragraf pujian umum.
- Sisipkan kalimat manusiawi yang tidak berlebihan.

Contoh perubahan artikel lingkungan:

| Saat Ini | Usulan |
| --- | --- |
| Wajah Lingkungan Cipta Green Ville: Hunian Modern, Rapi, dan Terus Bertumbuh | Wajah CGV Hari Ini: Rapi, Terang, dan Makin Enak Dilihat |
| Cipta Green Ville terus berkembang sebagai kawasan hunian modern yang nyaman, tertata, dan memiliki semangat komunitas warga yang kuat. | Dari gerbang, jalan cluster, sampai fasilitas bersama, CGV pelan-pelan makin rapi. Foto-foto ini jadi pengingat: lingkungan enak dilihat kalau dirawat bareng. |
| Fasilitas dan Ruang Bersama sebagai Nilai Tambah Kawasan | Fasilitas Bersama, Tempat Warga Saling Sapa |
| Dokumentasi Positif untuk Portal Warga CGV | Biar Momen Baik Tidak Hilang di Galeri HP |

Contoh perubahan Sedekah Jumat:

| Saat Ini | Usulan |
| --- | --- |
| Sedekah Jumat di Lingkungan CGV: Menebar Kepedulian, Menguatkan Kebersamaan | Sedekah Jumat: Kecil Bentuknya, Besar Hangatnya |
| Kegiatan sosial kembali terlihat... | Jumat ini ada kegiatan berbagi di sekitar CGV. Sederhana, tapi terasa. Yang ikut membantu mungkin tidak banyak bicara, tapi geraknya kelihatan. |
| Sekecil apa pun kontribusi yang diberikan... | Kadang bantuan kecil pun cukup untuk bikin hari seseorang sedikit lebih ringan. |

Contoh perubahan halaman daftar kabar:

| Saat Ini | Usulan |
| --- | --- |
| Artikel dari warga untuk warga. | Kabar yang dekat dengan kita. |
| Ruang kabar untuk berbagi informasi lingkungan... | Pengumuman, cerita kegiatan, foto lingkungan, dan kabar kecil yang sayang kalau hilang begitu saja. |
| Buka kabar | Baca selengkapnya |

Prioritas: sangat tinggi.

### 5. Pengurus

File utama:

- `app/pengurus/page.tsx`
- `lib/cgv10-master-data.ts`

Masalah:

- Halaman ini perlu formal, tetapi masih bisa lebih hangat.
- "Struktur resmi..." berulang dan terasa dokumen.
- Kartu pengurus memakai deskripsi generik sama untuk semua pimpinan.

Proposal:

- Tetap resmi untuk nama jabatan dan bagan.
- Tambahkan deskripsi per peran yang membantu warga memahami "hubungi siapa untuk apa".
- Kurangi pengulangan "resmi".

Contoh:

| Saat Ini | Usulan |
| --- | --- |
| Struktur resmi Pengurus RT 010 / RW 021 rev.01... | Ini susunan pengurus RT 010 / RW 021 yang sedang berjalan, lengkap dengan penasehat, bidang, dan koordinator cluster. |
| Ketua, Sekretaris, dan Bendahara. | Tiga orang yang paling sering jadi rujukan warga. |
| Tiga peran utama tetap ditampilkan terpisah... | Biar warga tidak bingung: urusan umum ke Ketua, data dan administrasi ke Sekretaris, iuran dan kas ke Bendahara. |
| Pimpinan utama RT 010 / RW 021 untuk koordinasi resmi warga... | Rujukan utama untuk koordinasi warga sehari-hari. |

Prioritas: sedang.

### 6. Keuangan dan Iuran

File utama:

- `app/keuangan/page.tsx`
- `app/keuangan/dues-confirmation-form.tsx`
- `lib/portal-data.ts`

Masalah:

- Ada campuran bahasa Inggris: "Financial Period", "Total expenditure".
- Copy keuangan terlalu laporan, tetapi konteksnya publik warga.
- Iuran perlu lebih jelas dan lebih menenangkan.
- Detail saldo akhir Rp10.000 sensitif, harus ditulis netral dan transparan, bukan bercanda.

Proposal:

- Ganti semua istilah Inggris ke Indonesia.
- Tambahkan microcopy yang menjelaskan "ini ringkasan, bukan buku kas lengkap".
- Untuk form iuran, jelaskan proses setelah submit.

Contoh:

| Saat Ini | Usulan |
| --- | --- |
| Financial Period | Periode Laporan |
| Total expenditure | Total Pengeluaran |
| Laporan ini memakai angka resmi pengurus. | Angka di halaman ini mengikuti laporan pengurus untuk periode yang tercantum. |
| Diagram ini memakai angka resmi yang sama dengan summary dan rincian transaksi. | Grafik ini hanya membantu membaca angka. Rinciannya tetap ada di tabel transaksi. |
| Kirim nominal dan bukti bayar ke bendahara. | Sudah bayar iuran? Kirim buktinya di sini. |
| Form ini khusus untuk pembayaran iuran. | Form ini khusus konfirmasi iuran. Untuk pertanyaan lain, pakai Layanan Warga supaya tidak tercampur. |
| Konfirmasi iuran diterima. Nomor konfirmasi... | Konfirmasi diterima. Simpan nomornya, nanti bendahara bisa cocokkan dari sini. |

Humor:

- Hindari humor di saldo, bukti pembayaran, dan validasi nominal.
- Humor kecil boleh di helper: "biar bendahara tidak perlu tebak-tebakan", tetapi jangan di pesan error.

Prioritas: tinggi.

### 7. PALUGADA

File utama:

- `app/palugada/page.tsx`
- `app/palugada/palugada-catalog.tsx`
- `app/palugada/[slug]/page.tsx`
- `app/palugada/daftar/page.tsx`
- `app/palugada/daftar/palugada-submission-form.tsx`
- `lib/portal-data.ts`

Masalah:

- PALUGADA paling cocok dibuat lebih hidup, tetapi sebagian copy masih terlalu katalog formal.
- Banyak kalimat "informasi dapat diperbarui melalui kanal PALUGADA" berulang.
- Beberapa status seperti "Katalog warga" kurang membantu.

Proposal:

- Beri PALUGADA karakter: lapak tetangga, jasa sekitar, info tidak tenggelam di chat.
- Produk nyata seperti Ma'niez Donut bisa ditulis lebih menggugah, tanpa berlebihan.
- Empty state bisa humoris.

Contoh:

| Saat Ini | Usulan |
| --- | --- |
| Cari kebutuhan warga tanpa harus menunggu info tersebar di grup. | Cari lapak warga tanpa harus scroll grup sampai jauh. |
| Ketik nama produk atau jasa, lalu pilih kategori yang dibutuhkan. | Butuh donat, laundry, servis AC, atau info lapak lain? Coba cari dulu di sini. |
| Lapak awal PALUGADA untuk katalog kuliner warga... | Salah satu lapak kuliner warga yang sudah siap dicoba. Cocok buat camilan rumah atau titipan acara kecil. |
| Katalog warga | Tercatat di katalog |
| Lapak belum membuka kontak langsung di katalog. | Kontak langsung belum dibuka. Kalau tertarik, cek lagi nanti atau tanya pengurus. |
| Daftarkan usaha atau jasa Anda. | Punya usaha atau jasa? Masukkan ke PALUGADA. |
| Mulai isi formulir | Daftarkan lapak |
| Setelah dikirim | Setelah lapak masuk |

Humor yang cocok:

- "Biar jualan tetangga tidak kalah cepat dari chat yang tenggelam."
- "Kalau ada yang jual enak-enak, jangan disimpan sendiri."

Prioritas: tinggi.

### 8. Kontak

File utama:

- `app/kontak/page.tsx`
- `app/kontak/contact-routing-form.tsx`
- `app/kontak/private-pengurus-contacts.tsx`

Masalah:

- Terlalu banyak "kanal kontak resmi".
- Kalimat "ditempatkan bersama struktur resmi" terdengar seperti pengumuman dokumen.
- Ini area butuh jelas, bukan terlalu lucu.

Proposal:

- Buat warga merasa tahu harus mulai dari mana.
- Jelaskan kontak privat hanya muncul setelah login dengan alasan privasi, bukan sekadar aturan.

Contoh:

| Saat Ini | Usulan |
| --- | --- |
| Kontak pengurus ditempatkan bersama struktur resmi. | Mau hubungi pengurus? Pilih jalurnya dulu. |
| Warga bisa memilih kanal kontak, menulis pesan singkat... | Pilih urusannya, tulis pesan singkat, nanti pesan masuk dengan konteks yang lebih jelas. |
| Pilih kanal kontak | Pilih tujuan pesan |
| Direktori peran tetap tersedia di halaman Pengurus. | Kalau belum yakin harus ke siapa, cek dulu peran pengurusnya. |
| Nomor pribadi pengurus hanya tampil... | Nomor pribadi tidak dibuka untuk umum. Setelah login, warga bisa melihat kontak yang memang perlu diketahui. |

Prioritas: sedang.

### 9. Masuk, Auth, dan Profil Rumah

File utama:

- `app/masuk/page.tsx`
- `app/masuk/masuk-warga-client.tsx`
- `app/portal/profil-rumah/page.tsx`

Masalah:

- Banyak bahasa fase/prototipe yang terasa internal.
- "Supabase" muncul di UI warga. Ini teknis, sebaiknya tidak terlalu menonjol untuk publik.
- Pesan session/login masih developer-ish: "Session aktif", "Role".

Proposal:

- Untuk warga, tampilkan "Akun aktif" bukan "Session aktif".
- Untuk pengurus, boleh tampilkan role di area admin, tetapi portal warga cukup "Akun pengurus terdeteksi".
- Kurangi kata "preview", "backend", "auth", "prototipe" dari halaman publik.

Contoh:

| Saat Ini | Usulan |
| --- | --- |
| Gerbang masuk untuk fase profil rumah CGV10. | Masuk ke Portal Warga CGV10. |
| portalwargacgv.id sudah siap menjadi alamat utama. | Gunakan akun warga untuk membuka layanan yang butuh data rumah. |
| Login warga dibuat bertahap supaya data rumah tetap terlindungi. | Akses warga dibuka bertahap supaya data rumah tetap aman. |
| Session aktif | Akun aktif |
| Role: warga / belum ada role admin | Status: warga |
| Buka Admin Dashboard | Buka Dashboard Pengurus |
| Pasang Admin di HP | Pasang dashboard di HP |

Prioritas: tinggi untuk microcopy login.

### 10. Privasi

File utama:

- `app/privasi/page.tsx`
- `app/components/privacy-consent.tsx`

Masalah:

- Sudah cukup jelas dan tidak terlalu kaku.
- Perlu sedikit lebih manusiawi, tetapi jangan bercanda.
- Banner consent sudah baik, hanya bisa dibuat lebih ringkas.

Proposal:

- Tetap singkat dan aman.
- Hindari istilah teknis berlebihan seperti "metrik performa" tanpa contoh.

Contoh:

| Saat Ini | Usulan |
| --- | --- |
| Data warga dipakai seperlunya untuk layanan lingkungan. | Data warga dipakai seperlunya, bukan untuk dipamerkan. |
| Portal dapat memakai data teknis ringan untuk membaca performa halaman. | Portal bisa mencatat data teknis ringan, misalnya halaman yang dibuka dan kecepatan akses. |
| Data form warga tetap dipakai untuk tindak lanjut pengurus. | Data dari form tetap hanya untuk membantu pengurus menindaklanjuti kebutuhan warga. |

Prioritas: sedang.

## Contoh Copy System

### CTA

| Fungsi | Usulan |
| --- | --- |
| Layanan | Ajukan Layanan |
| Kabar | Baca Kabar |
| PALUGADA | Cari Lapak Warga |
| Daftar PALUGADA | Daftarkan Lapak |
| Iuran | Konfirmasi Iuran |
| Kontak | Kirim Pesan ke Pengurus |
| Login | Masuk |
| Admin | Buka Dashboard Pengurus |

### Empty State

| Konteks | Usulan |
| --- | --- |
| Kabar kosong | Belum ada kabar baru untuk filter ini. Yang lama masih bisa dibaca di arsip. |
| PALUGADA kosong | Belum ada lapak di kategori ini. Mungkin tetangga sebelah belum daftar. |
| Layanan kosong | Belum ada permintaan di sini. Semoga artinya lingkungan sedang aman-aman saja. |
| Iuran kosong | Belum ada konfirmasi untuk periode ini. |

### Error

| Konteks | Usulan |
| --- | --- |
| Belum login | Masuk dulu supaya data yang dikirim nyambung ke akun warga. |
| Form belum lengkap | Ada beberapa bagian wajib yang belum diisi. Cek nama, rumah, WhatsApp, dan detailnya. |
| Upload gagal | File belum berhasil diunggah. Coba lagi, atau pilih foto yang ukurannya lebih kecil. |
| Supabase belum siap | Koneksi portal belum siap. Coba muat ulang halaman. |

## Prioritas Eksekusi

### Tahap 1: Quick Win Publik

Target: terasa lebih manusiawi tanpa menyentuh logika.

- `app/page.tsx`
- `app/portal/page.tsx`
- `app/kabar-warga/page.tsx`
- `app/palugada/page.tsx`
- `app/keuangan/page.tsx`
- `app/components/portal.tsx`

Perubahan:

- Rewrite hero, CTA, subtitle section, badge, footer tagline.
- Ganti campuran Inggris di Keuangan.
- Kurangi copy "portal digital" yang terlalu produk.

### Tahap 2: Form dan Microcopy

Target: warga lebih paham apa yang harus diisi.

- `app/layanan/service-request-form.tsx`
- `app/keuangan/dues-confirmation-form.tsx`
- `app/palugada/daftar/palugada-submission-form.tsx`
- `app/masuk/masuk-warga-client.tsx`
- `app/components/privacy-consent.tsx`

Perubahan:

- Rewrite placeholder, helper, pesan sukses, pesan error.
- Ubah "session/role/Supabase" menjadi bahasa warga.
- Tambahkan microcopy "kenapa field ini diminta".

### Tahap 3: Artikel dan Data Statis

Target: hilangkan rasa artikel AI.

- `lib/portal-data.ts`

Perubahan:

- Rewrite tiga artikel awal.
- Pendekkan excerpt.
- Ganti heading artikel.
- Kurangi paragraf generik dan ulang-ulang.
- Tambahkan detail manusiawi, tetapi tetap sopan.

### Tahap 4: Pengurus dan Privasi

Target: lebih hangat tanpa mengurangi kredibilitas.

- `app/pengurus/page.tsx`
- `app/kontak/page.tsx`
- `app/privasi/page.tsx`

Perubahan:

- Jelaskan peran pengurus dengan bahasa praktis.
- Kontak privat dijelaskan sebagai perlindungan, bukan sekadar pembatasan.
- Privasi dibuat lebih ringkas dan mudah dipercaya.

## Risiko Jika Langsung Rewrite Semua

- Artikel panjang bisa mengubah tone terlalu jauh dari dokumen resmi.
- Copy humor yang berlebihan bisa terasa tidak pantas di iuran, keamanan, dan privasi.
- Jika semua file diubah sekaligus, review visual dan QA akan berat.
- Beberapa teks mungkin sudah disetujui pengurus sebagai pengumuman resmi. Untuk pengumuman Ketua RT, sebaiknya hanya edit excerpt/intro halaman, bukan isi surat resmi tanpa persetujuan.

## Rekomendasi Final

Mulai dari Tahap 1 dan Tahap 2. Dua tahap ini paling terasa oleh warga dan risikonya rendah. Setelah itu baru rewrite artikel di `lib/portal-data.ts`, karena artikel adalah sumber terbesar rasa "AI language".

Untuk gaya akhir, gunakan rasio:

- 70% jelas dan praktis.
- 20% hangat dan lokal.
- 10% humor ringan.

Area yang boleh lebih humoris:

- PALUGADA
- Kabar warga
- Empty state
- CTA ringan

Area yang harus tetap tenang:

- Keuangan
- Iuran
- Keamanan
- Privasi
- Login dan data warga

