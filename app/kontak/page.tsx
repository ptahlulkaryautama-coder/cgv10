import Link from "next/link";
import { Icon, PageHero, PageShell, PlaceholderNotice } from "../components/portal";

export default function KontakPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Mode Tinjauan Pengurus"
        title="Kontak resmi kini digabung dalam halaman Pengurus."
        text="Rute ini tetap tersedia agar tautan lama tidak rusak, namun direktori kontak resmi sekarang ditempatkan bersama struktur pengurus."
      />
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon name="phone" />
            </div>
            <div>
              <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                Halaman transisi
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                Buka kontak melalui halaman Pengurus.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Nomor telepon dan QR tetap menunggu persetujuan publikasi. Tidak
                ada formulir, pengiriman data, atau sistem kontak aktif pada
                halaman ini.
              </p>
              <Link
                href="/pengurus/#kontak-pengurus"
                className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Buka Kontak Pengurus
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <PlaceholderNotice>
            Mode Tinjauan Pengurus: kontak resmi menunggu persetujuan publikasi.
            Tidak ada nomor atau QR resmi yang ditampilkan tanpa persetujuan
            pengurus.
          </PlaceholderNotice>
        </div>
      </section>
    </PageShell>
  );
}
