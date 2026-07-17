-- Phase C2.5: import the original static PALUGADA catalog into Supabase.
-- Supabase becomes the source of truth for public listing visibility.

begin;

alter table public.palugada_listings
  add column if not exists catalog_key text,
  add column if not exists cover_image_url text,
  add column if not exists cover_image_alt text;

create unique index if not exists palugada_listings_catalog_key_unique
  on public.palugada_listings (catalog_key)
  where catalog_key is not null;

insert into public.palugada_listings (
  id,
  catalog_key,
  name,
  category,
  cluster,
  price_label,
  description,
  availability_note,
  contact_method,
  seller_status,
  seller_status_note,
  cover_image_url,
  cover_image_alt,
  status,
  published_at
)
values
  (
    'c0100000-0000-4000-8000-000000000001',
    'maniez-donut',
    'Ma''niez Donut',
    'kuliner',
    'Cluster Colloseum',
    'Mulai Rp 20.000',
    'Lapak awal PALUGADA untuk katalog kuliner warga Ma''niez Donut dengan kanal WhatsApp untuk konfirmasi.',
    'Ketersediaan dan jadwal pesanan dapat dikonfirmasi melalui WhatsApp Ma''niez Donut.',
    '+62 812-9125-4064',
    'online',
    'Menerima konfirmasi pesanan melalui WhatsApp.',
    '/assets/palugada/maniez-donut-main-optimized.jpg',
    'Ma''niez Donut untuk katalog PALUGADA CGV',
    'approved',
    now()
  ),
  (
    'c0100000-0000-4000-8000-000000000002',
    'jasa-laundry-kiloan',
    'Jasa Laundry Kiloan',
    'jasa',
    'Cluster Pinnata',
    'Harga sesuai berat cucian',
    'Jasa harian warga dengan informasi cluster, layanan cuci kiloan, setrika, dan lipat pakaian.',
    'Ketersediaan layanan dapat diperbarui melalui kanal PALUGADA.',
    '',
    'offline',
    'Lapak belum membuka kontak langsung di katalog.',
    '/assets/palugada/palugada-laundry-optimized.jpg',
    'Jasa laundry kiloan untuk katalog PALUGADA CGV',
    'approved',
    now()
  ),
  (
    'c0100000-0000-4000-8000-000000000003',
    'tanaman-hias-rumah',
    'Tanaman Hias Rumah',
    'barang',
    'Cluster Greenwich',
    'Mulai Rp 25.000',
    'Katalog tanaman hias rumahan warga CGV10.',
    'Ketersediaan tanaman perlu dikonfirmasi melalui pengurus atau penyedia.',
    '',
    'offline',
    'Ketersediaan masih menunggu konfirmasi pengurus.',
    null,
    null,
    'approved',
    now()
  ),
  (
    'c0100000-0000-4000-8000-000000000004',
    'info-properti-warga',
    'Info Properti Warga',
    'properti',
    'Cluster Aurora',
    'Informasi menyusul',
    'Informasi properti warga yang dikurasi melalui kanal PALUGADA.',
    'Ketersediaan dan detail properti perlu dikonfirmasi melalui pengurus.',
    '',
    'offline',
    'Informasi properti belum aktif untuk kontak langsung.',
    null,
    null,
    'approved',
    now()
  ),
  (
    'c0100000-0000-4000-8000-000000000005',
    'catering-rumahan',
    'Catering Rumahan',
    'kuliner',
    'Cluster Meteora',
    'Harga menu saat rilis',
    'Katalog catering rumahan, termasuk gambaran menu, cluster, dan status harga.',
    'Ketersediaan menu dan batas pemesanan dapat diperbarui melalui kanal PALUGADA.',
    '',
    'offline',
    'Menu dan jadwal pemesanan belum dibuka di katalog.',
    '/assets/palugada/palugada-catering-optimized.jpg',
    'Catering rumahan untuk katalog PALUGADA CGV',
    'approved',
    now()
  ),
  (
    'c0100000-0000-4000-8000-000000000006',
    'jasa-servis-ac',
    'Jasa Servis AC',
    'jasa',
    'Cluster Aurora',
    'Harga sesuai konfirmasi',
    'Layanan servis AC warga dengan foto layanan, cluster, dan harga sesuai konfirmasi.',
    'Ketersediaan layanan dapat diperbarui melalui kanal PALUGADA.',
    '',
    'offline',
    'Jadwal layanan belum aktif untuk kontak langsung.',
    '/assets/palugada/palugada-servis-ac-optimized.jpg',
    'Jasa servis AC untuk katalog PALUGADA CGV',
    'approved',
    now()
  )
on conflict (catalog_key) where catalog_key is not null do update
set name = excluded.name,
    category = excluded.category,
    cluster = excluded.cluster,
    price_label = excluded.price_label,
    description = excluded.description,
    availability_note = excluded.availability_note,
    contact_method = excluded.contact_method,
    seller_status = excluded.seller_status,
    seller_status_note = excluded.seller_status_note,
    cover_image_url = excluded.cover_image_url,
    cover_image_alt = excluded.cover_image_alt;

commit;
