"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  published_at: string | null;
  updated_at: string;
};

const categoryLabel: Record<LivePost["category"], string> = {
  artikel: "Artikel",
  pengumuman: "Pengumuman",
  agenda: "Agenda",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Published";
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
      const mediaSelect = `${baseSelect}, cover_image_url, cover_image_alt, attachment_url, attachment_label`;
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

    loadPublishedPosts();

    return () => {
      mounted = false;
    };
  }, [supabaseState.client]);

  if (state === "error" || state === "empty") {
    return null;
  }

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        {state === "loading" ? (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Kabar Terbaru
              </p>
              <span className="w-fit rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted">
                Memuat...
              </span>
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="min-h-48 rounded-2xl border border-border bg-background p-5"
                >
                  <div className="h-5 w-28 rounded-full bg-primary-soft" />
                  <div className="mt-6 h-6 w-4/5 rounded-full bg-cream" />
                  <div className="mt-4 h-4 w-full rounded-full bg-cream" />
                  <div className="mt-2 h-4 w-3/4 rounded-full bg-cream" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Kabar Terbaru
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Informasi yang baru diterbitkan untuk warga.
                </h2>
              </div>
              <span className="w-fit rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted">
                {posts.length} kabar published
              </span>
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                  <article
                    key={post.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                  >
                    {post.cover_image_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedImage({
                            src: post.cover_image_url ?? "",
                            alt: post.cover_image_alt || post.title,
                          })
                        }
                        className="block aspect-[4/3] w-full cursor-zoom-in bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- Admin-entered external URLs are intentionally not constrained to Next image domains yet. */}
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || post.title}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : null}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                          {categoryLabel[post.category]}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-foreground">
                        {post.title}
                      </h3>
                      <p className="mt-3 max-h-24 overflow-hidden text-sm font-semibold leading-6 text-muted">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                        <span className="font-semibold text-muted">{getReadTime(post.body)}</span>
                        <div className="flex min-w-0 shrink items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-white px-3 text-xs font-semibold text-primary transition-colors duration-200 hover:border-primary/45 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            Baca isi
                          </button>
                          {post.attachment_url ? (
                            <a
                              href={post.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              title={post.attachment_label || "Lampiran"}
                              className="inline-flex min-h-9 max-w-[9rem] cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-primary-soft px-3 text-xs font-semibold text-primary transition-colors duration-200 hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-w-[11rem]"
                            >
                              <span className="truncate">{post.attachment_label || "Lampiran"}</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {expandedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Preview gambar kabar"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">
                {expandedImage.alt}
              </p>
              <button
                type="button"
                onClick={() => setExpandedImage(null)}
                className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(92vh-58px)] overflow-auto bg-cream p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- Admin-entered external URLs are intentionally not constrained to Next image domains yet. */}
              <img
                src={expandedImage.src}
                alt={expandedImage.alt}
                className="mx-auto h-auto max-w-full"
              />
            </div>
          </div>
        </div>
      ) : null}

      {selectedPost ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Baca ${selectedPost.title}`}
          onClick={() => setSelectedPost(null)}
        >
          <article
            className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {categoryLabel[selectedPost.category]}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {formatDate(selectedPost.published_at)}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                  {selectedPost.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(92vh-112px)] overflow-auto px-5 py-5">
              <p className="text-base font-semibold leading-7 text-muted">
                {selectedPost.excerpt}
              </p>
              <div className="mt-5 space-y-5 text-base leading-8 text-foreground/80">
                {getParagraphs(selectedPost.body).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {selectedPost.attachment_url ? (
                <a
                  href={selectedPost.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-primary-soft px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="truncate">{selectedPost.attachment_label || "Buka lampiran"}</span>
                </a>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
