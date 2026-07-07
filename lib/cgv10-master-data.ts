export type PengurusKategori = "pimpinan" | "bidang" | "koordinator-cluster";

export type PengurusStatusPublikasi = "published";

export type PengurusMember = {
  id: string;
  nama: string;
  jabatan: string;
  kategori: PengurusKategori;
  subKategori?: string;
  cluster?: string;
  urutanTampil: number;
  statusAktif: boolean;
  statusPublikasi: PengurusStatusPublikasi;
};

export const pengurusIdentity = {
  title: "Struktur Kepengurusan RT 010 / RW 021",
  wilayah: "Tembesi Sagulung",
  lingkungan: "Cipta Greenville",
  note:
    "Struktur kepengurusan ditampilkan untuk informasi warga dan dapat diperbarui sesuai keputusan pengurus RT.",
} as const;

export const pengurusMembers: PengurusMember[] = [
  {
    id: "ketua-rt-doddy-dharma",
    nama: "Doddy Dharma",
    jabatan: "Ketua RT",
    kategori: "pimpinan",
    urutanTampil: 1,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "sekretaris-zulhendy-masruddin",
    nama: "Zulhendy Masruddin",
    jabatan: "Sekretaris",
    kategori: "pimpinan",
    urutanTampil: 2,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "bendahara-niko-diponako",
    nama: "Niko Diponako",
    jabatan: "Bendahara",
    kategori: "pimpinan",
    urutanTampil: 3,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "keamanan-rully-admaja",
    nama: "Rully Admaja",
    jabatan: "Bidang Keamanan & Ketertiban",
    kategori: "bidang",
    subKategori: "Keamanan & Ketertiban",
    urutanTampil: 10,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "keamanan-slamet-riyadi",
    nama: "Slamet Riyadi",
    jabatan: "Bidang Keamanan & Ketertiban",
    kategori: "bidang",
    subKategori: "Keamanan & Ketertiban",
    urutanTampil: 11,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "keamanan-heri-p",
    nama: "Heri P",
    jabatan: "Bidang Keamanan & Ketertiban",
    kategori: "bidang",
    subKategori: "Keamanan & Ketertiban",
    urutanTampil: 12,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "kebersihan-khairil-anshar",
    nama: "Khairil Anshar",
    jabatan: "Bidang Kebersihan & Fasilitas Lingkungan",
    kategori: "bidang",
    subKategori: "Kebersihan & Fasilitas Lingkungan",
    urutanTampil: 20,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "kebersihan-ramadhan",
    nama: "Ramadhan",
    jabatan: "Bidang Kebersihan & Fasilitas Lingkungan",
    kategori: "bidang",
    subKategori: "Kebersihan & Fasilitas Lingkungan",
    urutanTampil: 21,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "sosial-manik",
    nama: "Manik",
    jabatan: "Bidang Sosial & Kemasyarakatan",
    kategori: "bidang",
    subKategori: "Sosial",
    urutanTampil: 30,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "kemasyarakatan-sukenty-parapat",
    nama: "Sukenty Parapat",
    jabatan: "Bidang Sosial & Kemasyarakatan",
    kategori: "bidang",
    subKategori: "Kemasyarakatan",
    urutanTampil: 31,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "keagamaan-islam-liza-astuti",
    nama: "Liza Astuti",
    jabatan: "Bidang Keagamaan",
    kategori: "bidang",
    subKategori: "Islam",
    urutanTampil: 40,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "keagamaan-kristen-nani-susi-mutiasari",
    nama: "Nani Susi Mutiasari",
    jabatan: "Bidang Keagamaan",
    kategori: "bidang",
    subKategori: "Kristen",
    urutanTampil: 41,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "pemuda-debi-chandra",
    nama: "Debi Chandra",
    jabatan: "Bidang Pemuda & Olahraga",
    kategori: "bidang",
    subKategori: "Pemuda & Olahraga",
    urutanTampil: 50,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "pemuda-ali-nusri",
    nama: "Ali Nusri",
    jabatan: "Bidang Pemuda & Olahraga",
    kategori: "bidang",
    subKategori: "Pemuda & Olahraga",
    urutanTampil: 51,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "administrasi-yohsep",
    nama: "Yohsep",
    jabatan: "Bidang Administrasi, Humas & Media",
    kategori: "bidang",
    subKategori: "Administrasi",
    urutanTampil: 60,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "media-m-maflukh",
    nama: "M. Maflukh",
    jabatan: "Bidang Administrasi, Humas & Media",
    kategori: "bidang",
    subKategori: "Media",
    urutanTampil: 61,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "media-ahlul-firdaus",
    nama: "Ahlul Firdaus",
    jabatan: "Bidang Administrasi, Humas & Media",
    kategori: "bidang",
    subKategori: "Media",
    urutanTampil: 62,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "humas-aditya-fajayarenta",
    nama: "Aditya Fajayarenta",
    jabatan: "Bidang Administrasi, Humas & Media",
    kategori: "bidang",
    subKategori: "Humas",
    urutanTampil: 63,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "humas-tjong-wie-chuan",
    nama: "Tjong Wie Chuan",
    jabatan: "Bidang Administrasi, Humas & Media",
    kategori: "bidang",
    subKategori: "Humas",
    urutanTampil: 64,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-plumeria-ari-primawan",
    nama: "Ari Primawan",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Plumeria",
    urutanTampil: 101,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-meteora-m-salahuddin",
    nama: "M. Salahuddin",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Meteora",
    urutanTampil: 102,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-colosseum-anthurium-ahlul-firdaus",
    nama: "Ahlul Firdaus",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Colosseum / Anthurium",
    urutanTampil: 103,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-aurora-sukenty-parapat",
    nama: "Sukenty Parapat",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Aurora",
    urutanTampil: 104,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-pinnata-setyo-mashan",
    nama: "Setyo Mashan",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Pinnata",
    urutanTampil: 105,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-caribbean-canyon-adam-yuanda",
    nama: "Adam Yuanda",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Caribbean / Canyon",
    urutanTampil: 106,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-ruko-tjong-wie-chuan",
    nama: "Tjong Wie Chuan",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Ruko",
    urutanTampil: 107,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-gardenia-khairil-anshar",
    nama: "Khairil Anshar",
    jabatan: "Koordinator Cluster",
    kategori: "koordinator-cluster",
    cluster: "Gardenia",
    urutanTampil: 108,
    statusAktif: true,
    statusPublikasi: "published",
  },
  {
    id: "cluster-kota-bunga-erlinda",
    nama: "Erlinda",
    jabatan: "Koordinator RT",
    kategori: "koordinator-cluster",
    cluster: "Kota Bunga",
    urutanTampil: 109,
    statusAktif: true,
    statusPublikasi: "published",
  },
];

export const pengurusBidangGroups = [
  "Keamanan & Ketertiban",
  "Kebersihan & Fasilitas Lingkungan",
  "Sosial & Kemasyarakatan",
  "Keagamaan",
  "Pemuda & Olahraga",
  "Administrasi, Humas & Media",
] as const;

export const publicPengurusMembers = pengurusMembers
  .filter((member) => member.statusAktif && member.statusPublikasi === "published")
  .sort((a, b) => a.urutanTampil - b.urutanTampil);

export const pengurusLeadership = publicPengurusMembers.filter(
  (member) => member.kategori === "pimpinan",
);

export const pengurusBidangMembers = publicPengurusMembers.filter(
  (member) => member.kategori === "bidang",
);

export const pengurusClusterCoordinators = publicPengurusMembers.filter(
  (member) => member.kategori === "koordinator-cluster",
);
