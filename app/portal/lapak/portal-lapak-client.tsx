"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

// ─── Types ───────────────────────────────────────────────────────────────────

type SellerStatus = "online" | "offline";
type ListingStatus = "approved" | "hidden" | "draft" | "submitted" | "review" | "rejected";

type MyListing = {
  id: string;
  name: string;
  category: string;
  cluster: string;
  price_label: string;
  description: string;
  availability_note: string;
  contact_method: string;
  seller_status: SellerStatus;
  seller_status_note: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  status: ListingStatus;
  published_at: string | null;
  created_at: string;
};

type ProductPhoto = {
  id: string;
  file_name: string;
  storage_path: string;
  publicUrl: string;
};

type LoadState = "idle" | "loading" | "loaded" | "empty" | "saving" | "error" | "guest";

const palugadaPublicMediaBucket = "portal-post-media";

const categoryLabels: Record<string, string> = {
  barang: "Barang",
  kuliner: "Kuliner",
  jasa: "Jasa",
  properti: "Properti",
  lainnya: "Lainnya",
};

const statusLabels: Record<ListingStatus, string> = {
  approved: "Aktif di Katalog",
  hidden: "Disembunyikan",
  draft: "Draft",
  submitted: "Diproses",
  review: "Ditinjau",
  rejected: "Ditolak",
};

const statusColors: Record<ListingStatus, string> = {
  approved: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  hidden: "border-zinc-400/40 bg-zinc-500/10 text-zinc-300",
  draft: "border-slate-400/40 bg-slate-500/10 text-slate-300",
  submitted: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  review: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  rejected: "border-red-400/40 bg-red-500/10 text-red-300",
};

function getSafeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(isoString: string | null) {
  if (!isoString) return "–";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(isoString),
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PortalLapakClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient() };
    } catch {
      return { client: null };
    }
  }, []);

  const [state, setState] = useState<LoadState>(supabaseState.client ? "loading" : "error");
  const [listings, setListings] = useState<MyListing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "ok" | "err" } | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MyListing>>({});

  // Cover upload
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Product photos (attachments)
  const [productPhotos, setProductPhotos] = useState<Record<string, ProductPhoto[]>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selected = listings.find((l) => l.id === selectedId) ?? listings[0] ?? null;

  // ─── Load Listings ────────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) return;

    let mounted = true;

    async function loadMyListings() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;

      if (!uid) {
        if (mounted) setState("guest");
        return;
      }

      const { data, error } = await supabase
        .from("palugada_listings")
        .select(
          "id, name, category, cluster, price_label, description, availability_note, contact_method, seller_status, seller_status_note, cover_image_url, cover_image_alt, status, published_at, created_at",
        )
        .eq("seller_user_id", uid)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setState("error");
        return;
      }

      const loaded = (data ?? []) as MyListing[];
      setListings(loaded);
      if (loaded.length > 0) {
        setSelectedId((curr) =>
          loaded.some((l) => l.id === curr) ? curr : loaded[0].id,
        );
        setState("loaded");
      } else {
        setState("empty");
      }
    }

    void loadMyListings();
    return () => {
      mounted = false;
    };
  }, [supabaseState.client]);

  // ─── Load Product Photos ──────────────────────────────────────────────────

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase || !selected) return;

    let mounted = true;

    async function loadPhotos() {
      if (!supabase || !selected) return;
      const { data } = await supabase
        .from("attachments")
        .select("id, file_name, storage_path")
        .eq("linked_type", "palugada_listing")
        .eq("linked_id", selected.id)
        .order("created_at", { ascending: true });

      if (!mounted || !data) return;

      const photos: ProductPhoto[] = data.map((row) => {
        const { data: urlData } = supabase!.storage
          .from(palugadaPublicMediaBucket)
          .getPublicUrl(row.storage_path);
        return {
          id: row.id as string,
          file_name: row.file_name as string,
          storage_path: row.storage_path as string,
          publicUrl: urlData.publicUrl,
        };
      });

      setProductPhotos((prev) => ({ ...prev, [selected.id]: photos }));
    }

    void loadPhotos();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseState.client, selected?.id]);

  // ─── Toggle Online/Offline ────────────────────────────────────────────────

  async function toggleSellerStatus() {
    const supabase = supabaseState.client;
    if (!supabase || !selected) return;
    setState("saving");
    const newStatus: SellerStatus = selected.seller_status === "online" ? "offline" : "online";
    const newNote = newStatus === "online" ? "Buka · Lapak aktif" : "Tutup sementara";

    const { error } = await supabase
      .from("palugada_listings")
      .update({ seller_status: newStatus, seller_status_note: newNote })
      .eq("id", selected.id);

    if (error) {
      setActionMessage({ text: "Gagal mengubah status: " + error.message, type: "err" });
      setState("loaded");
      return;
    }

    setListings((prev) =>
      prev.map((l) =>
        l.id === selected.id
          ? { ...l, seller_status: newStatus, seller_status_note: newNote }
          : l,
      ),
    );
    setActionMessage({
      text: newStatus === "online" ? "✅ Lapak sekarang Buka (Online)" : "⏸️ Lapak ditutup sementara (Offline)",
      type: "ok",
    });
    setState("loaded");
  }

  // ─── Save Edit ────────────────────────────────────────────────────────────

  async function saveEdit() {
    const supabase = supabaseState.client;
    if (!supabase || !selected) return;
    setState("saving");

    const { error } = await supabase
      .from("palugada_listings")
      .update({
        name: editForm.name?.trim() || selected.name,
        price_label: editForm.price_label?.trim() ?? selected.price_label,
        contact_method: editForm.contact_method?.trim() ?? selected.contact_method,
        availability_note: editForm.availability_note?.trim() ?? selected.availability_note,
        description: editForm.description?.trim() ?? selected.description,
      })
      .eq("id", selected.id);

    if (error) {
      setActionMessage({ text: "Gagal menyimpan: " + error.message, type: "err" });
      setState("loaded");
      return;
    }

    setListings((prev) =>
      prev.map((l) =>
        l.id === selected.id
          ? {
              ...l,
              name: editForm.name?.trim() || l.name,
              price_label: editForm.price_label?.trim() ?? l.price_label,
              contact_method: editForm.contact_method?.trim() ?? l.contact_method,
              availability_note: editForm.availability_note?.trim() ?? l.availability_note,
              description: editForm.description?.trim() ?? l.description,
            }
          : l,
      ),
    );
    setIsEditing(false);
    setEditForm({});
    setActionMessage({ text: "✅ Perubahan berhasil disimpan.", type: "ok" });
    setState("loaded");
  }

  // ─── Upload Cover ─────────────────────────────────────────────────────────

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const supabase = supabaseState.client;
    const file = e.target.files?.[0];
    if (!file || !supabase || !selected) return;

    if (!file.type.startsWith("image/")) {
      setActionMessage({ text: "Format berkas harus gambar (JPG, PNG, WebP).", type: "err" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setActionMessage({ text: "Ukuran foto maksimal 10 MB.", type: "err" });
      return;
    }

    setUploadingCover(true);
    setActionMessage({ text: "Mengunggah foto cover...", type: "ok" });

    try {
      const safeName = getSafeFileName(file.name);
      const storagePath = `palugada/${selected.id}/cover/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(palugadaPublicMediaBucket)
        .upload(storagePath, file, {
          cacheControl: "31536000",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(palugadaPublicMediaBucket)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("palugada_listings")
        .update({
          cover_image_url: publicUrl,
          cover_image_alt: `Cover ${selected.name}`,
        })
        .eq("id", selected.id);

      if (updateError) throw updateError;

      setListings((prev) =>
        prev.map((l) =>
          l.id === selected.id
            ? { ...l, cover_image_url: publicUrl, cover_image_alt: `Cover ${l.name}` }
            : l,
        ),
      );
      setActionMessage({ text: "✅ Foto cover berhasil diperbarui!", type: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setActionMessage({ text: msg, type: "err" });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  // ─── Upload Product Photo ─────────────────────────────────────────────────

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const supabase = supabaseState.client;
    const file = e.target.files?.[0];
    if (!file || !supabase || !selected) return;

    const currentPhotos = productPhotos[selected.id] ?? [];
    if (currentPhotos.length >= 5) {
      setActionMessage({ text: "Maksimal 5 foto produk per lapak.", type: "err" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setActionMessage({ text: "Format berkas harus gambar (JPG, PNG, WebP).", type: "err" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setActionMessage({ text: "Ukuran foto maksimal 10 MB.", type: "err" });
      return;
    }

    setUploadingPhoto(true);
    setActionMessage({ text: "Mengunggah foto produk...", type: "ok" });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) throw new Error("Session habis. Silakan login ulang.");

      const safeName = getSafeFileName(file.name);
      const storagePath = `palugada/${selected.id}/photos/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(palugadaPublicMediaBucket)
        .upload(storagePath, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(palugadaPublicMediaBucket)
        .getPublicUrl(storagePath);

      // Insert attachment record
      const { data: attachData, error: attachError } = await supabase
        .from("attachments")
        .insert({
          owner_user_id: uid,
          linked_type: "palugada_listing",
          linked_id: selected.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          visibility: "public_after_approval",
          moderation_status: "approved",
        })
        .select("id")
        .single();

      if (attachError) throw attachError;

      const newPhoto: ProductPhoto = {
        id: (attachData as { id: string }).id,
        file_name: file.name,
        storage_path: storagePath,
        publicUrl: urlData.publicUrl,
      };

      setProductPhotos((prev) => ({
        ...prev,
        [selected.id]: [...(prev[selected.id] ?? []), newPhoto],
      }));
      setActionMessage({ text: "✅ Foto produk berhasil ditambahkan!", type: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setActionMessage({ text: msg, type: "err" });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  // ─── Delete Product Photo ─────────────────────────────────────────────────

  async function handlePhotoDelete(photo: ProductPhoto) {
    const supabase = supabaseState.client;
    if (!supabase || !selected) return;
    setDeletingPhotoId(photo.id);

    try {
      // Remove from storage
      await supabase.storage
        .from(palugadaPublicMediaBucket)
        .remove([photo.storage_path]);

      // Remove attachment record
      await supabase
        .from("attachments")
        .delete()
        .eq("id", photo.id);

      setProductPhotos((prev) => ({
        ...prev,
        [selected.id]: (prev[selected.id] ?? []).filter((p) => p.id !== photo.id),
      }));
      setActionMessage({ text: "Foto berhasil dihapus.", type: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus foto.";
      setActionMessage({ text: msg, type: "err" });
    } finally {
      setDeletingPhotoId(null);
    }
  }

  // ─── Delete Listing ───────────────────────────────────────────────────────

  async function deleteListing() {
    const supabase = supabaseState.client;
    if (!supabase || !selected || deleteConfirmId !== selected.id) return;
    setState("saving");

    const { error } = await supabase
      .from("palugada_listings")
      .delete()
      .eq("id", selected.id);

    if (error) {
      setActionMessage({ text: "Gagal menghapus lapak: " + error.message, type: "err" });
      setState("loaded");
      return;
    }

    const remaining = listings.filter((l) => l.id !== selected.id);
    setListings(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setDeleteConfirmId(null);
    setActionMessage({ text: "Lapak berhasil dihapus dari katalog.", type: "ok" });
    setState(remaining.length ? "loaded" : "empty");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (state === "guest") {
    return (
      <main className="min-h-screen bg-[#001713] pb-24 text-slate-100">
        <div className="mx-auto max-w-lg px-4 pt-16 text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h1 className="text-xl font-black text-white">Kelola Lapak Saya</h1>
          <p className="mt-3 text-sm text-slate-400">
            Masuk dulu ke akun warga untuk melihat dan mengelola lapak PALUGADA Anda.
          </p>
          <Link
            href="/masuk/?next=/portal/lapak/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-6 text-sm font-black text-[#15140b] shadow-lg hover:brightness-110"
          >
            Masuk ke Portal Warga
          </Link>
        </div>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-[#001713] pb-24 text-slate-100">
        <div className="mx-auto max-w-lg px-4 pt-16 text-center">
          <p className="text-sm text-red-400">Gagal memuat lapak. Coba muat ulang halaman.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#001713] pb-24 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#001d18]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.05] text-slate-300 hover:border-white/25 hover:text-white transition-all"
              aria-label="Kembali ke Portal"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">PALUGADA CGV</p>
              <h1 className="text-sm font-black text-white">Lapak Saya</h1>
            </div>
          </div>
          <Link
            href="/palugada/daftar/"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <span>+</span>
            <span>Lapak Baru</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">

        {/* Action message */}
        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              actionMessage.type === "ok"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            {actionMessage.text}
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="ml-3 text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading state */}
        {state === "loading" && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl border border-white/8 bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {state === "empty" && (
          <div className="rounded-3xl border border-white/10 bg-[#00241b] p-10 text-center">
            <div className="text-4xl mb-4">🏪</div>
            <h2 className="text-lg font-black text-white">Belum ada lapak</h2>
            <p className="mt-2 text-sm text-slate-400">
              Daftarkan lapak pertama Anda di katalog PALUGADA CGV. Lapak langsung tayang!
            </p>
            <Link
              href="/palugada/daftar/"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-6 text-sm font-black text-[#15140b] shadow-lg hover:brightness-110"
            >
              Daftarkan Lapak Sekarang
            </Link>
          </div>
        )}

        {/* Listings grid */}
        {(state === "loaded" || state === "saving") && listings.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-start">

            {/* Left: Listing list */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                {listings.length} Lapak Saya
              </p>
              {listings.map((listing) => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(listing.id);
                    setIsEditing(false);
                    setEditForm({});
                    setDeleteConfirmId(null);
                    setActionMessage(null);
                  }}
                  className={`w-full cursor-pointer text-left rounded-2xl border p-4 transition-all ${
                    selectedId === listing.id
                      ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 shadow-lg"
                      : "border-white/10 bg-[#00241b] hover:border-[#D4AF37]/30 hover:bg-[#002b23]"
                  }`}
                >
                  {/* Cover thumbnail */}
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#001713]">
                      {listing.cover_image_url ? (
                        <Image
                          src={listing.cover_image_url}
                          alt={listing.cover_image_alt || listing.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🏪</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColors[listing.status]}`}>
                          {statusLabels[listing.status]}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] font-bold ${listing.seller_status === "online" ? "text-emerald-400" : "text-slate-500"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${listing.seller_status === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                          {listing.seller_status === "online" ? "Buka" : "Tutup"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-black text-white">{listing.name}</p>
                      <p className="text-xs text-[#D4AF37] font-semibold">{listing.price_label || "Harga belum diisi"}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{categoryLabels[listing.category] || listing.category} · {listing.cluster}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Detail panel */}
            {selected && (
              <div className="rounded-2xl border border-white/10 bg-[#00241b] overflow-hidden">

                {/* Cover image */}
                <div className="relative aspect-[16/9] w-full bg-[#001713]">
                  {selected.cover_image_url ? (
                    <Image
                      src={selected.cover_image_url}
                      alt={selected.cover_image_alt || selected.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">🏪</div>
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute left-3 top-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${statusColors[selected.status]}`}>
                      {statusLabels[selected.status]}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* Quick Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Toggle Buka/Tutup */}
                    <button
                      type="button"
                      onClick={() => void toggleSellerStatus()}
                      disabled={state === "saving"}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition-all disabled:opacity-60 ${
                        selected.seller_status === "online"
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          : "border-slate-400/30 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${selected.seller_status === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                      {state === "saving" ? "Menyimpan..." : selected.seller_status === "online" ? "Buka → Tutup" : "Tutup → Buka"}
                    </button>

                    {/* Upload Cover */}
                    <div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => void handleCoverUpload(e)}
                        className="hidden"
                        id="portal-lapak-cover-input"
                        disabled={uploadingCover}
                      />
                      <label
                        htmlFor="portal-lapak-cover-input"
                        className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 text-sm font-bold text-slate-200 hover:border-white/30 hover:bg-white/10 transition-all ${uploadingCover ? "pointer-events-none opacity-60" : ""}`}
                      >
                        📷 {uploadingCover ? "Mengunggah..." : "Ganti Cover"}
                      </label>
                    </div>
                  </div>

                  {/* Product Photos */}
                  {(() => {
                    const photos = productPhotos[selected.id] ?? [];
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Foto Produk ({photos.length}/5)
                          </p>
                          {photos.length < 5 && (
                            <div>
                              <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => void handlePhotoUpload(e)}
                                className="hidden"
                                id="portal-lapak-photo-input"
                                disabled={uploadingPhoto}
                              />
                              <label
                                htmlFor="portal-lapak-photo-input"
                                className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-2.5 text-xs font-bold text-slate-300 hover:border-white/30 hover:bg-white/10 transition-all ${
                                  uploadingPhoto ? "pointer-events-none opacity-50" : ""
                                }`}
                              >
                                {uploadingPhoto ? (
                                  <><span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" /> Mengunggah...</>
                                ) : (
                                  <>📎 Tambah Foto</>
                                )}
                              </label>
                            </div>
                          )}
                        </div>

                        {photos.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {photos.map((photo) => (
                              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#001713]">
                                <Image
                                  src={photo.publicUrl}
                                  alt={photo.file_name}
                                  fill
                                  className="object-cover"
                                  sizes="120px"
                                />
                                <button
                                  type="button"
                                  onClick={() => void handlePhotoDelete(photo)}
                                  disabled={deletingPhotoId === photo.id}
                                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                                  aria-label={`Hapus foto ${photo.file_name}`}
                                >
                                  {deletingPhotoId === photo.id ? (
                                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                  ) : (
                                    <span className="text-xs font-bold text-white">🗑️</span>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-xl border border-dashed border-white/10 py-4 text-center text-xs text-slate-600">
                            Belum ada foto produk. Tambahkan agar pembeli lebih tertarik!
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Edit toggle */}
                  {!isEditing ? (
                    <>
                      {/* View mode */}
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Lapak</p>
                          <p className="mt-0.5 font-black text-white">{selected.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Harga</p>
                            <p className="mt-0.5 font-semibold text-[#E8C865]">{selected.price_label || "–"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Kontak WA</p>
                            <p className="mt-0.5 font-semibold text-slate-200">{selected.contact_method || "–"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ketersediaan</p>
                          <p className="mt-0.5 font-semibold text-slate-200">{selected.availability_note || "–"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deskripsi</p>
                          <p className="mt-0.5 text-xs text-slate-300 leading-relaxed line-clamp-4">{selected.description}</p>
                        </div>
                        <p className="text-[10px] text-slate-600">Tayang sejak {formatDate(selected.published_at)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm({
                              name: selected.name,
                              price_label: selected.price_label,
                              contact_method: selected.contact_method,
                              availability_note: selected.availability_note,
                              description: selected.description,
                            });
                            setIsEditing(true);
                          }}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 text-xs font-bold text-[#E8C865] hover:bg-[#D4AF37]/20 transition-all"
                        >
                          ✏️ Edit Data Lapak
                        </button>
                        <Link
                          href="/palugada/"
                          target="_blank"
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 text-xs font-bold text-slate-300 hover:border-white/25 hover:text-white transition-all"
                        >
                          🔗 Lihat di Katalog
                        </Link>
                      </div>
                    </>
                  ) : (
                    /* Edit mode */
                    <div className="space-y-3 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Mode Edit Lapak</p>

                      <div>
                        <label className="block text-xs font-bold text-slate-300">Nama Lapak</label>
                        <input
                          type="text"
                          value={editForm.name ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          maxLength={120}
                          className="mt-1 w-full rounded-xl border border-white/15 bg-[#001713] px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-300">Harga / Status</label>
                          <input
                            type="text"
                            value={editForm.price_label ?? ""}
                            onChange={(e) => setEditForm((p) => ({ ...p, price_label: e.target.value }))}
                            maxLength={120}
                            className="mt-1 w-full rounded-xl border border-white/15 bg-[#001713] px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300">Nomor WA</label>
                          <input
                            type="tel"
                            value={editForm.contact_method ?? ""}
                            onChange={(e) => setEditForm((p) => ({ ...p, contact_method: e.target.value }))}
                            maxLength={20}
                            className="mt-1 w-full rounded-xl border border-white/15 bg-[#001713] px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300">Ketersediaan</label>
                        <input
                          type="text"
                          value={editForm.availability_note ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, availability_note: e.target.value }))}
                          maxLength={300}
                          className="mt-1 w-full rounded-xl border border-white/15 bg-[#001713] px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300">Deskripsi</label>
                        <textarea
                          rows={5}
                          value={editForm.description ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          maxLength={3000}
                          className="mt-1 w-full rounded-xl border border-white/15 bg-[#001713] px-3 py-2 text-xs font-medium leading-relaxed text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => { setIsEditing(false); setEditForm({}); }}
                          className="flex-1 min-h-10 rounded-xl border border-white/15 bg-white/[0.05] text-xs font-bold text-slate-300 hover:text-white transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => void saveEdit()}
                          disabled={state === "saving"}
                          className="flex-1 min-h-10 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] text-xs font-black text-[#15140b] hover:brightness-110 transition-all disabled:opacity-60"
                        >
                          {state === "saving" ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete zone */}
                  <div className="border-t border-red-500/20 pt-4">
                    {deleteConfirmId === selected.id ? (
                      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 space-y-3">
                        <p className="text-sm font-bold text-red-300">Hapus lapak ini secara permanen?</p>
                        <p className="text-xs text-red-400 leading-relaxed">
                          Lapak akan hilang dari katalog PALUGADA dan tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 min-h-9 rounded-xl border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition-all"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteListing()}
                            disabled={state === "saving"}
                            className="flex-1 min-h-9 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-all disabled:opacity-60"
                          >
                            Ya, Hapus Sekarang
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(selected.id)}
                        className="w-full min-h-10 rounded-xl border border-red-400/30 bg-red-500/5 text-xs font-bold text-red-400 hover:bg-red-500/15 hover:border-red-400/50 transition-all"
                      >
                        🗑️ Hapus Lapak Ini
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
