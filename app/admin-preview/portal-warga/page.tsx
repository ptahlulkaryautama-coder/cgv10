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
      subtitle="Preview publikasi statis"
      action={<ActionButton primary href="#public-preview">Preview Demo</ActionButton>}
    >
      <PageIntro
        eyebrow="Output Publik"
        title={
          <>
            Preview konten yang tampil di{" "}
            <span className="italic">Portal Warga</span>
          </>
        }
        text="Modul ini membaca data statis yang sama dengan portal publik untuk presentasi. Tombol publish, review, dan tahan hanya mengubah state browser, bukan menyimpan ke backend."
        side={<ActionButton primary href="#public-preview">Preview Demo</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Published"
          value={`${portalPublishSummary.published} item`}
          helper="Tampil di portal statis"
          icon="megaphone"
        />
        <MetricCard
          label="Review"
          value={`${portalPublishSummary.review} item`}
          helper="Demo antrean validasi"
          icon="shield"
          tone="gold"
        />
        <MetricCard
          label="Draft"
          value={`${portalPublishSummary.draft} item`}
          helper="Tidak tampil publik"
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
          ["Preview public feed", "Cek urutan konten yang tampil dari data statis portal."],
          ["Demo publish queue", "Tinjau simulasi approval tanpa menyimpan ke backend."],
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
