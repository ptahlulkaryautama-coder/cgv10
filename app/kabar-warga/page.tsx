import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, PageShell } from "../components/portal";
import { announcements, kegiatanItems } from "@/lib/portal-data";

type NewsItem = {
  category: "Agenda" | "Pengumuman" | "Dokumentasi";
  title: string;
  text: string;
  href: string;
};

const mainNews: NewsItem = {
  category: "Agenda",
  title: announcements[0].title,
  text: announcements[0].text,
  href: "/kegiatan/kerja-bakti-lingkungan/",
};

const allNews: NewsItem[] = [
  ...announcements.slice(1).map((item) => ({
    category: "Pengumuman" as const,
    title: item.title,
    text: item.text,
    href: "#pengumuman",
  })),
  {
    category: "Dokumentasi",
    title: "Dokumentasi kerja bakti",
    text: kegiatanItems[0].text,
    href: kegiatanItems[0].href,
  },
];

const documentationItems = kegiatanItems.slice(0, 4);

export const metadata: Metadata = {
  title: "Kabar Warga | CGV10",
  description:
    "Kabar Warga CGV10 berisi informasi resmi, agenda, dan dokumentasi warga dalam satu halaman ringkas.",
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

function CategoryBadge({ category }: { category: NewsItem["category"] }) {
  const className =
    category === "Agenda"
      ? "bg-primary text-white"
      : category === "Dokumentasi"
        ? "bg-accent-soft text-foreground"
        : "bg-primary-soft text-primary";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {category}
    </span>
  );
}

function NewsListCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CategoryBadge category={item.category} />
        <Link
          href={item.href}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Lihat informasi
          <ArrowIcon />
        </Link>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
    </article>
  );
}

export default function KabarWargaPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 xl:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Papan Informasi Warga
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Kabar Warga CGV10
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/78">
                Informasi resmi, agenda, dan dokumentasi warga dalam satu
                halaman yang ringkas.
              </p>
            </div>
            <div className="lg:text-right">
              <Link
                href="#kabar-utama"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Lihat kabar terbaru
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="kabar-utama" className="scroll-mt-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="grid gap-5 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Kabar Utama
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Prioritas informasi minggu ini.
              </h2>
            </div>

            <article className="rounded-2xl border border-accent/45 bg-accent-soft/55 p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <CategoryBadge category={mainNews.category} />
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface text-primary shadow-sm">
                  <Icon name="calendar" />
                </div>
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                {mainNews.title}
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/78">
                {mainNews.text}
              </p>
              <Link
                href={mainNews.href}
                className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
              >
                Buka detail
                <ArrowIcon />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section id="pengumuman" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Semua Kabar
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Informasi terbaru dalam format ringkas.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {allNews.slice(0, 4).map((item) => (
              <NewsListCard key={`${item.category}-${item.title}`} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section id="dokumentasi" className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Dokumentasi Terbaru
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Arsip kegiatan warga.
              </h2>
            </div>
            <Link
              href="/kegiatan/"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Lihat semua
              <ArrowIcon />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {documentationItems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors duration-200 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-[4/3] bg-cream">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-95"
                  />
                  <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-primary shadow-sm">
                    <Icon name={item.icon} />
                  </div>
                </div>
                <div className="p-4">
                  <CategoryBadge category="Dokumentasi" />
                  <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
