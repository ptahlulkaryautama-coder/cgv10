import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
  ProgressBar,
  StatusPill,
  cx,
} from "./components";
import {
  portalConnectionItems,
  portalConnectionSummary,
} from "@/lib/portal-connection";
import { portalPublishSummary } from "@/lib/portal-publish-data";
import { financeTotals } from "@/lib/portal-data";
import { programSummary } from "@/lib/program-data";

type Activity = {
  title: string;
  meta: string;
  status: string;
  icon: IconName;
  tone: "green" | "gold" | "blue" | "red";
};

function formatCompactRupiah(value: number) {
  return `Rp${(value / 1000000).toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  })}jt`;
}

const activities: Activity[] = [
  {
    title: "Konfirmasi iuran dari Cluster Meteora",
    meta: "Keuangan - perlu cocokkan mutasi bendahara",
    status: "Baru",
    icon: "wallet",
    tone: "blue",
  },
  {
    title: "Kontak bendahara dari halaman Kontak",
    meta: "Layanan - sudah masuk intake terpadu",
    status: "Diproses",
    icon: "message",
    tone: "gold",
  },
  {
    title: "Lapak PALUGADA siap review",
    meta: "PALUGADA - draft warga perlu kurasi katalog",
    status: "Validasi",
    icon: "store",
    tone: "gold",
  },
  {
    title: "Jadwal kerja bakti tetap published",
    meta: "Portal Warga - tampil di Kabar Warga",
    status: "Published",
    icon: "calendar",
    tone: "green",
  },
];

const moduleSummaries = [
  {
    title: "Portal Warga",
    description: "Demo publish queue, visibility audit, dan preview output publik.",
    href: "/admin-preview/portal-warga/",
    icon: "shield" as IconName,
    status: "Static",
    value: `${portalPublishSummary.published} published`,
  },
  {
    title: "Data Warga",
    description: "Basis KK, cluster, kontak, kendaraan, dan privacy guard.",
    href: "/admin-preview/data-warga/",
    icon: "users" as IconName,
    status: "250 KK",
    value: "12 update",
  },
  {
    title: "Keuangan",
    description: "Konfirmasi iuran, ledger, kategori, dan ringkasan publik.",
    href: "/admin-preview/keuangan/",
    icon: "wallet" as IconName,
    status: "2 cocokkan",
    value: "4 iuran",
  },
  {
    title: "Program & Kegiatan",
    description: "Agenda warga, jadwal kegiatan, dan output ke portal.",
    href: "/admin-preview/program-kegiatan/",
    icon: "calendar" as IconName,
    status: "Aktif",
    value: `${programSummary.total} program`,
  },
  {
    title: "Layanan Warga",
    description: "Surat, laporan, kontak, iuran, aspirasi, dan penugasan PIC.",
    href: "/admin-preview/layanan/",
    icon: "message" as IconName,
    status: "8 masuk",
    value: "3 baru",
  },
  {
    title: "PALUGADA",
    description: "Direktori barang, jasa, kuliner, properti, dan validasi lapak.",
    href: "/admin-preview/palugada/",
    icon: "store" as IconName,
    status: "Preview",
    value: "6 listing",
  },
  {
    title: "Dokumen",
    description: "Template surat, arsip, visibility label, dan review dokumen.",
    href: "/admin-preview/dokumen/",
    icon: "file" as IconName,
    status: "3 review",
    value: "24 arsip",
  },
];

const requestSummary = [
  ["Kontak bendahara", "Diproses", "Bendahara"],
  ["Update data warga", "Baru", "Data Warga"],
  ["Keluhan akses tamu", "Validasi", "Keamanan"],
  ["Pendaftaran lapak", "Validasi", "PALUGADA"],
];

const healthItems: Array<[string, string, string, "green" | "gold" | "red" | "blue"]> = [
  [
    "Konten publik",
    `${portalPublishSummary.published} published`,
    `${portalPublishSummary.averageReadiness}%`,
    "green" as const,
  ],
  ["Iuran tervalidasi", "1 dari 4 konfirmasi", "25%", "gold" as const],
  ["Layanan tertangani", "5 dari 8 intake", "63%", "blue" as const],
  ["Data sensitif", "2 ditahan", "26%", "red" as const],
];

const commandQueue = [
  {
    title: "Cocokkan iuran masuk",
    meta: "2 konfirmasi perlu dicocokkan dengan mutasi",
    href: "/admin-preview/keuangan/",
    icon: "wallet" as IconName,
    status: "Perlu cocokkan",
  },
  {
    title: "Triage request warga",
    meta: "3 intake baru dari layanan dan kontak",
    href: "/admin-preview/layanan/",
    icon: "message" as IconName,
    status: "Baru",
  },
  {
    title: "Kurasi draft PALUGADA",
    meta: "1 draft perlu verifikasi kontak dan foto",
    href: "/admin-preview/palugada/",
    icon: "store" as IconName,
    status: "Validasi",
  },
  {
    title: "Review demo konten publik",
    meta: `${portalPublishSummary.review} item berada di antrean demo browser`,
    href: "/admin-preview/portal-warga/",
    icon: "shield" as IconName,
    status: "Review",
  },
];

const operations = [
  ["Layanan intake", "8", "3 baru", "/admin-preview/layanan/"],
  ["Konfirmasi iuran", "4", "2 cocokkan", "/admin-preview/keuangan/"],
  ["Draft PALUGADA", "4", "1 validasi", "/admin-preview/palugada/"],
  [
    "Demo publish queue",
    String(portalPublishSummary.total),
    `${portalPublishSummary.review} review`,
    "/admin-preview/portal-warga/",
  ],
] as const;

const ecosystem = [
  {
    title: "Website Publik",
    text: "Informasi resmi CGV10 untuk warga dan calon warga.",
    href: "/",
    icon: "home" as IconName,
  },
  {
    title: "Portal Warga",
    text: "Konten published berasal dari data statis portal.",
    href: "/kabar-warga/",
    icon: "shield" as IconName,
  },
  {
    title: "PALUGADA",
    text: "Katalog warga yang dikurasi oleh pengurus.",
    href: "/palugada/",
    icon: "store" as IconName,
  },
];

export const metadata: Metadata = {
  title: "Dashboard Pengurus | CGV10",
  description:
    "Dashboard pengurus CGV10 sebagai ringkasan operasional Portal Warga.",
};

export default function AdminPreviewPage() {
  return (
    <AdminShell
      active="dashboard"
      title="Dashboard"
      subtitle="Overview - Juni 2026"
      action={<ActionButton primary href="/admin-preview/program-kegiatan/">Update Portal</ActionButton>}
    >
      <PageIntro
        eyebrow="Cipta Greenville - RT 010 / RW 021"
        title={
          <>
            Ringkasan Operasional <br />
            <span className="italic">Portal Warga CGV10</span>
          </>
        }
        text="Dashboard ini hanya menampilkan ringkasan lintas modul. Editing, penambahan data, dokumen, approval, dan preview output dilakukan di halaman modul masing-masing."
        side={
          <div className="w-fit rounded-full bg-primary px-4 py-3 text-sm font-bold text-accent shadow-[0_12px_30px_rgba(14,56,40,0.18)]">
            Status portal: {portalPublishSummary.published} published
          </div>
        }
      />

      <section aria-label="Ringkasan utama" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Warga" value="250 KK" helper="Data keluarga aktif di portal" icon="users" />
        <MetricCard label="Layanan" value="8 masuk" helper="3 intake baru" icon="message" tone="blue" />
        <MetricCard label="Iuran" value="4 konfirmasi" helper="2 perlu cocokkan" icon="wallet" tone="gold" />
        <MetricCard
          label="Kas Publik"
          value={formatCompactRupiah(financeTotals.endingBalance)}
          helper="Selaras dengan portal"
          icon="shield"
          tone="dark"
        />
        <MetricCard label="PALUGADA" value="4 draft" helper="1 perlu verifikasi" icon="store" />
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Panel>
          <PanelHeader
            title="Command Queue"
            subtitle="Urutan kerja harian pengurus berdasarkan hal yang perlu ditindaklanjuti."
            action={<ActionButton href="/admin-preview/layanan/">Buka intake</ActionButton>}
          />
          <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
            {commandQueue.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex gap-4 rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <Icon name={item.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold leading-5 text-foreground">{item.title}</h3>
                    <StatusPill>{item.status}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.meta}</p>
                  <p className="mt-3 text-sm font-bold text-primary group-hover:text-primary-hover">
                    Tindak lanjuti
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Operasional Hari Ini" subtitle="Angka cepat dari modul inti." />
          <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-1">
            {operations.map(([label, value, helper, href]) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between gap-4 rounded-[14px] border border-black/8 bg-white p-4 transition-colors hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">{helper}</p>
                </div>
                <p className="text-2xl font-bold text-primary">{value}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mb-5">
        <Panel>
          <div className="flex flex-col gap-5 p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                Status koneksi portal
              </p>
              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Shared static source mulai disiapkan untuk portal dan dashboard.
                  </h2>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
                    Data publik penting mulai ditarik dari file sumber yang sama.
                    Perubahan langsung dari dashboard masih prototype sampai ada
                    backend, CMS, atau database.
                  </p>
                </div>
                <StatusPill>
                  {portalConnectionSummary.sharedStatic}/{portalConnectionSummary.total} shared
                </StatusPill>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {portalConnectionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.adminPath}
                  className="rounded-[14px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                      <p className="mt-1 text-xs font-semibold text-muted">
                        {item.publicItems} public item
                      </p>
                    </div>
                    <StatusPill>
                      {item.status === "shared-static" ? "Shared" : "Prototype"}
                    </StatusPill>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                    {item.note}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <Panel>
          <PanelHeader
            title="Ringkasan Modul"
            subtitle="Setiap modul punya halaman kerja sendiri untuk review, status, dan preview output."
          />
          <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
            {moduleSummaries.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                    <Icon name={module.icon} />
                  </span>
                  <StatusPill>{module.status}</StatusPill>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="text-sm font-bold text-primary">{module.value}</span>
                  <span className="text-sm font-bold text-primary group-hover:text-primary-hover">
                    Kelola
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Aktivitas Terbaru"
            subtitle="Perubahan penting dari modul operasional"
            action={<ActionButton href="/admin-preview/keuangan/">Lihat semua</ActionButton>}
          />
          <div className="space-y-1 px-5 pb-5">
            {activities.map((item) => {
              const tone = {
                green: "bg-emerald-50 text-primary",
                gold: "bg-accent-soft text-foreground",
                blue: "bg-blue-50 text-blue-700",
                red: "bg-red-50 text-red-700",
              }[item.tone];

              return (
                <div key={item.title} className="flex gap-3 border-t border-border py-4 first:border-t-0 first:pt-0">
                  <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-[12px] [&>svg]:h-5 [&>svg]:w-5", tone)}>
                    <Icon name={item.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-5 text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{item.meta}</p>
                  </div>
                  <StatusPill>{item.status}</StatusPill>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)]">
        <Panel className="min-w-0 overflow-hidden">
          <PanelHeader title="Permintaan Warga" subtitle="Ringkasan request masuk, detailnya dikelola di modul Layanan." />
          <div className="max-w-full overflow-x-auto px-5 pb-5">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">PIC</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requestSummary.map(([type, status, owner]) => (
                  <tr key={type} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-4 font-bold text-foreground">{type}</td>
                    <td className="px-4 py-4"><StatusPill>{status}</StatusPill></td>
                    <td className="px-4 py-4 text-muted">{owner}</td>
                    <td className="px-4 py-4 text-right">
                      <Link href="/admin-preview/layanan/" className="text-sm font-bold text-primary">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="min-w-0">
          <PanelHeader title="Kesehatan Portal" subtitle="Indikator cepat kualitas data sebelum publish." />
          <div className="space-y-5 px-5 pb-5">
            {healthItems.map(([label, value, progress, tone]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs text-muted">{value}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{progress}</p>
                </div>
                <ProgressBar value={progress} tone={tone} />
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-7">
        <div className="mb-4 flex items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Ekosistem Digital CGV10
          </p>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ecosystem.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[18px] border border-black/8 bg-[#fdfcf9] p-5 shadow-[0_12px_30px_rgba(12,24,16,0.07)] transition-colors duration-200 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                <Icon name={item.icon} />
              </span>
              <h3 className="mt-5 text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              <p className="mt-4 text-sm font-bold text-primary group-hover:text-primary-hover">
                Buka modul
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
