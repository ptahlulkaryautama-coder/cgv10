import Link from "next/link";
import { Icon, PageShell } from "../components/portal";
import { ContactRoutingForm } from "./contact-routing-form";

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
              Warga bisa memilih kanal kontak, menulis pesan singkat, lalu
              mengirim draft WhatsApp yang sudah rapi ke pengurus.
            </p>
            <Link
              href="#kontak-cepat"
              className="mt-8 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Pilih kanal kontak
            </Link>
          </div>
        </div>
      </section>

      <ContactRoutingForm />

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
                Direktori peran tetap tersedia di halaman Pengurus.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Untuk melihat struktur peran dan konteks tanggung jawab, warga
                tetap bisa membuka halaman Pengurus. Untuk pesan cepat, gunakan
                form kontak di atas.
              </p>
              <Link
                href="/pengurus/#kontak-pengurus"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft"
              >
                Buka direktori pengurus
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
