import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Icon,
  PageShell,
} from "../components/portal";
import {
  marketplaceItems,
  palugadaCategories,
  palugadaReviewStages,
} from "@/lib/portal-data";
import { PalugadaCatalog } from "./palugada-catalog";
import { PalugadaHeroControls } from "./palugada-hero-controls";

export const metadata: Metadata = {
  title: "PALUGADA CGV | Katalog Warga",
  description:
    "Katalog usaha, jasa, barang, kuliner, dan informasi warga CGV10 dengan detail lapak dan kanal kontak.",
};

const primaryItem =
  marketplaceItems.find((item) => item.detailSlug === "donat-kentang-warga") ??
  marketplaceItems[0];

const activeListings = marketplaceItems.filter((item) => item.detailHref);
const whatsappListings = marketplaceItems.filter((item) => item.whatsappHref);

export default function PalugadaPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/18 bg-white/10 p-2">
                <Image
                  src="/assets/brand/palugada-mark.svg"
                  alt=""
                  width="42"
                  height="42"
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
                  PALUGADA CGV
                </p>
                <p className="mt-1 text-sm text-white/72">
                  Katalog usaha, jasa, dan kebutuhan warga.
                </p>
              </div>
            </div>

            <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Cari kebutuhan warga tanpa harus menunggu info tersebar di grup.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              PALUGADA tetap berada di portal CGV10, tetapi dibuat sebagai
              direktori khusus agar warga bisa menemukan lapak, jasa, kuliner,
              dan kontak dengan lebih cepat.
            </p>

            <PalugadaHeroControls />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/10 p-3 shadow-[0_28px_90px_rgba(7,35,23,0.34)] sm:p-4">
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/70" />
            <div className="grid gap-3 md:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-foreground/20 sm:min-h-[410px]">
                <Image
                  src="/assets/palugada/palugada-hero.jpg"
                  alt="Kolase kategori PALUGADA CGV untuk katalog warga"
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, (min-width: 768px) 52vw, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/82 via-primary/12 to-white/8" />
                <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur">
                  Marketplace warga
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/18 bg-primary/80 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    Lapak pilot
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/88">
                    Ma&apos;niez Donut menjadi contoh format katalog dengan
                    foto, detail, varian, area, dan WhatsApp.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-xl border border-white/14 bg-white/12 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                      Command center
                    </p>
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                      Pilot
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      ["Listing", marketplaceItems.length],
                      ["Kategori", palugadaCategories.length],
                      ["Detail aktif", activeListings.length],
                      ["Kontak WA", whatsappListings.length],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-white/14 bg-white/10 px-3 py-3"
                      >
                        <p className="text-2xl font-semibold">{value}</p>
                        <p className="mt-1 text-xs text-white/72">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={primaryItem.detailHref ?? "/palugada/"}
                  className="group rounded-xl border border-accent-soft/35 bg-accent-soft p-4 text-foreground shadow-[0_18px_55px_rgba(0,0,0,0.16)] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Buka lapak contoh
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                      {primaryItem.imageSrc ? (
                        <Image
                          src={primaryItem.imageSrc}
                          alt={primaryItem.imageAlt ?? primaryItem.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-primary">
                          <Icon name={primaryItem.icon} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{primaryItem.name}</p>
                      <p className="mt-1 text-sm text-foreground/72">
                        {primaryItem.price}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="rounded-xl border border-white/14 bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    Review pipeline
                  </p>
                  <div className="mt-4 space-y-3">
                    {palugadaReviewStages.map((stage) => (
                      <div
                        key={stage.title}
                        className="flex items-center gap-3 rounded-lg border border-white/14 bg-white/10 p-3"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/12 text-accent-soft">
                          <Icon name={stage.icon} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {stage.title}
                          </p>
                          <p className="mt-1 text-xs text-white/68">
                            {stage.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/70">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-3 text-sm md:grid-cols-3">
            {[
              {
                label: "Kategori sebagai filter",
                value: `${palugadaCategories.length} kategori aktif`,
                icon: "store" as const,
              },
              {
                label: "Kontak sesuai status",
                value:
                  whatsappListings.length > 0
                    ? `${whatsappListings.length} kontak langsung`
                    : "Melalui pengurus",
                icon: "phone" as const,
              },
              {
                label: "Kurasi bertahap",
                value: "Draft warga tetap direview",
                icon: "shield" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <Icon name={item.icon} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PalugadaCatalog />
    </PageShell>
  );
}
