"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "../production-admin-components";

type HouseholdRow = {
  id: string;
  head_user_id: string | null;
  cluster: string;
  block_or_unit: string;
  unit_number: string | null;
  primary_contact_name: string | null;
  primary_phone: string | null;
  occupancy_status: "active" | "vacant" | "moved" | "unknown";
  verification_status: "draft" | "review" | "verified" | "rejected";
  family_count: number;
  vehicle_count: number;
  updated_at: string;
};

type UserRoleRow = { role: string };
type PermissionRow = { permission: string };
type HouseholdFilter = "active" | "all" | "removed";
type RequestFilter = "pending" | "approved" | "rejected" | "duplicate" | "all";

type RegistrationRequestRow = {
  id: string;
  email: string;
  display_name: string;
  phone: string;
  cluster: string;
  block_or_unit: string;
  matched_household_id: string | null;
  status: "pending_review" | "approved" | "rejected" | "cancelled";
  admin_note: string;
  created_at: string;
  reviewed_at: string | null;
};

const occupancyLabels: Record<HouseholdRow["occupancy_status"], string> = {
  active: "Aktif",
  vacant: "Kosong",
  moved: "Pindah",
  unknown: "Belum jelas",
};

const verificationLabels: Record<HouseholdRow["verification_status"], string> = {
  draft: "Draft",
  review: "Review",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function maskPhone(value: string | null) {
  if (!value) return "-";
  const clean = value.replace(/\s+/g, "");
  if (clean.length <= 6) return clean;
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
}

function hasResidentData(item: HouseholdRow) {
  return Boolean(
    item.head_user_id ||
      item.primary_contact_name?.trim() ||
      item.primary_phone?.trim() ||
      item.family_count > 0 ||
      item.vehicle_count > 0,
  );
}

export function WargaAdminClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [roleLabel, setRoleLabel] = useState("Admin");
  const [message, setMessage] = useState("Memuat data warga...");
  const [canRead, setCanRead] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [requests, setRequests] = useState<RegistrationRequestRow[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [actionHouseholdId, setActionHouseholdId] = useState<string | null>(null);
  const [householdFilter, setHouseholdFilter] = useState<HouseholdFilter>("active");
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("pending");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [editingRequest, setEditingRequest] = useState<RegistrationRequestRow | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<RegistrationRequestRow | null>(null);
  const [editingHousehold, setEditingHousehold] = useState<HouseholdRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user) {
      setMessage(sessionError?.message || "Login admin diperlukan.");
      return;
    }

    const activeUser = sessionData.session.user;
    setUser(activeUser);

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", activeUser.id);

    if (roleError) {
      setMessage(roleError.message);
      return;
    }

    const roles = ((roleData ?? []) as UserRoleRow[]).map((row) => row.role);
    setRoleLabel(roles[0] ?? "Admin");

    const { data: permissionData, error: permissionError } = roles.length
      ? await supabase.from("role_permissions").select("permission").in("role", roles)
      : { data: [], error: null };

    if (permissionError) {
      setMessage(permissionError.message);
      return;
    }

    const permissions = (permissionData ?? []) as PermissionRow[];
    const hasRead = permissions.some((row) => row.permission === "resident:read");
    const hasWrite = permissions.some((row) => row.permission === "resident:write");
    setCanRead(hasRead);
    setCanWrite(hasWrite);

    if (!hasRead) {
      setMessage("Akun ini belum punya akses membaca data warga.");
      setRequests([]);
      return;
    }

    const [
      { data: householdData, error: householdError },
      { data: requestData, error: requestErr },
    ] = await Promise.all([
      supabase
        .from("households")
        .select(
          "id, head_user_id, cluster, block_or_unit, unit_number, primary_contact_name, primary_phone, occupancy_status, verification_status, family_count, vehicle_count, updated_at",
        )
        .order("cluster", { ascending: true })
        .order("block_or_unit", { ascending: true })
        .limit(300),
      supabase
        .from("resident_registration_requests")
        .select(
          "id, email, display_name, phone, cluster, block_or_unit, matched_household_id, status, admin_note, created_at, reviewed_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    if (householdError) {
      setMessage(householdError.message);
      return;
    }

    if (requestErr) {
      setRequests([]);
    } else {
      const loadedRequests = (requestData ?? []) as RegistrationRequestRow[];
      setRequests(loadedRequests);
    }

    setHouseholds((householdData ?? []) as HouseholdRow[]);
    setMessage(`${householdData?.length ?? 0} rumah terbaca.`);
  }, [supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  // Toast auto dismiss
  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToast(null), 4000);
    return () => clearTimeout(timer);
  }, [successToast]);

  // Duplicate detection computation
  const { duplicateIds, duplicateReasons } = useMemo(() => {
    const emailCounts = new Map<string, number>();
    const phoneCounts = new Map<string, number>();
    const unitCounts = new Map<string, number>();

    requests.forEach((req) => {
      const em = req.email?.trim().toLowerCase();
      if (em) emailCounts.set(em, (emailCounts.get(em) || 0) + 1);

      const ph = req.phone?.replace(/\D/g, "");
      if (ph && ph.length >= 7) phoneCounts.set(ph, (phoneCounts.get(ph) || 0) + 1);

      const unit = `${req.cluster?.trim().toLowerCase()}_${req.block_or_unit?.trim().toLowerCase()}`;
      if (req.cluster && req.block_or_unit) {
        unitCounts.set(unit, (unitCounts.get(unit) || 0) + 1);
      }
    });

    const dupSet = new Set<string>();
    const dupMap = new Map<string, string>();

    requests.forEach((req) => {
      const em = req.email?.trim().toLowerCase();
      const ph = req.phone?.replace(/\D/g, "");
      const unit = `${req.cluster?.trim().toLowerCase()}_${req.block_or_unit?.trim().toLowerCase()}`;

      const reasons: string[] = [];
      if (em && (emailCounts.get(em) || 0) > 1) reasons.push("Email kembar");
      if (ph && ph.length >= 7 && (phoneCounts.get(ph) || 0) > 1) reasons.push("No. WA kembar");
      if (req.cluster && req.block_or_unit && (unitCounts.get(unit) || 0) > 1) reasons.push("Rumah kembar");

      if (reasons.length > 0) {
        dupSet.add(req.id);
        dupMap.set(req.id, reasons.join(", "));
      }
    });

    return { duplicateIds: dupSet, duplicateReasons: dupMap };
  }, [requests]);

  async function approveRequest(requestId: string) {
    if (!canWrite) {
      setRequestError("Akun ini belum punya izin verifikasi warga.");
      return;
    }

    setActionRequestId(requestId);
    setRequestError(null);

    const { error } = await supabase.rpc("approve_resident_registration_request", {
      p_request_id: requestId,
      p_admin_note: "Disetujui dari Admin Data Warga",
    });

    if (error) {
      setRequestError(`Gagal approve: ${error.message}`);
      setActionRequestId(null);
      return;
    }

    await loadData();
    setSuccessToast("Pendaftaran warga berhasil disetujui.");
    setRequestError(null);
    setActionRequestId(null);
  }

  async function rejectRequest(requestId: string) {
    if (!canWrite) {
      setRequestError("Akun ini belum punya izin verifikasi warga.");
      return;
    }

    const reason = window.prompt("Alasan penolakan pendaftaran warga?");
    if (reason === null) return;

    setActionRequestId(requestId);

    const { error } = await supabase.rpc("reject_resident_registration_request", {
      p_request_id: requestId,
      p_admin_note: reason,
    });

    if (error) {
      setRequestError(error.message);
      setActionRequestId(null);
      return;
    }

    await loadData();
    setSuccessToast("Pendaftaran warga ditandai ditolak.");
    setActionRequestId(null);
  }

  async function handleSaveEditedRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingRequest || !canWrite) return;

    setIsSaving(true);
    setRequestError(null);

    // 1. Try RPC first
    const { error: rpcErr } = await supabase.rpc("admin_update_resident_registration_request", {
      p_request_id: editingRequest.id,
      p_display_name: editingRequest.display_name,
      p_phone: editingRequest.phone,
      p_email: editingRequest.email,
      p_cluster: editingRequest.cluster,
      p_block_or_unit: editingRequest.block_or_unit,
      p_status: editingRequest.status,
      p_admin_note: editingRequest.admin_note,
    });

    if (rpcErr) {
      // Fallback direct update
      const { error: directErr } = await supabase
        .from("resident_registration_requests")
        .update({
          display_name: editingRequest.display_name,
          phone: editingRequest.phone,
          email: editingRequest.email,
          cluster: editingRequest.cluster,
          block_or_unit: editingRequest.block_or_unit,
          status: editingRequest.status,
          admin_note: editingRequest.admin_note,
        })
        .eq("id", editingRequest.id);

      if (directErr) {
        setRequestError(`Gagal menyimpan edit: ${directErr.message}`);
        setIsSaving(false);
        return;
      }
    }

    await loadData();
    setIsSaving(false);
    setEditingRequest(null);
    setSuccessToast(`Data warga ${editingRequest.display_name} berhasil diperbarui.`);
  }

  async function handleConfirmDeleteRequest() {
    if (!deletingRequest || !canWrite) return;

    setIsSaving(true);
    setRequestError(null);

    // 1. Try RPC first
    const { error: rpcErr } = await supabase.rpc("admin_delete_resident_registration_request", {
      p_request_id: deletingRequest.id,
      p_reason: "Dihapus manual oleh admin (pembersihan/double registrasi)",
    });

    if (rpcErr) {
      // Fallback direct delete
      const { error: directErr } = await supabase
        .from("resident_registration_requests")
        .delete()
        .eq("id", deletingRequest.id);

      if (directErr) {
        setRequestError(`Gagal menghapus pendaftaran: ${directErr.message}`);
        setIsSaving(false);
        return;
      }
    }

    await loadData();
    setIsSaving(false);
    setDeletingRequest(null);
    setSuccessToast(`Pendaftaran warga ${deletingRequest.display_name} berhasil dihapus.`);
  }

  async function handleSaveEditedHousehold(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingHousehold || !canWrite) return;

    setIsSaving(true);

    // 1. Try RPC first
    const { error: rpcErr } = await supabase.rpc("admin_update_household", {
      p_household_id: editingHousehold.id,
      p_cluster: editingHousehold.cluster,
      p_block_or_unit: editingHousehold.block_or_unit,
      p_unit_number: editingHousehold.unit_number,
      p_primary_contact_name: editingHousehold.primary_contact_name,
      p_primary_phone: editingHousehold.primary_phone,
      p_occupancy_status: editingHousehold.occupancy_status,
      p_verification_status: editingHousehold.verification_status,
      p_family_count: Number(editingHousehold.family_count) || 0,
      p_vehicle_count: Number(editingHousehold.vehicle_count) || 0,
    });

    if (rpcErr) {
      // Fallback direct update
      const { error: directErr } = await supabase
        .from("households")
        .update({
          cluster: editingHousehold.cluster,
          block_or_unit: editingHousehold.block_or_unit,
          unit_number: editingHousehold.unit_number || null,
          primary_contact_name: editingHousehold.primary_contact_name || null,
          primary_phone: editingHousehold.primary_phone || null,
          occupancy_status: editingHousehold.occupancy_status,
          verification_status: editingHousehold.verification_status,
          family_count: Number(editingHousehold.family_count) || 0,
          vehicle_count: Number(editingHousehold.vehicle_count) || 0,
        })
        .eq("id", editingHousehold.id);

      if (directErr) {
        setMessage(`Gagal menyimpan data rumah: ${directErr.message}`);
        setIsSaving(false);
        return;
      }
    }

    await loadData();
    setIsSaving(false);
    setEditingHousehold(null);
    setSuccessToast(`Data rumah ${editingHousehold.cluster} / ${editingHousehold.block_or_unit} berhasil diperbarui.`);
  }

  function exportRequestsToCSV() {
    if (requests.length === 0) {
      alert("Tidak ada data pendaftaran warga untuk diexport.");
      return;
    }

    const headers = [
      "No",
      "Nama Warga",
      "Email",
      "Nomor WhatsApp",
      "Cluster",
      "Blok / No Rumah",
      "Status Verifikasi",
      "Status Akun Login",
      "Password Sementara",
      "Tanggal Daftar",
      "Tanggal Review",
      "Catatan Pengurus",
    ];

    const rows = requests.map((req, index) => {
      const statusLabel =
        req.status === "approved"
          ? "Disetujui"
          : req.status === "rejected"
            ? "Ditolak"
            : req.status === "cancelled"
              ? "Dibatalkan"
              : "Menunggu Verifikasi";
      const accountStatus = req.status === "approved" ? "Aktif (Disetujui)" : "Terdaftar";
      const tempPassword = "cgv10warga";
      const createdDate = req.created_at ? new Date(req.created_at).toLocaleString("id-ID") : "-";
      const reviewedDate = req.reviewed_at ? new Date(req.reviewed_at).toLocaleString("id-ID") : "-";

      return [
        index + 1,
        `"${(req.display_name || "-").replace(/"/g, '""')}"`,
        `"${(req.email || "-").replace(/"/g, '""')}"`,
        `"${(req.phone || "-").replace(/"/g, '""')}"`,
        `"${(req.cluster || "-").replace(/"/g, '""')}"`,
        `"${(req.block_or_unit || "-").replace(/"/g, '""')}"`,
        `"${statusLabel}"`,
        `"${accountStatus}"`,
        `"${tempPassword}"`,
        `"${createdDate}"`,
        `"${reviewedDate}"`,
        `"${(req.admin_note || "-").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `data-pendaftaran-warga-cgv10-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function removeResident(item: HouseholdRow) {
    if (!canWrite) {
      setMessage("Akun ini belum punya izin menghapus/mengubah warga.");
      return;
    }

    const confirmRemove = window.confirm(
      `Hapus data warga untuk ${item.cluster} / ${item.block_or_unit}? Kontak akan dibersihkan dan status rumah diubah menjadi Pindah.`,
    );
    if (!confirmRemove) return;

    setActionHouseholdId(item.id);
    setMessage("Menghapus data warga...");

    const { error } = await supabase.rpc("remove_resident_from_household", {
      p_household_id: item.id,
      p_reason: "Dihapus dari Admin Data Warga",
    });

    if (error) {
      setMessage(error.message);
      setActionHouseholdId(null);
      return;
    }

    await loadData();
    setMessage("Data warga sudah diremove. Rumah ditandai pindah dan perlu review.");
    setActionHouseholdId(null);
    setSuccessToast("Kontak warga pada rumah berhasil dibersihkan.");
  }

  const activeCount = households.filter((item) => item.occupancy_status === "active").length;
  const removedCount = households.filter((item) => item.occupancy_status === "moved").length;
  const pendingRequests = requests.filter((item) => item.status === "pending_review");
  const approvedRequests = requests.filter((item) => item.status === "approved");
  const rejectedRequests = requests.filter((item) => item.status === "rejected");
  const duplicateRequests = requests.filter((item) => duplicateIds.has(item.id));

  const visibleRequests = useMemo(() => {
    return requests.filter((item) => {
      // Filter by category tab
      if (requestFilter === "pending" && item.status !== "pending_review") return false;
      if (requestFilter === "approved" && item.status !== "approved") return false;
      if (requestFilter === "rejected" && item.status !== "rejected") return false;
      if (requestFilter === "duplicate" && !duplicateIds.has(item.id)) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.display_name?.toLowerCase().includes(query);
        const matchesEmail = item.email?.toLowerCase().includes(query);
        const matchesPhone = item.phone?.toLowerCase().includes(query);
        const matchesCluster = item.cluster?.toLowerCase().includes(query);
        const matchesUnit = item.block_or_unit?.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesCluster || matchesUnit;
      }

      return true;
    });
  }, [requests, requestFilter, searchQuery, duplicateIds]);

  const visibleHouseholds = households.filter((item) => {
    if (householdFilter === "active") return item.occupancy_status === "active";
    if (householdFilter === "removed") return item.occupancy_status === "moved";
    return true;
  });

  const filterLabel =
    householdFilter === "active"
      ? "aktif"
      : householdFilter === "removed"
        ? "pindah/removed"
        : "semua";

  return (
    <ProductionAdminShell
      active="warga"
      title="Data Warga"
      subtitle="Rumah, kontak, status hunian"
      userLabel={user?.email ?? "Admin"}
      roleLabel={roleLabel}
      isSuperAdmin={roleLabel === "super_admin"}
    >
      {/* Success Notification Toast */}
      {successToast ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-900/90 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
            ✓
          </span>
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      ) : null}

      <ProductionPageIntro
        eyebrow="Database warga"
        title="Data rumah & pendaftaran disiapkan sebagai dasar iuran dan layanan."
        text="Gunakan modul ini untuk memverifikasi pendaftaran, mengoreksi data typo/salah, serta menghapus entri pendaftaran ganda (double registration)."
        side={<ProductionStatusPill>{canRead ? "Akses aktif" : "Cek akses"}</ProductionStatusPill>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <ProductionMetricCard label="Rumah Terdata" value={String(households.length)} helper={message} icon="home" />
        <ProductionMetricCard label="Warga Aktif" value={String(activeCount)} helper="Status hunian aktif" icon="users" />
        <ProductionMetricCard
          label="Disetujui"
          value={String(approvedRequests.length)}
          helper={`${approvedRequests.length} akun aktif`}
          icon="shield"
          tone="green"
        />
        <ProductionMetricCard
          label={duplicateRequests.length > 0 ? "Duplikat / Antrean" : "Menunggu Review"}
          value={`${pendingRequests.length}${duplicateRequests.length > 0 ? ` (${duplicateRequests.length} dup)` : ""}`}
          helper={duplicateRequests.length > 0 ? `${duplicateRequests.length} terindikasi dobel` : "Antrean pendaftaran"}
          icon="message"
          tone={duplicateRequests.length > 0 ? "red" : pendingRequests.length > 0 ? "gold" : "green"}
        />
      </div>

      {/* Section 1: Pendaftaran & Data Registrasi Warga */}
      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Data & Pendaftaran Warga"
          subtitle={`Total ${requests.length} pendaftaran terekam (${pendingRequests.length} antrean verifikasi, ${duplicateRequests.length} terindikasi duplikat).`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportRequestsToCSV}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#002b23]/20 bg-[#002b23] px-4 text-xs font-bold text-[#E8C865] shadow-sm transition-all hover:bg-[#00382e] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export CSV ({requests.length})</span>
              </button>
            </div>
          }
        />

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col gap-3 border-t border-border bg-[#f8f6f0] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:thin]">
            {[
              { value: "pending", label: "Menunggu Verifikasi", count: pendingRequests.length, tone: "gold" },
              { value: "approved", label: "Disetujui", count: approvedRequests.length, tone: "green" },
              { value: "duplicate", label: "⚠️ Duplikat", count: duplicateRequests.length, tone: "red" },
              { value: "rejected", label: "Ditolak", count: rejectedRequests.length, tone: "red" },
              { value: "all", label: "Semua Riwayat", count: requests.length, tone: "slate" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRequestFilter(tab.value as RequestFilter)}
                aria-pressed={requestFilter === tab.value}
                className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  requestFilter === tab.value
                    ? "border-primary bg-primary text-accent shadow-sm"
                    : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    requestFilter === tab.value
                      ? "bg-white/12 text-white"
                      : tab.tone === "gold" && tab.count > 0
                        ? "bg-amber-100 text-amber-800"
                        : tab.tone === "red" && tab.count > 0
                          ? "bg-rose-100 text-rose-800 font-bold"
                          : tab.tone === "green" && tab.count > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-primary-soft text-primary"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, WA, email, blok..."
              className="w-full rounded-xl border border-border bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
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
        </div>

        {requestError ? (
          <div className="mx-4 mb-2 mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ⚠ {requestError}
          </div>
        ) : null}

        <div className="divide-y divide-border border-t border-border">
          {visibleRequests.map((request) => {
            const isDuplicate = duplicateIds.has(request.id);
            const dupReason = duplicateReasons.get(request.id);

            return (
              <article
                key={request.id}
                className={`grid gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center transition-colors ${
                  isDuplicate ? "bg-amber-50/40" : "bg-white"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground text-sm sm:text-base">{request.display_name}</p>

                    {request.status === "pending_review" ? (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Menunggu verifikasi
                      </span>
                    ) : request.status === "approved" ? (
                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Disetujui
                      </span>
                    ) : request.status === "rejected" ? (
                      <span className="rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                        Ditolak
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        Dibatalkan
                      </span>
                    )}

                    {isDuplicate ? (
                      <span
                        title={`Pendaftaran ganda terdeteksi: ${dupReason}`}
                        className="rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 flex items-center gap-1"
                      >
                        ⚠️ Double ({dupReason})
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {request.email} • {request.phone}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted/80">
                    Didaftarkan: {formatDate(request.created_at)}
                    {request.reviewed_at ? ` • Ditinjau: ${formatDate(request.reviewed_at)}` : ""}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-[0.12em] text-muted text-[10px]">Rumah yang diajukan</span>
                    {request.matched_household_id ? (
                      <span className="text-[10px] font-bold text-emerald-700">✓ Match Database</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700">⚠ Verifikasi Manual</span>
                    )}
                  </div>
                  <p className="mt-1 font-bold text-foreground text-sm">
                    {request.cluster} / {request.block_or_unit}
                  </p>

                  {request.admin_note ? (
                    <p className="mt-1.5 text-xs text-muted bg-white/70 rounded-lg p-1.5 border border-border/60">
                      <span className="font-semibold text-foreground/80">Catatan:</span> {request.admin_note}
                    </p>
                  ) : null}
                </div>

                {/* Action Buttons: Setujui, Tolak, Edit, Hapus */}
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  {request.status === "pending_review" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void approveRequest(request.id)}
                        disabled={!canWrite || actionRequestId === request.id}
                        className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl bg-primary px-3 text-xs font-bold text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {actionRequestId === request.id ? "Memproses..." : "Setujui"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void rejectRequest(request.id)}
                        disabled={!canWrite || actionRequestId === request.id}
                        className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        Tolak
                      </button>
                    </>
                  ) : null}

                  {/* Tombol Edit Data Warga */}
                  <button
                    type="button"
                    onClick={() => setEditingRequest(request)}
                    disabled={!canWrite}
                    title="Edit data warga / perbaiki salah ketik"
                    className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-xl border border-border bg-white px-3 text-xs font-bold text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>

                  {/* Tombol Hapus Pendaftaran (Untuk Bersihkan Double Registrasi) */}
                  <button
                    type="button"
                    onClick={() => setDeletingRequest(request)}
                    disabled={!canWrite}
                    title="Hapus entri pendaftaran ini (misal pendaftaran dobel)"
                    className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 px-3 text-xs font-bold text-rose-700 transition-all duration-200 hover:bg-rose-100 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Hapus</span>
                  </button>
                </div>
              </article>
            );
          })}

          {visibleRequests.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm font-semibold text-muted">
              {searchQuery ? `Tidak ada hasil pencarian "${searchQuery}".` : "Tidak ada pendaftaran dalam kategori ini."}
            </div>
          ) : null}
        </div>
      </ProductionPanel>

      {/* Section 2: Data Rumah & Kontak Utama */}
      <ProductionPanel className="mt-6">
        <ProductionPanelHeader
          title="Rumah dan Kontak Utama"
          subtitle={`Menampilkan rumah ${filterLabel}. Anda dapat mengedit data rumah/kontak atau meremove penghuni jika pindah.`}
        />
        <div className="flex gap-2 overflow-x-auto border-t border-border bg-[#f8f6f0] px-5 py-3 [scrollbar-width:thin]">
          {[
            { value: "active", label: "Aktif", count: activeCount },
            { value: "removed", label: "Pindah/removed", count: removedCount },
            { value: "all", label: "Semua", count: households.length },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setHouseholdFilter(filter.value as HouseholdFilter)}
              aria-pressed={householdFilter === filter.value}
              className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                householdFilter === filter.value
                  ? "border-primary bg-primary text-accent"
                  : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary"
              }`}
            >
              {filter.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${householdFilter === filter.value ? "bg-white/12 text-white" : "bg-primary-soft text-primary"}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-t border-border text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Rumah</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Akun</th>
                <th className="px-4 py-3">Hunian</th>
                <th className="px-4 py-3">Verifikasi</th>
                <th className="px-4 py-3 text-right">KK</th>
                <th className="px-4 py-3 text-right">Kendaraan</th>
                <th className="px-4 py-3">Update</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleHouseholds.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {item.cluster} / {item.block_or_unit}
                    {item.unit_number ? <span className="ml-1 text-muted">#{item.unit_number}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{item.primary_contact_name || "-"}</p>
                    <p className="mt-0.5 text-xs text-muted">{maskPhone(item.primary_phone)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        item.head_user_id
                          ? "border-primary/20 bg-primary-soft text-primary"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {item.head_user_id ? "Terhubung" : "Belum ada"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{occupancyLabels[item.occupancy_status]}</td>
                  <td className="px-4 py-3">{verificationLabels[item.verification_status]}</td>
                  <td className="px-4 py-3 text-right">{item.family_count}</td>
                  <td className="px-4 py-3 text-right">{item.vehicle_count}</td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(item.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingHousehold(item)}
                        disabled={!canWrite}
                        className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-white px-2.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary disabled:opacity-50"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void removeResident(item)}
                        disabled={!canWrite || !hasResidentData(item) || actionHouseholdId === item.id}
                        className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-bold text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionHouseholdId === item.id ? "..." : "Remove"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleHouseholds.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={9}>
                    {households.length === 0 ? message : `Tidak ada rumah dalam filter ${filterLabel}.`}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ProductionPanel>

      {/* MODAL 1: EDIT REGISTRATION REQUEST */}
      {editingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Pendaftaran Warga</h3>
                <p className="text-xs text-muted">Perbaiki nama, nomor telepon, email, atau status pendaftaran.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRequest(null)}
                className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedRequest} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-foreground">Nama Lengkap Warga</label>
                <input
                  type="text"
                  required
                  value={editingRequest.display_name}
                  onChange={(e) => setEditingRequest({ ...editingRequest, display_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={editingRequest.email}
                    onChange={(e) => setEditingRequest({ ...editingRequest, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={editingRequest.phone}
                    onChange={(e) => setEditingRequest({ ...editingRequest, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Cluster</label>
                  <input
                    type="text"
                    required
                    value={editingRequest.cluster}
                    onChange={(e) => setEditingRequest({ ...editingRequest, cluster: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Blok / No. Rumah</label>
                  <input
                    type="text"
                    required
                    value={editingRequest.block_or_unit}
                    onChange={(e) => setEditingRequest({ ...editingRequest, block_or_unit: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">Status Pendaftaran</label>
                <select
                  value={editingRequest.status}
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      status: e.target.value as RegistrationRequestRow["status"],
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="pending_review">Menunggu Verifikasi (Pending)</option>
                  <option value="approved">Disetujui (Approved)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">Catatan Pengurus / Admin</label>
                <textarea
                  rows={2}
                  value={editingRequest.admin_note || ""}
                  onChange={(e) => setEditingRequest({ ...editingRequest, admin_note: e.target.value })}
                  placeholder="Catatan verifikasi atau riwayat perubahan..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-muted hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-60"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: CONFIRM DELETE REGISTRATION REQUEST (DUPLICATE REMOVAL) */}
      {deletingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-bold text-foreground">Hapus Pendaftaran Warga?</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Entri pendaftaran warga berikut akan dihapus dari sistem. Gunakan opsi ini untuk membersihkan pendaftaran ganda (double registration) atau data fiktif.
            </p>

            <div className="mt-3.5 rounded-xl border border-border bg-surface p-3 text-xs space-y-1">
              <p><span className="font-bold text-foreground">Nama:</span> {deletingRequest.display_name}</p>
              <p><span className="font-bold text-foreground">Email:</span> {deletingRequest.email}</p>
              <p><span className="font-bold text-foreground">WhatsApp:</span> {deletingRequest.phone}</p>
              <p><span className="font-bold text-foreground">Rumah:</span> {deletingRequest.cluster} / {deletingRequest.block_or_unit}</p>
              <p><span className="font-bold text-foreground">Status:</span> {deletingRequest.status}</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRequest(null)}
                className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-muted hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDeleteRequest()}
                disabled={isSaving}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {isSaving ? "Menghapus..." : "Ya, Hapus Pendaftaran"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 3: EDIT HOUSEHOLD */}
      {editingHousehold ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Data Rumah & Kontak</h3>
                <p className="text-xs text-muted">Perbarui data unit rumah, kontak utama, atau status hunian.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingHousehold(null)}
                className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedHousehold} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Cluster</label>
                  <input
                    type="text"
                    required
                    value={editingHousehold.cluster}
                    onChange={(e) => setEditingHousehold({ ...editingHousehold, cluster: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Blok / Unit</label>
                  <input
                    type="text"
                    required
                    value={editingHousehold.block_or_unit}
                    onChange={(e) => setEditingHousehold({ ...editingHousehold, block_or_unit: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">No. Tambahan</label>
                  <input
                    type="text"
                    value={editingHousehold.unit_number || ""}
                    onChange={(e) => setEditingHousehold({ ...editingHousehold, unit_number: e.target.value })}
                    placeholder="Contoh: 12A"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Nama Kontak Utama</label>
                  <input
                    type="text"
                    value={editingHousehold.primary_contact_name || ""}
                    onChange={(e) =>
                      setEditingHousehold({ ...editingHousehold, primary_contact_name: e.target.value })
                    }
                    placeholder="Nama kepala keluarga / kontak"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editingHousehold.primary_phone || ""}
                    onChange={(e) =>
                      setEditingHousehold({ ...editingHousehold, primary_phone: e.target.value })
                    }
                    placeholder="0812..."
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Status Hunian</label>
                  <select
                    value={editingHousehold.occupancy_status}
                    onChange={(e) =>
                      setEditingHousehold({
                        ...editingHousehold,
                        occupancy_status: e.target.value as HouseholdRow["occupancy_status"],
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="active">Aktif (Dihuni)</option>
                    <option value="vacant">Kosong</option>
                    <option value="moved">Pindah</option>
                    <option value="unknown">Belum jelas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Status Verifikasi</label>
                  <select
                    value={editingHousehold.verification_status}
                    onChange={(e) =>
                      setEditingHousehold({
                        ...editingHousehold,
                        verification_status: e.target.value as HouseholdRow["verification_status"],
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="verified">Terverifikasi</option>
                    <option value="review">Review</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Jumlah Jiwa (KK)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingHousehold.family_count}
                    onChange={(e) =>
                      setEditingHousehold({ ...editingHousehold, family_count: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Jumlah Kendaraan</label>
                  <input
                    type="number"
                    min={0}
                    value={editingHousehold.vehicle_count}
                    onChange={(e) =>
                      setEditingHousehold({ ...editingHousehold, vehicle_count: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHousehold(null)}
                  className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-muted hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-60"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan Rumah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </ProductionAdminShell>
  );
}
