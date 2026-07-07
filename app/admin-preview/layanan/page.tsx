import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
} from "../components";
import { LayananRequestBoard } from "./layanan-request-board";

export const metadata: Metadata = {
  title: "Layanan Admin | CGV10",
  description: "Preview modul layanan warga CGV10.",
};

export default function LayananAdminPage() {
  return (
    <AdminShell
      active="layanan"
      title="Layanan"
      subtitle="Request dan tindak lanjut"
      action={<ActionButton primary href="/layanan/#form-layanan">Tambah Request</ActionButton>}
    >
      <PageIntro
        eyebrow="Operasional Warga"
        title={
          <>
            Kelola permintaan dan laporan <span className="italic">warga</span>
          </>
        }
        text="Modul layanan menampung permintaan surat, laporan lingkungan, aspirasi, dan tindak lanjut PIC agar pengurus punya satu antrian kerja yang jelas."
        side={<ActionButton primary href="/layanan/#form-layanan">Tambah Request</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Masuk" value="8 request" helper="Dari layanan, kontak, iuran" icon="message" tone="blue" />
        <MetricCard label="Diproses" value="4 item" helper="Sudah ada PIC" icon="calendar" tone="gold" />
        <MetricCard label="Selesai" value="10 item" helper="Arsip bulan ini" icon="shield" />
        <MetricCard label="SLA" value="2 hari" helper="Target respon awal" icon="file" tone="dark" />
      </section>

      <LayananRequestBoard />

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "Administrasi",
            text: "Surat domisili, data warga, dan kebutuhan sekretariat.",
          },
          {
            title: "Fasilitas",
            text: "Lampu, keamanan, kebersihan, dan kondisi area bersama.",
          },
          {
            title: "Aspirasi",
            text: "Masukan warga yang perlu masuk agenda pengurus.",
          },
        ].map((item) => (
          <Panel key={item.title}>
            <PanelHeader title={item.title} subtitle={item.text} />
          </Panel>
        ))}
      </section>
    </AdminShell>
  );
}
