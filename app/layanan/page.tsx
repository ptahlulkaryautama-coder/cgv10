import type { Metadata } from "next";
import Link from "next/link";
import {
  Icon,
  PageShell,
  SectionHeading,
} from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { ServiceRequestForm } from "./service-request-form";

type ServiceModule = {
  title: string;
  text: string;
  icon: IconName;
  href: string;
  label: string;
  group: string;
};

const serviceModules: ServiceModule[] = [
  {
    title: "Pengaduan lingkungan",
    text: "Kanal laporan fasilitas umum, keamanan, kebersihan, dan kebutuhan tindak lanjut warga.",
    icon: "message",
    href: "/layanan/#form-layanan",
    label: "Laporan",
    group: "Laporan",
  },
  {
    title: "Administrasi & data warga",
    text: "Pintu masuk pendataan warga baru, pembaruan data keluarga, dan kebutuhan administrasi.",
    icon: "briefcase",
    href: "/layanan/#form-layanan",
    label: "Data",
    group: "Administrasi",
  },
  {
    title: "Iuran warga",
    text: "Akses cepat menuju transparansi iuran dan ringkasan kas lingkungan.",
    icon: "wallet",
    href: "/layanan/#form-layanan",
    label: "Kas",
    group: "Keuangan",
  },
  {
    title: "Aspirasi & partisipasi",
    text: "Kanal ide, usulan, kontribusi, dan prioritas lingkungan dari warga.",
    icon: "megaphone",
    href: "/layanan/#form-layanan",
    label: "Aspirasi",
    group: "Partisipasi",
  },
];

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
              administrasi, iuran, dan aspirasi terlihat jelas tanpa
              membuat klaim bahwa sistem pengiriman sudah aktif.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#layanan-utama"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Pilih layanan
              </Link>
              <Link
                href="/pengurus/#kontak-pengurus"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Hubungi pengurus
              </Link>
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

      <section
        id="layanan-utama"
        className="border-b border-border bg-surface"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <SectionHeading
            eyebrow="Layanan Utama"
            title="Kebutuhan warga dikelompokkan agar mudah dipilih."
            text="Empat kelompok layanan dibuat cukup ringkas agar warga langsung tahu jalur yang tepat tanpa membaca terlalu banyak pilihan."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceModules.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group cursor-pointer rounded-2xl border border-border bg-background p-5 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white">
                    <Icon name={service.icon} />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                    {service.group}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {service.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {service.text}
                </p>
                <span className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors duration-200 group-hover:border-primary/35 group-hover:bg-primary-soft">
                  Buka layanan
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ServiceRequestForm />
    </PageShell>
  );
}
