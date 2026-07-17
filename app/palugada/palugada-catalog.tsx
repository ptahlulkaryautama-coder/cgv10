"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthAwareAction } from "../components/auth-aware-action";
import { ImagePreview } from "../components/image-preview";
import { Icon } from "../components/portal";
import { marketplaceItems, type MarketplaceItem } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PalugadaFilterDetail = {
  query?: string;
  category?: string;
};

type LivePalugadaRow = {
  id: string;
  name: string;
  category: "barang" | "kuliner" | "jasa" | "properti" | "lainnya";
  cluster: string;
  price_label: string;
  description: string;
  availability_note: string;
  contact_method: string;
  seller_status: "online" | "offline";
  seller_status_note: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  published_at: string | null;
  updated_at: string;
};

type LivePalugadaAttachment = {
  linked_id: string;
  storage_path: string;
  file_name: string;
};

const palugadaCategoryLabel: Record<LivePalugadaRow["category"], string> = {
  barang: "Barang",
  kuliner: "Kuliner",
  jasa: "Jasa",
  properti: "Properti",
  lainnya: "Lainnya",
};

const palugadaCategoryIcon: Record<LivePalugadaRow["category"], MarketplaceItem["icon"]> = {
  barang: "store",
  kuliner: "utensils",
  jasa: "briefcase",
  properti: "building",
  lainnya: "file",
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
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return categoryMatch && (!query || content.includes(query));
}

function sortItems(items: MarketplaceItem[]) {
  const indexedItems = items.map((item, index) => ({ item, index }));

  return indexedItems
    .sort((left, right) => {
      const leftFeatured = left.item.detailSlug === "donat-kentang-warga" ? 1 : 0;
      const rightFeatured = right.item.detailSlug === "donat-kentang-warga" ? 1 : 0;
      return rightFeatured - leftFeatured || left.index - right.index;
    })
    .map(({ item }) => item);
}

function buildWhatsappHref(contactMethod: string) {
  const digits = contactMethod.replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

function mapLiveListing(
  row: LivePalugadaRow,
  cover?: LivePalugadaAttachment & { signedUrl: string },
): MarketplaceItem {
  const category = palugadaCategoryLabel[row.category];
  const whatsappHref = buildWhatsappHref(row.contact_method);

  return {
    name: row.name,
    category,
    cluster: row.cluster,
    price: row.price_label || "Harga sesuai konfirmasi",
    status: "Tayang",
    sellerStatus: row.seller_status,
    sellerStatusLabel: row.seller_status === "online" ? "Online" : "Offline",
    sellerStatusNote: row.seller_status_note || "Status seller dari admin PALUGADA.",
    icon: palugadaCategoryIcon[row.category],
    imageSrc: cover?.signedUrl ?? row.cover_image_url ?? undefined,
    imageAlt: cover
      ? `Foto ${row.name} - ${cover.file_name}`
      : row.cover_image_alt ?? undefined,
    detailSlug: row.id,
    detailHref: `/palugada/detail/?id=${encodeURIComponent(row.id)}`,
    detailDescription:
      row.description ||
      "Lapak warga yang sudah diperiksa pengurus.",
    availabilityNote: row.availability_note,
    contactBadge: whatsappHref ? "WhatsApp" : "Kontak via pengurus",
    whatsappHref,
    whatsappLabel: "Hubungi WhatsApp",
    whatsappDisplayNumber: row.contact_method,
    whatsappStatus: whatsappHref ? "WhatsApp tersedia" : "Via pengurus",
  };
}

function ListingCard({ item }: { item: MarketplaceItem }) {
  const badges = getTrustBadges(item);
  const isOnline = item.sellerStatus === "online";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-colors duration-200 hover:border-primary/35 sm:rounded-2xl">
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
              {item.imageSrc.startsWith("http") ? (
                // Signed Supabase URLs are dynamic and cannot use the static image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt ?? item.name}
                  className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-95"
                />
              ) : (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt ?? item.name}
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 43vw, 92vw"
                  className="object-cover transition-opacity duration-200 group-hover:opacity-95"
                />
              )}
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
        <div className="absolute left-2 top-2 rounded-full bg-accent-soft px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-foreground shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:text-[0.68rem] sm:tracking-[0.14em]">
          {item.category}
        </div>
        <div
          aria-label={`Penjual ${item.sellerStatusLabel}`}
          className={`absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[0.62rem] font-semibold shadow-sm sm:right-3 sm:top-3 sm:gap-2 sm:px-3 sm:text-xs ${
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
          <span className="hidden sm:inline">{item.sellerStatusLabel}</span>
        </div>
        <div className="absolute bottom-3 right-3 hidden rounded-full border border-white/45 bg-primary/86 px-3 py-1 text-xs font-semibold text-white shadow-sm sm:block">
          {item.status}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-primary sm:text-xs sm:tracking-[0.14em]">
          {item.cluster}
        </p>
        <h2 className="mt-1.5 line-clamp-2 text-base font-semibold tracking-tight text-foreground sm:mt-2 sm:text-xl">
          {item.name}
        </h2>
        <p className="mt-3 hidden text-sm leading-6 text-muted sm:block">
          {item.detailDescription ??
            "Informasi lapak warga yang dapat dilihat sebelum menghubungi penjual."}
        </p>

        <div className="mt-3 grid gap-3 text-sm sm:mt-5">
          <div className="border-t border-border pt-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:pt-4">
            <span className="hidden text-muted sm:inline">Harga</span>
            <span className="line-clamp-2 text-sm font-semibold text-foreground sm:text-right">
              {item.price}
            </span>
          </div>
          <div className="hidden items-center justify-between gap-4 border-t border-border pt-4 sm:flex">
            <span className="text-muted">Kontak</span>
            <span className="text-right font-semibold text-foreground">
              {item.whatsappStatus ?? "Via pengurus"}
            </span>
          </div>
          <div className="hidden items-center justify-between gap-4 border-t border-border pt-4 sm:flex">
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

        <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:mt-6 sm:gap-3 sm:pt-0">
          {item.detailHref ? (
            <Link
              href={item.detailHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:rounded-xl sm:px-4 sm:text-sm"
            >
              Detail
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg bg-primary-soft px-2 text-xs font-semibold text-primary/70 sm:rounded-xl sm:px-4 sm:text-sm"
            >
              Detail segera
            </button>
          )}
          {item.whatsappHref ? (
            <Link
              href={item.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:rounded-xl sm:px-4 sm:text-sm"
              aria-label={`${item.whatsappLabel ?? "Hubungi WhatsApp"} untuk ${item.name}`}
            >
              {isOnline ? "Hubungi" : "Cek kontak"}
            </Link>
          ) : (
            <Link
              href="/kontak/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-2 text-xs font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:rounded-xl sm:px-4 sm:text-sm"
            >
              {isOnline ? "Tanya" : "Kontak"}
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
  const [liveItems, setLiveItems] = useState<MarketplaceItem[]>([]);
  const [, setLiveState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const normalizedQuery = normalize(query);
  const catalogItems = useMemo(() => {
    const liveNames = new Set(liveItems.map((item) => normalize(item.name)));

    return [
      ...liveItems,
      ...marketplaceItems.filter((item) => !liveNames.has(normalize(item.name))),
    ];
  }, [liveItems]);
  const filteredItems = useMemo(() => {
    const matchedItems = catalogItems.filter((item) =>
        matchesSearch(item, normalizedQuery, selectedCategory),
      );

    return sortItems(matchedItems);
  }, [catalogItems, normalizedQuery, selectedCategory]);

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

  useEffect(() => {
    let mounted = true;

    async function loadLiveListings() {
      try {
        setLiveState("loading");
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("palugada_listings")
          .select(
            "id, name, category, cluster, price_label, description, availability_note, contact_method, seller_status, seller_status_note, cover_image_url, cover_image_alt, published_at, updated_at",
          )
          .eq("status", "approved")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(24);

        if (!mounted) {
          return;
        }

        if (error) {
          setLiveState("error");
          return;
        }

        const rows = (data ?? []) as LivePalugadaRow[];
        const listingIds = rows.map((row) => row.id);
        const covers = new Map<string, LivePalugadaAttachment & { signedUrl: string }>();

        if (listingIds.length > 0) {
          const { data: attachmentData } = await supabase
            .from("attachments")
            .select("linked_id, storage_path, file_name")
            .eq("linked_type", "palugada_listing")
            .eq("visibility", "public_after_approval")
            .eq("moderation_status", "approved")
            .in("linked_id", listingIds)
            .order("created_at", { ascending: true });

          for (const attachment of (attachmentData ?? []) as LivePalugadaAttachment[]) {
            if (covers.has(attachment.linked_id)) continue;
            const { data: signedData } = await supabase.storage
              .from("palugada-submissions")
              .createSignedUrl(attachment.storage_path, 3600);
            if (signedData?.signedUrl) {
              covers.set(attachment.linked_id, {
                ...attachment,
                signedUrl: signedData.signedUrl,
              });
            }
          }
        }

        setLiveItems(rows.map((row) => mapLiveListing(row, covers.get(row.id))));
        setLiveState("ready");
      } catch {
        if (mounted) {
          setLiveState("error");
        }
      }
    }

    loadLiveListings();

    return () => {
      mounted = false;
    };
  }, []);

  function showAllListings() {
    setQuery("");
    setSelectedCategory("semua");
    window.dispatchEvent(new Event("palugada-reset"));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("hasil-palugada")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  return (
    <section
      id="katalog"
      className="mx-auto max-w-7xl scroll-mt-32 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10"
    >
      <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:text-sm sm:tracking-[0.16em]">
                {normalizedQuery
                  ? `${filteredItems.length} hasil untuk “${query}”`
                  : `${filteredItems.length} lapak tersedia`}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:mt-3 sm:text-4xl">
                Pilihan usaha dan jasa warga.
              </h2>
            </div>
            <AuthAwareAction
              href="/palugada/daftar/"
              guestHref="/masuk/?next=/palugada/daftar/"
              guestLabel="Masuk untuk daftar"
              authenticatedLabel="Daftar lapak"
              className="hidden min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
            />
          </div>

          <div id="hasil-palugada" className="scroll-mt-32">
            {filteredItems.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 items-stretch gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <ListingCard key={item.detailHref ?? item.name} item={item} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="store" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-foreground">
                  Belum ada lapak yang cocok.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
                  Coba kata kunci lain, pilih kategori berbeda, atau kembali ke
                  semua katalog PALUGADA.
                </p>
                <button
                  type="button"
                  onClick={showAllListings}
                  className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Lihat semua katalog
                </button>
              </div>
            )}
          </div>

          <div id="daftar-lapak" className="mt-8 flex flex-col gap-4 rounded-2xl border border-accent/45 bg-accent-soft/65 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Daftar lapak</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Punya usaha atau jasa untuk warga CGV?</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/78">Katalog terbuka untuk umum. Pendaftaran lapak hanya untuk warga yang sudah masuk.</p>
            </div>
            <AuthAwareAction
              href="/palugada/daftar/"
              guestHref="/masuk/?next=/palugada/daftar/"
              guestLabel="Masuk untuk daftar"
              authenticatedLabel="Daftar sekarang"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
            />
          </div>
      </div>
    </section>
  );
}
