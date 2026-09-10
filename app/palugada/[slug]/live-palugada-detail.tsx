"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon, PageShell } from "@/app/components/portal";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SellerStorefront, type StorefrontSeller } from "./seller-storefront";

type LiveListing = {
  id: string;
  seller_user_id?: string | null;
  catalog_key: string | null;
  name: string;
  category: string;
  cluster: string;
  description: string;
  availability_note: string;
  contact_method: string;
  seller_status: "online" | "offline";
  seller_status_note: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
};

type PublicAttachment = { storage_path: string; file_name: string };

function buildWhatsappHref(contactMethod: string) {
  const digits = contactMethod.replace(/\D/g, "");
  if (!digits) return undefined;
  return `https://wa.me/${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}`;
}

export function LivePalugadaDetail({ listingId }: { listingId: string }) {
  const supabase = useMemo(() => {
    try { return getSupabaseBrowserClient(); } catch { return null; }
  }, []);
  const [listing, setListing] = useState<LiveListing | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [images, setImages] = useState<Array<{ url: string; name: string }>>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let mounted = true;
    async function loadListing() {
      if (!supabase || !/^[0-9a-f-]{36}$/i.test(listingId)) { setState("missing"); return; }
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (mounted) {
        setCurrentUserId(sessionData?.session?.user?.id ?? null);
      }

      const { data, error } = await supabase
        .from("palugada_listings")
        .select("id, seller_user_id, catalog_key, name, category, cluster, description, availability_note, contact_method, seller_status, seller_status_note, cover_image_url, cover_image_alt")
        .eq("id", listingId)
        .eq("status", "approved")
        .maybeSingle<LiveListing>();
      if (!mounted) return;
      if (error) { setState("error"); return; }
      if (!data) { setState("missing"); return; }
      const { data: attachmentData } = await supabase
        .from("attachments")
        .select("storage_path, file_name")
        .eq("linked_type", "palugada_listing")
        .eq("linked_id", data.id)
        .eq("visibility", "public_after_approval")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: true });
      const signed = await Promise.all(((attachmentData ?? []) as PublicAttachment[]).map(async (attachment) => {
        if (attachment.storage_path.startsWith("palugada/")) {
          const { data: urlData } = supabase.storage.from("portal-post-media").getPublicUrl(attachment.storage_path);
          if (urlData?.publicUrl) return { url: urlData.publicUrl, name: attachment.file_name };
        }
        const { data: signedData } = await supabase.storage.from("palugada-submissions").createSignedUrl(attachment.storage_path, 3600);
        return signedData?.signedUrl ? { url: signedData.signedUrl, name: attachment.file_name } : null;
      }));
      if (!mounted) return;
      setListing(data);
      setImages(signed.filter((image): image is { url: string; name: string } => Boolean(image)));
      setState("ready");
    }
    void loadListing();
    return () => { mounted = false; };
  }, [listingId, supabase]);

  if (state !== "ready" || !listing) {
    return <PageShell><section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"><div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary"><Icon name="store" /></div><h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{state === "loading" ? "Memuat lapak..." : "Lapak tidak tersedia"}</h1><p className="mt-3 text-sm leading-6 text-muted">{state === "loading" ? "Kami sedang menyiapkan etalase penjual." : "Lapak mungkin sedang diperiksa atau sudah tidak ditayangkan."}</p>{state !== "loading" ? <Link href="/palugada/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white">Kembali ke katalog</Link> : null}</section></PageShell>;
  }

  const isOwner = Boolean(currentUserId && listing.seller_user_id === currentUserId);
  const heroImage = images[0]?.url ?? listing.cover_image_url ?? "/assets/palugada/maniez-donut-main-optimized.jpg";
  const seller: StorefrontSeller = {
    slug: listing.catalog_key ?? listing.id,
    name: listing.name,
    category: listing.category[0].toUpperCase() + listing.category.slice(1),
    cluster: listing.cluster,
    description: listing.description,
    imageSrc: heroImage,
    imageAlt: listing.cover_image_alt ?? `Foto ${listing.name}`,
    galleryImages: images.map((image) => ({ src: image.url, alt: `Foto ${listing.name} - ${image.name}` })),
    whatsappHref: buildWhatsappHref(listing.contact_method),
    whatsappLabel: "Hubungi WhatsApp",
    whatsappDisplayNumber: listing.contact_method || undefined,
    sellerStatus: listing.seller_status,
    sellerStatusLabel: listing.seller_status === "online" ? "Buka untuk pesanan" : "Konfirmasi terlebih dahulu",
    sellerStatusNote: listing.seller_status_note,
    availabilityNote: listing.availability_note,
    isOwner,
    highlights: [],
  };
  return <SellerStorefront seller={seller} />;
}
