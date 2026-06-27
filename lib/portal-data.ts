export type IconName =
  | "home"
  | "users"
  | "wallet"
  | "megaphone"
  | "store"
  | "phone"
  | "shield"
  | "calendar"
  | "file"
  | "briefcase"
  | "utensils"
  | "building"
  | "qr"
  | "message";

export type IconCard = {
  title: string;
  text: string;
  icon: IconName;
  name?: string;
  location?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type FinanceRow = {
  label: string;
  value: string;
};

export type MarketplaceField = {
  label: string;
  value: string;
};

export type ContactEntry = {
  role: string;
  text: string;
  qrStatus: string;
};

export const navItems = [
  ["Beranda", "/"],
  ["Pengurus", "/pengurus/"],
  ["Keuangan", "/keuangan/"],
  ["Pengumuman", "/pengumuman/"],
  ["PALUGADA", "/palugada/"],
] as const;

// Insert official pengurus-approved quick-info values here when available.
export const quickInfo: IconCard[] = [
  {
    title: "Saldo Kas RT",
    text: "Data resmi dalam proses konfirmasi pengurus.",
    icon: "wallet",
  },
  {
    title: "Jumlah KK",
    text: "Informasi akan diperbarui setelah validasi.",
    icon: "users",
  },
  {
    title: "Pengaduan Aktif",
    text: "Kanal pengaduan belum dibuka untuk publik.",
    icon: "message",
  },
  {
    title: "Kegiatan Terdekat",
    text: "Jadwal resmi menunggu konfirmasi pengurus.",
    icon: "calendar",
  },
];

// Replace role placeholders with official names only after publication approval.
export const pengurusRoles: IconCard[] = [
  {
    title: "Ketua RT",
    name: "Doddy Dharma",
    text: "Ketua RT yang berdomisili di Cipta Greenville, Blok Greenwich.",
    icon: "users",
    location: "Cipta Greenville, Blok Greenwich",
    imageSrc: "/assets/pengurus/doddy-dharma.png",
    imageAlt: "Doddy Dharma, Ketua RT",
  },
  {
    title: "Sekretaris",
    text: "Nama resmi dalam proses konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Bendahara",
    text: "Nama resmi dalam proses konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Semua seksi",
    text: "Daftar seksi akan diperbarui setelah validasi.",
    icon: "users",
  },
  {
    title: "Koordinator cluster",
    text: "Data koordinator menunggu persetujuan publikasi.",
    icon: "users",
  },
];

// Insert confirmed finance numbers here after pengurus approval.
export const financeRows: FinanceRow[] = [
  { label: "Saldo awal", value: "Dalam proses validasi pengurus" },
  { label: "Pemasukan", value: "Dalam proses validasi pengurus" },
  { label: "Pengeluaran", value: "Dalam proses validasi pengurus" },
  { label: "Saldo akhir", value: "Dalam proses validasi pengurus" },
];

// Replace preview copy only with announcement content approved for public display.
export const announcements: IconCard[] = [
  {
    title: "Jadwal kegiatan lingkungan",
    text: "Format pengumuman agenda warga yang akan diisi setelah jadwal resmi divalidasi.",
    icon: "calendar",
  },
  {
    title: "Informasi keamanan",
    text: "Ruang informasi keamanan yang menunggu arahan resmi sebelum dipublikasikan.",
    icon: "shield",
  },
  {
    title: "Pengumuman layanan warga",
    text: "Kanal ringkas untuk informasi administrasi dan layanan warga yang sudah disetujui.",
    icon: "file",
  },
];

export const palugadaCategories: { title: string; icon: IconName }[] = [
  { title: "Barang", icon: "store" },
  { title: "Kuliner", icon: "utensils" },
  { title: "Jasa", icon: "briefcase" },
  { title: "Properti", icon: "building" },
  { title: "Lainnya", icon: "file" },
];

// Insert official PALUGADA item values only after seller and pengurus approval.
export const marketplaceItems: MarketplaceField[] = [
  { label: "Nama", value: "Contoh format item warga" },
  { label: "Harga", value: "Informasi menunggu validasi" },
  { label: "Cluster", value: "Cluster menunggu konfirmasi" },
  { label: "Tombol WA", value: "WA menunggu persetujuan publikasi" },
];

// Insert public contact and QR assets only after explicit approval.
export const contacts: ContactEntry[] = [
  {
    role: "Ketua RT",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR menunggu validasi",
  },
  {
    role: "Sekretaris",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR menunggu validasi",
  },
  {
    role: "Bendahara",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR menunggu validasi",
  },
  {
    role: "Keamanan",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR menunggu validasi",
  },
];
