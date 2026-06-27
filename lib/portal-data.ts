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
    text: "Data resmi menyusul.",
    icon: "wallet",
  },
  {
    title: "Jumlah KK",
    text: "Menunggu konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Pengaduan Aktif",
    text: "Rencana fitur tahap berikutnya.",
    icon: "message",
  },
  {
    title: "Kegiatan Terdekat",
    text: "Data resmi menyusul.",
    icon: "calendar",
  },
];

// Replace role placeholders with official names only after publication approval.
export const pengurusRoles: IconCard[] = [
  {
    title: "Ketua RT",
    text: "Menunggu konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Sekretaris",
    text: "Menunggu konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Bendahara",
    text: "Menunggu konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Semua seksi",
    text: "Menunggu konfirmasi pengurus.",
    icon: "users",
  },
  {
    title: "Koordinator cluster",
    text: "Menunggu konfirmasi pengurus.",
    icon: "users",
  },
];

// Insert confirmed finance numbers here after pengurus approval.
export const financeRows: FinanceRow[] = [
  { label: "Saldo awal", value: "Data resmi menyusul" },
  { label: "Pemasukan", value: "Data resmi menyusul" },
  { label: "Pengeluaran", value: "Data resmi menyusul" },
  { label: "Saldo akhir", value: "Data resmi menyusul" },
];

// Replace preview copy only with announcement content approved for public display.
export const announcements: IconCard[] = [
  {
    title: "Jadwal kegiatan lingkungan",
    text: "Contoh struktur pengumuman untuk agenda warga setelah jadwal resmi tersedia.",
    icon: "calendar",
  },
  {
    title: "Informasi keamanan",
    text: "Contoh ruang informasi untuk arahan keamanan dan kesiapan lingkungan.",
    icon: "shield",
  },
  {
    title: "Pengumuman layanan warga",
    text: "Contoh kanal ringkas untuk informasi administrasi dan layanan RT/RW.",
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
  { label: "Nama", value: "Contoh tampilan barang warga" },
  { label: "Harga", value: "Data resmi menyusul" },
  { label: "Cluster", value: "Menunggu konfirmasi pengurus" },
  { label: "Tombol WA", value: "WA belum tersedia" },
];

// Insert public contact and QR assets only after explicit approval.
export const contacts: ContactEntry[] = [
  {
    role: "Ketua RT",
    text: "Kontak resmi menunggu konfirmasi pengurus.",
    qrStatus: "QR menunggu data resmi",
  },
  {
    role: "Sekretaris",
    text: "Kontak resmi menunggu konfirmasi pengurus.",
    qrStatus: "QR menunggu data resmi",
  },
  {
    role: "Bendahara",
    text: "Kontak resmi menunggu konfirmasi pengurus.",
    qrStatus: "QR menunggu data resmi",
  },
  {
    role: "Keamanan",
    text: "Kontak resmi menunggu konfirmasi pengurus.",
    qrStatus: "QR menunggu data resmi",
  },
];
