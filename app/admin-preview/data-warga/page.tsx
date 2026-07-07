import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
} from "../components";
import { DataWargaBoard } from "./data-warga-board";

export const metadata: Metadata = {
  title: "Data Warga Admin | CGV10",
  description: "Preview modul data warga CGV10.",
};

export default function DataWargaAdminPage() {
  return (
    <AdminShell
      active="warga"
      title="Data Warga"
      subtitle="KK, cluster, dan validasi"
      action={<ActionButton primary>Tambah Data</ActionButton>}
    >
      <PageIntro
        eyebrow="Data Internal"
        title={
          <>
            Basis data warga untuk operasional{" "}
            <span className="italic">pengurus</span>
          </>
        }
        text="Modul ini disiapkan untuk pendataan keluarga, cluster, kendaraan, status hunian, dan jalur komunikasi internal. Data sensitif tidak ditampilkan ke portal publik."
        side={<ActionButton primary>Tambah Data</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total KK"
          value="250 KK"
          helper="Ringkasan warga aktif"
          icon="users"
        />
        <MetricCard
          label="Cluster"
          value="8 area"
          helper="Basis koordinasi"
          icon="building"
          tone="blue"
        />
        <MetricCard
          label="Perlu Update"
          value="12 data"
          helper="Nomor/kendaraan perlu cek"
          icon="file"
          tone="gold"
        />
        <MetricCard
          label="Privasi"
          value="Internal"
          helper="Tidak tampil publik"
          icon="shield"
          tone="dark"
        />
      </section>

      <DataWargaBoard />

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["Cluster filter", "Tampilan warga per cluster untuk koordinasi."],
          ["Contact audit", "Tandai nomor yang perlu diperbarui."],
          ["Privacy review", "Pisahkan data operasional dari informasi publik."],
        ].map(([title, text]) => (
          <Panel key={title}>
            <PanelHeader title={title} subtitle={text} />
          </Panel>
        ))}
      </section>
    </AdminShell>
  );
}
