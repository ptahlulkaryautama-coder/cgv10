import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
} from "../components";
import { DocumentLibrary } from "./document-library";

export const metadata: Metadata = {
  title: "Dokumen Admin | CGV10",
  description: "Preview modul dokumen CGV10.",
};

export default function DokumenAdminPage() {
  return (
    <AdminShell
      active="dokumen"
      title="Dokumen"
      subtitle="Arsip dan template"
      action={<ActionButton primary href="#upload-dokumen">Upload Dokumen</ActionButton>}
    >
      <PageIntro
        eyebrow="Aset & Arsip"
        title={
          <>
            Kelola dokumen resmi dan <span className="italic">template</span>
          </>
        }
        text="Modul dokumen disiapkan untuk arsip surat, template layanan, dokumentasi kegiatan, dan file internal yang perlu tertata rapi."
        side={<ActionButton primary href="#upload-dokumen">Upload Dokumen</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Template"
          value="6 file"
          helper="Surat dan format standar"
          icon="file"
        />
        <MetricCard
          label="Arsip"
          value="24 item"
          helper="Dokumen tersimpan"
          icon="shield"
          tone="blue"
        />
        <MetricCard
          label="Review"
          value="3 file"
          helper="Perlu validasi"
          icon="calendar"
          tone="gold"
        />
        <MetricCard
          label="Internal"
          value="Private"
          helper="Tidak tampil publik"
          icon="building"
          tone="dark"
        />
      </section>

      <DocumentLibrary />

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["Template library", "Kelola format surat yang sering dipakai warga."],
          ["Visibility label", "Tandai dokumen publik, internal, atau terbatas."],
          ["Archive review", "Rapikan arsip kegiatan dan keuangan per periode."],
        ].map(([title, text]) => (
          <Panel key={title}>
            <PanelHeader title={title} subtitle={text} />
          </Panel>
        ))}
      </section>
    </AdminShell>
  );
}
