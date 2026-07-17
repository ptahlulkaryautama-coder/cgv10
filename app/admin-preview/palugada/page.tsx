import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/portal";
import {
  marketplaceItems,
  palugadaDraftItems,
  palugadaReviewStages,
} from "@/lib/portal-data";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
  ProgressBar,
  StatusPill,
} from "../components";
import { PalugadaReviewBoard } from "./palugada-review-board";

export const metadata: Metadata = {
  title: "PALUGADA Admin Preview | CGV10",
  description:
    "Preview dashboard kurasi PALUGADA CGV untuk draft lapak, verifikasi, dan publish katalog warga.",
};

const readyCount = palugadaDraftItems.filter(
  (item) => item.status === "Siap tayang",
).length;
const reviewCount = palugadaDraftItems.filter(
  (item) => item.status === "Perlu verifikasi",
).length;
const draftCount = palugadaDraftItems.filter(
  (item) => item.status === "Draft diterima",
).length;
const contactCount = marketplaceItems.filter((item) => item.whatsappHref).length;
const readinessItems: Array<[
  string,
  string,
  string,
  "green" | "gold" | "red" | "blue",
]> = [
  ["Foto & deskripsi", "4 listing lengkap", "72%", "green"],
  ["Kontak tervalidasi", `${contactCount} kontak WA`, "42%", "gold"],
  ["Butuh follow-up", `${reviewCount} review`, "34%", "red"],
];

export default function AdminPalugadaPage() {
  return (
    <AdminShell
      active="palugada"
      title="PALUGADA"
      subtitle="Kurasi katalog warga"
      action={<ActionButton primary href="/palugada/daftar/">Form Daftar</ActionButton>}
    >
      <PageIntro
        eyebrow="Marketplace Warga"
        title={
          <>
            Review Lapak <span className="italic">PALUGADA</span>
          </>
        }
        text="Halaman ini menjadi preview workflow pengurus untuk melihat draft pendaftaran, memeriksa kelengkapan, dan menentukan listing yang siap tampil di katalog warga."
        side={
          <div className="flex flex-wrap gap-2">
            <ActionButton href="/palugada/">Lihat katalog</ActionButton>
            <ActionButton primary href="/palugada/daftar/">Tambah draft</ActionButton>
          </div>
        }
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Listing Publik"
          value={`${marketplaceItems.length} item`}
          helper="Tampil di katalog warga"
          icon="store"
        />
        <MetricCard
          label="Kontak WA"
          value={`${contactCount} aktif`}
          helper="Bisa dihubungi langsung"
          icon="phone"
          tone="gold"
        />
        <MetricCard
          label="Draft"
          value={`${draftCount} item`}
          helper="Baru masuk intake"
          icon="file"
          tone="blue"
        />
        <MetricCard
          label="Review"
          value={`${reviewCount} item`}
          helper="Butuh verifikasi"
          icon="shield"
          tone="red"
        />
        <MetricCard
          label="Siap Tayang"
          value={`${readyCount} item`}
          helper="Siap masuk katalog"
          icon="megaphone"
          tone="dark"
        />
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)]">
        <Panel>
          <PanelHeader
            title="Pipeline Review"
            subtitle="Tahapan kerja sebelum listing ditampilkan atau diperbarui di katalog."
          />
          <div className="grid gap-3 px-5 pb-5 md:grid-cols-3">
            {palugadaReviewStages.map((stage) => (
              <article
                key={stage.title}
                className="rounded-[16px] border border-black/8 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                    <Icon name={stage.icon} />
                  </span>
                  <StatusPill>{stage.status}</StatusPill>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {stage.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {stage.text}
                </p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Publish Readiness"
            subtitle="Kualitas data katalog sebelum dipublikasikan."
          />
          <div className="space-y-5 px-5 pb-5">
            {readinessItems.map(([label, value, progress, tone]) => (
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

      <PalugadaReviewBoard />

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)]">
        <Panel>
          <PanelHeader
            title="Output Publik"
            subtitle="Tautan cepat untuk melihat dampak kurasi."
          />
          <div className="grid gap-3 px-5 pb-5">
            {[
              {
                title: "Katalog PALUGADA",
                text: "Lihat daftar listing yang sudah tampil untuk warga.",
                href: "/palugada/",
              },
              {
                title: "Form Daftar Lapak",
                text: "Uji alur draft pendaftaran dari sisi warga.",
                href: "/palugada/daftar/",
              },
              {
                title: "Ma'niez Donut",
                text: "Buka contoh detail listing yang sudah lengkap.",
                href: "/palugada/donat-kentang-warga/",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <p className="font-bold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </AdminShell>
  );
}
