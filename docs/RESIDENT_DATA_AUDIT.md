# Audit Data Warga CGV Updated Juli 2026

Sumber file:

`public/assets/data/imports/Data Warga CGV Updated_Juli26.xlsx`

Tanggal audit awal: 2026-07-19

## Ringkasan

Parser awal membaca workbook sebagai XLSX zip/XML tanpa mengubah file sumber.

| Sheet | Baris terbaca | Baris dengan alamat |
| --- | ---: | ---: |
| Sheet1 | 112 | 107 |
| Aurora | 38 | 36 |
| Pinnata | 39 | 33 |
| Mandeville | 11 | 10 |
| Plumeria | 28 | 27 |
| Canyon | 9 | 6 |
| Chiswick | 10 | 9 |
| Greenwich | 19 | 13 |
| Anthurium | 4 | 2 |
| Colosseum | 20 | 19 |
| Caribean | 10 | 9 |
| Meteora | 39 | 38 |
| Victoria | 10 | 9 |
| Ruko | 70 | 68 |
| DOMISILI | 252 | 248 |
| Sheet2 | 139 | 134 |

Total baris alamat mentah yang terbaca: 768.
Estimasi alamat unik setelah normalisasi awal: 343.

Angka ini belum boleh dipakai sebagai jumlah final warga/rumah karena beberapa sheet tampak saling menyalin data, misalnya sheet cluster, `DOMISILI`, `Sheet1`, dan `Sheet2`.

## Catatan Penting Aurora

Ada dua alamat berbeda di workbook:

| Sheet | Row | Nama | Alamat mentah | Normalisasi awal |
| --- | ---: | --- | --- | --- |
| Aurora | 3 | CLARISA | AURORA NO 3A | Aurora 3A |
| DOMISILI | 5 | CLARISA | AURORA NO 3A | Aurora 3A |
| Sheet1 | 40 | WIJI | AURORA No. 33 A | Aurora 33A |
| Aurora | 20 | BASIR / WIJI ASTUTI | AURORA No. 33 A | Aurora 33A |
| DOMISILI | 17 | BASIR / WIJI ASTUTI | AURORA No. 33 A | Aurora 33A |
| Sheet2 | 15 | Wiji | AURORA No. 33 A | Aurora 33A |

Keputusan audit:

- Jangan otomatis mengubah `Aurora 3A` menjadi `Aurora 33A`.
- `Aurora 3A` harus masuk daftar perlu konfirmasi karena informasi user menyebut tidak ada Aurora 3A dan yang benar adalah Aurora 33A.
- `Aurora 33A` aman sebagai alamat yang memang muncul di beberapa sheet.

## Normalisasi Nama Cluster

Beberapa nama cluster perlu aturan alias sebelum import:

| Bentuk mentah | Normalisasi yang disarankan |
| --- | --- |
| CHIS WICK | Chiswick |
| GREEN WICH | Greenwich |
| COLOSEUM | Colosseum |
| CARIBEAN / CAREBIAN | Caribbean |
| MANDEVILL / MANDEVIL / MENDEVIL | Mandeville |

Aturan ini aman untuk penulisan cluster, tetapi tetap perlu review untuk nomor rumah dan nama warga.

## Prinsip Import Aman

1. Tidak ada import langsung dari Excel ke `households` tanpa dry-run.
2. Gunakan key unik `cluster_normalized + unit_number_normalized`.
3. Jika satu alamat muncul di beberapa sheet dengan nama warga berbeda, jangan overwrite otomatis.
4. Data mentah harus disimpan sebagai `source_raw_address` atau catatan import agar bisa ditelusuri.
5. Alamat yang masuk daftar konflik harus ditandai `needs_review`, bukan `verified`.
6. Sheet `Ruko` perlu dipisahkan dari rumah tinggal karena banyak baris berisi nama usaha/lapak.

## Rekomendasi Tahap Berikutnya

- Script dry-run sudah dibuat di `scripts/dry_run_resident_import.py` dan menghasilkan CSV lokal di `tmp/resident-import-dry-run/`:
  - `source_sheet`
  - `source_row`
  - `resident_name_raw`
  - `address_raw`
  - `cluster_normalized`
  - `unit_number_normalized`
  - `confidence`
  - `review_reason`
- Tabel staging disiapkan di `supabase/migrations/202607200001_resident_import_staging.sql`.
- SQL loader lokal dapat dibuat ulang dengan `scripts/generate_resident_import_staging_sql.py`. Outputnya berada di `tmp/resident-import-dry-run/load_resident_import_staging.sql` dan tidak boleh dicommit karena berisi data warga.
- Query review Supabase tersedia di `supabase/queries/resident_import_review.sql`.
- Setelah staging direview, baru upsert ke:
  - `households`
  - `household_members`
  - kelak `household_assets` dan `household_vehicles`

## Dry-run 2026-07-20

Hasil parser terbaru:

| Metrik | Jumlah |
| --- | ---: |
| Baris kandidat mentah | 801 |
| Household key unik | 352 |
| Row auto matched | 419 |
| Row perlu review | 382 |
| Household candidate siap | 240 |
| Household candidate perlu review | 112 |

Alasan review terbesar:

| Alasan | Jumlah row |
| --- | ---: |
| `same_address_multiple_names` | 296 |
| `unknown_cluster` | 36 |
| `ruko_needs_separate_handling` | 24 |
| `missing_unit_number` | 19 |
| `missing_resident_name` | 17 |
| `aurora_3a_needs_confirmation` | 2 |

Urutan eksekusi aman:

1. Jalankan migration staging `202607200001_resident_import_staging.sql`.
2. Jalankan `python scripts\dry_run_resident_import.py`.
3. Jalankan `python scripts\generate_resident_import_staging_sql.py`.
4. Jalankan SQL lokal `tmp/resident-import-dry-run/load_resident_import_staging.sql` di Supabase SQL Editor.
5. Jalankan `supabase/queries/resident_import_review.sql` untuk cek jumlah batch, distribusi cluster, alasan review, dan baris yang perlu dicek manual.
6. Jangan promote ke `households` sebelum 112 household candidate yang perlu review diputuskan.
