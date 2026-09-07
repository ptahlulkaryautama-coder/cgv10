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
type RequestFilter = "pending" | "approved" | "rejected" | "all";
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
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [actionHouseholdId, setActionHouseholdId] = useState<string | null>(null);
  const [householdFilter, setHouseholdFilter] = useState<HouseholdFilter>("active");
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("pending");

  const loadData = useCallback(
    async () => {
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
        { data: requestData, error: requestError },
      ] = await Promise.all([
        supabase
          .from("households")
          .select("id, head_user_id, cluster, block_or_unit, unit_number, primary_contact_name, primary_phone, occupancy_status, verification_status, family_count, vehicle_count, updated_at")
          .order("cluster", { ascending: true })
          .order("block_or_unit", { ascending: true })
          .limit(300),
        supabase
          .from("resident_registration_requests")
          .select("id, email, display_name, phone, cluster, block_or_unit, matched_household_id, status, admin_note, created_at, reviewed_at")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      if (householdError) {
        setMessage(householdError.message);
        return;
      }

      if (requestError) {
        setRequests([]);
      } else {
        const loadedRequests = (requestData ?? []) as RegistrationRequestRow[];
        setRequests(loadedRequests);
      }

      setHouseholds((householdData ?? []) as HouseholdRow[]);
      setMessage(`${householdData?.length ?? 0} rumah terbaca.`);
    },
    [supabase],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  async function approveRequest(requestId: string) {
    if (!canWrite) {
      setRequestError("Akun ini belum punya izin verifikasi warga.");
      return;
    }

    setActionRequestId(requestId);
    setRequestError(null);

    const { data: rpcData, error } = await supabase.rpc("approve_resident_registration_request", {
      p_request_id: requestId,
      p_admin_note: "Disetujui dari Admin Data Warga",
    });

    console.log("[approve_request] rpcData:", rpcData, "error:", error);

    if (error) {
      console.error("[approve_request] FAILED:", error.code, error.message, error.details, error.hint);
      setRequestError(`Gagal approve: ${error.message}`);
      setActionRequestId(null);
      return;
    }

    await loadData();
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
    setActionRequestId(null);
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
  }

  const activeCount = households.filter((item) => item.occupancy_status === "active").length;
  const removedCount = households.filter((item) => item.occupancy_status === "moved").length;
  const pendingRequests = requests.filter((item) => item.status === "pending_review");
  const approvedRequests = requests.filter((item) => item.status === "approved");
  const rejectedRequests = requests.filter((item) => item.status === "rejected");
  const visibleRequests = requests.filter((item) => {
    if (requestFilter === "pending") return item.status === "pending_review";
    if (requestFilter === "approved") return item.status === "approved";
    if (requestFilter === "rejected") return item.status === "rejected";
    return true;
  });

  const visibleHouseholds = households.filter((item) => {
    if (householdFilter === "active") return item.occupancy_status === "active";
    if (householdFilter === "removed") return item.occupancy_status === "moved";
    return true;
  });
  const filterLabel = householdFilter === "active"
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
      <ProductionPageIntro
        eyebrow="Database warga"
        title="Data rumah disiapkan sebagai dasar iuran dan layanan."
        text="Gunakan modul ini sebagai daftar operasional internal. Kontak warga ditampilkan terbatas dan tidak dipublikasikan."
        side={<ProductionStatusPill>{canRead ? "Akses aktif" : "Cek akses"}</ProductionStatusPill>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <ProductionMetricCard label="Rumah" value={String(households.length)} helper={message} icon="home" />
        <ProductionMetricCard label="Aktif" value={String(activeCount)} helper="Status hunian aktif" icon="users" />
        <ProductionMetricCard label="Disetujui" value={String(approvedRequests.length)} helper={`${approvedRequests.length} pendaftaran disetujui`} icon="shield" tone="green" />
        <ProductionMetricCard
          label="Menunggu"
          value={String(pendingRequests.length)}
          helper="Pendaftaran antrean baru"
          icon="message"
          tone={pendingRequests.length > 0 ? "gold" : "green"}
        />
      </div>

      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Data & Pendaftaran Warga"
          subtitle={`Total ${requests.length} pendaftaran terekam di sistem (${pendingRequests.length} antrean menunggu verifikasi).`}
          action={
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
              <span>Export ke Excel / CSV ({requests.length})</span>
            </button>
          }
        />

        {/* Filter Tabs Pendaftaran Warga */}
        <div className="flex gap-2 overflow-x-auto border-t border-border bg-[#f8f6f0] px-5 py-3 [scrollbar-width:thin]">
          {[
            { value: "pending", label: "Menunggu Verifikasi", count: pendingRequests.length, tone: "gold" },
            { value: "approved", label: "Disetujui", count: approvedRequests.length, tone: "green" },
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
                  ? "border-primary bg-primary text-accent"
                  : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                requestFilter === tab.value
                  ? "bg-white/12 text-white"
                  : tab.tone === "gold" && tab.count > 0
                    ? "bg-amber-100 text-amber-800"
                    : tab.tone === "green" && tab.count > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-primary-soft text-primary"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {requestError ? (
          <div className="mx-4 mb-2 mt-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ⚠ {requestError}
          </div>
        ) : null}

        <div className="divide-y divide-border border-t border-border">
          {visibleRequests.map((request) => (
            <article key={request.id} className="grid gap-3 bg-white px-4 py-4 lg:grid-cols-[1.1fr_0.8fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{request.display_name}</p>
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
                  ) : (
                    <span className="rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                      Ditolak
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-muted">{request.email} - {maskPhone(request.phone)}</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Rumah yang diajukan</p>
                <p className="mt-1 font-semibold text-foreground">{request.cluster} / {request.block_or_unit}</p>
                
                {request.status === "pending_review" ? (
                  <p className={`mt-1 text-xs font-semibold ${request.matched_household_id ? "text-green-700" : "text-amber-600"}`}>
                    {request.matched_household_id ? "✓ Rumah cocok otomatis" : "⚠ Cek manual — blok & nomor perlu diverifikasi"}
                  </p>
                ) : request.status === "approved" ? (
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    ✓ Akses warga sudah aktif
                  </p>
                ) : null}

                {request.admin_note ? (
                  <p className="mt-1 text-xs leading-5 text-muted bg-white/60 rounded px-2 py-0.5 border border-border/40">
                    Catatan: {request.admin_note}
                  </p>
                ) : null}
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                  <span>Daftar: {formatDate(request.created_at)}</span>
                  {request.reviewed_at && <span>Review: {formatDate(request.reviewed_at)}</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {request.status === "pending_review" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void approveRequest(request.id)}
                      disabled={!canWrite || actionRequestId === request.id}
                      title={!request.matched_household_id ? "Rumah belum cocok otomatis — pastikan blok dan nomor benar sebelum menyetujui" : undefined}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {actionRequestId === request.id ? "Memproses..." : "Setujui"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void rejectRequest(request.id)}
                      disabled={!canWrite || actionRequestId === request.id}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      Tolak
                    </button>
                  </>
                ) : request.status === "approved" ? (
                  <span className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
                    ✓ Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700">
                    ✕ Ditolak
                  </span>
                )}
              </div>
            </article>
          ))}

          {visibleRequests.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm font-semibold text-muted">
              Tidak ada pendaftaran dalam kategori ini.
            </p>
          ) : null}
        </div>
      </ProductionPanel>

      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Rumah dan kontak utama"
          subtitle={`Menampilkan rumah ${filterLabel}. Remove warga akan membersihkan kontak dan memindahkan baris ke filter Pindah/removed.`}
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
                <tr key={item.id} className="bg-white">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {item.cluster} / {item.block_or_unit}
                    {item.unit_number ? <span className="ml-1 text-muted">#{item.unit_number}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{item.primary_contact_name || "-"}</p>
                    <p className="mt-1 text-xs text-muted">{maskPhone(item.primary_phone)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                      item.head_user_id
                        ? "border-primary/20 bg-primary-soft text-primary"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}>
                      {item.head_user_id ? "Terhubung" : "Belum ada"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{occupancyLabels[item.occupancy_status]}</td>
                  <td className="px-4 py-3">{verificationLabels[item.verification_status]}</td>
                  <td className="px-4 py-3 text-right">{item.family_count}</td>
                  <td className="px-4 py-3 text-right">{item.vehicle_count}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(item.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void removeResident(item)}
                      disabled={!canWrite || !hasResidentData(item) || actionHouseholdId === item.id}
                      className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      {actionHouseholdId === item.id ? "Memproses..." : "Remove"}
                    </button>
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
    </ProductionAdminShell>
  );
}
