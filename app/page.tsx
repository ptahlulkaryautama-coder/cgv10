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
    text: "Arah layanan warga disiapkan sebagai hub statis untuk meninjau pengaduan, administrasi, iuran, dan aspirasi.",
    icon: "home",
    href: "/layanan/",
    cta: "Buka Layanan",
    label: "Hub layanan",
    visual: "dashboard",
    imageSrc: undefined,
    imageAlt: "",
  },
  {
    title: "PALUGADA CGV",
    text: "Kampanye prioritas Marketplace Warga dimulai dari satu lapak pilot yang jelas batas uji cobanya.",
    icon: "store",
    href: "/palugada/",
    cta: "Buka PALUGADA",
    label: "Pilot lapak",
    visual: "palugada",
    imageSrc: "/assets/palugada/maniez-donut-main.png",
    imageAlt: "Ma'niez Donut sebagai visual pilot PALUGADA CGV",
  },
  {
    title: "Dokumentasi Kegiatan",
    text: "Arsip kegiatan warga memakai foto lokal dan halaman detail statis untuk meninjau format publikasi.",
    icon: "calendar",
    href: "/kegiatan/",
    cta: "Lihat kegiatan",
    label: "Dokumentasi",
    visual: "kegiatan",
    imageSrc: "/assets/kegiatan/kegiatan-keluarga.png",
    imageAlt: "Contoh visual dokumentasi kegiatan keluarga CGV10",
  },
] as const;

const portalHighlights = [
  {
    title: "Ma'niez Donut pilot",
    text: "Lapak pilot PALUGADA dengan WA trial khusus yang sudah disetujui.",
    href: "/palugada/donat-kentang-warga/",
    icon: "store",
    imageSrc: "/assets/palugada/maniez-donut-main.png",
    imageAlt: "Ma'niez Donut untuk highlight pilot PALUGADA",
    badge: "WA Pilot Mode Uji Coba",
  },
  {
    title: "Dokumentasi kerja bakti",
    text: "Detail kegiatan memakai foto lokal dan caption contoh untuk tinjauan publikasi.",
    href: "/kegiatan/kerja-bakti-lingkungan/",
    icon: "calendar",
    imageSrc: "/assets/kegiatan/kerja-bakti.png",
    imageAlt: "Contoh dokumentasi kerja bakti lingkungan",
    badge: "Contoh dokumentasi",
  },
  {
    title: "Transparansi kas demo",
    text: "Format ringkasan kas memakai nilai simulasi yang jelas bukan data resmi.",
    href: "/keuangan/",
    icon: "wallet",
    badge: "Simulasi format",
    imageSrc: undefined,
    imageAlt: "",
  },
] as const;

const portalPreviewRows = [
  ["PALUGADA Pilot", "Ma'niez Donut", "WA Pilot"],
  ["Dokumentasi", "Kerja bakti lingkungan", "Contoh"],
] as const;

export default function Home() {
  return (
    <PageShell>
      <section className="relative">
        <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-80 max-w-6xl rounded-full bg-primary-soft/70 blur-3xl" />
        <div className="absolute right-0 top-24 -z-10 h-64 w-64 rounded-full border border-accent/25 bg-accent-soft/50 blur-2xl" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8 lg:pb-20 lg:pt-16 xl:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-primary sm:tracking-[0.18em]">
              Mode Tinjauan Pengurus
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Cipta Greenville &bull; RT 010 / RW 021
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
              CGV10 ditampilkan sebagai portal warga publik yang siap ditinjau:
              struktur pengurus, transparansi kas, pengumuman, kontak penting,
              dan PALUGADA CGV sebagai kampanye prioritas Marketplace Warga.
              Sebagian data menggunakan simulasi format agar alur publikasi
              bisa dinilai sebelum informasi resmi disetujui.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                Data simulasi untuk review - bukan data resmi
              </span>
              <span className="inline-flex rounded-full border border-primary/20 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                PALUGADA pilot: Ma&apos;niez Donut
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#info-cepat"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-center text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
              >
                Lihat ringkasan portal
              </Link>
              <Link
                href="/palugada/"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-5 text-center text-base font-semibold text-primary shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
              >
                Buka PALUGADA CGV
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-accent-soft/80 blur-2xl" />
            <div className="rounded-[1.75rem] border border-border bg-surface p-3 shadow-[0_26px_70px_rgba(20,90,58,0.16)] sm:p-4">
              <div className="overflow-hidden rounded-[1.35rem] border border-primary/15 bg-primary text-white">
                <div className="flex items-center justify-between gap-4 border-b border-white/14 bg-white/8 px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                      Portal preview board
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                      Mode Tinjauan Pengurus
                    </h2>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                    Demo
                  </span>
                </div>

                <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
                  {quickInfo.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-foreground">
                          <Icon name={item.icon} />
                        </div>
                        <span className="rounded-full border border-white/16 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/84">
                          Simulasi
                        </span>
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                        {item.title}
                      </p>
                      <p className="mt-2 text-xl font-semibold leading-tight">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 border-t border-white/14 p-3 sm:p-4 md:grid-cols-[0.92fr_1.08fr]">
                  <div className="relative min-h-48 overflow-hidden rounded-2xl border border-white/14 bg-white/10">
                    <Image
                      src="/assets/palugada/maniez-donut-main.png"
                      alt="Ma'niez Donut sebagai PALUGADA Pilot"
                      fill
                      sizes="(min-width: 768px) 260px, 90vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/86 to-transparent p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                        PALUGADA Pilot
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        Ma&apos;niez Donut
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {portalPreviewRows.map(([label, value, chip]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/14 bg-white/10 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                            {label}
                          </p>
                          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.68rem] font-semibold text-foreground">
                            {chip}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                    <div className="relative min-h-24 overflow-hidden rounded-2xl border border-white/14 bg-accent-soft text-foreground">
                      <Image
                        src="/assets/kegiatan/kerja-bakti.png"
                        alt="Contoh dokumentasi kegiatan kerja bakti"
                        fill
                        sizes="(min-width: 768px) 260px, 90vw"
                        className="object-cover opacity-55"
                      />
                      <div className="absolute inset-0 bg-accent-soft/55" />
                      <div className="relative p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Dokumentasi Kegiatan
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          Foto lokal dengan label Contoh dokumentasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
            title="Tiga pintu utama untuk meninjau portal warga."
            text="Setiap kartu sekarang menjadi pintu masuk langsung ke area yang relevan, dengan fokus pada ringkasan portal, PALUGADA pilot, dan dokumentasi kegiatan."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {phaseFocus.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-colors duration-200 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <div className="relative h-36 bg-primary-soft">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="grid h-full grid-cols-2 gap-3 p-4">
                      {quickInfo.slice(0, 4).map((info) => (
                        <div
                          key={info.title}
                          className="rounded-xl border border-primary/12 bg-surface/88 p-3 shadow-sm"
                        >
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
                            {info.title}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {info.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm">
                    {item.label}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                  <span className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-primary-hover">
                    {item.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="info-cepat" className="scroll-mt-28 bg-primary py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Info cepat
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Dashboard simulasi untuk membaca kondisi portal sekilas.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/78">
                Nilai di bawah dipertahankan sebagai simulasi format. Kartu
                dibuat lebih padat, kontras, dan siap dipresentasikan tanpa
                mengklaim angka sebagai data resmi.
              </p>
            </div>
            <div className="rounded-2xl border border-white/14 bg-white/8 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  Ringkasan Portal CGV10
                </p>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                  Mode Tinjauan Pengurus
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickInfo.map((item, index) => (
                  <Link
                    key={item.title}
                    href={item.href ?? "/"}
                    className="group cursor-pointer rounded-2xl border border-white/14 bg-white/10 p-4 transition-colors duration-200 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-foreground">
                        <Icon name={item.icon} />
                      </div>
                      <span className="text-xs font-semibold text-white/64">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-sm font-semibold text-white/78">
                      {item.title}
                    </h3>
                    <p className="mt-2 min-h-14 text-xl font-semibold leading-tight text-white">
                      {item.value}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-white/68">
                      {item.text}
                    </p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/14">
                      <div
                        className="h-full rounded-full bg-accent-soft"
                        style={{ width: `${62 + index * 8}%` }}
                      />
                    </div>
                    <p className="mt-4 rounded-xl bg-accent-soft/95 px-3 py-2 text-xs font-semibold leading-5 text-foreground">
                      {item.status}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <PlaceholderNotice>
              Mode Tinjauan Pengurus: sebagian data pada halaman ini adalah
              simulasi format untuk diskusi, bukan data resmi.
            </PlaceholderNotice>
          </div>
        </div>
      </section>

      <section id="highlight-portal" className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Highlight Portal"
            title="Area demo yang paling siap dipresentasikan."
            text="Bagian ini mengarahkan pengurus ke alur yang sudah terasa hidup: PALUGADA pilot, dokumentasi kegiatan, dan transparansi kas dalam format simulasi."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {portalHighlights.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors duration-200 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative h-48 bg-primary-soft">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="h-full bg-primary p-5 text-white">
                      <div className="grid h-full content-between rounded-2xl border border-white/14 bg-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                            Kas RT
                          </span>
                          <Icon name="wallet" />
                        </div>
                        <div>
                          <p className="text-2xl font-semibold">
                            Rp 5.500.000
                          </p>
                          <div className="mt-4 grid grid-cols-4 gap-1.5">
                            {[56, 72, 48, 86].map((height) => (
                              <span
                                key={height}
                                className="block rounded-t bg-accent-soft"
                                style={{ height }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm">
                    {item.badge}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                  <span className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 group-hover:border-primary/35 group-hover:bg-primary-soft">
                    Buka detail
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
