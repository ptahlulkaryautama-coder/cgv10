"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthAwareAction } from "../components/auth-aware-action";
import { ImagePreview } from "../components/image-preview";
import { Icon } from "../components/portal";
import { type MarketplaceItem } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PalugadaFilterDetail = {
  query?: string;
  category?: string;
};

type LivePalugadaRow = {
  id: string;
  seller_user_id?: string | null;
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

function matchesSearch(item: MarketplaceItem, query: string, category: string) {
  const categoryMatch =
    category === "semua" || item.category.toLowerCase() === category;
  const content = [
    item.name,
    item.category,
    item.cluster,
    item.price,
    item.detailDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return categoryMatch && (!query || content.includes(query));
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
  currentUserId?: string | null,
): MarketplaceItem {
  const category = palugadaCategoryLabel[row.category] || "Lainnya";
  const whatsappHref = buildWhatsappHref(row.contact_method);
  const isOwner = Boolean(currentUserId && row.seller_user_id === currentUserId);

  return {
    name: row.name,
    category,
    cluster: row.cluster || "Warga CGV10",
    price: row.price_label || "Hubungi penjual",
    status: "Tayang",
    sellerStatus: row.seller_status,
    sellerStatusLabel: row.seller_status === "online" ? "Online" : "Offline",
    sellerStatusNote: row.seller_status_note || "Lapak aktif warga CGV10.",
    sellerUserId: row.seller_user_id,
    isOwner,
    icon: palugadaCategoryIcon[row.category] || "store",
    imageSrc: cover?.signedUrl ?? row.cover_image_url ?? undefined,
    imageAlt: cover
      ? `Foto ${row.name} - ${cover.file_name}`
      : row.cover_image_alt ?? `Foto lapak ${row.name}`,
    detailSlug: row.id,
    detailHref: `/palugada/detail/?id=${encodeURIComponent(row.id)}`,
    detailDescription:
      row.description ||
      "Lapak usaha warga resmi lingkungan Cipta Greenville.",
    availabilityNote: row.availability_note,
    contactBadge: whatsappHref ? "WhatsApp" : "Kontak via pengurus",
    whatsappHref,
    whatsappLabel: "Hubungi WhatsApp",
    whatsappDisplayNumber: row.contact_method,
    whatsappStatus: whatsappHref ? "WhatsApp aktif" : "Via pengurus",
  };
}

function ListingCard({ item }: { item: MarketplaceItem }) {
  const isOnline = item.sellerStatus === "online";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {/* Media Header */}
      <div className="relative border-b border-border/70 bg-stone-100 overflow-hidden">
        <div className="relative aspect-[4/3] w-full">
          {item.imageSrc ? (
            <ImagePreview
              src={item.imageSrc}
              alt={item.imageAlt ?? item.name}
              title={item.name}
              caption={`${item.category} • ${item.cluster}`}
              className="aspect-[4/3] w-full"
            >
              {item.imageSrc.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt ?? item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt ?? item.name}
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 43vw, 92vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              )}
            </ImagePreview>
          ) : (
            /* Premium Branded Placeholder */
            <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#0c2217] via-primary to-[#194b34] p-4 text-white sm:p-5">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 text-accent backdrop-blur-sm shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Icon name={item.icon} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-accent-soft sm:text-[11px]">
                  PALUGADA CGV
                </p>
                <p className="text-xs font-semibold text-white/90 line-clamp-1 sm:text-sm">
                  {item.category} • {item.cluster}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute left-2.5 top-2.5 rounded-lg border border-white/15 bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-accent-soft backdrop-blur-md shadow-sm sm:left-3 sm:top-3">
          {item.category}
        </div>

        {/* Seller Online/Offline Badge */}
        <div
          aria-label={`Penjual ${item.sellerStatusLabel}`}
          className={`absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md shadow-sm sm:right-3 sm:top-3 ${
            isOnline
              ? "border-emerald-400/40 bg-emerald-950/85 text-emerald-200"
              : "border-stone-400/30 bg-stone-900/80 text-stone-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-stone-400"
            }`}
          />
          <span>{isOnline ? "Buka" : "Tutup"}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Cluster / Location */}
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
          {item.cluster}
        </p>

        {/* Title */}
        <h2 className="mt-1 line-clamp-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
          {item.name}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">
          {item.detailDescription ?? "Lapak warga resmi Cipta Greenville."}
        </p>

        {/* Price & Contact Box */}
        <div className="mt-4 rounded-xl border border-border/80 bg-cream/40 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-muted">Harga</span>
            <span className="text-sm font-black text-primary text-right sm:text-base">
              {item.price}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-xs">
            <span className="text-muted">Kontak</span>
            <span className="font-semibold text-foreground text-right">
              {item.whatsappStatus ?? "Via pengurus"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 space-y-2">
          {item.isOwner && (
            <Link
              href="/portal/lapak/"
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-3 text-xs font-black text-[#15140b] shadow-sm transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:text-sm"
            >
              ✏️ Kelola Lapak Saya (Ganti Foto & Status)
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={item.detailHref ?? `/palugada/detail/?id=${encodeURIComponent(item.detailSlug ?? "")}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/25 bg-primary-soft/60 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
            >
              Detail Lapak
            </Link>

            {item.whatsappHref ? (
              <Link
                href={item.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-3 text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-sm"
                aria-label={`${item.whatsappLabel ?? "Hubungi WhatsApp"} untuk ${item.name}`}
              >
                Hubungi WA
              </Link>
            ) : (
              <Link
                href="/kontak/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-muted transition-colors hover:bg-cream hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
              >
                Tanya RT
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PalugadaCatalog() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [liveItems, setLiveItems] = useState<MarketplaceItem[]>([]);
  const [liveState, setLiveState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const normalizedQuery = normalize(query);

  const catalogItems = useMemo(() => {
    return liveItems;
  }, [liveItems]);

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) =>
      matchesSearch(item, normalizedQuery, selectedCategory),
    );
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
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id ?? null;

        const { data, error } = await supabase
          .from("palugada_listings")
          .select(
            "id, seller_user_id, name, category, cluster, price_label, description, availability_note, contact_method, seller_status, seller_status_note, cover_image_url, cover_image_alt, published_at, updated_at",
          )
          .in("status", ["approved", "submitted"])
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(48);

        if (!mounted) {
          return;
        }

        if (error) {
          console.error("Error loading PALUGADA listings:", error);
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
            .in("linked_id", listingIds)
            .order("created_at", { ascending: true });

          for (const attachment of (attachmentData ?? []) as LivePalugadaAttachment[]) {
            if (covers.has(attachment.linked_id)) continue;
            if (attachment.storage_path.startsWith("palugada/")) {
              const { data: urlData } = supabase.storage
                .from("portal-post-media")
                .getPublicUrl(attachment.storage_path);
              if (urlData?.publicUrl) {
                covers.set(attachment.linked_id, {
                  ...attachment,
                  signedUrl: urlData.publicUrl,
                });
                continue;
              }
            }
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

        if (!mounted) {
          return;
        }

        setLiveItems(rows.map((row) => mapLiveListing(row, covers.get(row.id), currentUserId)));
        setLiveState("ready");
      } catch (err) {
        console.error("Failed to fetch live PALUGADA items:", err);
        if (mounted) {
          setLiveState("error");
        }
      }
    }

    void loadLiveListings();

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
      className="mx-auto max-w-7xl scroll-mt-32 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10"
    >
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary sm:text-sm sm:tracking-[0.16em]">
              {liveState === "loading"
                ? "Memuat katalog lapak..."
                : normalizedQuery
                  ? `${filteredItems.length} hasil untuk “${query}”`
                  : `${filteredItems.length} lapak aktif`}
            </p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-foreground sm:mt-2 sm:text-4xl">
              Pilihan usaha dan jasa warga.
            </h2>
          </div>
          <AuthAwareAction
            href="/palugada/daftar/"
            guestHref="/masuk/?next=/palugada/daftar/"
            guestLabel="Masuk untuk daftar"
            authenticatedLabel="Daftar lapak"
            className="hidden min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:inline-flex"
          />
        </div>

        <div id="hasil-palugada" className="scroll-mt-32">
          {liveState === "loading" ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl border border-border/60 bg-surface/50 animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] rounded-xl bg-stone-200/60" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 w-2/3 bg-stone-200/60 rounded" />
                    <div className="h-3 w-1/2 bg-stone-200/40 rounded" />
                  </div>
                  <div className="h-10 bg-stone-200/60 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              {filteredItems.map((item) => (
                <ListingCard key={item.detailSlug ?? item.name} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm max-w-2xl mx-auto">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary shadow-sm">
                <Icon name="store" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                {liveState === "error"
                  ? "Gagal memuat katalog lapak."
                  : query || selectedCategory !== "semua"
                    ? "Tidak ada lapak yang cocok dengan pencarian."
                    : "Belum ada lapak yang terdaftar."}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {liveState === "error"
                  ? "Terjadi kendala koneksi ke server. Coba muat ulang halaman."
                  : query || selectedCategory !== "semua"
                    ? "Coba kata kunci lain atau pilih kategori berbeda."
                    : "Jadilah warga pertama yang mempromosikan usaha atau jasa Anda di PALUGADA CGV!"}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {query || selectedCategory !== "semua" ? (
                  <button
                    type="button"
                    onClick={showAllListings}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Lihat semua katalog
                  </button>
                ) : null}
                <AuthAwareAction
                  href="/palugada/daftar/"
                  guestHref="/masuk/?next=/palugada/daftar/"
                  guestLabel="Masuk untuk daftar"
                  authenticatedLabel="Daftar lapak sekarang"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div id="daftar-lapak" className="mt-10 flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent-soft/40 p-5 sm:p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Daftar Lapak Warga</p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">Punya usaha atau jasa untuk warga CGV?</h2>
            <p className="mt-1 text-sm leading-6 text-foreground/80">Katalog terbuka untuk seluruh warga. Publikasi instan dan kelola lapak Anda secara mandiri.</p>
          </div>
          <AuthAwareAction
            href="/palugada/daftar/"
            guestHref="/masuk/?next=/palugada/daftar/"
            guestLabel="Masuk untuk daftar"
            authenticatedLabel="Daftar sekarang"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>
    </section>
  );
}
