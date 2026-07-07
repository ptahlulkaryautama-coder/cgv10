import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
} from "../components";
import { PublishControlBoard } from "./publish-control-board";
import { portalPublishSummary } from "@/lib/portal-publish-data";

export const metadata: Metadata = {
  title: "Portal Warga Admin | CGV10",
  description: "Preview modul publikasi Portal Warga CGV10.",
};

export default function PortalWargaAdminPage() {
  return (
    <AdminShell
      active="portal"
      title="Portal Warga"
      subtitle="Publikasi konten"
      action={<ActionButton primary href="#public-preview">Preview Publish</ActionButton>}
    >
      <PageIntro
        eyebrow="Output Publik"
        title={
          <>
            Kontrol konten yang tampil di{" "}
            <span className="italic">Portal Warga</span>
          </>
        }
        text="Modul ini menjadi tempat pengurus meninjau konten yang akan tampil ke warga: pengumuman, agenda, ringkasan kas, PALUGADA, dan kontak resmi."
        side={<ActionButton primary href="#public-preview">Preview Publish</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Published"
          value={`${portalPublishSummary.published} item`}
          helper="Konten aktif di portal"
          icon="megaphone"
        />
        <MetricCard
          label="Review"
          value={`${portalPublishSummary.review} item`}
          helper="Menunggu validasi pengurus"
          icon="shield"
          tone="gold"
        />
        <MetricCard
          label="Draft"
          value={`${portalPublishSummary.draft} item`}
          helper="Belum tampil publik"
          icon="file"
          tone="blue"
        />
        <MetricCard
          label="Sensitif"
          value={`${portalPublishSummary.tahan} tahan`}
          helper="Tidak dipublikasikan"
          icon="shield"
          tone="red"
        />
      </section>

      <PublishControlBoard />

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["Preview public feed", "Cek urutan konten yang akan tampil di halaman warga."],
          ["Publish queue", "Tinjau item yang menunggu approval sebelum live."],
          ["Visibility audit", "Pastikan konten internal tidak ikut tampil publik."],
        ].map(([title, text]) => (
          <Panel key={title}>
            <PanelHeader title={title} subtitle={text} />
          </Panel>
        ))}
      </section>
    </AdminShell>
  );
}
