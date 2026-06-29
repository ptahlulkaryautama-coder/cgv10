import Link from "next/link";
import { Icon, PageShell, PlaceholderNotice } from "../components/portal";

export default function KontakPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-primary text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_50%,#006d5b_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto grid max-w-5xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-20">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-foreground">
            <Icon name="phone" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Jalur Kontak Resmi
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Kontak pengurus ditempatkan bersama struktur resmi.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
              Rute ini tetap tersedia agar tautan lama tidak rusak, tetapi
              direktori kontak resmi sekarang dipusatkan di halaman Pengurus.
            </p>
            <Link
              href="/pengurus/#kontak-pengurus"
              className="mt-8 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Buka Kontak Pengurus
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon name="shield" />
            </div>
            <div>
              <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                Halaman transisi
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                Buka kontak melalui halaman Pengurus.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Kontak pengurus dipusatkan di halaman Pengurus agar warga
                menemukan jalur komunikasi yang tepat dalam satu konteks.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <PlaceholderNotice>
            Gunakan halaman Pengurus sebagai direktori utama untuk informasi
            peran dan jalur komunikasi lingkungan.
          </PlaceholderNotice>
        </div>
      </section>
    </PageShell>
  );
}
