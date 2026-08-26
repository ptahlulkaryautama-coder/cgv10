"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { kabarArticles, kegiatanItems } from "@/lib/portal-data";
import { HeroImageRotator } from "./hero-image-rotator";

type LivePost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  published_at: string | null;
};

type CardItem = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  category: string;
  dateStr?: string;
};

// Dedicated environment photo slides for the Top Right Hero Rotator
const environmentPhotoSlides = [
  {
    src: "/references/cgv10-public-hybrid-reference.png",
    alt: "Kawasan Cipta Green VII RT 010 / RW 021 Cipta Greenville",
  },
  {
    src: "/assets/kegiatan/keamanan-kebersihan-optimized.jpg",
    alt: "Keamanan dan Kebersihan Lingkungan Cipta Greenville",
  },
  {
    src: "/assets/decb3499-157d-4c87-bdde-f72bae03a537.png",
    alt: "Kebersamaan Warga CGV10",
  },
];

// Fallback items if database has fewer than 3 published articles
const fallbackCards: CardItem[] = [
  {
    id: "fb-1",
    title: "Semarak Kemerdekaan RI ke-81 di Cipta Greenville RT 10 / RW 21",
    excerpt: "Semarak Kemerdekaan RI ke-81 di Cipta Greenville RT 10 / RW 21.",
    href: "/kabar-warga/",
    imageSrc: "/assets/decb3499-157d-4c87-bdde-f72bae03a537.png",
    imageAlt: "Semarak Kemerdekaan RI",
    category: "ARTIKEL",
    dateStr: "26 Agu 2026",
  },
  {
    id: "fb-2",
    title: kabarArticles[0].title,
    excerpt: kabarArticles[0].excerpt,
    href: "/kabar-warga/",
    imageSrc: kabarArticles[0].coverImageSrc ?? "/assets/kegiatan/keamanan-kebersihan-optimized.jpg",
    imageAlt: kabarArticles[0].coverImageAlt ?? kabarArticles[0].title,
    category: kabarArticles[0].category.toUpperCase(),
    dateStr: "14 Jul 2026",
  },
  {
    id: "fb-3",
    title: kegiatanItems[0].title,
    excerpt: kegiatanItems[0].text,
    href: kegiatanItems[0].href,
    imageSrc: kegiatanItems[0].imageSrc,
    imageAlt: kegiatanItems[0].imageAlt,
    category: "DOKUMENTASI",
    dateStr: "Dokumentasi",
  },
];

function formatDate(value: string | null) {
  if (!value) return "Terbaru";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

const liveSignals = ["Kabar Warga", "Agenda", "PALUGADA", "Layanan"];

export function LiveHomeHero() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Supabase belum tersedia." };
    }
  }, []);

  const [posts, setPosts] = useState<LivePost[]>([]);

  useEffect(() => {
    if (!supabaseState.client) return;
    const supabase = supabaseState.client;
    let mounted = true;

    async function loadHeroPosts() {
      const { data, error } = await supabase
        .from("portal_posts")
        .select("id, title, slug, category, excerpt, body, cover_image_url, cover_image_alt, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(5);

      if (!mounted || error || !data || data.length === 0) return;
      setPosts(data as LivePost[]);
    }

    void loadHeroPosts();
    return () => {
      mounted = false;
    };
  }, [supabaseState.client]);

  // Dynamic published article cards below the rotator (Sequence: Post #1, Post #2, Post #3)
  const dynamicCards: CardItem[] = useMemo(() => {
    const liveMapped: CardItem[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      href: "/kabar-warga/",
      imageSrc: post.cover_image_url || "/assets/brand/official-cgv-logo-trimmed.png",
      imageAlt: post.cover_image_alt || post.title,
      category: post.category.toUpperCase(),
      dateStr: formatDate(post.published_at),
    }));

    if (liveMapped.length >= 3) {
      return liveMapped.slice(0, 3);
    }

    // Merge fallback items if DB has < 3 posts
    const result = [...liveMapped];
    for (const fb of fallbackCards) {
      if (result.length >= 3) break;
      if (!result.some((item) => item.title === fb.title)) {
        result.push(fb);
      }
    }
    return result;
  }, [posts]);

  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_46%,#006d5b_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/18" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:min-h-[calc(100vh-92px)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-14 xl:px-10">
        {/* Left Side: Brand Intro & Action Buttons */}
        <div className="min-w-0 max-w-3xl">
          <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft shadow-sm backdrop-blur">
            Cipta Greenville - RT 010 / RW 021
          </p>
          <h1 className="mt-6 max-w-full text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Portal Warga CGV10
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
            Lebih dekat, lebih peduli. Tempat kita berbagi kabar lingkungan
            terbaru, menjaga transparansi RT, serta bersama-sama memajukan
            lapak tetangga.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/layanan/"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.28)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-6"
            >
              Ajukan Layanan
            </Link>
            <Link
              href="/kabar-warga/"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-6"
            >
              Cek Kabar Terbaru
            </Link>
          </div>
          <div className="mt-9 max-w-xl border-y border-white/12 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
              Jalur cepat warga
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/82">
              {liveSignals.map((signal, index) => (
                <span key={signal} className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-soft community-pulse" />
                  <span className="text-white/44">0{index + 1}</span>
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Dedicated Neighborhood Rotator (Top) + 3 Dynamic Latest Article Cards (Bottom) */}
        <div className="relative">
          {/* Top Main Hero Card: Dedicated Neighborhood Environment Rotator */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/16 bg-primary shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
            <div className="relative min-h-[340px] sm:min-h-[400px]">
              <HeroImageRotator
                slides={environmentPhotoSlides}
                sizes="(min-width: 1024px) 620px, 92vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/88 via-primary/30 to-primary/10" />
              
              {/* Badges */}
              <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/22 bg-white/14 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur shadow-sm">
                  🏡 CIPTA GREENVILLE RT 010 / RW 021
                </span>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                  CGV10
                </span>
              </div>

              {/* Banner Text Overlay */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-col justify-end gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Lingkungan Asri, Aman & Harmonis
                </h2>
                <p className="max-w-md text-xs font-normal leading-5 text-white/88 sm:text-sm">
                  Kabar pengumuman, agenda kegiatan, serta dokumentasi warga yang paling baru.
                </p>
                <div className="mt-2">
                  <Link
                    href="/kabar-warga/"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/16 border border-white/25 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/25"
                  >
                    <span>Lihat Semua Kabar Warga</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Dynamic Cards: Latest Published Articles from Database (Left to Right Sequence) */}
          <div className="relative mt-3 grid gap-3 sm:grid-cols-3">
            {dynamicCards.map((card, idx) => (
              <Link
                key={card.id || idx}
                href={card.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/14 bg-white/10 text-white shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:bg-white/18 hover:border-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
              >
                {/* Standardized 16:9 Image Preview Banner */}
                <div className="relative aspect-[16/9] w-full bg-primary shrink-0">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 92vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <span className="absolute left-2.5 top-2.5 rounded-full border border-white/14 bg-black/60 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white backdrop-blur">
                    {card.category}
                  </span>
                </div>
                
                {/* Card Content Section */}
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-soft">
                    {card.dateStr || `Kabar ${idx + 1}`}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-white group-hover:text-accent-soft">
                    {card.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[11px] font-normal leading-4 text-white/75">
                    {card.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
