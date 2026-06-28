import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/app/components/image-preview";
import { Icon, PageShell, PlaceholderNotice } from "@/app/components/portal";
import { palugadaDetailItems } from "@/lib/portal-data";

type DetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return palugadaDetailItems.map((item) => ({
    slug: item.detailSlug,
  }));
}

function getDetailItem(slug: string) {
  return palugadaDetailItems.find((item) => item.detailSlug === slug);
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getDetailItem(slug);

  if (!item) {
    return {
      title: "PALUGADA CGV",
    };
  }

  return {
    title: `${item.name} | PALUGADA CGV`,
    description: item.detailDescription,
  };
}

export default async function PalugadaDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = getDetailItem(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = palugadaDetailItems
    .filter((entry) => entry.detailSlug !== item.detailSlug)
    .slice(0, 3);
  const isPilot = item.detailSlug === "donat-kentang-warga";
  const hasWhatsappPilot = Boolean(item.whatsappHref);
  const whatsappLabel = item.whatsappLabel ?? "Hubungi WA Pilot";
  const variants = item.variants ?? item.exampleScope;
  const orderFormats =
    item.orderFormats ?? ["Format pesanan masih berupa contoh tampilan."];
  const serviceAreas =
    item.serviceAreas ?? ["Area layanan menunggu data resmi penyedia."];
  const transactionStatus =
    item.transactionStatus ??
    "Bukan transaksi aktif. Pembayaran, checkout, keranjang, dan WA aktif tidak tersedia pada mode demo.";
  const validationSteps =
    item.validationSteps ?? [
      "Admin/pengurus meninjau informasi listing.",
      "Data dan kontak hanya dipublikasikan setelah disetujui.",
      "Format katalog digunakan sebagai bahan review.",
    ];
  const galleryImages = item.galleryImages ?? [
    {
      src: item.imageSrc,
      alt: item.imageAlt,
    },
  ];
  const pilotNote =
    item.pilotNote ??
    "Detail ini digunakan untuk meninjau format katalog sebelum data resmi dipublikasikan.";

  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/14 bg-foreground/20 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:min-h-[460px]">
            <ImagePreview
              src={item.imageSrc}
              alt={item.imageAlt}
              title={item.name}
              caption="Foto utama detail PALUGADA"
              className="h-full min-h-[320px] sm:min-h-[460px]"
            >
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 92vw"
                className="object-cover"
              />
            </ImagePreview>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/72 via-primary/12 to-transparent" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
              {hasWhatsappPilot ? whatsappLabel : "Contoh tampilan"}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <Link
              href="/palugada/"
              className="inline-flex w-fit items-center rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              Kembali ke PALUGADA
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              PALUGADA CGV - Detail katalog
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {item.name}
            </h1>
            <p className="mt-5 text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
              {item.detailDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Mode Tinjauan Pengurus
              </span>
              <span className="inline-flex rounded-full border border-accent-soft/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                {hasWhatsappPilot ? whatsappLabel : "Bukan transaksi aktif"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="space-y-4">
            <PlaceholderNotice>
              {pilotNote}{" "}
              {hasWhatsappPilot
                ? "WhatsApp trial hanya aktif untuk Ma'niez Donut dalam Mode Uji Coba. Tidak ada pembayaran, checkout, keranjang, akun penjual, database, backend, login, atau dashboard penjual."
                : "Tidak ada pembayaran, checkout, keranjang, akun penjual, database, backend, login, dashboard penjual, atau WhatsApp aktif pada mode demo."}
            </PlaceholderNotice>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Status demo
              </p>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <span className="text-muted">Kategori</span>
                  <span className="font-semibold text-foreground">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <span className="text-muted">Cluster</span>
                  <span className="text-right font-semibold text-foreground">
                    {item.cluster}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <span className="text-muted">Harga/status</span>
                  <span className="text-right font-semibold text-foreground">
                    {item.price}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">WA</span>
                  <span className="text-right font-semibold text-foreground">
                    {item.whatsappStatus ?? "WA nonaktif untuk demo"}
                  </span>
                </div>
                {item.whatsappDisplayNumber ? (
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                    <span className="text-muted">Nomor</span>
                    <span className="text-right font-semibold text-foreground">
                      {item.whatsappDisplayNumber}
                    </span>
                  </div>
                ) : null}
              </div>
              {item.whatsappHref ? (
                <Link
                  href={item.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label={`${whatsappLabel} untuk ${item.name}`}
                >
                  {whatsappLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
                >
                  WA nonaktif untuk demo
                </button>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <article className="rounded-2xl border border-accent/45 bg-accent-soft/45 p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Ringkasan lapak
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {isPilot
                  ? "Pilot pertama untuk format katalog PALUGADA."
                  : "Ringkasan contoh katalog PALUGADA."}
              </h2>
              <p className="mt-4 text-base leading-7 text-foreground">
                {item.detailDescription}
              </p>
              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-xl border border-accent/30 bg-surface/80 p-4">
                  <span className="text-muted">Kategori</span>
                  <p className="mt-2 font-semibold text-foreground">
                    {item.category}
                  </p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-surface/80 p-4">
                  <span className="text-muted">Cluster</span>
                  <p className="mt-2 font-semibold text-foreground">
                    {item.cluster}
                  </p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-surface/80 p-4">
                  <span className="text-muted">Kontak</span>
                  <p className="mt-2 font-semibold text-foreground">
                    {item.whatsappStatus ?? "WA nonaktif untuk demo"}
                  </p>
                  {item.whatsappDisplayNumber ? (
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {item.whatsappDisplayNumber}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon name={item.icon} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Detail Produk - Contoh Tampilan
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Informasi katalog untuk bahan tinjauan.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                {item.productDetail}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {galleryImages.map((image) => (
                  <ImagePreview
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    title={item.name}
                    caption={image.alt}
                    className="aspect-[4/3] rounded-xl border border-border bg-cream"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 92vw"
                      className="object-cover"
                    />
                  </ImagePreview>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Varian contoh
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
                    {variants.map((scope) => (
                      <li key={scope} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        <span>{scope}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-cream p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Format pesanan
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                      {orderFormats.map((format) => (
                        <li key={format}>{format}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-accent/35 bg-accent-soft/55 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Catatan ketersediaan
                    </p>
                    <p className="mt-3 text-sm leading-6 text-foreground">
                      {item.availabilityNote}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="building" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Area layanan
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Area tetap contoh sampai aturan disetujui.
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                  {serviceAreas.map((area) => (
                    <li key={area} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="shield" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Status transaksi
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {hasWhatsappPilot
                    ? "WA pilot untuk konfirmasi awal, tanpa transaksi sistem."
                    : "Tidak ada pemesanan aktif pada demo."}
                </h2>
                <p className="mt-5 text-sm leading-6 text-muted">
                  {transactionStatus}
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                <Icon name={item.icon} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Profil penyedia - contoh tampilan
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Format profil sebelum data resmi dipublikasikan.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                {item.providerProfile}
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                <Icon name="file" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Alur validasi admin
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Pilot dikelola admin/pengurus sebelum diperluas.
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {validationSteps.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="mt-4 text-sm leading-6 text-muted">{step}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Mini katalog
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    Contoh item lain untuk alur tinjauan.
                  </h2>
                </div>
                <Link
                  href="/palugada/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Lihat katalog
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {relatedItems.map((related) => (
                  <Link
                    key={related.detailSlug}
                    href={related.detailHref}
                    className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    <div className="relative aspect-[4/3] bg-cream">
                      <Image
                        src={related.imageSrc}
                        alt={related.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 240px, 30vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
                        Contoh
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        {related.category}
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-foreground">
                        {related.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        {related.cluster}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
