import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
} from "../components";
import { SettingsMatrix } from "./settings-matrix";

export const metadata: Metadata = {
  title: "Pengaturan Admin | CGV10",
  description: "Preview modul pengaturan CGV10.",
};

export default function PengaturanAdminPage() {
  return (
    <AdminShell
      active="pengaturan"
      title="Pengaturan"
      subtitle="Konfigurasi portal"
      action={<ActionButton primary>Update Setting</ActionButton>}
    >
      <PageIntro
        eyebrow="System Settings"
        title={
          <>
            Pengaturan identitas, akses, dan{" "}
            <span className="italic">publikasi</span>
          </>
        }
        text="Modul pengaturan menjadi tempat konfigurasi identitas portal, pengurus, akses admin, preferensi publikasi, dan integrasi masa depan."
        side={<ActionButton primary>Update Setting</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Identitas"
          value="Aktif"
          helper="CGV10 dan RT"
          icon="building"
        />
        <MetricCard
          label="Admin"
          value="4 role"
          helper="Rencana akses"
          icon="users"
          tone="blue"
        />
        <MetricCard
          label="Publikasi"
          value="Manual"
          helper="Approval sebelum live"
          icon="shield"
          tone="gold"
        />
        <MetricCard
          label="Integrasi"
          value="Next"
          helper="CMS/database nanti"
          icon="file"
          tone="dark"
        />
      </section>

      <SettingsMatrix />

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["Role matrix", "Rancang akses ketua, sekretaris, bendahara, dan seksi."],
          ["Brand settings", "Kelola identitas CGV10, RT, dan sub-brand PALUGADA."],
          ["Publish mode", "Pilih alur manual approval sebelum konten tampil."],
        ].map(([title, text]) => (
          <Panel key={title}>
            <PanelHeader title={title} subtitle={text} />
          </Panel>
        ))}
      </section>
    </AdminShell>
  );
}
