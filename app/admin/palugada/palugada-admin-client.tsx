"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
  cx,
} from "../production-admin-components";

type ListingStatus = "draft" | "submitted" | "review" | "approved" | "hidden" | "rejected";
type StatusFilter = "all" | ListingStatus;
type LoadState = "checking" | "loading" | "loaded" | "empty" | "saving" | "denied" | "error";

type Profile = { display_name: string; email: string | null };
type RoleRow = { role: string };
type PermissionRow = { permission: string };
type Listing = {
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
  status: ListingStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ListingAttachment = {
  id: string;
  linked_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  moderation_status: "pending" | "approved" | "rejected";
  created_at: string;
  signed_url: string | null;
};

const palugadaAttachmentBucket = "palugada-submissions";

const filters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "submitted", label: "Baru masuk" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "hidden", label: "Disembunyikan" },
];

const statusLabels: Record<ListingStatus, string> = {
  draft: "Draft",
  submitted: "Baru masuk",
  review: "Review",
  approved: "Disetujui",
  hidden: "Disembunyikan",
  rejected: "Ditolak",
};

const categoryLabels: Record<Listing["category"], string> = {
  barang: "Barang",
  kuliner: "Kuliner",
  jasa: "Jasa",
  properti: "Properti",
  lainnya: "Lainnya",
};

const statusTone: Record<ListingStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  submitted: "border-accent/35 bg-accent-soft text-foreground",
  review: "border-blue-200 bg-blue-50 text-blue-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  hidden: "border-zinc-200 bg-zinc-100 text-zinc-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const allowedActions: Record<ListingStatus, Array<{ value: ListingStatus; label: string }>> = {
  draft: [
    { value: "review", label: "Mulai review" },
    { value: "rejected", label: "Tolak" },
  ],
  submitted: [
    { value: "review", label: "Mulai review" },
    { value: "rejected", label: "Tolak" },
  ],
  review: [
    { value: "approved", label: "Setujui lapak" },
    { value: "rejected", label: "Tolak" },
  ],
  approved: [{ value: "hidden", label: "Sembunyikan dari katalog" }],
  hidden: [{ value: "approved", label: "Tampilkan kembali" }],
  rejected: [{ value: "review", label: "Kembalikan ke review" }],
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function PalugadaAdminClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [state, setState] = useState<LoadState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(supabaseState.error || "Memeriksa akses PALUGADA...");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [attachments, setAttachments] = useState<ListingAttachment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const requestedListingIdRef = useRef<string | null | undefined>(undefined);

  const loadListings = useCallback(async () => {
    if (!supabase) return;

    setState("checking");
    setMessage("Memeriksa session dan permission PALUGADA...");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user) {
      setState("error");
      setMessage(sessionError?.message || "Session admin tidak tersedia.");
      return;
    }

    const activeUser = sessionData.session.user;
    setUser(activeUser);
    const [{ data: profileData, error: profileError }, { data: roleData, error: roleError }] =
      await Promise.all([
        supabase.from("profiles").select("display_name, email").eq("id", activeUser.id).maybeSingle<Profile>(),
        supabase.from("user_roles").select("role").eq("user_id", activeUser.id),
      ]);

    if (profileError || roleError) {
      setState("error");
      setMessage(profileError?.message || roleError?.message || "Gagal memuat role.");
      return;
    }

    const loadedRoles = (roleData ?? []) as RoleRow[];
    const roleNames = loadedRoles.map((row) => row.role);
    const { data: permissionData, error: permissionError } = roleNames.length
      ? await supabase.from("role_permissions").select("permission").in("role", roleNames)
      : { data: [], error: null };

    if (permissionError) {
      setState("error");
      setMessage(permissionError.message);
      return;
    }

    const loadedPermissions = (permissionData ?? []) as PermissionRow[];
    setProfile(profileData ?? null);
    setRoles(loadedRoles);
    setPermissions(loadedPermissions);

    if (!loadedPermissions.some((row) => row.permission === "palugada:read")) {
      setState("denied");
      setMessage("Role aktif tidak memiliki permission palugada:read.");
      setListings([]);
      return;
    }

    setState("loading");
    setMessage("Memuat submission PALUGADA...");
    const query = supabase
      .from("palugada_listings")
      .select("id, name, category, cluster, price_label, description, availability_note, contact_method, seller_status, seller_status_note, cover_image_url, cover_image_alt, status, published_at, created_at, updated_at")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    const loadedListings = (data ?? []) as Listing[];
    let loadedAttachments: ListingAttachment[] = [];

    if (loadedListings.length > 0) {
      const { data: attachmentData, error: attachmentError } = await supabase
        .from("attachments")
        .select("id, linked_id, file_name, file_type, file_size, storage_path, moderation_status, created_at")
        .eq("linked_type", "palugada_listing")
        .in("linked_id", loadedListings.map((item) => item.id))
        .order("created_at", { ascending: true });

      if (attachmentError) {
        setState("error");
        setMessage(`Submission terbaca, tetapi attachment gagal dimuat: ${attachmentError.message}`);
        return;
      }

      loadedAttachments = await Promise.all(
        ((attachmentData ?? []) as Omit<ListingAttachment, "signed_url">[]).map(async (attachment) => {
          const { data: signedData } = await supabase.storage
            .from(palugadaAttachmentBucket)
            .createSignedUrl(attachment.storage_path, 600);
          return { ...attachment, signed_url: signedData?.signedUrl ?? null };
        }),
      );
    }

    setListings(loadedListings);
    setAttachments(loadedAttachments);
    if (requestedListingIdRef.current === undefined) {
      requestedListingIdRef.current = new URLSearchParams(window.location.search).get("listing");
    }
    const requestedListingId = requestedListingIdRef.current;
    requestedListingIdRef.current = null;
    setSelectedId((current) => {
      if (requestedListingId && loadedListings.some((item) => item.id === requestedListingId)) {
        return requestedListingId;
      }
      return loadedListings.some((item) => item.id === current)
        ? current
        : loadedListings[0]?.id ?? null;
    });
    setState(loadedListings.length ? "loaded" : "empty");
    setMessage(loadedListings.length ? `${loadedListings.length} submission PALUGADA dimuat.` : "Tidak ada submission untuk filter ini.");
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadListings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadListings]);

  const canWrite = permissions.some((row) => row.permission === "palugada:write");
  const canRead = permissions.some((row) => row.permission === "palugada:read");
  const isSuperAdmin = roles.some((row) => row.role === "super_admin");
  const visibleListings = filter === "all"
    ? listings
    : listings.filter((item) => item.status === filter);
  const selected = visibleListings.find((item) => item.id === selectedId) ?? visibleListings[0] ?? null;
  const selectedAttachments = attachments.filter((attachment) => attachment.linked_id === selected?.id);
  const isBusy = state === "checking" || state === "loading" || state === "saving";
  const roleSummary = roles.map((row) => row.role).join(", ") || "-";
  const visibleEmail = profile?.email ?? user?.email ?? "-";

  async function updateStatus(status: ListingStatus) {
    if (!supabase || !selected || !canWrite) return;
    if (!allowedActions[selected.status].some((action) => action.value === status)) return;
    setState("saving");
    setMessage(`Mengubah status menjadi ${statusLabels[status]}...`);

    if (status === "approved" && selectedAttachments.length > 0) {
      const { error: attachmentApprovalError } = await supabase
        .from("attachments")
        .update({ moderation_status: "approved", visibility: "public_after_approval" })
        .eq("linked_type", "palugada_listing")
        .eq("linked_id", selected.id);

      if (attachmentApprovalError) {
        setState("error");
        setMessage(`Foto gagal disetujui: ${attachmentApprovalError.message}`);
        return;
      }
    }

    const { error } = await supabase
      .from("palugada_listings")
      .update({
        status,
        published_at: status === "approved" ? selected.published_at ?? new Date().toISOString() : null,
      })
      .eq("id", selected.id);

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    await loadListings();
  }

  async function deleteListing() {
    if (!supabase || !selected || !canWrite || deleteConfirmationId !== selected.id) return;
    setState("saving");
    setMessage(`Menghapus ${selected.name} dan semua lampirannya...`);

    const storagePaths = selectedAttachments.map((attachment) => attachment.storage_path);
    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(palugadaAttachmentBucket)
        .remove(storagePaths);
      if (storageError) {
        setState("error");
        setMessage(`File gagal dihapus: ${storageError.message}`);
        return;
      }

      const { error: attachmentError } = await supabase
        .from("attachments")
        .delete()
        .eq("linked_type", "palugada_listing")
        .eq("linked_id", selected.id);
      if (attachmentError) {
        setState("error");
        setMessage(`Metadata lampiran gagal dihapus: ${attachmentError.message}`);
        return;
      }
    }

    const { error: listingError } = await supabase
      .from("palugada_listings")
      .delete()
      .eq("id", selected.id);
    if (listingError) {
      setState("error");
      setMessage(`Listing gagal dihapus: ${listingError.message}`);
      return;
    }

    setDeleteConfirmationId(null);
    setSelectedId(null);
    await loadListings();
  }

  return (
    <ProductionAdminShell
      active="palugada"
      title="PALUGADA"
      subtitle="Periksa pendaftaran lapak"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleSummary}
      isSuperAdmin={isSuperAdmin}
    >
      <ProductionPageIntro
        eyebrow="Katalog usaha warga"
        title={<>Pendaftaran <span className="italic">PALUGADA</span></>}
        text="Periksa informasi lapak sebelum disetujui dan ditampilkan di katalog. Kontak pemilik hanya terlihat oleh pengelola yang berwenang."
        side={<ProductionStatusPill>{canRead ? "Akses aktif" : "Memeriksa akses"}</ProductionStatusPill>}
      />

      <section aria-label="Ringkasan PALUGADA" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <ProductionMetricCard label="Baru" value={String(listings.filter((item) => item.status === "submitted").length)} helper="Pendaftaran baru" icon="store" />
        <ProductionMetricCard label="Diperiksa" value={String(listings.filter((item) => item.status === "review").length)} helper="Sedang diperiksa pengurus" icon="shield" tone="blue" />
        <ProductionMetricCard label="Disetujui" value={String(listings.filter((item) => item.status === "approved").length)} helper="Siap tampil di katalog" icon="store" tone="gold" />
        <ProductionMetricCard label="Akses" value={canWrite ? "Kelola" : "Lihat saja"} helper={roleSummary} icon="users" tone="dark" />
      </section>

      <ProductionPanel className="mb-5">
        <ProductionPanelHeader title="Filter status" subtitle={message} />
        <div className="flex flex-wrap gap-2 px-5 pb-5" aria-label="Filter submission PALUGADA">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              disabled={isBusy}
              className={cx(
                "min-h-10 cursor-pointer rounded-[10px] border px-3 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
                filter === item.value ? "border-primary bg-primary text-accent" : "border-black/10 bg-white text-muted hover:border-primary/30 hover:text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </ProductionPanel>

      {state === "denied" || state === "error" ? (
        <div className="mb-5 rounded-[16px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{message}</div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <ProductionPanel>
          <ProductionPanelHeader title="Semua lapak PALUGADA" subtitle="Gunakan filter untuk melihat lapak berdasarkan status pemeriksaan." />
          <div className="grid gap-3 px-5 pb-5">
            {visibleListings.map((listing) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => setSelectedId(listing.id)}
                className={cx(
                  "w-full cursor-pointer rounded-[14px] border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selectedId === listing.id ? "border-primary bg-primary-soft/40" : "border-black/8 bg-white hover:border-primary/25",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{categoryLabels[listing.category]} · {listing.cluster}</p>
                    <h2 className="mt-2 text-base font-bold text-foreground">{listing.name}</h2>
                    <p className="mt-1 text-sm text-muted">{listing.price_label || "Harga belum dicantumkan"}</p>
                    <p className="mt-2 text-xs font-bold text-primary">
                      {attachments.filter((attachment) => attachment.linked_id === listing.id).length} lampiran
                    </p>
                  </div>
                  <span className={cx("rounded-full border px-3 py-1 text-xs font-bold", statusTone[listing.status])}>{statusLabels[listing.status]}</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-muted">Masuk {formatDate(listing.created_at)}</p>
              </button>
            ))}
            {state === "empty" || visibleListings.length === 0 ? <p className="rounded-[14px] border border-dashed border-black/10 bg-white p-6 text-center text-sm font-semibold text-muted">Belum ada lapak PALUGADA untuk filter ini.</p> : null}
          </div>
        </ProductionPanel>

        <aside className="space-y-5">
          <ProductionPanel>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">Detail pendaftaran</h2>
              {selected ? (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={cx("rounded-full border px-3 py-1 text-xs font-bold", statusTone[selected.status])}>{statusLabels[selected.status]}</span>
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-muted">{categoryLabels[selected.category]}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground">{selected.name}</h3>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <InfoRow label="Cluster" value={selected.cluster} />
                    <InfoRow label="Kontak" value={selected.contact_method || "-"} />
                    <InfoRow label="Harga" value={selected.price_label || "-"} />
                    <InfoRow label="Ketersediaan" value={selected.availability_note || "-"} />
                    <InfoRow label="Status penjual" value={`${selected.seller_status} · ${selected.seller_status_note || "-"}`} />
                  </dl>
                  <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-cream p-4 font-sans text-sm leading-6 text-foreground">{selected.description}</pre>
                  {selected.cover_image_url ? (
                    <section className="mt-4" aria-labelledby="palugada-cover-title">
                      <h4 id="palugada-cover-title" className="text-sm font-bold text-foreground">Cover katalog</h4>
                      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white">
                        {/* Catalog covers can use local public assets or a managed public URL. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selected.cover_image_url} alt={selected.cover_image_alt || `Cover ${selected.name}`} className="aspect-[4/3] w-full bg-cream object-cover" />
                      </div>
                    </section>
                  ) : null}
                  <section className="mt-4" aria-labelledby="palugada-attachments-title">
                    <div className="flex items-center justify-between gap-3">
                      <h4 id="palugada-attachments-title" className="text-sm font-bold text-foreground">Foto dan lampiran</h4>
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{selectedAttachments.length} file</span>
                    </div>
                    {selectedAttachments.length > 0 ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        {selectedAttachments.map((attachment) => (
                          <article key={attachment.id} className="overflow-hidden rounded-xl border border-border bg-white">
                            {attachment.signed_url ? (
                              // Signed private Storage URLs cannot use the static Next image optimizer.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={attachment.signed_url} alt={`Lampiran ${attachment.file_name}`} className="aspect-[4/3] w-full bg-cream object-cover" />
                            ) : (
                              <div className="grid aspect-[4/3] place-items-center bg-cream px-4 text-center text-xs font-semibold text-muted">Preview tidak tersedia</div>
                            )}
                            <div className="p-3">
                              <p className="truncate text-xs font-bold text-foreground" title={attachment.file_name}>{attachment.file_name}</p>
                              <p className="mt-1 text-xs text-muted">{formatFileSize(attachment.file_size)} · {attachment.moderation_status}</p>
                              {attachment.signed_url ? (
                                <a href={attachment.signed_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-[9px] border border-primary/20 bg-primary-soft px-3 text-xs font-bold text-primary transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                  Buka file
                                </a>
                              ) : null}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-xl border border-dashed border-border bg-cream p-4 text-sm font-semibold leading-6 text-muted">Pendaftaran ini belum memiliki lampiran.</p>
                    )}
                  </section>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {allowedActions[selected.status].map((action) => (
                      <button
                        key={action.value}
                        type="button"
                        onClick={() => void updateStatus(action.value)}
                        disabled={isBusy || !canWrite}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-red-200 pt-4">
                    {deleteConfirmationId === selected.id ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-bold text-red-800">Hapus lapak secara permanen?</p>
                        <p className="mt-2 text-xs leading-5 text-red-700">Lapak dan seluruh lampirannya akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <button type="button" onClick={() => setDeleteConfirmationId(null)} disabled={isBusy} className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-bold text-muted transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60">Batal</button>
                          <button type="button" onClick={() => void deleteListing()} disabled={isBusy || !canWrite} className="min-h-10 cursor-pointer rounded-[10px] border border-red-700 bg-red-700 px-3 text-sm font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:opacity-60">Ya, hapus permanen</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirmationId(selected.id)} disabled={isBusy || !canWrite} className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-[10px] border border-red-200 bg-white px-3 text-sm font-bold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:opacity-60">Hapus lapak</button>
                    )}
                  </div>
                  {!canWrite ? <p className="mt-3 text-xs font-semibold leading-5 text-muted">Permission palugada:write diperlukan untuk mengubah status.</p> : null}
                </div>
              ) : <p className="mt-3 text-sm font-semibold leading-6 text-muted">Pilih pendaftaran untuk melihat detail.</p>}
            </div>
          </ProductionPanel>
        </aside>
      </div>
    </ProductionAdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="mt-1 break-words font-bold text-foreground">{value}</dd>
    </div>
  );
}
