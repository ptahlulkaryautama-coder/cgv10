import Image from "next/image";
import Link from "next/link";
import {
  Icon,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "../components/portal";
import { ImagePreview } from "../components/image-preview";
import { marketplaceItems, palugadaCategories } from "@/lib/portal-data";

const categoryDescriptions: Record<string, string> = {
  Barang: "Barang rumah tangga, tanaman, dan kebutuhan warga dalam katalog komunitas.",
  Kuliner: "Makanan rumahan, camilan, dan pesanan warga dengan format promosi yang rapi.",
  Jasa: "Layanan harian warga seperti laundry, servis, dan bantuan praktis lingkungan.",
  Properti: "Informasi properti warga yang ditampilkan sebagai direktori, bukan transaksi aktif.",
  Lainnya: "Ruang tambahan untuk kategori warga yang terus berkembang.",
};

const primaryItem =
  marketplaceItems.find((item) => item.detailSlug === "donat-kentang-warga") ??
  marketplaceItems[0];
const secondaryItems = marketplaceItems.filter(
  (item) => item.name !== primaryItem.name,
);
const featureItems = [primaryItem, ...secondaryItems].slice(0, 3);
const heroProofItems = [
  "Kuliner warga",
  "Jasa harian",
  "Direktori barang",
  "Info properti",
];

export default function PalugadaPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-20 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              PALUGADA CGV - Katalog Warga
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Direktori visual usaha dan layanan warga.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              PALUGADA CGV ditampilkan sebagai katalog komunitas dengan
              Ma&apos;niez Donut sebagai lapak awal. Item lain tetap
              menjadi etalase awal untuk mengenalkan usaha dan layanan warga.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Katalog Warga
              </span>
              <span className="inline-flex rounded-full border border-accent-soft/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                Dukung UMKM lingkungan
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-3 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:p-4">
            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[260px] overflow-hidden rounded-xl bg-foreground/20 sm:min-h-[340px]">
                <Image
                  src="/assets/palugada/palugada-hero.jpg"
                  alt="Kolase kategori PALUGADA CGV untuk katalog warga"
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, (min-width: 768px) 52vw, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/68 via-primary/8 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/18 bg-primary/76 p-4 text-white backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    Lapak awal PALUGADA
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/86">
                    Ma&apos;niez Donut menjadi lapak awal PALUGADA dengan kanal
                    WhatsApp untuk konfirmasi warga.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/14 bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                  Etalase katalog
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {heroProofItems.map((label) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/14 bg-white/10 px-3 py-3 text-sm font-semibold text-white"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  {featureItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-xl border border-white/14 bg-white/10 p-2"
                    >
                      {item.imageSrc ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                          <Image
                            src={item.imageSrc}
                            alt={item.imageAlt ?? item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent-soft text-foreground">
                          <Icon name={item.icon} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-white/70">
                          {item.category} - {item.cluster}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <SectionHeading
            eyebrow="Kategori PALUGADA"
            title="Kategori dibuat untuk memudahkan warga menemukan kebutuhan."
            text="Setiap kategori memberi konteks katalog yang jelas agar warga mudah menemukan kebutuhan sekitar."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {palugadaCategories.map((category) => (
              <article
                key={category.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={category.icon} />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                    Kategori
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {categoryDescriptions[category.title]}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <PlaceholderNotice>
            PALUGADA CGV menjadi etalase warga untuk mengenalkan kuliner, jasa,
            barang, dan informasi properti lingkungan dalam satu katalog.
          </PlaceholderNotice>

          <div className="space-y-5">
            <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {marketplaceItems.map((item) => (
                <article
                  key={item.name}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary/30 sm:p-5"
                >
                  <div className="mb-5 overflow-hidden rounded-xl border border-border bg-cream">
                    <div className="relative aspect-[4/3]">
                      {item.imageSrc ? (
                        <ImagePreview
                          src={item.imageSrc}
                          alt={item.imageAlt ?? item.name}
                          title={item.name}
                          caption={`${item.category} - ${item.cluster}`}
                          className="aspect-[4/3]"
                        >
                          <Image
                            src={item.imageSrc}
                            alt={item.imageAlt ?? item.name}
                            fill
                            sizes="(min-width: 1280px) 260px, (min-width: 640px) 43vw, 92vw"
                            className="object-cover transition-opacity duration-200 group-hover:opacity-95"
                          />
                        </ImagePreview>
                      ) : (
                        <div className="flex h-full flex-col justify-between p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface text-primary shadow-sm">
                              <Icon name={item.icon} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-2/3 rounded-full bg-primary/18" />
                            <div className="h-3 w-1/2 rounded-full bg-accent/28" />
                            <div className="h-10 rounded-xl border border-border bg-surface/80" />
                          </div>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
                        Katalog warga
                      </div>
                      <div className="absolute bottom-3 right-3 rounded-full border border-white/35 bg-primary/82 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-24 items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        {item.category}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold leading-snug">
                        {item.name}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 flex-1 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                      <span className="text-muted">Cluster</span>
                      <span className="text-right font-semibold text-foreground">
                        {item.cluster}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                      <span className="text-muted">Harga</span>
                      <span className="text-right font-semibold text-foreground">
                        {item.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted">Status</span>
                      <span className="text-right font-semibold text-foreground">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {item.detailHref ? (
                      <Link
                        href={item.detailHref}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        Lihat detail
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
                      >
                        Detail segera hadir
                      </button>
                    )}
                    {item.whatsappHref ? (
                      <Link
                        href={item.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        aria-label={`${item.whatsappLabel} untuk ${item.name}`}
                      >
                        {item.whatsappLabel ?? "Hubungi WhatsApp"}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
                      >
                        Kontak via pengurus
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
