import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/app/components/image-preview";
import { PageShell } from "@/app/components/portal";
import { kabarArticles } from "@/lib/portal-data";

type KabarDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type KabarArticle = (typeof kabarArticles)[number];

export const dynamicParams = false;

export function generateStaticParams() {
  return kabarArticles
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug,
    }));
}

function getArticle(slug: string) {
  return kabarArticles.find((item) => item.slug === slug);
}

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

function CategoryBadge({ category }: { category: KabarArticle["category"] }) {
  const className =
    category === "Pengumuman"
      ? "bg-primary text-white"
      : category === "Artikel"
        ? "bg-primary-soft text-primary"
        : category === "Kabar Lingkungan"
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

function ArticleVideo({ article }: { article: KabarArticle }) {
  if (!article.video) {
    return null;
  }

  return (
    <figure className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <video
        controls
        playsInline
        preload="metadata"
        poster={article.video.posterSrc}
        className="aspect-video w-full bg-foreground object-cover"
      >
        <source src={article.video.src} type="video/mp4" />
        Browser Anda belum mendukung pemutar video.
      </video>
      <figcaption className="border-t border-border px-4 py-3 text-sm leading-6 text-muted sm:px-5">
        <span className="font-semibold text-foreground">{article.video.title}</span>
        {" - "}
        {article.video.durationLabel}
      </figcaption>
    </figure>
  );
}

function ArticleBody({ article }: { article: KabarArticle }) {
  if (!article.bodySections) {
    return (
      <p className="text-base leading-8 text-foreground/78">{article.body}</p>
    );
  }

  return (
    <div className="space-y-6 text-base leading-8 text-foreground/80">
      {article.bodySections.map((section, sectionIndex) => (
        <div key={`${article.title}-${sectionIndex}`} className="space-y-5">
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

      {article.tags ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-5">
          {article.tags.map((tag) => (
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

export async function generateMetadata({
  params,
}: KabarDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: "Kabar Warga | CGV10",
    };
  }

  return {
    title: `${article.seoTitle ?? article.title} | Kabar Warga CGV10`,
    description: article.excerpt,
  };
}

export default async function KabarDetailPage({
  params,
}: KabarDetailPageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Link
            href="/kabar-warga/#semua-kabar"
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          >
            <span className="rotate-180">
              <ArrowIcon />
            </span>
            Semua Kabar
          </Link>
          <div className="mt-8">
            <CategoryBadge category={article.category} />
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              {article.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/78">
                {article.publishedAt} - {article.readTime}
              </span>
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/78">
                {article.author}
              </span>
            </div>
          </div>

          {article.coverImageSrc ? (
            <figure className="mt-9 overflow-hidden rounded-2xl border border-white/14 bg-white/8 shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[16/9] bg-cream sm:aspect-[16/7]">
                <Image
                  src={article.coverImageSrc}
                  alt={article.coverImageAlt ?? article.title}
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
          <ArticleVideo article={article} />
          <ArticleBody article={article} />
        </article>
      </section>
    </PageShell>
  );
}
