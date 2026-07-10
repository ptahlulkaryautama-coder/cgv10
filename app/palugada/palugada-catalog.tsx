"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePreview } from "../components/image-preview";
import { Icon, PlaceholderNotice } from "../components/portal";
import {
  marketplaceItems,
  palugadaCategories,
  type MarketplaceItem,
} from "@/lib/portal-data";

const categories = ["Semua", ...palugadaCategories.map((item) => item.title)];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "contact", label: "Kontak tersedia" },
  { value: "category", label: "Kategori" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

type PalugadaFilterDetail = {
  query?: string;
  category?: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getTrustBadges(item: MarketplaceItem) {
  return [
    "Lapak warga",
    item.whatsappHref ? "Kontak tersedia" : "Kontak via pengurus",
    item.detailHref ? "Detail aktif" : "Detail segera hadir",
    item.sellerStatus === "online" ? "Seller online" : "Seller offline",
  ];
}

function matchesSearch(item: MarketplaceItem, query: string, category: string) {
  const categoryMatch =
    category === "semua" || item.category.toLowerCase() === category;
  const content = [
    item.name,
    item.category,
    item.cluster,
    item.price,
    item.status,
    item.detailDescription,
    item.providerProfile,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return categoryMatch && (!query || content.includes(query));
}

function sortItems(items: MarketplaceItem[], sort: SortValue) {
  const indexedItems = items.map((item, index) => ({ item, index }));

  return indexedItems
    .sort((left, right) => {
      if (sort === "newest") {
        return right.index - left.index;
      }

      if (sort === "contact") {
        return Number(Boolean(right.item.whatsappHref)) - Number(Boolean(left.item.whatsappHref));
      }

      if (sort === "category") {
        return left.item.category.localeCompare(right.item.category, "id");
      }

      const leftFeatured = left.item.detailSlug === "donat-kentang-warga" ? 1 : 0;
      const rightFeatured = right.item.detailSlug === "donat-kentang-warga" ? 1 : 0;
      return rightFeatured - leftFeatured || left.index - right.index;
    })
    .map(({ item }) => item);
}

function ListingCard({ item }: { item: MarketplaceItem }) {
  const badges = getTrustBadges(item);
  const isOnline = item.sellerStatus === "online";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors duration-200 hover:border-primary/35">
      <div className="relative border-b border-border bg-cream">
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
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 43vw, 92vw"
                className="object-cover transition-opacity duration-200 group-hover:opacity-95"
              />
            </ImagePreview>
          ) : (
            <div className="flex h-full flex-col justify-between p-5">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-surface text-primary shadow-sm">
                <Icon name={item.icon} />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-primary/18" />
                <div className="h-3 w-1/2 rounded-full bg-accent/35" />
                <div className="h-12 rounded-xl border border-border bg-surface/80" />
              </div>
            </div>
          )}
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
          {item.category}
        </div>
        <div
          className={`absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
            isOnline
              ? "border-emerald-200 bg-emerald-50 text-primary"
              : "border-white/45 bg-white/90 text-muted"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-emerald-600" : "bg-stone-400"
            }`}
          />
          {item.sellerStatusLabel}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full border border-white/45 bg-primary/86 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {item.status}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {item.cluster}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {item.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {item.detailDescription ??
            "Listing katalog warga dengan informasi dasar yang dapat dilengkapi bertahap."}
        </p>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-muted">Harga/status</span>
            <span className="text-right font-semibold text-foreground">
              {item.price}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-muted">Kontak</span>
            <span className="text-right font-semibold text-foreground">
              {item.whatsappStatus ?? "Via pengurus"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-muted">Status seller</span>
            <span
              className={`inline-flex items-center gap-2 text-right font-semibold ${
                isOnline ? "text-primary" : "text-muted"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isOnline ? "bg-emerald-600" : "bg-stone-400"
                }`}
              />
              {item.sellerStatusLabel}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {item.detailHref ? (
            <Link
              href={item.detailHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Lihat detail
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
            >
              Detail segera
            </button>
          )}
          {item.whatsappHref ? (
            <Link
              href={item.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label={`${item.whatsappLabel ?? "Hubungi WhatsApp"} untuk ${item.name}`}
            >
              {isOnline ? "Hubungi" : "Cek kontak"}
            </Link>
          ) : (
            <Link
              href="/kontak/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {isOnline ? "Tanya kontak" : "Seller offline"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function PalugadaCatalog() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [sort, setSort] = useState<SortValue>("featured");
  const normalizedQuery = normalize(query);
  const selectedCategoryLabel =
    categories.find((category) => normalize(category) === selectedCategory) ??
    "Semua";
  const filteredItems = useMemo(() => {
    const matchedItems = marketplaceItems.filter((item) =>
        matchesSearch(item, normalizedQuery, selectedCategory),
      );

    return sortItems(matchedItems, sort);
  }, [normalizedQuery, selectedCategory, sort]);

  useEffect(() => {
    function handleHeroFilter(event: Event) {
      const { query: nextQuery, category } = (
        event as CustomEvent<PalugadaFilterDetail>
      ).detail;

      setQuery(nextQuery ?? "");
      setSelectedCategory(category ? normalize(category) : "semua");
    }

    window.addEventListener("palugada-filter", handleHeroFilter);

    return () => {
      window.removeEventListener("palugada-filter", handleHeroFilter);
    };
  }, []);

  return (
    <section
      id="katalog"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-32">
          <div className="hidden lg:block">
            <PlaceholderNotice>
            PALUGADA saat ini memakai data katalog terkurasi. Transaksi tetap
            dikonfirmasi langsung melalui penyedia atau kanal pengurus.
            </PlaceholderNotice>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Cari katalog
              </p>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary lg:hidden">
                {filteredItems.length} hasil
              </span>
            </div>
            <label htmlFor="palugada-search" className="sr-only">
              Cari lapak PALUGADA
            </label>
            <input
              id="palugada-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Donat, laundry, catering..."
              className="mt-4 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => {
                const normalizedCategory = normalize(category);
                const isActive = selectedCategory === normalizedCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(normalizedCategory)}
                    className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted hover:border-primary/35 hover:bg-primary-soft"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Urutkan
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {sortOptions.map((option) => {
                const isActive = sort === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSort(option.value)}
                    className={`flex min-h-10 cursor-pointer items-center justify-between rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted hover:border-primary/35 hover:bg-primary-soft"
                    }`}
                  >
                    {option.label}
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-accent" : "bg-border"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden rounded-2xl border border-border bg-surface p-5 shadow-sm lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Filter aktif
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted">Kategori</span>
                <span className="font-semibold text-foreground">
                  {selectedCategoryLabel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted">Pencarian</span>
                <span className="text-right font-semibold text-foreground">
                  {normalizedQuery || "Semua"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Hasil</span>
                <span className="font-semibold text-foreground">
                  {filteredItems.length} listing
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <span className="text-muted">Urutan</span>
                <span className="text-right font-semibold text-foreground">
                  {sortOptions.find((option) => option.value === sort)?.label}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCategory("semua");
                setSort("featured");
              }}
              className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Reset filter
            </button>
          </div>

          <div
            id="daftar-lapak"
            className="rounded-2xl border border-accent/45 bg-accent-soft/65 p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Daftar lapak
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              Warga bisa mulai didata untuk masuk katalog.
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/78">
              Siapkan nama usaha, kategori, cluster, deskripsi singkat, kisaran
              harga, kontak WhatsApp, dan foto produk atau layanan.
            </p>
            <Link
              href="/palugada/daftar/"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
            >
              Buka form daftar
            </Link>
          </div>
        </aside>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Katalog warga
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Listing PALUGADA yang bisa langsung dibuka.
              </h2>
            </div>
            <Link
              href="/palugada/daftar/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Daftar lapak
            </Link>
          </div>

          {filteredItems.length > 0 ? (
            <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <ListingCard key={item.name} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon name="store" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-foreground">
                Belum ada listing yang cocok.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
                Coba kata kunci lain, pilih kategori berbeda, atau kembali ke
                semua katalog PALUGADA.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("semua");
                }}
                className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Lihat semua katalog
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
