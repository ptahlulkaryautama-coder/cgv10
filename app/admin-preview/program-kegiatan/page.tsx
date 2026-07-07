import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
  cx,
} from "../components";
import { ProgramBoard } from "./program-board";
import { programItems, programSummary } from "@/lib/program-data";

const websitePreview = programItems.filter((program) => program.web).slice(0, 4);
const portalPreview = programItems.filter((program) => program.portal);

export const metadata: Metadata = {
  title: "Program & Kegiatan Admin | CGV10",
  description: "Preview modul program dan kegiatan admin CGV10.",
};

function PillarBadge({ value }: { value: string }) {
  const tone = value === "Lingkungan"
    ? "bg-emerald-50 text-primary"
    : value === "Keluarga"
      ? "bg-purple-50 text-purple-700"
      : value === "Amanah"
        ? "bg-accent-soft text-foreground"
        : value === "Data"
          ? "bg-blue-50 text-blue-700"
          : "bg-stone-100 text-stone-700";

  return (
    <span className={cx("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold", tone)}>
      {value}
    </span>
  );
}

export default function AdminProgramPage() {
  return (
    <AdminShell
      active="program"
      title="Program & Kegiatan"
      subtitle="Manajemen konten portal"
      action={<ActionButton primary>Tambah Program</ActionButton>}
    >
      <PageIntro
        eyebrow="Pengelolaan Konten"
        title={
          <>
            Program & <span className="italic">Kegiatan</span>
          </>
        }
        text="Halaman ini mengelola sumber data agenda, kegiatan, dan konten yang akan tampil di Website Publik dan Portal Warga. Dashboard hanya mengambil ringkasannya."
        side={<ActionButton primary>Tambah Program</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Program" value={`${programSummary.total} program`} helper="Dari data kegiatan publik" icon="calendar" tone="blue" />
        <MetricCard label="Status Aktif" value={`${programSummary.active} program`} helper="Status siap berjalan" icon="shield" />
        <MetricCard label="Tampil Website" value={`${programSummary.website}/${programSummary.total} slot`} helper="Kartu website publik" icon="home" tone="dark" />
        <MetricCard label="Tampil Portal" value={`${programSummary.portal} program`} helper="Jadwal dan arsip warga" icon="users" />
      </section>

      <ProgramBoard />

      <Panel className="mb-5">
        <PanelHeader
          title="Preview Output - Website Publik"
          subtitle="Konten yang akan tampil sebagai kartu Program & Kegiatan di website."
        />
        <div className="grid gap-3 px-5 pb-5 md:grid-cols-2 xl:grid-cols-3">
          {websitePreview.map((program, index) => (
            <article key={program.id} className="rounded-[16px] border border-black/8 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
                {String(index + 1).padStart(2, "0")} - {program.category}
              </p>
              <h3 className="mt-3 font-bold text-foreground">{program.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{program.schedule}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Preview Output - Portal Warga"
          subtitle="Daftar agenda yang tampil untuk warga dengan status dan pilar."
        />
        <div className="px-5 pb-5">
          {portalPreview.map((program) => (
            <div key={program.id} className="flex flex-col gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-foreground">{program.name}</p>
                <p className="mt-1 text-sm text-muted">{program.schedule}</p>
              </div>
              <PillarBadge value={program.pillar} />
            </div>
          ))}
        </div>
      </Panel>
    </AdminShell>
  );
}
