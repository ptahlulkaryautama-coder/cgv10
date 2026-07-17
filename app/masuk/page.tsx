import type { Metadata } from "next";
import Link from "next/link";
import { Icon, PageShell, PlaceholderNotice } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { MasukWargaClient } from "./masuk-warga-client";

type AccessStep = {
  title: string;
  text: string;
  icon: IconName;
};

const accessSteps: AccessStep[] = [
  {
    title: "Verifikasi warga",
    text: "Akun warga akan dicocokkan dengan data rumah sebelum akses profil dibuka.",
    icon: "shield",
  },
  {
    title: "Lengkapi profil rumah",
    text: "Warga dapat meninjau data keluarga, kendaraan, dan catatan administrasi.",
    icon: "home",
  },
  {
    title: "Akses layanan",
    text: "Layanan, iuran, dan laporan bisa diarahkan dari profil yang sudah jelas.",
    icon: "message",
  },
];

export const metadata: Metadata = {
  title: "Masuk Warga | CGV10",
  description:
    "Gerbang preview login warga CGV10 untuk fase profil rumah dan akses portal warga.",
};

export default function MasukWargaPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Akses Warga
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Gerbang masuk untuk fase profil rumah CGV10.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              portalwargacgv.id sudah siap menjadi alamat utama. Akses tulis
              seperti pendaftaran lapak PALUGADA akan dibuka setelah warga
              masuk dan terverifikasi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portal/profil-rumah/"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Preview Profil Rumah
              </Link>
              <Link
                href="/portal/"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Buka Portal Warga
              </Link>
            </div>
          </div>

          <MasukWargaClient />
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Alur akses
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Login warga dibuat bertahap supaya data rumah tetap terlindungi.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted">
              Halaman ini menjadi kerangka UX sebelum pilihan backend produksi
              dipasang. Fokusnya adalah kejelasan status, izin akses, dan
              kebutuhan verifikasi.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {accessSteps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={step.icon} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">{step.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <PlaceholderNotice>
              Login warga memakai Supabase Auth. Setelah session aktif, menu
              layanan, konfirmasi iuran, dan pendaftaran PALUGADA dapat dibuka
              tanpa berputar kembali ke halaman masuk.
            </PlaceholderNotice>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
