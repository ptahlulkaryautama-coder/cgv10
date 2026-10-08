"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildGoogleMapsLink,
  buildWhatsappUrl,
  extractStoreDetails,
  formatDisplayPrice,
  getJakartaOperatingStatus,
} from "@/lib/palugada-storefront-utils";

export type StorefrontSeller = {
  slug: string;
  name: string;
  category: string;
  cluster: string;
  description: string;
  imageSrc: string;
  coverImageSrc?: string;
  imageAlt: string;
  galleryImages: Array<{ src: string; alt: string; isMenu?: boolean }>;
  whatsappHref?: string;
  whatsappLabel?: string;
  whatsappDisplayNumber?: string;
  sellerStatus: "online" | "offline";
  sellerStatusLabel: string;
  sellerStatusNote: string;
  availabilityNote?: string;
  priceNote?: string;
  isOwner?: boolean;
  highlights?: string[];
  structuredProducts?: Array<{
    id: string;
    name: string;
    variant?: string;
    description: string;
    price?: number | string;
    imageSrc?: string;
    imageAlt?: string;
    availability?: string;
  }>;
};

const categoryLabels: Record<string, { title: string; sectionTitle: string; icon: string }> = {
  kuliner: { title: "Kuliner", sectionTitle: "Menu & Sajian Unggulan", icon: "🍽️" },
  jasa: { title: "Jasa & Layanan", sectionTitle: "Layanan Tersedia", icon: "🛠️" },
  barang: { title: "Barang & Toko", sectionTitle: "Produk Pilihan", icon: "📦" },
  properti: { title: "Properti", sectionTitle: "Informasi Unit & Hunian", icon: "🏠" },
  lainnya: { title: "Usaha Warga", sectionTitle: "Katalog Penawaran", icon: "🏪" },
};

/* ── Accessible Lightbox Component ── */
function AccessibleLightbox({
  images,
  initialIndex,
  onClose,
  title,
}: {
  images: Array<{ src: string; alt: string }>;
  initialIndex: number;
  onClose: () => void;
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, onClose]);

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeri foto ${title}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-3 sm:p-6 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="flex w-full max-w-6xl items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            Foto {currentIndex + 1} dari {images.length}
          </span>
          <p className="hidden text-xs font-medium text-white/70 sm:inline">
            Gunakan panah keyboard ◀ ▶ untuk navigasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomed((z) => !z)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            aria-label={isZoomed ? "Kecilkan ukuran gambar" : "Perbesar ukuran gambar"}
          >
            <span>{isZoomed ? "🔍 Normal" : "🔍 Zoom Baca"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center justify-center rounded-xl bg-white/15 px-4 text-xs font-bold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            aria-label="Tutup penampil foto"
            autoFocus
          >
            ✕ Tutup (Esc)
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className={`relative my-auto flex w-full max-w-6xl items-center justify-center overflow-auto py-2 transition-all ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed((z) => !z);
        }}
      >
        <div
          className={`relative transition-transform duration-200 ${
            isZoomed
              ? "min-h-[85vh] min-w-[95vw] sm:min-w-[80vw]"
              : "max-h-[78vh] w-full max-w-4xl"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.src}
            alt={currentImage.alt || `Foto ${title}`}
            className={`mx-auto rounded-xl object-contain shadow-2xl transition-all ${
              isZoomed ? "max-h-none w-full" : "max-h-[76vh] w-auto max-w-full"
            }`}
          />
        </div>
      </div>

      {/* Bottom Navigation Controls & Caption */}
      <div
        className="flex w-full max-w-6xl items-center justify-between gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            setIsZoomed(false);
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label="Foto sebelumnya"
        >
          <span>◀</span>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <p className="line-clamp-1 max-w-md text-center text-xs text-white/80">
          {currentImage.alt || title}
        </p>

        <button
          type="button"
          onClick={() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
            setIsZoomed(false);
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label="Foto berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <span>▶</span>
        </button>
      </div>
    </div>
  );
}

/* ── Share Lapak Button Component ── */
function ShareLapakButton({ sellerName, cluster }: { sellerName: string; cluster: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${sellerName} · PALUGADA CGV`,
      text: `Lihat lapak ${sellerName} (${cluster}) di Portal Warga CGV:`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fallback to copy */
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2600);
      } catch {
        /* no-op */
      }
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 text-xs font-bold text-white/95 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        aria-label={`Bagikan tautan lapak ${sellerName}`}
      >
        <span>📤</span>
        <span>{copied ? "Tautan Disalin!" : "Bagikan Lapak"}</span>
      </button>

      {/* Toast popup */}
      {copied && (
        <div
          role="status"
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#003d34] px-3 py-1.5 text-xs font-bold text-white shadow-lg border border-[#D4AF37]/50 animate-fade-in"
        >
          ✓ Tautan berhasil disalin ke clipboard!
        </div>
      )}
    </div>
  );
}

/* ── Main Seller Storefront Component ── */
export function SellerStorefront({ seller }: { seller: StorefrontSeller }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const rawCat = (seller.category || "lainnya").toLowerCase();
  const catConfig = categoryLabels[rawCat] || categoryLabels.lainnya;

  // Extract cleaned details, highlights, and operating status
  const storeDetails = useMemo(() => {
    return extractStoreDetails(
      seller.description,
      seller.name,
      seller.category,
      seller.cluster,
      seller.availabilityNote
    );
  }, [seller.description, seller.name, seller.category, seller.cluster, seller.availabilityNote]);

  const operatingStatus = useMemo(() => {
    return getJakartaOperatingStatus(
      storeDetails.operatingHours || seller.sellerStatusNote,
      seller.sellerStatus
    );
  }, [storeDetails.operatingHours, seller.sellerStatusNote, seller.sellerStatus]);

  const displayPrice = useMemo(() => {
    return formatDisplayPrice(seller.priceNote, seller.category);
  }, [seller.priceNote, seller.category]);

  const whatsappDisplay =
    seller.whatsappDisplayNumber ||
    (seller.whatsappHref ? seller.whatsappHref.replace(/^https:\/\/wa\.me\//, "+") : undefined);

  // Gallery list construction
  const allImages = useMemo(() => {
    const list: Array<{ src: string; alt: string; isMenu?: boolean }> = [];
    if (seller.coverImageSrc) {
      list.push({
        src: seller.coverImageSrc,
        alt: seller.imageAlt || `Foto usaha ${seller.name}`,
      });
    } else if (seller.imageSrc && !seller.imageSrc.startsWith("/")) {
      list.push({
        src: seller.imageSrc,
        alt: seller.imageAlt || `Foto usaha ${seller.name}`,
      });
    }

    for (const g of seller.galleryImages) {
      if (!list.some((existing) => existing.src === g.src)) {
        const isMenu =
          g.isMenu ||
          g.src.toLowerCase().includes("142") ||
          g.alt.toLowerCase().includes("menu");
        list.push({ ...g, isMenu });
      }
    }
    return list;
  }, [seller.coverImageSrc, seller.imageSrc, seller.imageAlt, seller.galleryImages, seller.name]);

  // Primary showcase hero visual
  const heroImageSrc =
    seller.coverImageSrc ||
    allImages[0]?.src ||
    (seller.imageSrc.startsWith("http") ? seller.imageSrc : null);

  // Menu photo if available in attachments
  const menuImage = allImages.find(
    (img) => img.isMenu || img.alt.toLowerCase().includes("menu") || img.src.includes("142")
  );

  // Primary WhatsApp URL with pre-filled greeting message
  const primaryWhatsappUrl = useMemo(() => {
    const defaultMsg = `Halo ${seller.name}, saya melihat lapak Anda di PALUGADA CGV. Saya ingin bertanya atau memesan.`;
    return buildWhatsappUrl(seller.whatsappDisplayNumber || seller.whatsappHref, defaultMsg);
  }, [seller.name, seller.whatsappDisplayNumber, seller.whatsappHref]);

  // Google Maps link
  const googleMapsUrl = useMemo(() => {
    return buildGoogleMapsLink(seller.name, seller.cluster);
  }, [seller.name, seller.cluster]);

  // Combined genuine highlights (prioritizing explicit seller highlights, falling back to extracted)
  const finalHighlights = useMemo(() => {
    if (seller.highlights && seller.highlights.length > 0) {
      return seller.highlights;
    }
    return storeDetails.highlights;
  }, [seller.highlights, storeDetails.highlights]);

  return (
    <main className="min-h-screen bg-[#FBF9F5] text-[#1A1A1A] pb-28 lg:pb-16 font-sans selection:bg-[#E8C865]/30">
      {/* ── Owner Bar (Only for listing owner) ── */}
      {seller.isOwner && (
        <aside
          aria-label="Akses pemilik lapak"
          className="border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#D4AF37] via-[#F2E5BD] to-[#D4AF37] px-4 py-2 text-[#15140B] shadow-sm"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">👑</span>
              <p className="text-xs font-extrabold sm:text-sm">Anda adalah pemilik lapak ini.</p>
            </div>
            <Link
              href="/portal/lapak/"
              className="inline-flex min-h-7 items-center justify-center rounded-lg bg-[#001D18] px-3 text-xs font-bold text-white shadow hover:bg-black transition-all"
            >
              ✏️ Kelola Lapak
            </Link>
          </div>
        </aside>
      )}

      {/* ── A. Top Compact Navigation ── */}
      <nav
        aria-label="Navigasi PALUGADA"
        className="sticky top-0 z-30 border-b border-[#002D27]/10 bg-[#002D27] text-white backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/palugada/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/90 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Kembali ke PALUGADA</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-xs font-semibold text-white/60 sm:inline">
              Portal Warga CGV
            </span>
            <ShareLapakButton sellerName={seller.name} cluster={seller.cluster} />
          </div>
        </div>
      </nav>

      {/* ── B. Hero Section (Warm Forest Green Editorial Hero) ── */}
      <section className="relative overflow-hidden bg-[#002D27] text-white">
        {/* Soft background ambient depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#003D34] via-[#002D27] to-[#001D18]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Editorial Information & Direct Action (7 Cols on desktop) */}
            <div className="space-y-4 lg:col-span-7">
              {/* Category Pill & Status Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[#15140B] shadow-sm">
                  <span>{catConfig.icon}</span>
                  <span>{catConfig.title}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold backdrop-blur-sm ${
                    operatingStatus.isOpenNow
                      ? "border-emerald-400/40 bg-emerald-950/70 text-emerald-200"
                      : "border-stone-400/30 bg-stone-900/70 text-stone-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      operatingStatus.isOpenNow ? "bg-emerald-400 animate-pulse" : "bg-stone-400"
                    }`}
                  />
                  <span>{operatingStatus.timeBadge || operatingStatus.statusText}</span>
                </span>
              </div>

              {/* Business Name */}
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                {seller.name}
              </h1>

              {/* Tagline / Brief Description */}
              <p className="text-base font-normal leading-relaxed text-white/90 sm:text-lg">
                {storeDetails.tagline}
              </p>

              {/* Location & Pricing Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-medium text-white/95">
                  <span>📍</span>
                  <span>{seller.cluster}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 font-extrabold text-[#E8C865]">
                  <span>🏷️</span>
                  <span>{displayPrice}</span>
                </div>

                {storeDetails.operatingHours && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-medium text-white/90">
                    <span>⏰</span>
                    <span>{storeDetails.operatingHours}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {primaryWhatsappUrl && (
                  <a
                    href={primaryWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] px-6 text-sm font-black text-[#15140B] shadow-[0_8px_20px_rgba(212,175,55,0.35)] transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95"
                  >
                    <span>💬</span>
                    <span>{seller.category?.toLowerCase() === "kuliner" ? "Pesan via WhatsApp" : "Hubungi via WhatsApp"}</span>
                  </a>
                )}

                <a
                  href="#penawaran"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-95"
                >
                  <span>Lihat Menu & Info</span>
                  <span>↓</span>
                </a>
              </div>
            </div>

            {/* Right Column: Main Showcase Visual (5 Cols on desktop) */}
            <div className="lg:col-span-5">
              <div
                className="group relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden rounded-3xl border-2 border-white/15 bg-[#001D18] shadow-2xl transition-all hover:border-[#D4AF37]/50 cursor-pointer"
                onClick={() => {
                  if (allImages.length > 0) setLightboxIndex(0);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (allImages.length > 0) setLightboxIndex(0);
                  }
                }}
                aria-label={`Lihat foto utama ${seller.name}`}
              >
                {heroImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImageSrc}
                    alt={seller.imageAlt || `Foto ${seller.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#003D34] to-[#001D18] p-6 text-center text-white">
                    <span className="text-6xl">{catConfig.icon}</span>
                    <p className="mt-3 font-bold text-white/80">{seller.name}</p>
                    <p className="text-xs text-white/50">{seller.cluster}</p>
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="rounded-xl border border-white/20 bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    🔍 Klik untuk perbesar
                  </span>
                  {allImages.length > 1 && (
                    <span className="rounded-xl border border-white/20 bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                      {allImages.length} Foto
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── C. Keunggulan Usaha (Highlights Strip) ── */}
      {finalHighlights.length > 0 && (
        <section aria-label="Keunggulan Usaha" className="relative z-10 mx-auto -mt-6 max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#DED4C4] bg-white p-3.5 sm:p-4 shadow-sm sm:grid-cols-4">
            {finalHighlights.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-xl bg-[#F8F5F0] p-2.5 sm:p-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#003D34] text-xs font-black text-[#D4AF37]">
                  ✓
                </span>
                <p className="text-xs font-bold text-[#003D34] leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Main Content Body ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 space-y-12">
        {/* ── D. Penawaran Utama / Menu / Layanan ── */}
        <section id="penawaran" className="scroll-mt-20 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#DED4C4] pb-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#003D34]">
                PENAWARAN & KATALOG
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#1A1A1A] sm:text-3xl">
                {catConfig.sectionTitle}
              </h2>
            </div>
            <span className="rounded-full bg-[#E4F0ED] px-3 py-1 text-xs font-extrabold text-[#003D34]">
              {displayPrice}
            </span>
          </div>

          {/* Special Menu Photo Showcase (e.g. for Kafe Kak Ayu) */}
          {menuImage && (
            <div className="overflow-hidden rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <div
                    className="group relative aspect-[3/4] sm:aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 cursor-pointer"
                    onClick={() => {
                      const idx = allImages.findIndex((img) => img.src === menuImage.src);
                      setLightboxIndex(idx >= 0 ? idx : 0);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Perbesar foto daftar menu"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={menuImage.src}
                      alt="Daftar Menu Kafe Kak Ayu"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-xl bg-black/75 px-3.5 py-2 text-xs font-bold text-white shadow">
                        🔍 Klik untuk Baca Menu Lengkap
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-7">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E4F0ED] px-3 py-1 text-xs font-bold text-[#003D34]">
                    <span>📋</span>
                    <span>Daftar Menu & Harga Resmi</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">
                    Pilihan Makanan, Minuman, & Camilan
                  </h3>

                  <p className="text-sm leading-relaxed text-stone-600">
                    Foto menu resmi tersedia langsung dari pengelola. Anda dapat memperbesar gambar untuk melihat rincian minuman segar, kopi, makanan berat, dan aneka camilan dengan kisaran harga <strong>{displayPrice}</strong>.
                  </p>

                  <div className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 text-xs text-stone-600 space-y-1.5">
                    <p className="font-bold text-[#003D34]">💡 Cara Memesan:</p>
                    <p>1. Klik foto menu di samping untuk melihat pilihan menu lengkap.</p>
                    <p>2. Hubungi WhatsApp pengelola untuk memastikan menu yang tersedia hari ini.</p>
                  </div>

                  {primaryWhatsappUrl && (
                    <a
                      href={primaryWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#003D34] px-5 text-xs font-bold text-white hover:bg-[#002D27] transition-all"
                    >
                      <span>💬</span>
                      <span>Tanya Menu Hari Ini via WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Structured Products (If available) */}
          {seller.structuredProducts && seller.structuredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {seller.structuredProducts.map((product) => {
                const itemWaUrl = buildWhatsappUrl(
                  seller.whatsappDisplayNumber || seller.whatsappHref,
                  `Halo ${seller.name}, saya melihat lapak Anda di PALUGADA CGV. Saya ingin bertanya tentang ${product.name}.`
                );

                return (
                  <article
                    key={product.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#DED4C4] bg-white p-4 shadow-sm transition-all hover:border-[#003D34]/40 hover:shadow-md"
                  >
                    {product.imageSrc && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageSrc}
                          alt={product.imageAlt || product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-[#1A1A1A]">{product.name}</h3>
                        {product.price && (
                          <span className="shrink-0 text-sm font-extrabold text-[#003D34]">
                            {typeof product.price === "number"
                              ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)
                              : product.price}
                          </span>
                        )}
                      </div>
                      {product.variant && (
                        <p className="mt-0.5 text-xs text-stone-500">{product.variant}</p>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-stone-600">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-stone-500">
                        {product.availability || "Tersedia"}
                      </span>
                      {itemWaUrl && (
                        <a
                          href={itemWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#003D34] px-3 text-xs font-bold text-white hover:bg-[#002D27] transition-all"
                        >
                          <span>Pesan</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── E. Tentang Usaha ── */}
        <section aria-labelledby="heading-tentang" className="space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#003D34]">
            PROFIL & DESKRIPSI
          </p>
          <div className="rounded-3xl border border-[#DED4C4] bg-white p-6 sm:p-8 shadow-sm">
            <h2 id="heading-tentang" className="text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">
              Tentang {seller.name}
            </h2>
            <div className="mt-4 whitespace-pre-line text-sm sm:text-base leading-relaxed text-stone-700">
              {storeDetails.cleanDescription}
            </div>
          </div>
        </section>

        {/* ── F. Galeri Foto & Lightbox ── */}
        {allImages.length > 0 && (
          <section aria-labelledby="heading-galeri" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#003D34]">
                  DOKUMENTASI FOTO
                </p>
                <h2 id="heading-galeri" className="text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">
                  Galeri Tempat, Suasana, & Produk
                </h2>
              </div>
              <span className="text-xs font-semibold text-stone-500">
                🔍 Klik foto untuk perbesar
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-[#DED4C4] bg-stone-100 shadow-sm transition-all hover:border-[#003D34]/60 hover:shadow-md cursor-pointer"
                  onClick={() => setLightboxIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setLightboxIndex(idx);
                  }}
                  aria-label={`Buka foto ke-${idx + 1} ${seller.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt || `Foto ke-${idx + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                      #{idx + 1} Perbesar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── G. Lokasi dan Jam Layanan ── */}
        <section aria-labelledby="heading-lokasi" className="space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#003D34]">
            INFORMASI LOKASI & WAKTU
          </p>
          <div className="rounded-3xl border border-[#DED4C4] bg-white p-6 sm:p-8 shadow-sm">
            <h2 id="heading-lokasi" className="text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">
              Lokasi & Jam Layanan
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  📍 Alamat / Lokasi
                </p>
                <p className="text-sm font-bold text-[#003D34]">{seller.cluster}</p>
                <p className="text-xs text-stone-500">Perumahan Cipta Green Ville, Batam</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  ⏰ Jam Operasional
                </p>
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {storeDetails.operatingHours || seller.sellerStatusNote || "Sesuai konfirmasi via WA"}
                </p>
                <p className="text-xs text-emerald-700 font-semibold">{operatingStatus.statusText}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  🛵 Pengantaran & Layanan
                </p>
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {seller.availabilityNote || "Konfirmasi pengantaran via WhatsApp"}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                Lapak usaha warga resmi di lingkungan Cipta Green Ville.
              </span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 bg-[#FBF9F5] px-4 text-xs font-bold text-[#003D34] hover:bg-[#E4F0ED] transition-colors"
              >
                <span>🗺️</span>
                <span>Buka di Google Maps ↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── H. Kontak Akhir & Call to Action ── */}
        <section aria-label="Kontak Penjual" className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#003D34] to-[#001D18] p-6 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl space-y-2">
              <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#15140B]">
                Hubungi Langsung
              </span>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Ingin bertanya atau memesan dari {seller.name}?
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Hubungi pengelola langsung melalui WhatsApp. Transaksi dilakukan langsung antarwarga dengan cepat dan praktis.
              </p>
              {whatsappDisplay && (
                <p className="text-xs font-mono font-semibold text-[#E8C865]">
                  Nomor WhatsApp: {whatsappDisplay}
                </p>
              )}
            </div>

            {primaryWhatsappUrl && (
              <a
                href={primaryWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 shrink-0 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] px-8 text-sm font-black text-[#15140B] shadow-[0_8px_24px_rgba(212,175,55,0.4)] transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              >
                <span className="text-lg">💬</span>
                <span>Hubungi Penjual via WA</span>
              </a>
            )}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/50 flex flex-wrap items-center justify-between gap-2">
            <span>✓ Transaksi langsung dengan penjual</span>
            <span>✓ Tanpa potongan atau biaya perantara</span>
          </div>
        </section>
      </div>

      {/* ── Sticky Mobile WhatsApp Bottom Bar ── */}
      {primaryWhatsappUrl && (
        <aside
          aria-label="Aksi Cepat WhatsApp"
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#003D34]/20 bg-[#001D18]/95 p-3 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{seller.name}</p>
              <p className="text-[11px] font-semibold text-[#E8C865]">{displayPrice}</p>
            </div>

            <a
              href={primaryWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-5 text-xs font-black text-[#15140B] shadow-md active:scale-95"
            >
              <span>💬</span>
              <span>Hubungi WA</span>
            </a>
          </div>
        </aside>
      )}

      {/* ── Fullscreen Accessible Lightbox ── */}
      {lightboxIndex !== null && (
        <AccessibleLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          title={seller.name}
        />
      )}
    </main>
  );
}
