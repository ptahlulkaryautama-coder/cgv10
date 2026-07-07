import { kegiatanItems } from "./portal-data";

export type ProgramStatus = "Aktif" | "Draft" | "Review";

export type ProgramItem = {
  id: string;
  name: string;
  category: string;
  pillar: string;
  schedule: string;
  status: ProgramStatus;
  web: boolean;
  portal: boolean;
  owner: string;
  portalPath: string;
  source: string;
};

const programMeta: Record<
  string,
  Pick<ProgramItem, "category" | "pillar" | "schedule" | "status" | "web" | "owner">
> = {
  "kerja-bakti-lingkungan": {
    category: "Kebersihan",
    pillar: "Lingkungan",
    schedule: "Minggu pekan ke-2 - 07.00",
    status: "Aktif",
    web: true,
    owner: "Bidang Kebersihan",
  },
  "rapat-warga": {
    category: "Forum",
    pillar: "Pengurus",
    schedule: "Sabtu pekan terakhir - 19.30",
    status: "Aktif",
    web: true,
    owner: "Ketua RT",
  },
  "kegiatan-sosial": {
    category: "Sosial",
    pillar: "Kemasyarakatan",
    schedule: "Bulanan - sesuai pengumuman",
    status: "Aktif",
    web: true,
    owner: "Bidang Sosial",
  },
  "keamanan-kebersihan": {
    category: "Keamanan",
    pillar: "Keamanan",
    schedule: "Berjalan sesuai kebutuhan",
    status: "Aktif",
    web: true,
    owner: "Bidang Keamanan",
  },
  "kegiatan-keluarga": {
    category: "Keluarga",
    pillar: "Keluarga",
    schedule: "Bulanan - sesuai pengumuman",
    status: "Review",
    web: true,
    owner: "Bidang Sosial",
  },
};

export const programItems: ProgramItem[] = kegiatanItems.map((item, index) => {
  const meta = programMeta[item.slug] ?? {
    category: "Kegiatan",
    pillar: "Warga",
    schedule: "Sesuai pengumuman",
    status: "Review" as ProgramStatus,
    web: true,
    owner: "Pengurus",
  };

  return {
    id: `PRG-${String(index + 1).padStart(2, "0")}`,
    name: item.title,
    portal: true,
    portalPath: item.href,
    source: "lib/portal-data.ts",
    ...meta,
  };
});

export const programSummary = {
  total: programItems.length,
  active: programItems.filter((program) => program.status === "Aktif").length,
  review: programItems.filter((program) => program.status === "Review").length,
  draft: programItems.filter((program) => program.status === "Draft").length,
  website: programItems.filter((program) => program.web).length,
  portal: programItems.filter((program) => program.portal).length,
};
