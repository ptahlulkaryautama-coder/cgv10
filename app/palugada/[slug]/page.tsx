import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthAwareAction } from "@/app/components/auth-aware-action";
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

function getTrustBadges({
  hasWhatsappContact,
}: {
  hasWhatsappContact: boolean;
}) {
  return [
    "Lapak warga",
    hasWhatsappContact ? "Kontak WhatsApp tersedia" : "Kontak via pengurus",
    "Katalog aktif",
    "Perlu konfirmasi penyedia",
  ];
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
  const hasWhatsappContact = Boolean(item.whatsappHref);
  const isSellerOnline = item.sellerStatus === "online";
  const whatsappLabel = item.whatsappLabel ?? "Hubungi WhatsApp";
  const variants = item.variants ?? item.exampleScope;
  const orderFormats =
    item.orderFormats ?? ["Format pesanan mengikuti informasi penyedia."];
  const serviceAreas =
    item.serviceAreas ?? ["Area layanan mengikuti informasi penyedia."];
  const transactionStatus =
    item.transactionStatus ??
    "Kontak dan pemesanan diarahkan melalui kanal pengurus atau penyedia terkait.";
  const validationSteps =
    item.validationSteps ?? [
      "Informasi listing dikelola agar mudah dibaca warga.",
      "Kontak penyedia ditampilkan melalui kanal yang sesuai.",
      "Katalog membantu warga menemukan kebutuhan sekitar.",
    ];
  const galleryImages = item.galleryImages ?? [
    {
      src: item.imageSrc,
      alt: item.imageAlt,
    },
  ];
  const catalogNote =
    item.catalogNote ??
    "Detail katalog membantu warga mengenal usaha dan layanan di lingkungan.";
  const trustBadges = getTrustBadges({
    hasWhatsappContact,
  });

  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="relative min-h-[330px] overflow-hidden rounded-2xl border border-white/14 bg-foreground/20 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:min-h-[480px]">
            <ImagePreview
              src={item.imageSrc}
              alt={item.imageAlt}
              title={item.name}
              caption="Foto utama detail PALUGADA"
              className="h-full min-h-[330px] sm:min-h-[480px]"
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/78 via-primary/14 to-transparent" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
              {item.category}
            </div>
            <div
              className={`pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm ${
                isSellerOnline
                  ? "border-emerald-200 bg-emerald-50 text-primary"
                  : "border-white/30 bg-white/88 text-muted"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSellerOnline ? "bg-emerald-600" : "bg-stone-400"
                }`}
              />
              {item.sellerStatusLabel}
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl border border-white/18 bg-primary/78 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                {item.category} - {item.cluster}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/86">
                {item.price}
              </p>
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
            <div className="mt-7 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {item.whatsappHref ? (
                <Link
                  href={item.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`${whatsappLabel} untuk ${item.name}`}
                >
                  {whatsappLabel}
                </Link>
              ) : (
                <Link
                  href="/kontak/"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Tanya kontak
                </Link>
              )}
              <AuthAwareAction
                href="/palugada/daftar/"
                guestHref="/masuk/?next=/palugada/daftar/"
                guestLabel="Masuk untuk daftar"
                authenticatedLabel="Daftar lapak"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/18 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-32">
            <PlaceholderNotice>
              {catalogNote}{" "}
              {hasWhatsappContact
                ? "Gunakan WhatsApp untuk konfirmasi awal langsung ke penyedia."
                : "Kontak dapat diarahkan melalui pengurus atau kanal PALUGADA."}
            </PlaceholderNotice>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Ringkasan kontak
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
                  <span className="text-muted">Kontak</span>
                  <span className="text-right font-semibold text-foreground">
                    {item.whatsappStatus ?? "Kontak via pengurus"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                  <span className="text-muted">Status seller</span>
                  <span
                    className={`inline-flex items-center gap-2 text-right font-semibold ${
                      isSellerOnline ? "text-primary" : "text-muted"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSellerOnline ? "bg-emerald-600" : "bg-stone-400"
                      }`}
                    />
                    {item.sellerStatusLabel}
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
                <Link
                  href="/kontak/"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Tanya kontak
                </Link>
              )}
            </div>

            <div className="rounded-2xl border border-accent/40 bg-accent-soft/65 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Catatan transaksi
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground/78">
                {transactionStatus}
              </p>
              <p className="mt-3 rounded-xl border border-accent/35 bg-surface/80 px-3 py-2 text-sm font-semibold text-foreground">
                {item.sellerStatusNote}
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <article className="rounded-2xl border border-accent/45 bg-accent-soft/45 p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Ringkasan lapak
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Lapak warga di katalog PALUGADA.
              </h2>
              <p className="mt-4 text-base leading-7 text-foreground">
                {item.productDetail}
              </p>
              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-xl border border-accent/30 bg-surface/80 p-4">
                  <span className="text-muted">Kategori</span>
                  <p className="mt-2 font-semibold text-foreground">
                    {item.category}
                  </p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-surface/80 p-4">
                  <span className="text-muted">Area</span>
                  <p className="mt-2 font-semibold text-foreground">
                    {item.cluster}
                  </p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-surface/80 p-4">
                  <span className="text-muted">Status</span>
                  <p className="mt-2 font-semibold text-foreground">
                    {item.catalogStatusNote}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Galeri
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    Foto produk dan layanan.
                  </h2>
                </div>
                <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {galleryImages.length} foto
                </span>
              </div>
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
            </article>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={item.icon} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Pilihan atau cakupan
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Informasi utama untuk warga.
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                  {variants.map((scope) => (
                    <li key={scope} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <span>{scope}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="message" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Format pesanan
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Cara warga memahami order awal.
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                  {orderFormats.map((format) => (
                    <li key={format} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <span>{format}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="building" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Area layanan
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Area mengikuti informasi penyedia.
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
                  <Icon name="calendar" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Ketersediaan
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Konfirmasi sebelum memesan.
                </h2>
                <p className="mt-5 text-sm leading-6 text-muted">
                  {item.availabilityNote}
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                <Icon name="shield" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Trust layer
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Informasi dibuat jelas sebelum warga menghubungi penyedia.
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
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                <Icon name={item.icon} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Profil penyedia
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Informasi penjual.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                {item.providerProfile}
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Mini katalog
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    Item lain dalam katalog warga.
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
                        className="object-cover transition-opacity duration-200 group-hover:opacity-95"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
                        {related.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold leading-snug text-foreground">
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
