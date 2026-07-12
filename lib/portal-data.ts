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
  sellerStatus: "online" | "offline";
  sellerStatusLabel: string;
  sellerStatusNote: string;
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
  articleSections?: {
    paragraphs: string[];
    image?: {
      src: string;
      alt: string;
      caption: string;
    };
  }[];
  captions: string[];
  archiveNote: string;
};

export type KabarArticle = {
  title: string;
  seoTitle?: string;
  slug?: string;
  category: "Artikel" | "Pengumuman" | "Agenda" | "Kabar Lingkungan";
  excerpt: string;
  body: string;
  bodySections?: {
    heading?: string;
    paragraphs?: string[];
    list?: string[];
    signature?: string[];
    image?: {
      src: string;
      alt: string;
      caption: string;
    };
  }[];
  tags?: string[];
  author: string;
  publishedAt: string;
  readTime: string;
  coverImageSrc?: string;
  coverImageAlt?: string;
  video?: {
    src: string;
    posterSrc: string;
    title: string;
    durationLabel: string;
  };
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
    title:
      "Primatama FC CGV U12 Lolos ke Babak 16 Besar NFA Cup Futsal Piala Gubernur & Wakil Gubernur Kepri 2026",
    slug: "primatama-fc-cgv-u12-babak-16-besar",
    href: "/kegiatan/primatama-fc-cgv-u12-babak-16-besar/",
    text:
      "Kabar membanggakan datang dari anak-anak warga CGV yang tergabung dalam Primatama FC CGV U12.",
    detailDescription:
      "Primatama FC CGV U12 berhasil melangkah ke babak 16 besar dalam ajang NFA Cup Futsal Piala Gubernur dan Wakil Gubernur Kepri 2026.",
    icon: "users",
    tone: "primary",
    imageSrc: "/assets/kegiatan/primatama-fc1-optimized.jpg",
    imageAlt:
      "Primatama FC CGV U12 dalam NFA Cup Futsal Piala Gubernur dan Wakil Gubernur Kepri 2026",
    articleSections: [
      {
        paragraphs: [
          "Kabar membanggakan datang dari anak-anak warga CGV yang tergabung dalam Primatama FC CGV U12. Berdasarkan informasi dari official tim, Primatama FC CGV U12 berhasil melangkah ke babak 16 besar dalam ajang NFA Cup Futsal Piala Gubernur dan Wakil Gubernur Kepri 2026.",
          "Turnamen ini menjadi salah satu ajang penting bagi pembinaan futsal usia muda di Kepulauan Riau. Melalui kompetisi seperti ini, anak-anak tidak hanya belajar mengejar kemenangan, tetapi juga membangun mental bertanding, kerja sama tim, disiplin, sportivitas, dan keberanian tampil di arena kompetitif.",
          "Dalam keterangan yang dibagikan official, klasemen akhir U12 menunjukkan bahwa tim-tim yang diberi tanda warna berhak lolos ke babak 16 besar. Warna kuning menunjukkan juara grup, warna biru menunjukkan runner-up, dan warna merah menunjukkan peringkat tiga terbaik. Seluruh tim yang masuk dalam penanda warna tersebut berhak melanjutkan perjuangan ke fase berikutnya.",
        ],
        image: {
          src: "/assets/kegiatan/primatama-fc2-optimized.jpg",
          alt: "Dokumentasi Primatama FC CGV U12 bersama official tim",
          caption: "Dokumentasi Primatama FC CGV U12.",
        },
      },
      {
        paragraphs: [
          "Official tim juga menyampaikan permohonan doa kepada warga:",
          "Doakan ya Bapak Ibu, anak-anak kita Primatama U12 masuk ke babak 16 besar.",
          "Capaian ini tentu menjadi kebanggaan bagi warga CGV. Di balik setiap pertandingan, ada proses latihan, dukungan orang tua, arahan pelatih, kekompakan tim, dan semangat anak-anak untuk terus berjuang membawa nama baik lingkungan.",
          "Semoga langkah Primatama FC CGV U12 di babak 16 besar diberikan kelancaran, kesehatan, kekuatan, dan hasil terbaik. Apa pun hasil akhirnya nanti, perjuangan anak-anak ini sudah menjadi contoh positif bahwa lingkungan yang baik dapat melahirkan semangat, prestasi, dan kebersamaan.",
          "Mari warga CGV bersama-sama memberikan doa dan dukungan terbaik untuk anak-anak Primatama FC CGV U12.",
          "Semangat Primatama FC CGV. Tetap kompak, percaya diri, dan bermain dengan sportivitas.",
        ],
        image: {
          src: "/assets/kegiatan/primatama-klasemen.jpeg",
          alt: "Klasemen akhir U12 NFA Cup Futsal yang menandai tim lolos babak 16 besar",
          caption: "Klasemen akhir U12 untuk penentuan peserta babak 16 besar.",
        },
      },
    ],
    captions: [
      "Primatama FC CGV U12 lolos ke babak 16 besar.",
      "Turnamen menjadi ruang pembinaan mental, kerja sama tim, dan sportivitas.",
      "Warga CGV diajak memberi doa dan dukungan terbaik untuk anak-anak.",
    ],
    archiveNote:
      "Artikel warga tentang capaian Primatama FC CGV U12.",
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
    imageSrc: "/assets/kegiatan/rapat-warga-optimized.jpg",
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
    imageSrc: "/assets/kegiatan/kegiatan-sosial-optimized.jpg",
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
    imageSrc: "/assets/kegiatan/keamanan-kebersihan-optimized.jpg",
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
    imageSrc: "/assets/kegiatan/kegiatan-keluarga-optimized.jpg",
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
      ? "/assets/pengurus/doddy-dharma-optimized.jpg"
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
    title:
      "Wajah Lingkungan Cipta Green Ville: Hunian Modern, Rapi, dan Terus Bertumbuh",
    seoTitle:
      "Wajah Lingkungan Cipta Green Ville: Hunian Modern dan Komunitas Warga yang Terus Bertumbuh",
    slug: "wajah-lingkungan-cipta-green-ville",
    category: "Kabar Lingkungan",
    excerpt:
      "Cipta Green Ville terus berkembang sebagai kawasan hunian modern yang nyaman, tertata, dan memiliki semangat komunitas warga yang kuat.",
    body:
      "Cipta Green Ville terus menunjukkan perkembangan sebagai kawasan hunian yang nyaman, tertata, dan memiliki karakter lingkungan yang kuat.",
    bodySections: [
      {
        paragraphs: [
          "Cipta Green Ville terus menunjukkan perkembangan sebagai kawasan hunian yang nyaman, tertata, dan memiliki karakter lingkungan yang kuat. Dari area masuk kawasan, fasilitas umum, jalan lingkungan, hingga deretan rumah warga, suasana Cipta Green Ville menghadirkan kesan modern, bersih, dan layak menjadi ruang tinggal yang aman bagi keluarga.",
          "Melalui dokumentasi visual terbaru, terlihat bahwa kawasan ini memiliki identitas yang cukup kuat sebagai lingkungan hunian modern. Bangunan rumah dengan desain kontemporer, perpaduan warna cerah, area jalan yang terbuka, serta penataan taman di sekitar hunian memberikan kesan kawasan yang aktif dirawat dan terus berkembang.",
        ],
        image: {
          src: "/assets/kegiatan/2026-06-28_lingkungan_signage-cgv_web_v1-optimized.jpg",
          alt: "Signage kawasan Cipta Green Ville sebagai identitas lingkungan",
          caption:
            "Identitas kawasan Cipta Green Ville sebagai lingkungan hunian yang terus berkembang.",
        },
      },
      {
        heading: "Lingkungan Hunian yang Nyaman untuk Keluarga",
        paragraphs: [
          "Salah satu kekuatan utama sebuah perumahan bukan hanya terletak pada bangunannya, tetapi juga pada suasana lingkungannya. Cipta Green Ville memiliki potensi besar sebagai kawasan tempat tinggal keluarga karena menghadirkan ruang yang cukup lega, akses jalan yang memadai, serta suasana lingkungan yang tenang.",
          "Deretan rumah dengan desain modern memberi kesan rapi dan tertata. Hal ini menjadi nilai tambah bagi warga, karena lingkungan yang baik dapat membantu menciptakan rasa nyaman dalam aktivitas sehari-hari.",
        ],
        image: {
          src: "/assets/kegiatan/2026-06-28_lingkungan_rumah-cluster-cgv_web_v1-optimized.jpg",
          alt: "Tampilan rumah cluster modern di kawasan Cipta Green Ville",
          caption:
            "Tampilan hunian modern di kawasan Cipta Green Ville dengan desain rapi, bersih, dan nyaman untuk keluarga.",
        },
      },
      {
        heading: "Fasilitas dan Ruang Bersama sebagai Nilai Tambah Kawasan",
        paragraphs: [
          "Selain hunian, fasilitas bersama juga menjadi bagian penting dalam membangun kualitas hidup warga. Area seperti kolam renang dan ruang terbuka dapat menjadi tempat warga beraktivitas, bersantai, sekaligus mempererat hubungan sosial antarwarga.",
          "Fasilitas seperti ini tidak hanya berfungsi sebagai pelengkap kawasan, tetapi juga menjadi ruang interaksi. Anak-anak, keluarga, dan warga dapat memiliki tempat untuk menikmati waktu bersama dalam suasana yang lebih santai dan positif.",
        ],
        image: {
          src: "/assets/kegiatan/2026-06-28_fasilitas_kolam-cgv_web_v1-optimized.jpg",
          alt: "Fasilitas kolam renang kawasan Cipta Green Ville",
          caption:
            "Fasilitas kawasan yang dapat menjadi ruang bersama bagi warga dan keluarga.",
        },
      },
      {
        heading: "Keamanan dan Penerangan Lingkungan",
        paragraphs: [
          "Dokumentasi suasana malam di jalan lingkungan menunjukkan pentingnya penerangan dan pengawasan kawasan. Jalan yang terang dan terpantau menjadi salah satu faktor utama dalam membangun rasa aman bagi warga.",
          "Keberadaan dokumentasi dari petugas keamanan juga menunjukkan adanya perhatian terhadap kondisi lingkungan. Hal ini perlu terus dijaga agar warga merasa lebih tenang, terutama pada malam hari.",
        ],
        image: {
          src: "/assets/kegiatan/2026-06-28_security_jalan-malam-cgv-01_web_v1-optimized.jpg",
          alt: "Suasana jalan lingkungan Cipta Green Ville pada malam hari",
          caption:
            "Suasana jalan lingkungan pada malam hari sebagai bagian dari perhatian terhadap keamanan dan kenyamanan warga.",
        },
      },
      {
        heading: "Membangun Identitas Digital Warga CGV",
        paragraphs: [
          "Melalui Portal Warga CGV, dokumentasi seperti ini dapat menjadi bagian dari identitas digital lingkungan. Setiap foto, kabar, dan informasi kawasan dapat membantu warga melihat perkembangan lingkungan secara lebih terbuka.",
          "Ke depan, dokumentasi lingkungan tidak hanya menjadi arsip visual, tetapi juga dapat menjadi sarana komunikasi warga, publikasi kegiatan, laporan kondisi lingkungan, dan penguatan rasa memiliki terhadap kawasan Cipta Green Ville.",
        ],
        image: {
          src: "/assets/kegiatan/2026-06-28_security_jalan-malam-cgv-02_web_v1-optimized.jpg",
          alt: "Dokumentasi jalan lingkungan Cipta Green Ville saat malam",
          caption:
            "Dokumentasi lingkungan membantu warga melihat kondisi kawasan secara lebih terbuka.",
        },
      },
      {
        heading: "Bersama Menjaga Lingkungan",
        paragraphs: [
          "Cipta Green Ville bukan hanya kumpulan rumah, tetapi sebuah komunitas warga. Karena itu, kenyamanan lingkungan perlu dijaga bersama, baik melalui kebersihan, keamanan, kepedulian antarwarga, maupun komunikasi yang baik antara warga dan pengurus.",
          "Dengan semangat kebersamaan, Cipta Green Ville dapat terus tumbuh menjadi lingkungan yang lebih rapi, aman, nyaman, dan membanggakan bagi seluruh warga.",
        ],
      },
    ],
    tags: [
      "Cipta Green Ville",
      "CGV",
      "Portal Warga",
      "Lingkungan Warga",
      "Keamanan",
      "Fasilitas Perumahan",
      "Hunian Modern",
    ],
    author: "Pengurus CGV10",
    publishedAt: "10 Jul 2026",
    readTime: "4 menit baca",
    coverImageSrc:
      "/assets/kegiatan/2026-06-28_lingkungan_signage-cgv_web_v1-optimized.jpg",
    coverImageAlt:
      "Identitas kawasan Cipta Green Ville sebagai lingkungan hunian yang terus berkembang",
  },
  {
    title: "Pengumuman Susunan Kepengurusan RT 010 Periode Baru",
    slug: "pengumuman-susunan-kepengurusan-rt-010-periode-baru",
    category: "Pengumuman",
    excerpt:
      "Pernyataan Ketua RT 010 tentang amanah kepengurusan baru, susunan organisasi, dan serah terima dari pengurus sebelumnya.",
    body:
      "Tim Kepengurusan RT 010 menyampaikan terima kasih atas kepercayaan warga, memohon doa serta kerja sama, dan melampirkan susunan kepengurusan baru sebagai bentuk keterbukaan kepada seluruh warga.",
    bodySections: [
      {
        paragraphs: [
          "Assalamualaikum warahmatullahi wabarakatuh.",
          "Salam sejahtera untuk semuanya,",
          "Bapak/Ibu dan seluruh warga RT 010 yang kami hormati,",
          "Dengan penuh rasa syukur, kami dari Tim Kepengurusan RT 010 mengucapkan terima kasih atas kepercayaan yang telah diberikan kepada kami untuk mengemban amanah sebagai pengurus RT yang baru.",
          "Amanah ini bukanlah tugas yang ringan. Kami menyadari bahwa membangun lingkungan yang nyaman, rukun, dan harmonis hanya dapat terwujud dengan kebersamaan, kepedulian, serta dukungan dari seluruh warga. Oleh karena itu, kami memohon doa, masukan, dan kerja sama dari Bapak/Ibu sekalian agar kami dapat menjalankan tugas ini dengan sebaik-baiknya.",
          "Bersama pengumuman ini, kami juga menyampaikan susunan Kepengurusan RT 010 periode yang baru sebagai bentuk keterbukaan kepada seluruh warga.",
          "Sebagai bagian dari proses pergantian kepengurusan, telah dilaksanakan serah terima dari pengurus RT sebelumnya. Adapun rincian serah terima yang kami terima adalah sebagai berikut:",
        ],
        list: [
          "Inventaris RT, dengan daftar inventaris terlampir.",
          "Saldo uang kas RT yang tersisa sebesar Rp10.000, dengan keterangan uang kas terlampir.",
        ],
      },
      {
        paragraphs: [
          "Seluruh rincian tersebut kami lampirkan sebagai bentuk transparansi dan pertanggungjawaban kepada seluruh warga.",
          "Kami juga mengucapkan terima kasih yang sebesar-besarnya kepada pengurus RT sebelumnya atas segala pengabdian, waktu, tenaga, dan kontribusi yang telah diberikan untuk kemajuan lingkungan RT 010. Semoga segala kebaikan yang telah dilakukan menjadi amal ibadah dan membawa manfaat bagi kita semua.",
          "Mari kita jadikan RT 010 sebagai lingkungan yang semakin kompak, peduli, dan penuh semangat gotong royong. Bersama, kita bisa menciptakan lingkungan yang lebih baik untuk kita dan generasi yang akan datang.",
          "Atas perhatian, dukungan, dan kerja sama Bapak/Ibu sekalian, kami ucapkan terima kasih.",
          "Wassalamualaikum warahmatullahi wabarakatuh.",
        ],
        signature: ["Ketua RT 010", "Doddy Dharma"],
      },
    ],
    author: "Ketua RT 010",
    publishedAt: "10 Jul 2026",
    readTime: "4 menit baca",
    coverImageSrc: "/assets/pengurus/RT10-Official-Pengurus.jpeg",
    coverImageAlt: "Bagan susunan Kepengurusan RT 010 periode baru",
  },
  {
    title:
      "Sedekah Jumat di Lingkungan CGV: Menebar Kepedulian, Menguatkan Kebersamaan",
    slug: "sedekah-jumat-di-lingkungan-cgv",
    category: "Artikel",
    excerpt:
      "Dokumentasi kegiatan sosial Sedekah Jumat sebagai bentuk kepedulian warga dan penguatan kebersamaan di lingkungan sekitar Cipta Green Ville.",
    body:
      "Kegiatan sosial kembali terlihat di lingkungan sekitar Cipta Green Ville melalui agenda pembagian Sedekah Jumat.",
    bodySections: [
      {
        paragraphs: [
          "Kegiatan sosial kembali terlihat di lingkungan sekitar Cipta Green Ville melalui agenda pembagian Sedekah Jumat. Dalam dokumentasi kegiatan, tampak suasana sederhana namun penuh makna, ketika warga dan pihak yang terlibat turut berperan dalam menyalurkan kebaikan kepada masyarakat sekitar.",
          "Sedekah Jumat menjadi salah satu bentuk kepedulian sosial yang sangat positif. Tidak hanya bernilai sebagai bantuan, kegiatan ini juga menjadi sarana untuk mempererat hubungan antarwarga, menumbuhkan rasa empati, dan membangun lingkungan yang lebih peduli terhadap sesama.",
        ],
        image: {
          src: "/assets/kegiatan/2026-07-10_kabar-sosial_sedekah-jumat-cgv_panitia-01-optimized.jpg",
          alt: "Dokumentasi kegiatan Sedekah Jumat di lingkungan sekitar Cipta Green Ville",
          caption:
            "Dokumentasi Sedekah Jumat sebagai kegiatan sosial warga di lingkungan sekitar CGV.",
        },
      },
      {
        heading: "Peran Sosial Warga dalam Lingkungan Sekitar",
        paragraphs: [
          "Sebuah lingkungan yang baik tidak hanya diukur dari kerapian kawasan dan fasilitasnya, tetapi juga dari kepedulian warganya. Melalui kegiatan seperti Sedekah Jumat, warga dapat mengambil bagian dalam aktivitas sosial yang membawa manfaat bagi orang lain.",
          "Kegiatan ini menjadi pengingat bahwa kebersamaan warga tidak hanya hadir dalam forum, rapat, atau kegiatan lingkungan, tetapi juga dalam bentuk kepedulian nyata. Sekecil apa pun kontribusi yang diberikan, ketika dilakukan bersama-sama akan menjadi bagian dari kebaikan yang lebih besar.",
        ],
      },
      {
        heading: "Menumbuhkan Budaya Peduli dan Berbagi",
        paragraphs: [
          "Sedekah Jumat memiliki nilai yang kuat karena dilakukan secara rutin dan dekat dengan kehidupan masyarakat. Aktivitas seperti ini dapat menjadi contoh baik bagi keluarga, anak-anak, dan warga sekitar bahwa kepedulian sosial adalah bagian penting dari kehidupan bertetangga.",
          "Dengan adanya kegiatan berbagi, lingkungan menjadi lebih hangat. Warga tidak hanya hidup berdampingan, tetapi juga saling memperhatikan dan mendukung.",
        ],
      },
      {
        heading: "Dokumentasi Positif untuk Portal Warga CGV",
        paragraphs: [
          "Melalui Portal Warga CGV, kegiatan sosial seperti ini dapat terdokumentasi dengan lebih rapi sebagai bagian dari kabar lingkungan. Dokumentasi Sedekah Jumat dapat menjadi catatan positif tentang peran warga dalam membangun budaya sosial yang aktif, peduli, dan bermanfaat.",
          "Ke depan, kegiatan sosial warga dapat menjadi salah satu bagian penting dalam Kabar Warga CGV, agar setiap aktivitas kebaikan dapat diketahui, diapresiasi, dan menjadi inspirasi bagi warga lainnya.",
        ],
      },
      {
        heading: "Semoga Terus Menjadi Kebaikan",
        paragraphs: [
          "Terima kasih kepada seluruh pihak yang telah ikut mendukung kegiatan Sedekah Jumat ini. Semoga setiap bantuan yang diberikan menjadi amal kebaikan, membawa manfaat bagi penerima, dan menjadi jalan untuk memperkuat kepedulian sosial di lingkungan CGV dan sekitarnya.",
          "Semoga kegiatan seperti ini dapat terus berjalan, semakin terorganisir, dan menjadi bagian dari budaya positif warga Cipta Green Ville.",
        ],
      },
    ],
    tags: [
      "Sedekah Jumat",
      "Kabar Sosial",
      "Cipta Green Ville",
      "Kepedulian Warga",
      "Portal Warga",
    ],
    author: "Pengurus CGV10",
    publishedAt: "10 Jul 2026",
    readTime: "4 menit baca",
    coverImageSrc:
      "/assets/kegiatan/2026-07-10_kabar-sosial_sedekah-jumat-cgv_panitia-01-optimized.jpg",
    coverImageAlt:
      "Dokumentasi kegiatan Sedekah Jumat di lingkungan sekitar Cipta Green Ville",
    video: {
      src: "/assets/kegiatan/2026-07-10_kabar-sosial_sedekah-jumat-cgv_video-01.mp4",
      posterSrc:
        "/assets/kegiatan/2026-07-10_kabar-sosial_sedekah-jumat-cgv_poster-01-optimized.jpg",
      title: "Video dokumentasi Sedekah Jumat CGV",
      durationLabel: "27 detik",
    },
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
    sellerStatus: "online",
    sellerStatusLabel: "Online",
    sellerStatusNote: "Menerima konfirmasi pesanan melalui WhatsApp.",
    icon: "utensils",
    imageSrc: "/assets/palugada/maniez-donut-main-optimized.jpg",
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
        src: "/assets/palugada/maniez-donut-main-optimized.jpg",
        alt: "Ma'niez Donut sebagai foto utama PALUGADA",
      },
      {
        src: "/assets/palugada/maniez-donut-varian01-optimized.jpg",
        alt: "Varian Ma'niez Donut untuk katalog PALUGADA",
      },
      {
        src: "/assets/palugada/maniez-donut-varian02-optimized.jpg",
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
    sellerStatus: "offline",
    sellerStatusLabel: "Offline",
    sellerStatusNote: "Lapak belum membuka kontak langsung di katalog.",
    icon: "briefcase",
    imageSrc: "/assets/palugada/palugada-laundry-optimized.jpg",
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
    sellerStatus: "offline",
    sellerStatusLabel: "Offline",
    sellerStatusNote: "Ketersediaan masih menunggu konfirmasi pengurus.",
    icon: "store",
  },
  {
    name: "Info Properti Warga",
    category: "Properti",
    cluster: "Cluster Aurora",
    price: "Informasi menyusul",
    status: "Katalog warga",
    sellerStatus: "offline",
    sellerStatusLabel: "Offline",
    sellerStatusNote: "Informasi properti belum aktif untuk kontak langsung.",
    icon: "building",
  },
  {
    name: "Catering Rumahan",
    category: "Kuliner",
    cluster: "Cluster Meteora",
    price: "Harga menu saat rilis",
    status: "Katalog warga",
    sellerStatus: "offline",
    sellerStatusLabel: "Offline",
    sellerStatusNote: "Menu dan jadwal pemesanan belum dibuka di katalog.",
    icon: "utensils",
    imageSrc: "/assets/palugada/palugada-catering-optimized.jpg",
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
    sellerStatus: "offline",
    sellerStatusLabel: "Offline",
    sellerStatusNote: "Jadwal layanan belum aktif untuk kontak langsung.",
    icon: "briefcase",
    imageSrc: "/assets/palugada/palugada-servis-ac-optimized.jpg",
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
