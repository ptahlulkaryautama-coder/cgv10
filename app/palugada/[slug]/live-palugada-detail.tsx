"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon, PageShell } from "@/app/components/portal";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { IconName } from "@/lib/portal-data";

type LiveListing = {
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
};

type PublicAttachment = {
  storage_path: string;
  file_name: string;
};

const categoryLabels: Record<LiveListing["category"], string> = {
  barang: "Barang",
  kuliner: "Kuliner",
  jasa: "Jasa",
  properti: "Properti",
  lainnya: "Lainnya",
};

const categoryIcons: Record<LiveListing["category"], IconName> = {
  barang: "store",
  kuliner: "utensils",
  jasa: "briefcase",
  properti: "building",
  lainnya: "file",
};

function buildWhatsappHref(contactMethod: string) {
  const digits = contactMethod.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}`;
}

export function LivePalugadaDetail({ listingId }: { listingId: string }) {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [listing, setListing] = useState<LiveListing | null>(null);
  const [images, setImages] = useState<Array<{ url: string; name: string }>>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      if (!supabase || !/^[0-9a-f-]{36}$/i.test(listingId)) {
        setState("missing");
        return;
      }

      const { data, error } = await supabase
        .from("palugada_listings")
        .select("id, name, category, cluster, price_label, description, availability_note, contact_method, seller_status, seller_status_note, cover_image_url, cover_image_alt, published_at")
        .eq("id", listingId)
        .eq("status", "approved")
        .maybeSingle<LiveListing>();

      if (!mounted) return;
      if (error) {
        setState("error");
        return;
      }
      if (!data) {
        setState("missing");
        return;
      }

      const { data: attachmentData } = await supabase
        .from("attachments")
        .select("storage_path, file_name")
        .eq("linked_type", "palugada_listing")
        .eq("linked_id", data.id)
        .eq("visibility", "public_after_approval")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: true });

      const signedImages = await Promise.all(
        ((attachmentData ?? []) as PublicAttachment[]).map(async (attachment) => {
          const { data: signedData } = await supabase.storage
            .from("palugada-submissions")
            .createSignedUrl(attachment.storage_path, 3600);
          return signedData?.signedUrl
            ? { url: signedData.signedUrl, name: attachment.file_name }
            : null;
        }),
      );

      if (!mounted) return;
      setListing(data);
      setImages(signedImages.filter((image): image is { url: string; name: string } => Boolean(image)));
      setState("ready");
    }

    void loadListing();
    return () => {
      mounted = false;
    };
  }, [listingId, supabase]);

  if (state !== "ready" || !listing) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary"><Icon name="store" /></div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
            {state === "loading" ? "Memuat detail lapak..." : "Lapak tidak tersedia"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {state === "loading" ? "Kami sedang menyiapkan informasinya." : "Lapak mungkin sedang diperiksa atau sudah tidak ditayangkan."}
          </p>
          {state !== "loading" ? <Link href="/palugada/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white">Kembali ke katalog</Link> : null}
        </section>
      </PageShell>
    );
  }

  const category = categoryLabels[listing.category];
  const whatsappHref = buildWhatsappHref(listing.contact_method);
  const isOnline = listing.seller_status === "online";

  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="relative min-h-[330px] overflow-hidden rounded-2xl border border-white/14 bg-white/8 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:min-h-[480px]">
            {images[0] || listing.cover_image_url ? (
              // Signed private Storage URL made public only after moderation approval.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]?.url ?? listing.cover_image_url ?? ""} alt={listing.cover_image_alt || `Foto utama ${listing.name}`} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="grid h-full min-h-[330px] place-items-center text-accent-soft sm:min-h-[480px]"><Icon name={categoryIcons[listing.category]} /></div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">{category}</span>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/18 bg-primary/78 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">{listing.cluster}</p>
              <p className="mt-2 text-sm text-white/86">{listing.price_label || "Harga sesuai konfirmasi"}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <Link href="/palugada/" className="inline-flex w-fit rounded-xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft">Kembali ke PALUGADA</Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">PALUGADA CGV · Lapak warga</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{listing.name}</h1>
            <p className="mt-5 whitespace-pre-line text-base leading-7 text-white/84 sm:text-lg sm:leading-8">{listing.description}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Lapak warga", "Disetujui pengurus", isOnline ? "Seller online" : "Konfirmasi seller"].map((badge) => <span key={badge} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">{badge}</span>)}
            </div>
            {whatsappHref ? <Link href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85">Hubungi WhatsApp</Link> : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.7fr_0.3fr] lg:px-8 lg:py-16 xl:px-10">
        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Detail lapak</p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">Informasi usaha atau layanan</h2>
          <p className="mt-4 whitespace-pre-line text-base leading-7 text-muted">{listing.description}</p>
          {images.length > 1 ? <div className="mt-6 grid gap-4 sm:grid-cols-2">{images.slice(1).map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.url} src={image.url} alt={`Foto ${listing.name} - ${image.name}`} className="aspect-[4/3] w-full rounded-xl border border-border bg-cream object-cover" />
          ))}</div> : null}
        </article>
        <aside className="rounded-2xl border border-accent/40 bg-accent-soft/55 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Ringkasan</p>
          <dl className="mt-4 grid gap-4 text-sm">
            <Info label="Kategori" value={category} />
            <Info label="Cluster" value={listing.cluster} />
            <Info label="Harga/status" value={listing.price_label || "Konfirmasi penyedia"} />
            <Info label="Ketersediaan" value={listing.availability_note || "Konfirmasi penyedia"} />
            <Info label="Status seller" value={listing.seller_status_note || listing.seller_status} />
          </dl>
        </aside>
      </section>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-accent/30 pb-4 last:border-b-0 last:pb-0"><dt className="text-muted">{label}</dt><dd className="mt-1 font-semibold text-foreground">{value}</dd></div>;
}
