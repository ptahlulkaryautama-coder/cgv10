import {
  pengurusClusterCoordinators,
  pengurusLeadership,
} from "./cgv10-master-data";

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
  value?: string;
  status?: string;
  href?: string;
};

export type FinanceRow = {
  label: string;
  value: string;
};

export type FinanceTransaction = {
  description: string;
  quantity: number;
  unitAmount: number;
  subtotal: number;
  shortLabel: string;
  color: string;
};

export type MarketplaceItem = {
  name: string;
  category: string;
  cluster: string;
  price: string;
  status: string;
  icon: IconName;
  imageSrc?: string;
  imageAlt?: string;
  detailSlug?: string;
  detailHref?: string;
  detailDescription?: string;
  providerProfile?: string;
  productDetail?: string;
  exampleScope?: string[];
  availabilityNote?: string;
  catalogStatusNote?: string;
  contactBadge?: string;
  galleryImages?: {
    src: string;
    alt: string;
  }[];
  variants?: string[];
  orderFormats?: string[];
  serviceAreas?: string[];
  transactionStatus?: string;
  validationSteps?: string[];
  catalogNote?: string;
  whatsappHref?: string;
  whatsappLabel?: string;
  whatsappDisplayNumber?: string;
  whatsappStatus?: string;
};

export type PalugadaDraftItem = {
  id: string;
  name: string;
  owner: string;
  category: string;
  cluster: string;
  submittedAt: string;
  status: "Draft diterima" | "Perlu verifikasi" | "Siap tayang";
  priority: "Normal" | "Tinggi";
  contactStatus: string;
  nextAction: string;
  completeness: string;
};

export type ContactEntry = {
  role: string;
  text: string;
  qrStatus: string;
};

export type KegiatanItem = {
  title: string;
  slug: string;
  href: string;
  text: string;
  detailDescription: string;
  icon: IconName;
  tone: "primary" | "accent" | "cream";
  imageSrc: string;
  imageAlt: string;
  captions: string[];
  archiveNote: string;
};

export type KabarArticle = {
  title: string;
  category: "Artikel" | "Pengumuman" | "Agenda";
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverImageSrc?: string;
  coverImageAlt?: string;
};

export const navItems = [
  ["Beranda", "/"],
  ["Portal", "/portal/"],
  ["Layanan", "/layanan/"],
  ["Kabar Warga", "/kabar-warga/"],
  ["Pengurus", "/pengurus/"],
  ["Keuangan", "/keuangan/"],
  ["PALUGADA", "/palugada/"],
] as const;

// Maintain public quick-info values for the portal overview.
export const quickInfo: IconCard[] = [
  {
    title: "Saldo Kas RT",
    value: "Rp 5.500.000",
    text: "Ringkasan kas lingkungan yang mudah dipantau warga.",
    status: "Ringkasan kas RT.",
    icon: "wallet",
    href: "/keuangan/",
  },
  {
    title: "Jumlah KK",
    value: "250 KK",
    text: "Ringkasan data keluarga di lingkungan.",
    status: "Ringkasan warga.",
    icon: "users",
    href: "/pengurus/",
  },
  {
    title: "Pengaduan Aktif",
    value: "2 laporan",
    text: "Status kanal layanan warga.",
    status: "Laporan warga.",
    icon: "message",
    href: "/layanan/",
  },
  {
    title: "Kegiatan Terdekat",
    value: "Kerja bakti lingkungan",
    text: "Jadwal kegiatan lingkungan.",
    status: "Agenda warga.",
    icon: "calendar",
    href: "/kabar-warga/#dokumentasi",
  },
];

export const kegiatanItems: KegiatanItem[] = [
  {
    title: "Kerja bakti lingkungan",
    slug: "kerja-bakti-lingkungan",
    href: "/kegiatan/kerja-bakti-lingkungan/",
    text: "Dokumentasi kegiatan kebersihan bersama warga lingkungan.",
    detailDescription:
      "Dokumentasi kerja bakti lingkungan untuk memperlihatkan suasana gotong royong dan arsip kegiatan warga.",
    icon: "users",
    tone: "primary",
    imageSrc: "/assets/kegiatan/kerja-bakti.png",
    imageAlt: "Dokumentasi kerja bakti lingkungan warga CGV10",
    captions: [
      "Suasana gotong royong warga dalam kegiatan kebersihan lingkungan.",
      "Catatan kebersihan area bersama ditulis singkat dan mudah dibaca.",
      "Dokumentasi disusun sebagai arsip kegiatan warga.",
    ],
    archiveNote:
      "Dokumentasi kegiatan warga untuk arsip lingkungan.",
  },
  {
    title: "Rapat warga",
    slug: "rapat-warga",
    href: "/kegiatan/rapat-warga/",
    text: "Arsip visual untuk rangkuman suasana musyawarah warga.",
    detailDescription:
      "Dokumentasi rapat warga yang menampilkan suasana forum dan koordinasi lingkungan.",
    icon: "message",
    tone: "accent",
    imageSrc: "/assets/kegiatan/rapat-warga.png",
    imageAlt: "Dokumentasi rapat warga CGV10",
    captions: [
      "Suasana diskusi warga dalam forum lingkungan.",
      "Rangkuman dapat ditulis sebagai arsip visual, bukan notulen resmi.",
      "Rangkuman dapat ditulis singkat agar mudah dibaca warga.",
    ],
    archiveNote: "Dokumentasi forum warga untuk arsip lingkungan.",
  },
  {
    title: "Kegiatan sosial",
    slug: "kegiatan-sosial",
    href: "/kegiatan/kegiatan-sosial/",
    text: "Ruang dokumentasi untuk momen kebersamaan warga sebagai arsip komunitas.",
    detailDescription:
      "Arsip kegiatan sosial yang menunjukkan momen kebersamaan warga.",
    icon: "home",
    tone: "cream",
    imageSrc: "/assets/kegiatan/kegiatan-sosial.png",
    imageAlt: "Dokumentasi kegiatan sosial warga CGV10",
    captions: [
      "Kegiatan sosial warga sebagai bagian dari arsip komunitas.",
      "Materi visual dapat dipilih agar tetap sopan dan relevan untuk arsip.",
      "Informasi kegiatan ditulis ringkas dan tetap menjaga kenyamanan warga.",
    ],
    archiveNote: "Dokumentasi kegiatan sosial warga.",
  },
  {
    title: "Keamanan dan kebersihan",
    slug: "keamanan-kebersihan",
    href: "/kegiatan/keamanan-kebersihan/",
    text: "Kategori untuk dokumentasi koordinasi lingkungan, patroli, dan perawatan area bersama.",
    detailDescription:
      "Dokumentasi keamanan dan kebersihan untuk arsip visual kegiatan lingkungan.",
    icon: "shield",
    tone: "primary",
    imageSrc: "/assets/kegiatan/keamanan-kebersihan.png",
    imageAlt: "Dokumentasi keamanan dan kebersihan lingkungan CGV10",
    captions: [
      "Koordinasi keamanan dan kebersihan lingkungan.",
      "Keterangan dapat berisi fokus kegiatan tanpa menyebut laporan resmi.",
      "Foto dan catatan kegiatan disusun untuk arsip lingkungan.",
    ],
    archiveNote: "Dokumentasi koordinasi keamanan dan kebersihan.",
  },
  {
    title: "Kegiatan anak-anak / keluarga",
    slug: "kegiatan-keluarga",
    href: "/kegiatan/kegiatan-keluarga/",
    text: "Arsip aktivitas keluarga yang menjaga kenyamanan dan privasi warga.",
    detailDescription:
      "Dokumentasi kegiatan keluarga yang menampilkan aktivitas kebersamaan warga.",
    icon: "calendar",
    tone: "accent",
    imageSrc: "/assets/kegiatan/kegiatan-keluarga.png",
    imageAlt: "Dokumentasi kegiatan anak-anak dan keluarga CGV10",
    captions: [
      "Aktivitas keluarga sebagai bagian dari arsip komunitas.",
      "Dokumentasi anak-anak atau keluarga memerlukan kurasi yang lebih hati-hati.",
      "Detail pribadi tetap dijaga agar dokumentasi nyaman untuk warga.",
    ],
    archiveNote: "Dokumentasi kegiatan keluarga warga.",
  },
];

// Public pengurus structure shown in the portal.
export const pengurusRoles: IconCard[] = pengurusLeadership.map((member) => ({
  title: member.jabatan,
  name: member.nama,
  text: `${member.jabatan} dalam Struktur Kepengurusan RT 010 / RW 021 Cipta Greenville.`,
  icon: "users",
  location: "Cipta Greenville",
  imageSrc:
    member.id === "ketua-rt-doddy-dharma"
      ? "/assets/pengurus/doddy-dharma.png"
      : undefined,
  imageAlt:
    member.id === "ketua-rt-doddy-dharma"
      ? "Doddy Dharma, Ketua RT"
      : undefined,
}));

// Public finance summary shown in the portal.
export const financeRows: FinanceRow[] = [
  { label: "Saldo awal", value: "Rp 0" },
  { label: "Pemasukan", value: "Rp 5.500.000" },
  { label: "Pengeluaran", value: "Rp 0" },
  { label: "Saldo akhir", value: "Rp 5.500.000" },
];

export const financeTransactions: FinanceTransaction[] = [
  {
    description: "Dana kas RT",
    quantity: 1,
    unitAmount: 2000000,
    subtotal: 2000000,
    shortLabel: "Dana kas RT",
    color: "#003d34",
  },
  {
    description: "Pendaftaran Calon Doddy",
    quantity: 1,
    unitAmount: 500000,
    subtotal: 500000,
    shortLabel: "Calon Doddy",
    color: "#d4af37",
  },
  {
    description: "Pendaftaran Calon Fikri",
    quantity: 1,
    unitAmount: 500000,
    subtotal: 500000,
    shortLabel: "Calon Fikri",
    color: "#006d5b",
  },
  {
    description: "Pendaftaran Calon Meyer",
    quantity: 1,
    unitAmount: 500000,
    subtotal: 500000,
    shortLabel: "Calon Meyer",
    color: "#e8c670",
  },
  {
    description: "Dari KPU Sebelumnya",
    quantity: 1,
    unitAmount: 1000000,
    subtotal: 1000000,
    shortLabel: "KPU Sebelumnya",
    color: "#002d27",
  },
  {
    description: "Dari Sumbangan Warga - Mandeville 09",
    quantity: 1,
    unitAmount: 1000000,
    subtotal: 1000000,
    shortLabel: "Mandeville 09",
    color: "#b8942f",
  },
];

export const financeTotals = {
  openingBalance: 0,
  income: financeTransactions.reduce((sum, item) => sum + item.subtotal, 0),
  expense: 0,
  endingBalance: financeTransactions.reduce((sum, item) => sum + item.subtotal, 0),
};

// Public announcement content for residents.
export const announcements: IconCard[] = [
  {
    title: "Jadwal kerja bakti lingkungan",
    text: "Agenda kebersihan bersama warga untuk menjaga lingkungan tetap rapi.",
    icon: "calendar",
  },
  {
    title: "Pendataan warga dan kendaraan",
    text: "Informasi pendataan lingkungan agar data warga dan kendaraan tertata.",
    icon: "file",
  },
  {
    title: "Informasi keamanan lingkungan",
    text: "Informasi keamanan lingkungan untuk meningkatkan kewaspadaan warga.",
    icon: "shield",
  },
  {
    title: "Pengingat administrasi warga",
    text: "Pengingat administrasi warga agar kebutuhan lingkungan berjalan tertib.",
    icon: "file",
  },
];

export const kabarArticles: KabarArticle[] = [
  {
    title: "Portal Warga CGV10 siap dikenalkan ke lingkungan",
    category: "Artikel",
    excerpt:
      "Ringkasan pengantar untuk warga tentang fungsi Portal CGV10, kanal layanan, Kabar Warga, transparansi, dan PALUGADA.",
    body:
      "Portal Warga CGV10 disiapkan sebagai pintu informasi lingkungan yang ringkas. Warga dapat membuka kabar terbaru, mengakses layanan, melihat struktur pengurus, memantau ringkasan kas, dan mengenal katalog PALUGADA dalam satu tempat. Pada tahap awal, pengurus dapat memakai artikel ini sebagai materi pengantar sebelum modul login dan database warga ditambahkan.",
    author: "Pengurus CGV10",
    publishedAt: "07 Jul 2026",
    readTime: "2 menit baca",
    coverImageSrc: "/assets/kegiatan/keamanan-kebersihan.png",
    coverImageAlt: "Ilustrasi lingkungan CGV10 untuk artikel Portal Warga",
  },
];

export const palugadaCategories: { title: string; icon: IconName }[] = [
  { title: "Barang", icon: "store" },
  { title: "Kuliner", icon: "utensils" },
  { title: "Jasa", icon: "briefcase" },
  { title: "Properti", icon: "building" },
  { title: "Lainnya", icon: "file" },
];

export const palugadaOnboardingSteps: {
  title: string;
  text: string;
  icon: IconName;
}[] = [
  {
    title: "Isi draft lapak",
    text: "Warga menyiapkan nama usaha, kategori, cluster, kontak, harga/status, dan deskripsi singkat.",
    icon: "file",
  },
  {
    title: "Kirim ke pengurus",
    text: "Draft dikirim melalui WhatsApp agar data awal bisa dicek tanpa membuat akun baru.",
    icon: "message",
  },
  {
    title: "Masuk kurasi",
    text: "Pengurus memeriksa kelengkapan, foto, dan catatan kontak sebelum listing ditampilkan.",
    icon: "shield",
  },
];

export const palugadaReviewStages: {
  title: string;
  status: string;
  text: string;
  icon: IconName;
}[] = [
  {
    title: "Draft diterima",
    status: "Intake",
    text: "Data lapak sudah masuk sebagai draft awal dan siap dicek kelengkapannya.",
    icon: "file",
  },
  {
    title: "Perlu verifikasi",
    status: "Review",
    text: "Kontak, foto, kategori, area, dan catatan harga dicek agar jelas untuk warga.",
    icon: "shield",
  },
  {
    title: "Siap tayang",
    status: "Publish",
    text: "Listing dapat dipindahkan ke katalog aktif setelah informasi utama cukup rapi.",
    icon: "store",
  },
];

export const palugadaDraftItems: PalugadaDraftItem[] = [
  {
    id: "PLG-001",
    name: "Ma'niez Donut",
    owner: "Warga Cluster Colloseum",
    category: "Kuliner",
    cluster: "Cluster Colloseum",
    submittedAt: "27 Jun 2026",
    status: "Siap tayang",
    priority: "Normal",
    contactStatus: "WhatsApp tersedia",
    nextAction: "Jaga sebagai listing pilot aktif.",
    completeness: "100%",
  },
  {
    id: "PLG-002",
    name: "Laundry Kiloan Pinnata",
    owner: "Warga Cluster Pinnata",
    category: "Jasa",
    cluster: "Cluster Pinnata",
    submittedAt: "29 Jun 2026",
    status: "Perlu verifikasi",
    priority: "Tinggi",
    contactStatus: "Nomor perlu dicek",
    nextAction: "Validasi nomor WhatsApp dan jam operasional.",
    completeness: "72%",
  },
  {
    id: "PLG-003",
    name: "Tanaman Hias Rumah",
    owner: "Warga Cluster Greenwich",
    category: "Barang",
    cluster: "Cluster Greenwich",
    submittedAt: "30 Jun 2026",
    status: "Draft diterima",
    priority: "Normal",
    contactStatus: "Kontak via pengurus",
    nextAction: "Minta foto produk dan kisaran harga.",
    completeness: "48%",
  },
  {
    id: "PLG-004",
    name: "Catering Rumahan",
    owner: "Warga Cluster Meteora",
    category: "Kuliner",
    cluster: "Cluster Meteora",
    submittedAt: "30 Jun 2026",
    status: "Perlu verifikasi",
    priority: "Normal",
    contactStatus: "Kontak perlu konfirmasi",
    nextAction: "Lengkapi menu, batas PO, dan area layanan.",
    completeness: "68%",
  },
];

// Public PALUGADA catalog content.
export const marketplaceItems: MarketplaceItem[] = [
  {
    name: "Ma'niez Donut",
    category: "Kuliner",
    cluster: "Cluster Colloseum",
    price: "Mulai Rp 20.000",
    status: "Kanal WhatsApp tersedia",
    icon: "utensils",
    imageSrc: "/assets/palugada/maniez-donut-main.png",
    imageAlt: "Ma'niez Donut untuk katalog PALUGADA CGV",
    detailSlug: "donat-kentang-warga",
    detailHref: "/palugada/donat-kentang-warga/",
    detailDescription:
      "Lapak awal PALUGADA untuk katalog kuliner warga Ma'niez Donut dengan kanal WhatsApp untuk konfirmasi.",
    providerProfile:
      "Profil penyedia menampilkan usaha rumahan warga dengan kanal WhatsApp untuk Ma'niez Donut.",
    productDetail:
      "Ma'niez Donut menjadi lapak awal PALUGADA: produk kuliner rumahan dengan foto lokal, harga, varian, format pesanan, area layanan, dan status kontak yang jelas.",
    exampleScope: [
      "Varian: coklat meses, keju, dan red velvet.",
      "Format pesanan: box kecil, box keluarga, dan pesanan acara warga.",
      "Informasi ketersediaan dan jadwal produksi dapat dikonfirmasi melalui kanal PALUGADA.",
    ],
    availabilityNote:
      "Ketersediaan dan jadwal pesanan dapat dikonfirmasi melalui WhatsApp Ma'niez Donut.",
    catalogStatusNote:
      "Kanal WhatsApp tersedia untuk konfirmasi awal PALUGADA.",
    contactBadge: "Kanal WhatsApp",
    galleryImages: [
      {
        src: "/assets/palugada/maniez-donut-main.png",
        alt: "Ma'niez Donut sebagai foto utama PALUGADA",
      },
      {
        src: "/assets/palugada/maniez-donut-varian01.png",
        alt: "Varian Ma'niez Donut untuk katalog PALUGADA",
      },
      {
        src: "/assets/palugada/maniez-donut-varian02.png",
        alt: "Pilihan Ma'niez Donut untuk PALUGADA",
      },
    ],
    variants: ["Coklat meses", "Keju", "Red velvet"],
    orderFormats: [
      "Box kecil untuk camilan keluarga",
      "Box keluarga untuk kumpul warga",
      "Pesanan acara warga dengan konfirmasi admin",
    ],
    serviceAreas: [
      "Cluster Colloseum sebagai area awal PALUGADA",
      "Area CGV10 lain dapat ditambahkan bertahap",
      "Pengambilan atau pengantaran mengikuti informasi penyedia",
    ],
    transactionStatus:
      "Status transaksi: konfirmasi awal Ma'niez Donut melalui WhatsApp. Pembayaran dan pemesanan mengikuti arahan penyedia.",
    validationSteps: [
      "Informasi lapak dan foto produk dikelola agar rapi.",
      "WhatsApp tersedia untuk Ma'niez Donut.",
      "Listing awal membantu warga memahami format katalog PALUGADA.",
    ],
    catalogNote:
      "Lapak awal ini memperlihatkan format katalog dengan kanal WhatsApp khusus Ma'niez Donut.",
    whatsappHref: "https://wa.me/6281291254064",
    whatsappLabel: "Hubungi WhatsApp",
    whatsappDisplayNumber: "+62 812-9125-4064",
    whatsappStatus: "WhatsApp tersedia",
  },
  {
    name: "Jasa Laundry Kiloan",
    category: "Jasa",
    cluster: "Cluster Pinnata",
    price: "Harga sesuai berat cucian",
    status: "Katalog warga",
    icon: "briefcase",
    imageSrc: "/assets/palugada/palugada-laundry.jpg",
    imageAlt:
      "Jasa laundry kiloan untuk katalog PALUGADA CGV",
    detailSlug: "jasa-laundry-kiloan",
    detailHref: "/palugada/jasa-laundry-kiloan/",
    detailDescription:
      "Halaman detail untuk jasa harian warga dengan informasi cluster dan status layanan.",
    providerProfile:
      "Profil penyedia jasa membantu warga memahami layanan yang tersedia.",
    productDetail:
      "Jasa laundry kiloan ditampilkan sebagai layanan harian warga yang dapat dijelaskan melalui halaman detail katalog.",
    exampleScope: [
      "Cakupan layanan: cuci kiloan, setrika, dan lipat pakaian.",
      "Catatan layanan dapat memuat area cluster, estimasi pengerjaan, dan syarat penerimaan cucian.",
      "Harga akhir, jam layanan, dan metode penyerahan mengikuti informasi penyedia.",
    ],
    availabilityNote:
      "Ketersediaan layanan dapat diperbarui melalui kanal PALUGADA.",
    catalogStatusNote:
      "Katalog warga PALUGADA.",
  },
  {
    name: "Tanaman Hias Rumah",
    category: "Barang",
    cluster: "Cluster Greenwich",
    price: "Mulai Rp 25.000",
    status: "Katalog warga",
    icon: "store",
  },
  {
    name: "Info Properti Warga",
    category: "Properti",
    cluster: "Cluster Aurora",
    price: "Informasi menyusul",
    status: "Katalog warga",
    icon: "building",
  },
  {
    name: "Catering Rumahan",
    category: "Kuliner",
    cluster: "Cluster Meteora",
    price: "Harga menu saat rilis",
    status: "Katalog warga",
    icon: "utensils",
    imageSrc: "/assets/palugada/palugada-catering.jpg",
    imageAlt:
      "Catering rumahan untuk katalog PALUGADA CGV",
    detailSlug: "catering-rumahan",
    detailHref: "/palugada/catering-rumahan/",
    detailDescription:
      "Halaman detail untuk katalog catering rumahan, termasuk gambaran menu, cluster, dan status harga.",
    providerProfile:
      "Profil penyedia kuliner rumahan membantu warga mengenal layanan makanan sekitar.",
    productDetail:
      "Catering rumahan ditampilkan sebagai layanan kuliner yang membutuhkan deskripsi menu, area layanan, dan status pemesanan yang jelas.",
    exampleScope: [
      "Cakupan layanan: paket nasi rumahan, lauk harian, dan pesanan acara kecil.",
      "Halaman detail dapat menampilkan catatan menu, porsi, dan waktu pemesanan.",
      "Harga menu mengikuti informasi dari penyedia.",
    ],
    availabilityNote:
      "Ketersediaan menu dan batas pemesanan dapat diperbarui melalui kanal PALUGADA.",
    catalogStatusNote:
      "Katalog warga PALUGADA.",
  },
  {
    name: "Jasa Servis AC",
    category: "Jasa",
    cluster: "Cluster Aurora",
    price: "Harga sesuai konfirmasi",
    status: "Katalog warga",
    icon: "briefcase",
    imageSrc: "/assets/palugada/palugada-servis-ac.jpg",
    imageAlt:
      "Jasa servis AC untuk katalog PALUGADA CGV",
    detailSlug: "jasa-servis-ac",
    detailHref: "/palugada/jasa-servis-ac/",
    detailDescription:
      "Halaman detail untuk layanan servis AC warga dengan foto layanan, cluster, dan harga sesuai konfirmasi.",
    providerProfile:
      "Profil penyedia jasa teknis membantu warga memahami cakupan layanan.",
    productDetail:
      "Jasa servis AC ditampilkan sebagai layanan teknis warga yang menjelaskan cakupan pekerjaan dan status harga secara transparan.",
    exampleScope: [
      "Cakupan layanan: pengecekan AC, pembersihan ringan, dan konsultasi kondisi unit.",
      "Detail layanan dapat memuat area cluster, catatan kunjungan, dan kebutuhan konfirmasi teknisi.",
      "Harga, jadwal kunjungan, dan kontak penyedia mengikuti informasi layanan.",
    ],
    availabilityNote:
      "Ketersediaan layanan dapat diperbarui melalui kanal PALUGADA.",
    catalogStatusNote:
      "Katalog warga PALUGADA.",
  },
];

export const palugadaDetailItems = marketplaceItems.filter(
  (item): item is MarketplaceItem & {
    detailSlug: string;
    detailHref: string;
    imageSrc: string;
    imageAlt: string;
    detailDescription: string;
    providerProfile: string;
    productDetail: string;
    exampleScope: string[];
    availabilityNote: string;
    catalogStatusNote: string;
  } =>
    Boolean(
      item.detailSlug &&
        item.detailHref &&
        item.imageSrc &&
        item.imageAlt &&
        item.detailDescription &&
        item.providerProfile &&
        item.productDetail &&
        item.exampleScope &&
        item.availabilityNote &&
        item.catalogStatusNote,
    ),
);

// Public contact entries for residents.
export const contacts: ContactEntry[] = [
  ...pengurusLeadership.map((member) => ({
    role: member.jabatan,
    text: `${member.nama} tercatat dalam struktur resmi pengurus. Kontak pribadi tidak dipublikasikan di portal.`,
    qrStatus: "Kontak dikelola melalui kanal resmi pengurus",
  })),
  {
    role: "Koordinator Cluster",
    text: `${pengurusClusterCoordinators.length} koordinator cluster tercatat untuk jalur komunikasi warga.`,
    qrStatus: "Kontak dikelola melalui kanal resmi pengurus",
  },
];
