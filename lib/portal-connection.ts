import {
  announcements,
  financeTransactions,
  kegiatanItems,
  marketplaceItems,
  palugadaDraftItems,
} from "./portal-data";
import {
  pengurusBidangMembers,
  pengurusClusterCoordinators,
  pengurusLeadership,
} from "./cgv10-master-data";

export type PortalConnectionStatus = "shared-static" | "prototype-local";

export type PortalConnectionItem = {
  id: string;
  label: string;
  portalPath: string;
  adminPath: string;
  source: string;
  status: PortalConnectionStatus;
  publicItems: number;
  adminItems?: number;
  note: string;
};

export const portalConnectionItems: PortalConnectionItem[] = [
  {
    id: "pengurus",
    label: "Pengurus",
    portalPath: "/pengurus/",
    adminPath: "/admin-preview/pengaturan/",
    source: "lib/cgv10-master-data.ts",
    status: "shared-static",
    publicItems:
      pengurusLeadership.length +
      pengurusBidangMembers.length +
      pengurusClusterCoordinators.length,
    note:
      "Portal Pengurus sudah membaca struktur resmi dari master data statis.",
  },
  {
    id: "keuangan",
    label: "Keuangan",
    portalPath: "/keuangan/",
    adminPath: "/admin-preview/keuangan/",
    source: "lib/portal-data.ts",
    status: "shared-static",
    publicItems: financeTransactions.length,
    note:
      "Ringkasan publik dan admin preview keuangan memakai transaksi statis yang sama.",
  },
  {
    id: "palugada",
    label: "PALUGADA",
    portalPath: "/palugada/",
    adminPath: "/admin-preview/palugada/",
    source: "lib/portal-data.ts",
    status: "shared-static",
    publicItems: marketplaceItems.length,
    adminItems: palugadaDraftItems.length,
    note:
      "Katalog publik dan draft review admin sudah berada di sumber data portal yang sama.",
  },
  {
    id: "kabar-warga",
    label: "Kabar Warga",
    portalPath: "/kabar-warga/",
    adminPath: "/admin-preview/portal-warga/",
    source: "lib/portal-data.ts",
    status: "shared-static",
    publicItems: announcements.length + kegiatanItems.length,
    note:
      "Pengumuman dan kegiatan publik sudah tersentral di data portal statis.",
  },
  {
    id: "layanan",
    label: "Layanan",
    portalPath: "/layanan/",
    adminPath: "/admin-preview/layanan/",
    source: "client-side draft",
    status: "prototype-local",
    publicItems: 0,
    note:
      "Form layanan masih membuat draft WhatsApp dan belum menulis ke dashboard.",
  },
];

export const portalConnectionSummary = {
  sharedStatic: portalConnectionItems.filter(
    (item) => item.status === "shared-static",
  ).length,
  prototypeLocal: portalConnectionItems.filter(
    (item) => item.status === "prototype-local",
  ).length,
  total: portalConnectionItems.length,
};
