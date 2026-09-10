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
  submitted: "Sedang Diproses",
  review: "Dalam Peninjauan",
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

  // ─── Load Product Photos (Handles public & signed URLs) ───────────────────

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

      const photos: ProductPhoto[] = await Promise.all(
        data.map(async (row) => {
          let publicUrl = "";
          if (row.storage_path.startsWith("palugada/")) {
            const { data: urlData } = supabase!.storage
              .from(palugadaPublicMediaBucket)
              .getPublicUrl(row.storage_path);
            publicUrl = urlData.publicUrl;
          } else {
            const { data: signedData } = await supabase!.storage
              .from("palugada-submissions")
              .createSignedUrl(row.storage_path, 3600);
            publicUrl = signedData?.signedUrl ?? "";
          }
          return {
            id: row.id as string,
            file_name: row.file_name as string,
            storage_path: row.storage_path as string,
            publicUrl,
          };
        }),
      );

      if (!mounted) return;
      setProductPhotos((prev) => ({ ...prev, [selected.id]: photos }));
    }

    void loadPhotos();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseState.client, selected?.id]);

  // ─── Set Seller Status (Online / Offline) ──────────────────────────────────

  async function setSellerStatus(newStatus: SellerStatus) {
    const supabase = supabaseState.client;
    if (!supabase || !selected || selected.seller_status === newStatus) return;
    setState("saving");
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
      text: newStatus === "online" ? "✅ Status lapak sekarang: Buka (Online)" : "⏸️ Status lapak sekarang: Tutup Sementara (Offline)",
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
    setActionMessage({ text: "✅ Informasi lapak berhasil diperbarui.", type: "ok" });
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
    setActionMessage({ text: "Mengunggah foto cover utama...", type: "ok" });

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
      setActionMessage({ text: "✅ Foto cover utama berhasil diperbarui!", type: "ok" });
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
      if (!uid) throw new Error("Sesi login berakhir. Silakan login kembali.");

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
      if (photo.storage_path.startsWith("palugada/")) {
        await supabase.storage
          .from(palugadaPublicMediaBucket)
          .remove([photo.storage_path]);
      } else {
        await supabase.storage
          .from("palugada-submissions")
          .remove([photo.storage_path]);
      }

      await supabase
        .from("attachments")
        .delete()
        .eq("id", photo.id);

      setProductPhotos((prev) => ({
        ...prev,
        [selected.id]: (prev[selected.id] ?? []).filter((p) => p.id !== photo.id),
      }));
      setActionMessage({ text: "✅ Foto berhasil dihapus.", type: "ok" });
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

  // ─── Render Guest / Error ─────────────────────────────────────────────────

  if (state === "guest") {
    return (
      <main className="min-h-screen bg-[#001713] pb-24 text-slate-100">
        <div className="mx-auto max-w-lg px-4 pt-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-400/10 border border-amber-300/20 text-3xl">
            🏪
          </div>
          <h1 className="mt-5 text-2xl font-black text-white">Kelola Lapak PALUGADA</h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Masuk terlebih dahulu dengan akun warga Anda untuk mengelola foto, status buka/tutup, dan informasi lapak.
          </p>
          <Link
            href="/masuk/?next=/portal/lapak/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-6 text-sm font-black text-[#15140b] shadow-lg hover:brightness-110 transition-all"
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
        <div className="mx-auto max-w-lg px-4 pt-20 text-center">
          <p className="text-sm font-semibold text-red-400">Gagal memuat data lapak. Silakan muat ulang halaman.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/10"
          >
            Muat Ulang
          </button>
        </div>
      </main>
    );
  }

  // Cover image fallback to 1st product photo
  const activePhotos = selected ? productPhotos[selected.id] ?? [] : [];
  const displayCoverUrl = selected?.cover_image_url || activePhotos[0]?.publicUrl || null;

  return (
    <main className="min-h-screen bg-[#001713] pb-24 text-slate-100 font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#001d18]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.05] text-slate-300 hover:border-white/25 hover:text-white transition-all"
              aria-label="Kembali ke Portal Warga"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">PALUGADA CGV</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-300">Mandiri</span>
              </div>
              <h1 className="text-sm font-black text-white sm:text-base">Kelola Lapak Saya</h1>
            </div>
          </div>
          <Link
            href="/palugada/daftar/"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <span>+</span>
            <span>Tambah Lapak</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">

        {/* ── Action Notification Banner ── */}
        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              actionMessage.type === "ok"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/30 bg-red-500/10 text-red-200"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="ml-3 rounded-lg p-1 text-xs opacity-60 hover:opacity-100 hover:bg-white/10"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {state === "loading" && (
          <div className="space-y-4">
            <div className="h-44 rounded-3xl border border-white/8 bg-white/[0.04] animate-pulse" />
            <div className="h-64 rounded-3xl border border-white/8 bg-white/[0.04] animate-pulse" />
          </div>
        )}

        {/* ── Empty State ── */}
        {state === "empty" && (
          <div className="rounded-3xl border border-white/10 bg-[#00241b] p-10 text-center shadow-xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-4xl">🏪</div>
            <h2 className="mt-4 text-xl font-black text-white">Belum Ada Lapak Terdaftar</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Daftarkan usaha, produk, atau jasa Anda di katalog PALUGADA CGV. Lapak langsung tayang untuk seluruh warga tetangga!
            </p>
            <Link
              href="/palugada/daftar/"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-6 text-sm font-black text-[#15140b] shadow-lg hover:brightness-110 transition-all"
            >
              Daftarkan Lapak Sekarang
            </Link>
          </div>
        )}

        {/* ── Main Content Area ── */}
        {(state === "loaded" || state === "saving") && listings.length > 0 && selected && (
          <div className="space-y-6">

            {/* ── Lapak Selector Tabs (if multiple listings) ── */}
            {listings.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {listings.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(l.id);
                      setIsEditing(false);
                      setEditForm({});
                      setDeleteConfirmId(null);
                      setActionMessage(null);
                    }}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                      selectedId === l.id
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#E8C865] shadow-sm"
                        : "border-white/10 bg-[#00241b] text-slate-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className={`h-2 w-2 rounded-full ${l.seller_status === "online" ? "bg-emerald-400" : "bg-slate-500"}`} />
                  </button>
                ))}
              </div>
            )}

            {/* ── SECTION 1: HERO COVER & DIRECT ACTIONS ── */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#00241b] shadow-xl">
              {/* Cover Banner */}
              <div className="relative aspect-[21/9] sm:aspect-[3/1] w-full bg-[#001713] overflow-hidden">
                {displayCoverUrl ? (
                  <Image
                    src={displayCoverUrl}
                    alt={selected.cover_image_alt || selected.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#00241b] via-[#001713] to-[#043327] p-6 text-center">
                    <span className="text-4xl sm:text-5xl">🏪</span>
                    <p className="mt-2 text-xs font-bold text-slate-400">Belum ada foto cover utama</p>
                  </div>
                )}

                {/* Dark gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Badges on Top */}
                <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${statusColors[selected.status]}`}>
                    {statusLabels[selected.status]}
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-200 backdrop-blur-md">
                    {categoryLabels[selected.category] || selected.category}
                  </span>
                </div>

                {/* Title & Info on Bottom of Cover */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-5 sm:right-5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
                      {selected.cluster}
                    </p>
                    <h2 className="truncate text-lg sm:text-2xl font-black text-white drop-shadow-md">
                      {selected.name}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-xl bg-black/60 px-3 py-1 text-xs sm:text-sm font-black text-[#E8C865] backdrop-blur-md border border-[#D4AF37]/30">
                    {selected.price_label || "Harga Belum Diisi"}
                  </span>
                </div>
              </div>

              {/* Action Toolbar below Cover */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#001d18] px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
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
                    className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 text-xs font-bold text-slate-200 hover:border-white/30 hover:bg-white/10 transition-all ${
                      uploadingCover ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <span>📷</span>
                    <span>{uploadingCover ? "Mengunggah..." : "Ganti Foto Cover"}</span>
                  </label>
                  <span className="hidden sm:inline text-[11px] text-slate-500">Maks. 10MB (JPG/PNG/WebP)</span>
                </div>

                <Link
                  href={`/palugada/detail/?id=${encodeURIComponent(selected.id)}`}
                  target="_blank"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                >
                  <span>🌐</span>
                  <span>Lihat Tampilan Publik ↗</span>
                </Link>
              </div>
            </section>

            {/* ── SECTION 2: STATUS OPERASIONAL (ONLINE / OFFLINE) ── */}
            <section className="rounded-3xl border border-white/10 bg-[#00241b] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">STATUS TOKO</p>
                  <h3 className="text-base font-black text-white">Status Operasional Lapak</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${selected.seller_status === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  <span className={`text-xs font-black ${selected.seller_status === "online" ? "text-emerald-300" : "text-slate-400"}`}>
                    {selected.seller_status === "online" ? "Sedang Buka" : "Sedang Tutup"}
                  </span>
                </div>
              </div>

              {/* Segmented Switch */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#001713] p-1.5">
                <button
                  type="button"
                  onClick={() => void setSellerStatus("online")}
                  disabled={state === "saving"}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition-all disabled:opacity-60 ${
                    selected.seller_status === "online"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>🟢</span>
                  <span>Buka untuk Pesanan (Online)</span>
                </button>

                <button
                  type="button"
                  onClick={() => void setSellerStatus("offline")}
                  disabled={state === "saving"}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition-all disabled:opacity-60 ${
                    selected.seller_status === "offline"
                      ? "bg-zinc-700 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>⏸️</span>
                  <span>Tutup Sementara (Offline)</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {selected.seller_status === "online"
                  ? "Lapak Anda berstatus Buka. Tetangga dapat langsung menghubungi via WhatsApp untuk memesan."
                  : "Lapak sedang dinonaktifkan sementara. Pengunjung akan melihat tanda toko sedang tutup."}
              </p>
            </section>

            {/* ── SECTION 3: PRODUCT PHOTOS & GALLERY (UP TO 5) ── */}
            <section className="rounded-3xl border border-white/10 bg-[#00241b] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">GALERI PRODUK</p>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-slate-300">
                      {activePhotos.length}/5 Foto
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">Foto Produk atau Menu Tambahan</h3>
                </div>

                {activePhotos.length < 5 && (
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
                      className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 text-xs font-black text-[#E8C865] hover:bg-[#D4AF37]/20 transition-all ${
                        uploadingPhoto ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {uploadingPhoto ? (
                        <>
                          <span className="h-3 w-3 rounded-full border-2 border-[#E8C865] border-t-transparent animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <span>+</span>
                          <span>Tambah Foto Produk</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {activePhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#001713] shadow-md"
                  >
                    {photo.publicUrl ? (
                      <Image
                        src={photo.publicUrl}
                        alt={photo.file_name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 180px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        Foto {idx + 1}
                      </div>
                    )}

                    {/* Delete overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => void handlePhotoDelete(photo)}
                        disabled={deletingPhotoId === photo.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow hover:bg-red-700 transition-colors disabled:opacity-50"
                        aria-label={`Hapus foto ${photo.file_name}`}
                      >
                        {deletingPhotoId === photo.id ? (
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <span>🗑️</span>
                            <span>Hapus</span>
                          </>
                        )}
                      </button>
                    </div>

                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, 5 - activePhotos.length) }).map((_, idx) => (
                  <label
                    key={idx}
                    htmlFor={idx === 0 ? "portal-lapak-photo-input" : undefined}
                    className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-3 text-center transition-all ${
                      idx === 0
                        ? "cursor-pointer hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5"
                        : "opacity-40"
                    }`}
                  >
                    <span className="text-xl text-slate-500">{idx === 0 ? "➕" : "📷"}</span>
                    <span className="mt-1 text-[10px] font-bold text-slate-400">
                      {idx === 0 ? "Unggah Foto" : `Slot ${activePhotos.length + idx + 1}`}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* ── SECTION 4: INFORMASI DETAIL LAPAK ── */}
            <section className="rounded-3xl border border-white/10 bg-[#00241b] p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">DATA INFORMASI</p>
                  <h3 className="text-base font-black text-white">Detail & Deskripsi Lapak</h3>
                </div>

                {!isEditing && (
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
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 text-xs font-black text-[#E8C865] hover:bg-[#D4AF37]/20 transition-all"
                  >
                    <span>✏️</span>
                    <span>Edit Informasi</span>
                  </button>
                )}
              </div>

              {!isEditing ? (
                /* View Mode */
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-[#001713] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Lapak</p>
                      <p className="mt-1 text-sm font-black text-white">{selected.name}</p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-[#001713] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Harga / Tarif</p>
                      <p className="mt-1 text-sm font-black text-[#E8C865]">{selected.price_label || "–"}</p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-[#001713] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nomor WhatsApp</p>
                      <p className="mt-1 text-sm font-bold text-slate-200">{selected.contact_method || "–"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-[#001713] p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ketersediaan</p>
                    <p className="mt-1 text-xs font-semibold text-slate-200">{selected.availability_note || "–"}</p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-[#001713] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deskripsi Lengkap</p>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {selected.description}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Tayang di katalog sejak {formatDate(selected.published_at || selected.created_at)}
                  </p>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <p className="text-xs font-black uppercase tracking-wider text-[#E8C865]">Formulir Edit Data Lapak</p>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setEditForm({}); }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">Nama Lapak / Usaha</label>
                    <input
                      type="text"
                      value={editForm.name ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      maxLength={120}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#001713] px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Harga / Label Tarif</label>
                      <input
                        type="text"
                        value={editForm.price_label ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, price_label: e.target.value }))}
                        placeholder="Contoh: 5.300.000 atau Mulai Rp 20.000"
                        maxLength={120}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#001713] px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Nomor WhatsApp Aktif</label>
                      <input
                        type="tel"
                        value={editForm.contact_method ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, contact_method: e.target.value }))}
                        placeholder="Contoh: 081291254064"
                        maxLength={20}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#001713] px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">Catatan Ketersediaan / Stok</label>
                    <input
                      type="text"
                      value={editForm.availability_note ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, availability_note: e.target.value }))}
                      placeholder="Contoh: Stok ready, pengiriman setiap sore"
                      maxLength={300}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#001713] px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">Deskripsi Lengkap</label>
                    <textarea
                      rows={5}
                      value={editForm.description ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      maxLength={3000}
                      placeholder="Tuliskan spesifikasi produk, keunggulan, atau ketentuan pemesanan..."
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#001713] px-3.5 py-2.5 text-xs font-medium leading-relaxed text-white placeholder:text-slate-600 focus:border-[#D4AF37]/60 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setEditForm({}); }}
                      className="flex-1 min-h-11 rounded-xl border border-white/15 bg-white/[0.05] text-xs font-bold text-slate-300 hover:text-white transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveEdit()}
                      disabled={state === "saving"}
                      className="flex-1 min-h-11 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] text-xs font-black text-[#15140b] hover:brightness-110 transition-all disabled:opacity-60 shadow-md"
                    >
                      {state === "saving" ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* ── SECTION 5: DANGER ZONE (HAPUS LAPAK) ── */}
            <section className="rounded-3xl border border-red-500/20 bg-red-950/20 p-5 sm:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-red-300">Hapus Lapak dari Katalog</h4>
                  <p className="text-xs text-red-400/80">Lapak akan dihapus secara permanen dari etalase warga.</p>
                </div>

                {deleteConfirmId !== selected.id ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(selected.id)}
                    className="inline-flex min-h-9 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 px-4 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all"
                  >
                    🗑️ Hapus Lapak
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="inline-flex min-h-9 items-center justify-center rounded-xl border border-white/15 px-3 text-xs font-bold text-slate-300 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteListing()}
                      disabled={state === "saving"}
                      className="inline-flex min-h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-xs font-black text-white hover:bg-red-700 transition-all disabled:opacity-60"
                    >
                      Konfirmasi Hapus
                    </button>
                  </div>
                )}
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}
