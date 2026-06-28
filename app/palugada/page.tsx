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
  Barang: "Barang rumah tangga, tanaman, dan kebutuhan warga yang bisa ditinjau sebagai katalog komunitas.",
  Kuliner: "Makanan rumahan, camilan, dan pesanan warga dengan format promosi yang rapi.",
  Jasa: "Layanan harian warga seperti laundry, servis, dan bantuan praktis lingkungan.",
  Properti: "Informasi properti warga yang ditampilkan sebagai direktori, bukan transaksi aktif.",
  Lainnya: "Ruang tambahan untuk kategori yang akan disepakati bersama pengurus.",
};

const campaignNotes = [
  {
    title: "Dari warga, untuk warga",
    text: "PALUGADA CGV disiapkan sebagai ruang promosi agar usaha, barang, jasa, kuliner, dan properti warga lebih mudah ditemukan.",
    icon: "users",
  },
  {
    title: "Katalog review",
    text: "Tahap awal menampilkan kategori dan contoh tampilan, dengan WA trial hanya untuk Ma'niez Donut selama Mode Uji Coba.",
    icon: "file",
  },
  {
    title: "Transaksi nonaktif",
    text: "Pembayaran, keranjang, akun penjual, database, dan proses jual beli tidak diaktifkan pada mode demo ini.",
    icon: "shield",
  },
] as const;

const pilotItem =
  marketplaceItems.find((item) => item.detailSlug === "donat-kentang-warga") ??
  marketplaceItems[0];
const secondaryItems = marketplaceItems.filter(
  (item) => item.name !== pilotItem.name,
);
const previewItems = [pilotItem, ...secondaryItems].slice(0, 3);
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
              PALUGADA CGV - Marketplace Warga
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Katalog visual untuk promosi warga dalam mode tinjauan.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              PALUGADA CGV ditampilkan sebagai pratinjau katalog komunitas
              dengan Ma&apos;niez Donut sebagai pilot lapak pertama. Item lain
              tetap contoh tampilan untuk membandingkan struktur kategori.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Mode Tinjauan Pengurus
              </span>
              <span className="inline-flex rounded-full border border-accent-soft/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                Contoh tampilan - bukan data resmi
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-3 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:p-4">
            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[260px] overflow-hidden rounded-xl bg-foreground/20 sm:min-h-[340px]">
                <Image
                  src="/assets/palugada/palugada-hero.jpg"
                  alt="Kolase contoh kategori PALUGADA CGV untuk tinjauan pengurus"
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, (min-width: 768px) 52vw, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/68 via-primary/8 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/18 bg-primary/76 p-4 text-white backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    Pilot lapak pertama
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/86">
                    Ma&apos;niez Donut dipakai untuk meninjau format katalog
                    dengan WhatsApp trial khusus selama Mode Uji Coba.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/14 bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                  Preview katalog
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
                  {previewItems.map((item) => (
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
            title="Kategori dibuat lebih mudah dipahami sejak tahap review."
            text="Setiap kategori diberi peran yang jelas agar pengurus dapat menilai struktur direktori sebelum aturan publikasi dan kontak resmi disetujui."
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
                    Contoh
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

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <SectionHeading
            eyebrow="Kampanye Prioritas"
            title="Dari direktori sederhana menjadi materi presentasi yang lebih visual."
            text="PALUGADA tetap static demo, tetapi pengalaman review dibuat lebih nyata melalui alur kategori, contoh listing, dan batasan transaksi yang jelas."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {campaignNotes.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-foreground">
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <PlaceholderNotice>
            Mode Tinjauan Pengurus: WA trial hanya aktif untuk Ma&apos;niez
            Donut dalam Mode Uji Coba. Listing PALUGADA lain tetap contoh
            tampilan dengan WA nonaktif. Tidak ada transaksi, pembayaran,
            keranjang, database, akun penjual, checkout, atau dashboard penjual.
          </PlaceholderNotice>

          <div className="space-y-5">
            <article className="overflow-hidden rounded-2xl border border-accent/55 bg-surface shadow-[0_22px_70px_rgba(20,90,58,0.12)]">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[300px] bg-cream sm:min-h-[380px]">
                  {pilotItem.imageSrc ? (
                    <ImagePreview
                      src={pilotItem.imageSrc}
                      alt={pilotItem.imageAlt ?? pilotItem.name}
                      title={pilotItem.name}
                      caption="Foto utama pilot PALUGADA"
                      className="h-full min-h-[300px] sm:min-h-[380px]"
                    >
                      <Image
                        src={pilotItem.imageSrc}
                        alt={pilotItem.imageAlt ?? pilotItem.name}
                        fill
                        sizes="(min-width: 1024px) 430px, 92vw"
                        className="object-cover"
                      />
                    </ImagePreview>
                  ) : null}
                  <div className="absolute left-4 top-4 rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
                    {pilotItem.pilotBadge ?? "Pilot Lapak PALUGADA"}
                  </div>
                </div>

                <div className="flex flex-col justify-center p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {pilotItem.category} - {pilotItem.cluster}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {pilotItem.name}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-muted">
                    Pilot lapak PALUGADA untuk meninjau format katalog dengan
                    WhatsApp trial khusus selama Mode Uji Coba.
                  </p>

                  <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <span className="text-muted">Harga contoh</span>
                      <p className="mt-2 font-semibold text-foreground">
                        {pilotItem.price}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4">
                      <span className="text-muted">Status</span>
                      <p className="mt-2 font-semibold text-foreground">
                        {pilotItem.status}
                      </p>
                    </div>
                    {pilotItem.whatsappDisplayNumber ? (
                      <div className="rounded-xl border border-border bg-background p-4 sm:col-span-2">
                        <span className="text-muted">WhatsApp pilot</span>
                        <p className="mt-2 font-semibold text-foreground">
                          {pilotItem.whatsappDisplayNumber}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {pilotItem.galleryImages ? (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        Foto pilot
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {pilotItem.galleryImages.map((image) => (
                          <ImagePreview
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            title={pilotItem.name}
                            caption={image.alt}
                            className="aspect-square rounded-xl border border-border bg-cream"
                          >
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              sizes="(min-width: 1024px) 96px, 30vw"
                              className="object-cover"
                            />
                          </ImagePreview>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {pilotItem.detailHref ? (
                      <Link
                        href={pilotItem.detailHref}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        Tinjau pilot lapak
                      </Link>
                    ) : null}
                    {pilotItem.whatsappHref ? (
                      <Link
                        href={pilotItem.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        aria-label={`${pilotItem.whatsappLabel} untuk ${pilotItem.name}`}
                      >
                        {pilotItem.whatsappLabel ?? "Hubungi WA Pilot"}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
                      >
                        WA nonaktif untuk demo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {secondaryItems.map((item) => (
                <article
                  key={item.name}
                  className="group rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary/30 sm:p-5"
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
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
                        Contoh tampilan
                      </div>
                      <div className="absolute bottom-3 right-3 rounded-full border border-white/35 bg-primary/82 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        {item.category}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold leading-snug">
                        {item.name}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
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
                        Tinjau detail
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
                    >
                      WA nonaktif untuk demo
                    </button>
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
