import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../components/portal";
import { kabarArticles, kegiatanItems } from "@/lib/portal-data";
import { LiveKabarList } from "./live-kabar-list";

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

const allNews: KabarItem[] = [
  ...kabarArticles.map((item) => ({
    category: item.category,
    title: item.title,
    text: item.excerpt,
    href: item.slug ? `/kabar-warga/${item.slug}/` : "#semua-kabar",
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
    "Kabar Warga CGV10 berisi pengumuman, agenda, dokumentasi, dan cerita lingkungan yang mudah dibaca warga.",
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
          Baca selengkapnya
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export default function KabarWargaPage() {
  return (
    <PageShell>
      <section id="semua-kabar" className="scroll-mt-28 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 xl:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Kabar Warga
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Kabar yang dekat dengan kita.
              </h1>
              <p className="mt-3 text-base leading-7 text-muted">
                Pengumuman, cerita kegiatan, foto lingkungan, dan kabar kecil
                yang sayang kalau hilang begitu saja.
              </p>
            </div>
            <span className="w-fit rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted">
              Kabar terbaru
            </span>
          </div>
        </div>
      </section>

      <LiveKabarList />

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 xl:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Arsip Kabar
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Arsip kabar dan dokumentasi lingkungan.
              </h2>
            </div>
            <span className="w-fit rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted">
              {allNews.length} kabar arsip
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
