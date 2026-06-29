import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/app/components/image-preview";
import { Icon, PageShell, PlaceholderNotice } from "@/app/components/portal";
import { kegiatanItems } from "@/lib/portal-data";

type KegiatanDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return kegiatanItems.map((item) => ({
    slug: item.slug,
  }));
}

function getKegiatanItem(slug: string) {
  return kegiatanItems.find((item) => item.slug === slug);
}

export async function generateMetadata({
  params,
}: KegiatanDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getKegiatanItem(slug);

  if (!item) {
    return {
      title: "Kegiatan | CGV10",
    };
  }

  return {
    title: `${item.title} | Kegiatan CGV10`,
    description: item.detailDescription,
  };
}

export default async function KegiatanDetailPage({
  params,
}: KegiatanDetailPageProps) {
  const { slug } = await params;
  const item = getKegiatanItem(slug);

  if (!item) {
    notFound();
  }

  const galleryPreview = [
    item,
    ...kegiatanItems.filter((entry) => entry.slug !== item.slug),
  ].slice(0, 3);

  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/14 bg-foreground/20 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:min-h-[460px]">
            <ImagePreview
              src={item.imageSrc}
              alt={item.imageAlt}
              title={item.title}
              caption="Foto dokumentasi kegiatan"
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/72 via-primary/16 to-transparent" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
              Dokumentasi warga
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <Link
              href="/kabar-warga/#dokumentasi"
              className="inline-flex w-fit items-center rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              Kembali ke Kabar Warga
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Dokumentasi Kegiatan
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {item.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
              {item.detailDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Arsip warga
              </span>
              <span className="inline-flex rounded-full border border-accent-soft/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                Kegiatan lingkungan
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="space-y-4">
            <PlaceholderNotice>
              Dokumentasi kegiatan membantu warga melihat kembali momen
              kebersamaan dan koordinasi lingkungan.
            </PlaceholderNotice>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon name={item.icon} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Status arsip
              </p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">
                Tersimpan sebagai dokumentasi warga.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {item.archiveNote}
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <article className="rounded-2xl border border-accent/45 bg-accent-soft/45 p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Ringkasan dokumentasi
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Arsip kegiatan warga.
              </h2>
              <p className="mt-4 text-base leading-7 text-foreground">
                {item.text}
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Galeri kegiatan
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Visual kegiatan disusun sebagai dokumentasi komunitas.
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {galleryPreview.map((galleryItem) => (
                  <div
                    key={galleryItem.slug}
                    className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
                  >
                    <ImagePreview
                      src={galleryItem.imageSrc}
                      alt={galleryItem.imageAlt}
                      title={galleryItem.title}
                      caption="Dokumentasi kegiatan"
                      className="aspect-[4/3] bg-cream"
                    >
                      <Image
                        src={galleryItem.imageSrc}
                        alt={galleryItem.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 92vw"
                        className="object-cover"
                      />
                    </ImagePreview>
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        Dokumentasi warga
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {galleryItem.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Catatan kegiatan
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Keterangan singkat untuk membantu warga memahami dokumentasi.
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {item.captions.map((caption, index) => (
                  <div
                    key={caption}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="mt-4 text-sm leading-6 text-muted">
                      {caption}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
