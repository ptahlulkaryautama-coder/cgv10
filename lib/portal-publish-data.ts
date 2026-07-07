import {
  announcements,
  contacts,
  financeTransactions,
  kegiatanItems,
  marketplaceItems,
} from "./portal-data";

export type PublishStatus = "Published" | "Review" | "Draft" | "Tahan";

export type PortalContentChannel =
  | "Pengumuman"
  | "Agenda"
  | "Keuangan"
  | "PALUGADA"
  | "Kontak";

export type PortalContentItem = {
  id: string;
  title: string;
  channel: PortalContentChannel;
  status: PublishStatus;
  owner: string;
  visibility: "Publik" | "Internal" | "Terbatas";
  updated: string;
  summary: string;
  readiness: number;
  portalPath: string;
  source: string;
};

const publishedDate = "03 Jul 2026";

const announcementItems: PortalContentItem[] = announcements.map((item, index) => ({
  id: `PUB-ANN-${String(index + 1).padStart(2, "0")}`,
  title: item.title,
  channel: "Pengumuman",
  status: "Published",
  owner: "Portal Warga",
  visibility: "Publik",
  updated: publishedDate,
  summary: item.text,
  readiness: 92,
  portalPath: "/kabar-warga/",
  source: "lib/portal-data.ts",
}));

const agendaItems: PortalContentItem[] = kegiatanItems.map((item, index) => ({
  id: `PUB-AGD-${String(index + 1).padStart(2, "0")}`,
  title: item.title,
  channel: "Agenda",
  status: "Published",
  owner: "Program & Kegiatan",
  visibility: "Publik",
  updated: publishedDate,
  summary: item.text,
  readiness: 94,
  portalPath: item.href,
  source: "lib/portal-data.ts",
}));

const financeItems: PortalContentItem[] = [
  {
    id: "PUB-FIN-01",
    title: "Ringkasan kas publik",
    channel: "Keuangan",
    status: "Review",
    owner: "Bendahara",
    visibility: "Publik",
    updated: publishedDate,
    summary: `${financeTransactions.length} transaksi kas tersedia untuk ringkasan publik.`,
    readiness: 78,
    portalPath: "/keuangan/",
    source: "lib/portal-data.ts",
  },
];

const palugadaItems: PortalContentItem[] = marketplaceItems.map((item, index) => ({
  id: `PUB-PLG-${String(index + 1).padStart(2, "0")}`,
  title: item.name,
  channel: "PALUGADA",
  status: "Published",
  owner: "PALUGADA",
  visibility: "Publik",
  updated: publishedDate,
  summary: `${item.category} - ${item.cluster}. ${item.status}`,
  readiness: item.whatsappHref ? 96 : 86,
  portalPath: item.detailHref ?? "/palugada/",
  source: "lib/portal-data.ts",
}));

const contactItems: PortalContentItem[] = [
  {
    id: "PUB-CON-01",
    title: "Kontak resmi pengurus",
    channel: "Kontak",
    status: "Review",
    owner: "Pengurus",
    visibility: "Publik",
    updated: publishedDate,
    summary: `${contacts.length} entri kontak peran tersedia tanpa nomor pribadi.`,
    readiness: 82,
    portalPath: "/pengurus/#kontak-pengurus",
    source: "lib/portal-data.ts",
  },
  {
    id: "PUB-CON-02",
    title: "Kontak internal terbatas",
    channel: "Kontak",
    status: "Tahan",
    owner: "Keamanan",
    visibility: "Terbatas",
    updated: publishedDate,
    summary:
      "Nomor pribadi dan kontak internal tetap ditahan sampai ada persetujuan publikasi.",
    readiness: 48,
    portalPath: "/kontak/",
    source: "admin preview",
  },
];

export const portalContentItems: PortalContentItem[] = [
  ...announcementItems,
  ...agendaItems,
  ...financeItems,
  ...palugadaItems,
  ...contactItems,
];

export const portalPublishSummary = {
  total: portalContentItems.length,
  published: portalContentItems.filter((item) => item.status === "Published").length,
  review: portalContentItems.filter((item) => item.status === "Review").length,
  draft: portalContentItems.filter((item) => item.status === "Draft").length,
  tahan: portalContentItems.filter((item) => item.status === "Tahan").length,
  averageReadiness: Math.round(
    portalContentItems.reduce((sum, item) => sum + item.readiness, 0) /
      portalContentItems.length,
  ),
};
