import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Icon,
  PageShell,
} from "../components/portal";
import { AuthAwareAction } from "../components/auth-aware-action";
import { ServiceRequestGate } from "./service-request-gate";

const serviceStats = [
  ["4", "Pintu layanan"],
  ["3", "Prioritas tindak lanjut"],
  ["1", "Hub warga terpadu"],
] as const;

const priorityRows = [
  ["Darurat lingkungan", "Prioritas tinggi"],
  ["Administrasi warga", "Prioritas normal"],
  ["Aspirasi & usulan", "Masuk antrean"],
] as const;

export const metadata: Metadata = {
  title: "Layanan | CGV10",
  description:
    "Hub layanan warga CGV10 untuk alur pengaduan, administrasi, aspirasi, dan koordinasi lingkungan.",
};

export default function LayananPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-primary text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_50%,#006d5b_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:py-20 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Meja Layanan Warga
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Layanan warga yang rapi, jelas, dan mudah diakses.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
              Layanan CGV10 ditata sebagai pintu bantuan warga: laporan,
              administrasi, iuran, dan aspirasi masuk ke alur yang jelas untuk
              ditindaklanjuti pengurus.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AuthAwareAction
                href="/layanan/#form-layanan"
                guestHref="/masuk/?next=/layanan/%23form-layanan"
                guestLabel="Masuk untuk ajukan"
                authenticatedLabel="Ajukan layanan"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-4">
            <div className="grid gap-3 md:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-xl border border-white/14 bg-white/10 p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                    <Icon name="message" />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                    Kanal warga
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                  Papan layanan
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  Laporan, administrasi, dan aspirasi dalam satu alur.
                </h2>
                <div className="mt-6 space-y-3">
                  {priorityRows.map(([label, status]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 border-b border-white/14 pb-3 text-sm"
                    >
                      <span className="font-semibold text-white/86">
                        {label}
                      </span>
                      <span className="text-right font-semibold text-accent-soft">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <div className="grid gap-3">
                {serviceStats.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/14 bg-white/10 p-4"
                  >
                    <p className="text-3xl font-semibold text-accent-soft">
                      {value}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {label}
                    </p>
                  </div>
                ))}
                <div className="rounded-xl border border-white/14 bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                    Kanal layanan
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/76">
                    Warga diarahkan ke jalur pengurus untuk kebutuhan yang
                    memerlukan tindak lanjut langsung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <ServiceRequestGate />
      </Suspense>
    </PageShell>
  );
}
