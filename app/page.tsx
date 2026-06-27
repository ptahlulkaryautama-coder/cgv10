import Image from "next/image";
import Link from "next/link";
import {
  Icon,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "./components/portal";
import { quickInfo } from "@/lib/portal-data";

const phaseFocus = [
  {
    title: "Portal Warga",
    text: "Tahap awal memusatkan informasi yang siap ditinjau: pengurus, kas, pengumuman, kontak penting, dan layanan warga.",
    icon: "home",
  },
  {
    title: "PALUGADA CGV",
    text: "PALUGADA CGV diposisikan sebagai kampanye prioritas Marketplace Warga: ruang promosi dan direktori dari warga, untuk warga.",
    icon: "store",
  },
  {
    title: "Siap ditinjau bersama",
    text: "Struktur portal disiapkan bertahap agar warga dan pengurus dapat meninjau informasi, alur, dan prioritas sebelum data resmi dipublikasikan.",
    icon: "calendar",
  },
] as const;

export default function Home() {
  return (
    <PageShell>
      <section className="relative">
        <div className="absolute inset-x-0 top-16 -z-10 mx-auto h-72 max-w-5xl rounded-full bg-primary-soft/60 blur-2xl" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:items-center lg:px-8 lg:pb-20 lg:pt-16 xl:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-primary sm:tracking-[0.18em]">
              Tahap awal - Portal Warga
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Cipta Greenville &bull; RT 010 / RW 021
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
              CGV10 dimulai dari portal warga publik yang menyusun informasi
              pengurus, keuangan, pengumuman, kontak penting, dan PALUGADA CGV
              sebagai kampanye prioritas Marketplace Warga. Fokus saat ini
              adalah membuat informasi, pengumuman, transparansi, dan direktori
              warga lebih rapi untuk ditinjau bersama.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pengurus/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-center text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
              >
                Tinjau struktur pengurus
              </Link>
              <Link
                href="/palugada/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-center text-base font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
              >
                Buka PALUGADA CGV
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-accent-soft/70 blur-2xl" />
            <div className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-[0_20px_60px_rgba(20,90,58,0.12)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
                <Image
                  src="/cgv10-portal-preview.svg"
                  alt="Ilustrasi gambaran portal digital warga CGV10"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
            <aside className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto aspect-[2/1] w-full max-w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-cream sm:mx-0">
                  <Image
                    src="/assets/brand/cgv10-logo-proposal.png"
                    alt="Proposal sementara logo CGV10 untuk pratinjau identitas"
                    fill
                    sizes="(min-width: 768px) 224px, 70vw"
                    className="object-contain p-3"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Brand preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Proposal logo ditampilkan sebagai referensi visual
                    sementara. Header memakai mark CGV10 sederhana yang
                    diturunkan dari arah proposal agar tetap jelas di desktop
                    dan layar kecil.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Fokus Tahap Awal"
            title="Portal warga yang fokus pada informasi resmi dan PALUGADA."
            text="Tahap awal menjaga pengalaman tetap sederhana dan tepercaya: informasi yang dibutuhkan warga tersedia rapi, sementara PALUGADA CGV diperkenalkan sebagai kampanye prioritas direktori warga."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {phaseFocus.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={item.icon} />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Info cepat"
            title="Ringkasan awal yang siap divalidasi pengurus."
            text="Kartu berikut menjaga struktur portal tetap jelas tanpa menampilkan angka atau status yang belum dikonfirmasi."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickInfo.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={item.icon} />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <PlaceholderNotice>
              Data publik pada halaman ini masih menunggu validasi pengurus
              sebelum digunakan untuk komunikasi warga yang lebih luas.
            </PlaceholderNotice>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
