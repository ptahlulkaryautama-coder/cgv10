import type { Metadata } from "next";
import Link from "next/link";
import {
  Icon,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "@/app/components/portal";
import {
  palugadaOnboardingSteps,
  palugadaReviewStages,
} from "@/lib/portal-data";
import { PalugadaSubmissionForm } from "./palugada-submission-form";

export const metadata: Metadata = {
  title: "Daftar Lapak | PALUGADA CGV",
  description:
    "Form draft pendaftaran lapak PALUGADA CGV untuk warga yang ingin masuk katalog usaha, jasa, barang, atau kuliner komunitas.",
};

export default function PalugadaDaftarPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="flex flex-col justify-center">
            <Link
              href="/palugada/"
              className="inline-flex w-fit items-center rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              Kembali ke PALUGADA
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Daftar Lapak PALUGADA
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Siapkan draft lapak yang siap dikurasi pengurus.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              Form ini membantu warga menyusun informasi awal sebelum dikirim
              ke WhatsApp. Belum ada akun, database, atau transaksi otomatis.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <a
                href="#form-daftar"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Isi draft lapak
              </a>
              <a
                href="#alur-review"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/18 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
              >
                Lihat alur review
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_22px_70px_rgba(7,35,23,0.24)]">
            <div className="rounded-xl border border-accent-soft/25 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Draft intake
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  ["Data lapak", "Nama, kategori, cluster"],
                  ["Kontak", "WhatsApp dan penanggung jawab"],
                  ["Kurasi", "Foto, deskripsi, status harga"],
                ].map(([title, text], index) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-xl border border-white/14 bg-white/10 p-3"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-sm text-white/72">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-white/14 bg-primary/55 p-4">
                <p className="text-sm leading-6 text-white/86">
                  Target fase ini adalah membuat pendaftaran lapak mudah
                  dipakai lebih awal, sambil tetap menjaga kurasi manual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <SectionHeading
            eyebrow="Alur warga"
            title="Pendaftaran dibuat ringan, tapi tetap rapi untuk pengurus."
            text="Warga cukup menyiapkan draft yang jelas. Setelah itu pengurus bisa mengkurasi sebelum listing masuk katalog aktif."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {palugadaOnboardingSteps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-border bg-background p-6 shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={step.icon} />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-foreground">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="form-daftar"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10"
      >
        <div className="mb-8 grid gap-5 lg:grid-cols-[0.35fr_0.65fr] lg:items-end">
          <PlaceholderNotice>
            Form ini belum menyimpan data ke database. Untuk fase awal, data
            dirapikan menjadi pesan WhatsApp agar bisa langsung dipakai oleh
            warga dan pengurus.
          </PlaceholderNotice>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Draft pendaftaran
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Isi sekali, kirim sebagai draft yang mudah direview.
            </h2>
          </div>
        </div>
        <PalugadaSubmissionForm />
      </section>

      <section id="alur-review" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <SectionHeading
            eyebrow="Fondasi Phase 4"
            title="Review pipeline disiapkan sebelum admin/database dibangun."
            text="Struktur ini memberi bahasa kerja untuk pengurus: draft diterima, perlu verifikasi, lalu siap tayang."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {palugadaReviewStages.map((stage) => (
              <article
                key={stage.title}
                className="rounded-2xl border border-border bg-background p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={stage.icon} />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                    {stage.status}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-foreground">
                  {stage.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {stage.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
