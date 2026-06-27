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

export type MarketplaceItem = {
  name: string;
  category: string;
  price: string;
  status: string;
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
    text: "Simulasi ringkasan kas untuk review.",
    icon: "wallet",
  },
  {
    title: "Jumlah KK",
    text: "Format tampilan data warga untuk ditinjau.",
    icon: "users",
  },
  {
    title: "Pengaduan Aktif",
    text: "Contoh status kanal layanan warga.",
    icon: "message",
  },
  {
    title: "Kegiatan Terdekat",
    text: "Contoh tampilan jadwal lingkungan.",
    icon: "calendar",
  },
];

// Replace review-mode role entries with official names only after publication approval.
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
    text: "Peran dan nama resmi menunggu persetujuan publikasi.",
    icon: "users",
  },
  {
    title: "Bendahara",
    text: "Peran dan nama resmi menunggu persetujuan publikasi.",
    icon: "users",
  },
  {
    title: "Semua seksi",
    text: "Struktur seksi disiapkan sebagai format tinjauan.",
    icon: "users",
  },
  {
    title: "Koordinator cluster",
    text: "Format koordinator disiapkan untuk persetujuan publikasi.",
    icon: "users",
  },
];

// Insert confirmed finance numbers here after pengurus approval.
export const financeRows: FinanceRow[] = [
  { label: "Saldo awal", value: "Rp 8.500.000" },
  { label: "Pemasukan", value: "Rp 20.250.000" },
  { label: "Pengeluaran", value: "Rp 5.750.000" },
  { label: "Saldo akhir", value: "Rp 23.000.000" },
];

// Replace preview copy only with announcement content approved for public display.
export const announcements: IconCard[] = [
  {
    title: "Jadwal kerja bakti lingkungan",
    text: "Contoh pengumuman untuk mengatur agenda kebersihan bersama warga.",
    icon: "calendar",
  },
  {
    title: "Pendataan warga dan kendaraan",
    text: "Simulasi konten untuk memperlihatkan format pendataan lingkungan.",
    icon: "file",
  },
  {
    title: "Informasi keamanan lingkungan",
    text: "Contoh informasi keamanan yang dapat ditinjau sebelum dipublikasikan.",
    icon: "shield",
  },
  {
    title: "Pengingat administrasi warga",
    text: "Format demo untuk pengingat administrasi yang tetap menunggu persetujuan.",
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
export const marketplaceItems: MarketplaceItem[] = [
  {
    name: "Donat kentang warga",
    category: "Kuliner",
    price: "Harga contoh: Rp 35.000",
    status: "Contoh tampilan - WA nonaktif",
  },
  {
    name: "Jasa laundry kiloan",
    category: "Jasa",
    price: "Harga contoh: sesuai berat cucian",
    status: "Contoh tampilan - WA nonaktif",
  },
  {
    name: "Tanaman hias rumah",
    category: "Barang",
    price: "Harga contoh: Rp 25.000",
    status: "Contoh tampilan - WA nonaktif",
  },
  {
    name: "Info properti warga",
    category: "Properti",
    price: "Harga contoh: informasi menyusul",
    status: "Contoh tampilan - WA nonaktif",
  },
];

// Insert public contact and QR assets only after explicit approval.
export const contacts: ContactEntry[] = [
  {
    role: "Ketua RT",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR akan ditampilkan setelah disetujui pengurus",
  },
  {
    role: "Sekretaris",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR akan ditampilkan setelah disetujui pengurus",
  },
  {
    role: "Bendahara",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR akan ditampilkan setelah disetujui pengurus",
  },
  {
    role: "Keamanan",
    text: "Kontak resmi menunggu persetujuan publikasi.",
    qrStatus: "QR akan ditampilkan setelah disetujui pengurus",
  },
];
