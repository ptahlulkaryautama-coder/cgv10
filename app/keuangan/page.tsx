import type { Metadata } from "next";
import { PageShell } from "../components/portal";
import { KeuanganClient } from "./keuangan-client";

export const metadata: Metadata = {
  title: "Laporan Keuangan & Kas RT 010 | CGV10",
  description:
    "Transparansi laporan keuangan dan ringkasan kas RT 010 Perumahan Cipta Green Ville khusus warga terdaftar.",
};

const reportTitle = "Laporan Keuangan RT 010";
const reportSubtitle = "Perumahan Cipta Green Ville";
const reportPeriod = "Januari-Juni 2026";
const reportStatus = "Ringkasan Pengurus";

export default function KeuanganPage() {
  return (
    <PageShell>
      <section className="relative isolate overflow-hidden border-b border-primary-hover bg-primary text-white">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[28px] border-accent/30" />
          <div className="absolute right-[17%] top-10 h-32 w-32 rounded-full border border-white/20" />
          <div className="absolute bottom-0 right-0 h-24 w-[52%] border-l border-t border-white/10" />
          <div className="absolute bottom-16 right-[34%] h-3 w-3 rounded-full bg-accent" />
          <div className="absolute bottom-24 right-[42%] h-2 w-2 rounded-full bg-white/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
              Transparansi Kas RT
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {reportTitle}
            </h1>
            <p className="mt-4 text-lg font-semibold text-white/88">
              {reportSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                {reportPeriod}
              </span>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                {reportStatus}
              </span>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                🔒 Khusus Warga Terdaftar
              </span>
            </div>
          </div>
        </div>
      </section>

      <KeuanganClient />
    </PageShell>
  );
}
