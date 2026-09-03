import Link from "next/link";
import { Icon, PageShell } from "./components/portal";
import { LiveHomeHero } from "./components/live-home-hero";
import {
  quickInfo,
  type IconName,
} from "@/lib/portal-data";

const actionTiles: {
  title: string;
  text: string;
  href: string;
  icon: IconName;
  badge: string;
}[] = [
  {
    title: "Layanan Warga",
    text: "Sampaikan kendala, urus administrasi, atau bagikan usulan Anda dengan mudah demi kenyamanan bersama.",
    href: "/layanan/",
    icon: "home",
    badge: "Aksi warga",
  },
  {
    title: "PALUGADA CGV",
    text: "Dukung usaha lokal! Temukan beragam produk, jasa, dan lapak menarik milik tetangga sendiri.",
    href: "/palugada/",
    icon: "store",
    badge: "Katalog warga",
  },
  {
    title: "Kabar Warga",
    text: "Simak pengumuman penting, agenda warga, serta cerita hangat seputar lingkungan tempat tinggal kita.",
    href: "/kabar-warga/",
    icon: "calendar",
    badge: "Aktif",
  },
  {
    title: "Transparansi Keuangan",
    text: "Pantau bersama penggunaan iuran dan ringkasan kas RT secara terbuka, jujur, dan mudah dipahami.",
    href: "/keuangan/",
    icon: "wallet",
    badge: "Kas RT",
  },
];

export default function Home() {
  return (
    <PageShell>
      <LiveHomeHero />

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Akses Utama Warga
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Mau urus apa hari ini? Pilih pintunya di sini.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted">
                Layanan ringkas dan terintegrasi agar kebutuhan Anda cepat
                terpenuhi dan pengurus dapat melayani dengan sepenuh hati.
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
                      Lihat selengkapnya
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
                Sekilas Info Lingkungan Kita
              </h2>
              <p className="mt-5 text-base leading-7 text-white/78">
                Ringkasan informasi penting hari ini agar kita selalu terhubung
                dan saling peduli.
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
