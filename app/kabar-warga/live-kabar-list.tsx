"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type GalleryImageItem = {
  id: string;
  url: string;
  alt?: string | null;
  caption?: string | null;
};

type LivePost = {
  id: string;
  title: string;
  slug: string;
  category: "artikel" | "pengumuman" | "agenda";
  excerpt: string;
  body: string;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  attachment_url?: string | null;
  attachment_label?: string | null;
  gallery_images?: GalleryImageItem[] | null;
  published_at: string | null;
  updated_at: string;
};

const categoryLabel: Record<LivePost["category"], string> = {
  artikel: "Artikel",
  pengumuman: "Pengumuman",
  agenda: "Agenda",
};

const categoryTone: Record<LivePost["category"], string> = {
  pengumuman: "bg-amber-100 text-amber-900 border-amber-300",
  artikel: "bg-emerald-100 text-emerald-900 border-emerald-300",
  agenda: "bg-blue-100 text-blue-900 border-blue-300",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sudah terbit";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getReadTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} menit baca`;
}

function getParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isVideoUrl(url: string | null | undefined) {
  if (!url) return false;
  const clean = url.toLowerCase();
  return (
    clean.includes("youtube.com") ||
    clean.includes("youtu.be") ||
    clean.includes("vimeo.com") ||
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov")
  );
}

function getYouTubeEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/shorts/")) {
    const id = url.split("youtube.com/shorts/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return null;
}

export function LiveKabarList() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Supabase belum tersedia." };
    }
  }, []);
  const [posts, setPosts] = useState<LivePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<LivePost | null>(null);
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty" | "error">(
    supabaseState.error ? "error" : "idle",
  );

  useEffect(() => {
    if (!supabaseState.client) {
      return;
    }

    const supabase = supabaseState.client;
    let mounted = true;

    async function loadPublishedPosts() {
      setState("loading");
      const baseSelect = "id, title, slug, category, excerpt, body, published_at, updated_at";
      const mediaSelect = `${baseSelect}, cover_image_url, cover_image_alt, attachment_url, attachment_label, gallery_images`;
      const initialResult = await supabase
        .from("portal_posts")
        .select(mediaSelect)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false });
      let data: unknown = initialResult.data;
      let error = initialResult.error;

      if (error?.code === "42703") {
        const fallbackResult = await supabase
          .from("portal_posts")
          .select(baseSelect)
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false });

        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (!mounted) {
        return;
      }

      if (error) {
        setState("error");
        return;
      }

      const livePosts = (data ?? []) as LivePost[];
      setPosts(livePosts);
      setState(livePosts.length > 0 ? "ready" : "empty");
    }

    void loadPublishedPosts();

    return () => {
      mounted = false;
    };
  }, [supabaseState.client]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "all" || post.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  if (state === "error" || state === "empty") {
    return null;
  }

  return (
    <section className="border-b border-border bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        {state === "loading" ? (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                Kabar Warga
              </p>
              <span className="w-fit rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted">
                Memuat...
              </span>
            </div>
            <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="min-h-64 rounded-2xl border border-border bg-background p-5"
                >
                  <div className="h-44 w-full rounded-xl bg-cream" />
                  <div className="mt-4 h-5 w-28 rounded-full bg-primary-soft" />
                  <div className="mt-3 h-6 w-4/5 rounded-full bg-cream" />
                  <div className="mt-2 h-4 w-full rounded-full bg-cream" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Header Bar with Search & Category Filter Pills */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Kabar Terbaru Lingkungan
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Informasi RT 010 / RW 021
                </h2>
              </div>

              {/* Filter Pills & Search Input */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[180px] sm:w-56">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Cari kabar..."
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-xs font-bold text-muted hover:text-foreground"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 text-xs font-semibold text-muted">
                  {[
                    ["all", "Semua"],
                    ["pengumuman", "📢 Pengumuman"],
                    ["artikel", "📰 Artikel"],
                    ["agenda", "🏆 Agenda"],
                  ].map(([catKey, label]) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setActiveCategory(catKey)}
                      className={`rounded-lg px-2.5 py-1.5 transition-all ${
                        activeCategory === catKey
                          ? "bg-primary font-bold text-white shadow-sm"
                          : "hover:bg-cream hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Standardized Equal 3-Column Card Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => {
                const hasGallery = post.gallery_images && post.gallery_images.length > 0;
                const galleryCount = post.gallery_images?.length ?? 0;
                const isVid = isVideoUrl(post.cover_image_url);

                return (
                  <article
                    key={post.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_15px_35px_rgba(0,61,52,0.1)]"
                  >
                    {/* Standard Fixed-Height 16:9 Image Preview (Max Height ~200px) */}
                    {post.cover_image_url ? (
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-cream shrink-0">
                        {isVid ? (
                          <video
                            src={post.cover_image_url}
                            controls
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="block h-full w-full cursor-pointer focus-visible:outline-none"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.cover_image_url}
                              alt={post.cover_image_alt || post.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </button>
                        )}

                        {/* Floating Badges */}
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] shadow-sm ${
                              categoryTone[post.category]
                            }`}
                          >
                            {categoryLabel[post.category]}
                          </span>
                        </div>

                        {/* Gallery / Attachment Count Badges */}
                        {hasGallery ? (
                          <span className="absolute right-3 bottom-3 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                            📸 {galleryCount} Foto
                          </span>
                        ) : post.attachment_url ? (
                          <span className="absolute right-3 bottom-3 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                            📎 Dokumen PDF
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Content Section (Always Visible: Category + Title + Excerpt + CTA) */}
                    <div className="flex flex-1 flex-col p-5">
                      {!post.cover_image_url ? (
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${
                              categoryTone[post.category]
                            }`}
                          >
                            {categoryLabel[post.category]}
                          </span>
                          <span className="text-[11px] font-semibold text-muted">
                            {formatDate(post.published_at)}
                          </span>
                        </div>
                      ) : (
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                          {formatDate(post.published_at)}
                        </div>
                      )}

                      <h3 className="text-base font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt Summary (Always Displayed) */}
                      <p className="mt-2 text-xs font-normal leading-6 text-muted line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-5 border-t border-border/50 text-xs font-semibold">
                        <span className="text-muted">{getReadTime(post.body)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-xl bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <span>Baca Selengkapnya</span>
                            <span>→</span>
                          </button>
                          {post.attachment_url ? (
                            <a
                              href={post.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              title={post.attachment_label || "Lampiran"}
                              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-primary/30 bg-primary-soft px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                            >
                              📎
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Full Image Modal */}
      {expandedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Preview foto full"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
              <p className="line-clamp-1 text-sm font-bold text-foreground">
                {expandedImage.alt}
              </p>
              <button
                type="button"
                onClick={() => setExpandedImage(null)}
                className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-4 text-xs font-bold text-primary hover:bg-cream"
              >
                Tutup
              </button>
            </div>
            <div className="max-h-[calc(92vh-58px)] overflow-auto bg-cream p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expandedImage.src}
                alt={expandedImage.alt}
                className="mx-auto h-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Full Article Reader Modal Drawer */}
      {selectedPost ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Baca ${selectedPost.title}`}
          onClick={() => setSelectedPost(null)}
        >
          <article
            className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                      categoryTone[selectedPost.category]
                    }`}
                  >
                    {categoryLabel[selectedPost.category]}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {formatDate(selectedPost.published_at)}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  {selectedPost.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-4 text-xs font-bold text-primary hover:bg-cream"
              >
                Tutup
              </button>
            </div>

            <div className="max-h-[calc(92vh-112px)] overflow-auto px-6 py-6">
              {/* Media Player or Full Uncropped Image / Document View */}
              {selectedPost.cover_image_url ? (
                <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-cream">
                  {isVideoUrl(selectedPost.cover_image_url) ? (
                    getYouTubeEmbedUrl(selectedPost.cover_image_url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(selectedPost.cover_image_url) ?? ""}
                        title={selectedPost.title}
                        className="aspect-[16/9] w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={selectedPost.cover_image_url}
                        controls
                        preload="metadata"
                        className="aspect-[16/9] w-full object-cover"
                      />
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedImage({
                          src: selectedPost.cover_image_url ?? "",
                          alt: selectedPost.cover_image_alt || selectedPost.title,
                        })
                      }
                      className="block w-full cursor-zoom-in"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPost.cover_image_url}
                        alt={selectedPost.cover_image_alt || selectedPost.title}
                        className="mx-auto h-auto max-h-[500px] w-full object-contain"
                      />
                    </button>
                  )}
                </div>
              ) : null}

              <p className="text-base font-semibold leading-7 text-foreground/90">
                {selectedPost.excerpt}
              </p>

              <div className="mt-5 space-y-4 text-sm font-normal leading-8 text-foreground/80">
                {getParagraphs(selectedPost.body).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {/* Photo & Video Gallery Section */}
              {selectedPost.gallery_images && selectedPost.gallery_images.length > 0 ? (
                <div className="mt-8 border-t border-border/80 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    Dokumentasi Galeri Media ({selectedPost.gallery_images.length})
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    Klik foto/video untuk melihat tampilan penuh.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedPost.gallery_images.map((mediaItem, idx) => {
                      const isVid = isVideoUrl(mediaItem.url);

                      return (
                        <div
                          key={mediaItem.id || idx}
                          className="group relative overflow-hidden rounded-xl border border-border bg-cream shadow-sm"
                        >
                          {isVid ? (
                            <video
                              src={mediaItem.url}
                              controls
                              preload="metadata"
                              className="aspect-[4/3] w-full object-cover"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedImage({
                                  src: mediaItem.url,
                                  alt: mediaItem.alt || selectedPost.title,
                                })
                              }
                              className="block h-full w-full cursor-zoom-in"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={mediaItem.url}
                                alt={mediaItem.alt || selectedPost.title}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {selectedPost.attachment_url ? (
                <div className="mt-8 border-t border-border/80 pt-6">
                  <a
                    href={selectedPost.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/30 bg-primary-soft px-5 text-sm font-bold text-primary shadow-sm hover:bg-primary/10"
                  >
                    📎 Download Lampiran: {selectedPost.attachment_label || "Dokumen PDF"}
                  </a>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
