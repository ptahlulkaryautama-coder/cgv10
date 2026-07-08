import Link from "next/link";
import { Icon, PageShell, PwaInstallGuide } from "./components/portal";
import { HeroImageRotator } from "./components/hero-image-rotator";
import { quickInfo, type IconName } from "@/lib/portal-data";

const actionTiles: {
  title: string;
  text: string;
  href: string;
  icon: IconName;
  badge: string;
}[] = [
  {
    title: "Layanan Warga",
    text: "Pengaduan, administrasi, dan aspirasi warga dalam satu alur ringkas.",
    href: "/layanan/",
    icon: "home",
    badge: "Aksi warga",
  },
  {
    title: "PALUGADA CGV",
    text: "Katalog warga dengan Ma'niez Donut sebagai lapak awal.",
    href: "/palugada/",
    icon: "store",
    badge: "Lapak awal",
  },
  {
    title: "Kabar Warga",
    text: "Pengumuman, agenda, dan dokumentasi warga dalam satu halaman hidup.",
    href: "/kabar-warga/",
    icon: "calendar",
    badge: "Aktif",
  },
  {
    title: "Transparansi Keuangan",
    text: "Ringkasan kas lingkungan yang mudah dipindai oleh warga.",
    href: "/keuangan/",
    icon: "wallet",
    badge: "Kas RT",
  },
];

const heroMiniCards: {
  title: string;
  value: string;
  icon: IconName;
  badge: string;
}[] = [
  {
    title: "PALUGADA",
    value: "Ma'niez Donut",
    icon: "store",
    badge: "WhatsApp",
  },
  {
    title: "Kegiatan Warga",
    value: "Kerja bakti",
    icon: "calendar",
    badge: "Agenda",
  },
];

const heroSlides = [
  {
    src: "/assets/kegiatan/keamanan-kebersihan.png",
    alt: "Dokumentasi keamanan dan kebersihan lingkungan CGV10",
  },
  {
    src: "/assets/kegiatan/kerja-bakti.png",
    alt: "Dokumentasi kerja bakti lingkungan CGV10",
  },
  {
    src: "/assets/kegiatan/kegiatan-sosial.png",
    alt: "Dokumentasi kegiatan sosial warga CGV10",
  },
];

const liveSignals = [
  "Kabar Warga",
  "Agenda",
  "PALUGADA",
  "Layanan",
];

export default function Home() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_46%,#006d5b_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/18" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:min-h-[calc(100vh-92px)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-14 xl:px-10">
          <div className="min-w-0 max-w-3xl">
            <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft shadow-sm backdrop-blur">
              Cipta Greenville - RT 010 / RW 021
            </p>
            <h1 className="mt-6 max-w-full text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Portal Digital Warga CGV10
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              Portal lingkungan yang rapi, hidup, dan terpercaya untuk
              pengumuman, layanan warga, kegiatan, pengurus, transparansi, dan
              PALUGADA CGV dalam satu pengalaman premium.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/layanan/"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.28)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-6"
              >
                Buka Layanan Warga
              </Link>
              <Link
                href="/kabar-warga/"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-6"
              >
                Lihat Kabar Warga
              </Link>
            </div>
            <div className="mt-9 max-w-xl border-y border-white/12 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Portal aktif untuk
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/82">
                {liveSignals.map((signal, index) => (
                  <span
                    key={signal}
                    className="inline-flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-accent-soft community-pulse" />
                    <span className="text-white/44">0{index + 1}</span>
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/16 bg-primary shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
              <div className="relative min-h-[360px] sm:min-h-[430px]">
                <HeroImageRotator
                  slides={heroSlides}
                  sizes="(min-width: 1024px) 620px, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/76 via-primary/18 to-primary/6" />
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/22 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    Ritme Warga
                  </span>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                    CGV10
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <p className="max-w-[15rem] text-sm font-semibold leading-6 text-white/88">
                    Suasana warga, kegiatan, dan lingkungan Cipta Greenville.
                  </p>
                  <span className="rounded-full border border-white/22 bg-white/14 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    Visual utama
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mt-3 grid gap-3 sm:grid-cols-2">
              {heroMiniCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/14 bg-white/10 p-4 text-white shadow-sm backdrop-blur"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-foreground">
                      <Icon name={card.icon} />
                    </div>
                    <span className="rounded-full border border-white/14 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                    {card.title}
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-tight text-white">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PwaInstallGuide />

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Akses Utama Warga
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Empat pintu utama untuk kebutuhan lingkungan.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted">
                Pilihan dibuat ringkas agar pengurus dan warga bisa langsung
                menuju area yang dibutuhkan.
              </p>
            </div>
            <span className="w-fit rounded-full border border-accent/35 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
              Portal warga aktif
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {actionTiles.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <div className="flex h-full gap-4 p-5 sm:p-6">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {item.text}
                    </p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-primary transition-colors duration-200 group-hover:text-primary-hover">
                      Buka area
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="info-cepat"
        className="scroll-mt-28 bg-primary py-12 text-white lg:py-14"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Info Cepat
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Snapshot civic dashboard yang mudah dipindai.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/78">
                Ringkasan terkini portal warga.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickInfo.map((item, index) => (
                <Link
                  key={item.title}
                  href={item.href ?? "/"}
                  className="group cursor-pointer rounded-2xl border border-white/14 bg-white/10 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.13)] transition-colors duration-200 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                      <Icon name={item.icon} />
                    </div>
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold text-white/76">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.13em] text-accent-soft">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-2xl font-semibold leading-tight">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    {item.text}
                  </p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/14">
                    <div
                      className="h-full rounded-full bg-accent-soft"
                      style={{ width: `${58 + index * 10}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
