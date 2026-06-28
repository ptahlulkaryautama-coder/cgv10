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
  demoStatusNote?: string;
  pilotBadge?: string;
  galleryImages?: {
    src: string;
    alt: string;
  }[];
  variants?: string[];
  orderFormats?: string[];
  serviceAreas?: string[];
  transactionStatus?: string;
  validationSteps?: string[];
  pilotNote?: string;
  whatsappHref?: string;
  whatsappLabel?: string;
  whatsappDisplayNumber?: string;
  whatsappStatus?: string;
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
  approvalNote: string;
};

export const navItems = [
  ["Beranda", "/"],
  ["Layanan", "/layanan/"],
  ["Pengurus", "/pengurus/"],
  ["Keuangan", "/keuangan/"],
  ["Pengumuman", "/pengumuman/"],
  ["Kegiatan", "/kegiatan/"],
  ["PALUGADA", "/palugada/"],
] as const;

// Insert official pengurus-approved quick-info values here when available.
export const quickInfo: IconCard[] = [
  {
    title: "Saldo Kas RT",
    value: "Rp 5.500.000",
    text: "Simulasi ringkasan kas untuk review.",
    status: "Data simulasi untuk review - bukan data resmi.",
    icon: "wallet",
    href: "/keuangan/",
  },
  {
    title: "Jumlah KK",
    value: "128 KK",
    text: "Format tampilan data warga untuk ditinjau.",
    status: "Data simulasi untuk review - bukan data resmi.",
    icon: "users",
    href: "/pengurus/",
  },
  {
    title: "Pengaduan Aktif",
    value: "2 laporan",
    text: "Contoh status kanal layanan warga.",
    status: "Data simulasi untuk review - bukan data resmi.",
    icon: "message",
    href: "/layanan/",
  },
  {
    title: "Kegiatan Terdekat",
    value: "Kerja bakti lingkungan",
    text: "Contoh tampilan jadwal lingkungan.",
    status: "Data simulasi untuk review - bukan data resmi.",
    icon: "calendar",
    href: "/kegiatan/kerja-bakti-lingkungan/",
  },
];

export const kegiatanItems: KegiatanItem[] = [
  {
    title: "Kerja bakti lingkungan",
    slug: "kerja-bakti-lingkungan",
    href: "/kegiatan/kerja-bakti-lingkungan/",
    text: "Format dokumentasi untuk kegiatan kebersihan bersama setelah foto dan caption disetujui.",
    detailDescription:
      "Contoh halaman dokumentasi kerja bakti lingkungan untuk memperlihatkan cara foto, caption, dan status persetujuan dapat ditata sebelum menjadi arsip publik.",
    icon: "users",
    tone: "primary",
    imageSrc: "/assets/kegiatan/kerja-bakti.png",
    imageAlt:
      "Contoh visual dokumentasi kerja bakti lingkungan untuk Mode Tinjauan Pengurus",
    captions: [
      "Caption contoh untuk suasana gotong royong warga setelah foto disetujui.",
      "Catatan kebersihan area bersama dapat ditulis singkat tanpa tanggal resmi.",
      "Dokumentasi hanya dipublikasikan setelah pengurus menyetujui materi.",
    ],
    approvalNote:
      "Menunggu persetujuan publikasi. Ini contoh dokumentasi, bukan catatan resmi kegiatan.",
  },
  {
    title: "Rapat warga",
    slug: "rapat-warga",
    href: "/kegiatan/rapat-warga/",
    text: "Arsip visual untuk rangkuman suasana musyawarah tanpa mencantumkan nama atau keputusan sebelum persetujuan.",
    detailDescription:
      "Contoh dokumentasi rapat warga yang fokus pada suasana forum dan struktur caption, tanpa memuat keputusan atau peserta sebagai klaim resmi.",
    icon: "message",
    tone: "accent",
    imageSrc: "/assets/kegiatan/rapat-warga.png",
    imageAlt:
      "Contoh visual dokumentasi rapat warga untuk Mode Tinjauan Pengurus",
    captions: [
      "Caption contoh untuk suasana diskusi warga setelah materi disetujui.",
      "Rangkuman dapat ditulis sebagai arsip visual, bukan notulen resmi.",
      "Nama peserta dan keputusan tidak ditampilkan sebelum persetujuan publikasi.",
    ],
    approvalNote:
      "Menunggu persetujuan publikasi. Halaman ini bukan notulen atau keputusan resmi.",
  },
  {
    title: "Kegiatan sosial",
    slug: "kegiatan-sosial",
    href: "/kegiatan/kegiatan-sosial/",
    text: "Ruang kurasi untuk momen kebersamaan warga yang layak tampil sebagai dokumentasi komunitas.",
    detailDescription:
      "Contoh arsip kegiatan sosial yang menunjukkan bagaimana momen kebersamaan dapat dipresentasikan secara rapi setelah kurasi pengurus.",
    icon: "home",
    tone: "cream",
    imageSrc: "/assets/kegiatan/kegiatan-sosial.png",
    imageAlt:
      "Contoh visual dokumentasi kegiatan sosial untuk Mode Tinjauan Pengurus",
    captions: [
      "Caption contoh untuk kegiatan sosial warga yang sudah dikurasi.",
      "Materi visual dapat dipilih agar tetap sopan dan relevan untuk arsip.",
      "Informasi penerima, nama, atau detail sensitif tidak ditampilkan tanpa persetujuan.",
    ],
    approvalNote:
      "Menunggu persetujuan publikasi. Konten ini hanya simulasi format dokumentasi.",
  },
  {
    title: "Keamanan dan kebersihan",
    slug: "keamanan-kebersihan",
    href: "/kegiatan/keamanan-kebersihan/",
    text: "Contoh kategori untuk dokumentasi koordinasi lingkungan, patroli, dan perawatan area bersama.",
    detailDescription:
      "Contoh dokumentasi keamanan dan kebersihan untuk memperlihatkan arsip visual kegiatan lingkungan tanpa mengklaim jadwal atau laporan resmi.",
    icon: "shield",
    tone: "primary",
    imageSrc: "/assets/kegiatan/keamanan-kebersihan.png",
    imageAlt:
      "Contoh visual dokumentasi keamanan dan kebersihan untuk Mode Tinjauan Pengurus",
    captions: [
      "Caption contoh untuk koordinasi keamanan dan kebersihan lingkungan.",
      "Keterangan dapat berisi fokus kegiatan tanpa menyebut laporan resmi.",
      "Foto dan caption tetap melewati persetujuan sebelum publikasi.",
    ],
    approvalNote:
      "Menunggu persetujuan publikasi. Ini bukan laporan keamanan resmi.",
  },
  {
    title: "Kegiatan anak-anak / keluarga",
    slug: "kegiatan-keluarga",
    href: "/kegiatan/kegiatan-keluarga/",
    text: "Format arsip untuk aktivitas keluarga yang dipublikasikan hanya setelah materi visual disetujui.",
    detailDescription:
      "Contoh halaman dokumentasi kegiatan keluarga yang menekankan kurasi foto dan caption sebelum konten layak tampil untuk publik.",
    icon: "calendar",
    tone: "accent",
    imageSrc: "/assets/kegiatan/kegiatan-keluarga.png",
    imageAlt:
      "Contoh visual dokumentasi kegiatan anak-anak dan keluarga untuk Mode Tinjauan Pengurus",
    captions: [
      "Caption contoh untuk aktivitas keluarga setelah materi visual disetujui.",
      "Dokumentasi anak-anak atau keluarga memerlukan kurasi yang lebih hati-hati.",
      "Detail pribadi tidak ditampilkan tanpa persetujuan publikasi.",
    ],
    approvalNote:
      "Menunggu persetujuan publikasi. Konten ini bukan arsip kegiatan resmi.",
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
  { label: "Saldo akhir", value: "Rp 5.500.000" },
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
    name: "Ma'niez Donut",
    category: "Kuliner",
    cluster: "Cluster Colloseum",
    price: "Harga contoh: Rp 20.000",
    status: "Pilot trial WA / Mode Uji Coba",
    icon: "utensils",
    imageSrc: "/assets/palugada/maniez-donut-main.png",
    imageAlt: "Contoh tampilan Ma'niez Donut untuk katalog PALUGADA CGV",
    detailSlug: "donat-kentang-warga",
    detailHref: "/palugada/donat-kentang-warga/",
    detailDescription:
      "Pilot lapak PALUGADA untuk meninjau format katalog kuliner warga Ma'niez Donut dengan WhatsApp trial khusus selama Mode Uji Coba.",
    providerProfile:
      "Profil penyedia ditampilkan sebagai format usaha rumahan warga untuk pilot trial. Tautan WhatsApp hanya aktif untuk Ma'niez Donut selama Mode Uji Coba.",
    productDetail:
      "Ma'niez Donut dipakai sebagai pilot lapak PALUGADA: produk kuliner rumahan dengan foto lokal, harga contoh, varian contoh, format pesanan, area layanan, dan status transaksi yang dibuat jelas sejak awal.",
    exampleScope: [
      "Varian contoh: coklat meses, keju, dan red velvet.",
      "Format pesanan contoh: box kecil, box keluarga, dan pesanan acara warga.",
      "Informasi ketersediaan, jadwal produksi, dan kontak masih berupa simulasi format.",
    ],
    availabilityNote:
      "Ketersediaan dan jadwal pesanan masih dalam Mode Uji Coba. Konfirmasi awal hanya melalui WhatsApp pilot Ma'niez Donut.",
    demoStatusNote:
      "Pilot trial WA dalam Mode Uji Coba. Tidak ada checkout, keranjang, pembayaran, login, database, backend, atau dashboard penjual.",
    pilotBadge: "WA Pilot Mode Uji Coba",
    galleryImages: [
      {
        src: "/assets/palugada/maniez-donut-main.png",
        alt: "Ma'niez Donut sebagai foto utama pilot PALUGADA",
      },
      {
        src: "/assets/palugada/maniez-donut-varian01.png",
        alt: "Contoh varian Ma'niez Donut untuk katalog PALUGADA",
      },
      {
        src: "/assets/palugada/maniez-donut-varian02.png",
        alt: "Contoh pilihan Ma'niez Donut untuk pilot PALUGADA",
      },
    ],
    variants: ["Coklat meses", "Keju", "Red velvet"],
    orderFormats: [
      "Box kecil untuk camilan keluarga",
      "Box keluarga untuk kumpul warga",
      "Pesanan acara warga dengan konfirmasi admin",
    ],
    serviceAreas: [
      "Cluster Colloseum sebagai area contoh pilot",
      "Area CGV10 lain dapat ditinjau setelah aturan publikasi disepakati",
      "Pengambilan atau pengantaran belum menjadi layanan aktif",
    ],
    transactionStatus:
      "Status transaksi: pilot trial WA untuk konfirmasi awal Ma'niez Donut. Pembayaran, checkout, keranjang, login, database, backend, dan dashboard penjual tidak tersedia.",
    validationSteps: [
      "Admin/pengurus meninjau data lapak dan foto produk.",
      "WhatsApp trial hanya aktif untuk Ma'niez Donut selama Mode Uji Coba.",
      "Listing pilot dipakai untuk menyepakati format katalog sebelum diperluas tanpa checkout, pembayaran, atau dashboard penjual.",
    ],
    pilotNote:
      "Pilot ini digunakan untuk meninjau format katalog dengan WhatsApp trial khusus Ma'niez Donut.",
    whatsappHref: "https://wa.me/6281291254064",
    whatsappLabel: "Hubungi WA Pilot",
    whatsappDisplayNumber: "+62 812-9125-4064",
    whatsappStatus: "Pilot trial WA",
  },
  {
    name: "Jasa Laundry Kiloan",
    category: "Jasa",
    cluster: "Cluster Oxford",
    price: "Harga sesuai berat cucian",
    status: "Contoh tampilan - WA nonaktif",
    icon: "briefcase",
    imageSrc: "/assets/palugada/palugada-laundry.jpg",
    imageAlt:
      "Contoh tampilan jasa laundry kiloan untuk katalog PALUGADA CGV",
    detailSlug: "jasa-laundry-kiloan",
    detailHref: "/palugada/jasa-laundry-kiloan/",
    detailDescription:
      "Contoh halaman detail untuk jasa harian warga dengan informasi cluster, status layanan, dan batasan bahwa WA belum aktif.",
    providerProfile:
      "Profil penyedia jasa ditampilkan sebagai contoh struktur direktori. Detail operasional dan kontak resmi belum dipublikasikan.",
    productDetail:
      "Jasa laundry kiloan ditampilkan sebagai contoh layanan harian warga yang dapat dijelaskan lebih rapi melalui halaman detail katalog.",
    exampleScope: [
      "Cakupan contoh: cuci kiloan, setrika, dan lipat pakaian.",
      "Catatan layanan dapat memuat area cluster, estimasi pengerjaan, dan syarat penerimaan cucian.",
      "Harga akhir, jam layanan, dan metode penyerahan belum menjadi data resmi.",
    ],
    availabilityNote:
      "Ketersediaan layanan masih simulasi untuk review. Jadwal operasional dan kontak penyedia belum dipublikasikan.",
    demoStatusNote:
      "Contoh tampilan dalam Mode Tinjauan Pengurus. Bukan transaksi aktif dan WA nonaktif untuk demo.",
  },
  {
    name: "Tanaman Hias Rumah",
    category: "Barang",
    cluster: "Cluster Windsor",
    price: "Harga contoh: Rp 25.000",
    status: "Contoh tampilan - WA nonaktif",
    icon: "store",
  },
  {
    name: "Info Properti Warga",
    category: "Properti",
    cluster: "Cluster Cambridge",
    price: "Harga contoh: informasi menyusul",
    status: "Contoh tampilan - WA nonaktif",
    icon: "building",
  },
  {
    name: "Catering Rumahan",
    category: "Kuliner",
    cluster: "Cluster Chelsea",
    price: "Harga menu saat rilis",
    status: "Contoh tampilan - WA nonaktif",
    icon: "utensils",
    imageSrc: "/assets/palugada/palugada-catering.jpg",
    imageAlt:
      "Contoh tampilan catering rumahan untuk katalog PALUGADA CGV",
    detailSlug: "catering-rumahan",
    detailHref: "/palugada/catering-rumahan/",
    detailDescription:
      "Contoh halaman detail untuk katalog catering rumahan, termasuk gambaran menu, cluster, dan status harga yang masih menunggu rilis.",
    providerProfile:
      "Profil penyedia kuliner rumahan masih berupa contoh tampilan. Kontak, jadwal pesanan, dan ketentuan publikasi menunggu persetujuan.",
    productDetail:
      "Catering rumahan ditampilkan sebagai contoh layanan kuliner yang membutuhkan deskripsi menu, area layanan, dan status pemesanan yang jelas.",
    exampleScope: [
      "Cakupan contoh: paket nasi rumahan, lauk harian, dan pesanan acara kecil.",
      "Halaman detail dapat menampilkan catatan menu, porsi, dan waktu pemesanan.",
      "Harga menu saat rilis masih menunggu data resmi dari penyedia.",
    ],
    availabilityNote:
      "Ketersediaan menu dan batas pemesanan belum aktif. Konten ini hanya contoh struktur untuk bahan tinjauan.",
    demoStatusNote:
      "Contoh tampilan dalam Mode Tinjauan Pengurus. Bukan transaksi aktif dan WA nonaktif untuk demo.",
  },
  {
    name: "Jasa Servis AC",
    category: "Jasa",
    cluster: "Cluster Somerset",
    price: "Harga menunggu konfirmasi",
    status: "Contoh tampilan - WA nonaktif",
    icon: "briefcase",
    imageSrc: "/assets/palugada/palugada-servis-ac.jpg",
    imageAlt:
      "Contoh tampilan jasa servis AC untuk katalog PALUGADA CGV",
    detailSlug: "jasa-servis-ac",
    detailHref: "/palugada/jasa-servis-ac/",
    detailDescription:
      "Contoh halaman detail untuk layanan servis AC warga dengan foto layanan, cluster, harga menunggu konfirmasi, dan tombol WA nonaktif.",
    providerProfile:
      "Profil penyedia jasa teknis disiapkan sebagai contoh kartu review. Data penyedia dan kontak resmi belum menjadi data publik.",
    productDetail:
      "Jasa servis AC ditampilkan sebagai contoh layanan teknis warga yang perlu menjelaskan cakupan pekerjaan dan status harga secara transparan.",
    exampleScope: [
      "Cakupan contoh: pengecekan AC, pembersihan ringan, dan konsultasi kondisi unit.",
      "Detail layanan dapat memuat area cluster, catatan kunjungan, dan kebutuhan konfirmasi teknisi.",
      "Harga, jadwal kunjungan, dan kontak penyedia belum dikonfirmasi sebagai data resmi.",
    ],
    availabilityNote:
      "Ketersediaan layanan masih menunggu konfirmasi. Halaman ini tidak membuka pemesanan atau transaksi.",
    demoStatusNote:
      "Contoh tampilan dalam Mode Tinjauan Pengurus. Bukan transaksi aktif dan WA nonaktif untuk demo.",
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
    demoStatusNote: string;
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
        item.demoStatusNote,
    ),
);

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
