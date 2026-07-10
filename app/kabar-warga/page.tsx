import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePreview } from "../components/image-preview";
import { PageShell } from "../components/portal";
import { kabarArticles, kegiatanItems } from "@/lib/portal-data";

type KabarCategory =
  | "Pengumuman"
  | "Artikel"
  | "Kabar Lingkungan"
  | "Dokumentasi"
  | "Agenda";

type KabarItem = {
  category: KabarCategory;
  title: string;
  text: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  meta?: string;
};

const featuredArticle = kabarArticles[0];

const allNews: KabarItem[] = [
  ...kabarArticles.map((item, index) => ({
    category: item.category,
    title: item.title,
    text: item.excerpt,
    href: index === 0 ? "#artikel-terbaru" : "#semua-kabar",
    imageSrc: item.coverImageSrc,
    imageAlt: item.coverImageAlt ?? item.title,
    meta: `${item.publishedAt} - ${item.readTime}`,
  })),
  ...kegiatanItems.slice(0, 1).map((item) => ({
    category: "Dokumentasi" as const,
    title: item.title,
    text: item.text,
    href: item.href,
    imageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    meta: "Dokumentasi warga",
  })),
];

export const metadata: Metadata = {
  title: "Kabar Warga | CGV10",
  description:
    "Kabar Warga CGV10 berisi artikel terbaru, pengumuman, agenda, dan dokumentasi warga dalam satu alur yang mudah dibaca.",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CategoryBadge({ category }: { category: KabarCategory }) {
  const className =
    category === "Pengumuman"
      ? "bg-primary text-white"
      : category === "Artikel"
        ? "bg-primary-soft text-primary"
        : category === "Kabar Lingkungan"
          ? "bg-accent-soft text-foreground"
        : category === "Dokumentasi"
          ? "bg-accent-soft text-foreground"
          : "bg-surface text-primary";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {category}
    </span>
  );
}

function ArticleBody() {
  if (!featuredArticle.bodySections) {
    return (
      <p className="text-base leading-8 text-foreground/78">
        {featuredArticle.body}
      </p>
    );
  }

  return (
    <div className="space-y-6 text-base leading-8 text-foreground/80">
      {featuredArticle.bodySections.map((section, sectionIndex) => (
        <div
          key={`${featuredArticle.title}-${sectionIndex}`}
          className="space-y-5"
        >
          {section.heading ? (
            <h2 className="pt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {section.heading}
            </h2>
          ) : null}

          {section.paragraphs?.map((paragraph, paragraphIndex) => (
            <p
              key={paragraph}
              className={
                paragraphIndex === 0 && sectionIndex === 0
                  ? "font-semibold text-foreground"
                  : undefined
              }
            >
              {paragraph}
            </p>
          ))}

          {section.image ? (
            <figure className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <ImagePreview
                src={section.image.src}
                alt={section.image.alt}
                title={section.image.caption}
                caption="Dokumentasi artikel"
                className="aspect-[4/3] bg-cream sm:aspect-[3/2]"
              >
                <Image
                  src={section.image.src}
                  alt={section.image.alt}
                  fill
                  sizes="(min-width: 1024px) 640px, 92vw"
                  className="object-cover"
                />
              </ImagePreview>
              <figcaption className="border-t border-border px-4 py-3 text-sm leading-6 text-muted sm:px-5">
                {section.image.caption}
              </figcaption>
            </figure>
          ) : null}

          {section.list ? (
            <ul className="space-y-3 rounded-2xl border border-border bg-surface p-4">
              {section.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {section.signature ? (
            <div className="rounded-2xl border-l-4 border-primary bg-primary-soft px-5 py-4 text-primary">
              {section.signature.map((line, index) => (
                <p key={line} className={index === 1 ? "font-semibold" : undefined}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ))}

      {featuredArticle.tags ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-5">
          {featuredArticle.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function KabarCard({ item }: { item: KabarItem }) {
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors duration-200 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {item.imageSrc ? (
        <div className="relative aspect-[4/3] bg-cream">
          <Image
            src={item.imageSrc}
            alt={item.imageAlt ?? item.title}
            fill
            sizes="(min-width: 1024px) 310px, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-opacity duration-200 group-hover:opacity-95"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} />
          {item.meta ? (
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {item.meta}
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-foreground">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {item.text}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-200 group-hover:text-primary-hover">
          Buka kabar
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export default function KabarWargaPage() {
  return (
    <PageShell>
      <section id="artikel-terbaru" className="scroll-mt-28 bg-primary text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
              Artikel Terbaru
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {featuredArticle.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              {featuredArticle.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CategoryBadge category={featuredArticle.category} />
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/78">
                {featuredArticle.publishedAt} - {featuredArticle.readTime}
              </span>
            </div>
            <Link
              href="#semua-kabar"
              className="mt-8 inline-flex min-h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Lihat semua kabar
              <ArrowIcon />
            </Link>
          </div>

          {featuredArticle.coverImageSrc ? (
            <figure className="mt-9 overflow-hidden rounded-2xl border border-white/14 bg-white/8 shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[16/9] bg-cream sm:aspect-[16/7]">
                <Image
                  src={featuredArticle.coverImageSrc}
                  alt={featuredArticle.coverImageAlt ?? featuredArticle.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 680px, 92vw"
                  className="object-cover"
                />
              </div>
            </figure>
          ) : null}
        </div>
      </section>

      <section className="bg-background">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <ArticleBody />
        </article>
      </section>

      <section id="semua-kabar" className="scroll-mt-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pb-16 xl:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Semua Kabar
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Pengumuman, artikel, dan dokumentasi dalam satu daftar.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted">
                Kategori tetap dipakai sebagai penanda, tetapi warga cukup
                membaca dari satu alur informasi.
              </p>
            </div>
            <span className="w-fit rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted">
              {allNews.length} kabar aktif
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allNews.map((item) => (
              <KabarCard key={`${item.category}-${item.title}`} item={item} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
