import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/app/components/portal";
import { PalugadaSubmissionGate } from "./palugada-submission-gate";

export const metadata: Metadata = {
  title: "Daftar Lapak | PALUGADA CGV",
  description:
    "Form pendaftaran lapak PALUGADA CGV untuk usaha, jasa, barang, atau kuliner warga.",
};

export default function PalugadaDaftarPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14 xl:px-10">
          <div className="flex flex-col justify-center">
            <Link
              href="/palugada/"
              className="inline-flex w-fit items-center rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              Kembali ke PALUGADA
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Daftar Lapak PALUGADA
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Daftarkan usaha atau jasa Anda.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              Katalog PALUGADA dapat dilihat umum. Pendaftaran lapak hanya
              dibuka untuk warga yang sudah masuk agar data terhubung ke akun
              dan dapat direview pengurus.
            </p>
            <div className="mt-6">
              <a
                href="#form-daftar"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Mulai isi formulir
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_22px_70px_rgba(7,35,23,0.24)]">
            <div className="rounded-xl border border-accent-soft/25 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Yang perlu disiapkan
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  ["Akun warga", "Masuk sebagai warga terverifikasi"],
                  ["Data lapak", "Nama, kategori, cluster"],
                  ["Informasi", "Foto, deskripsi, dan kisaran harga"],
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
            </div>
          </div>
        </div>
      </section>

      <section
        id="form-daftar"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-10"
      >
        <div className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Akses pendaftaran</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Masuk warga sebelum mendaftarkan lapak.</h2>
        </div>
        <PalugadaSubmissionGate />
      </section>
    </PageShell>
  );
}
