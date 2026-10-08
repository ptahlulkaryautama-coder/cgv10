"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CGV_CLUSTERS } from "@/app/components/searchable-cluster-select";
import {
  IconCar,
  IconCheck,
  IconFileText,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconSliders,
  IconTrash,
  IconUnlock,
  IconUsers,
  IconWrench,
  IconX,
} from "@/app/components/security-icons";
import {
  calculateVisitDuration,
  formatWibDateTime,
  formatWibTime,
  initialMockVisitorLogs,
  isTodayWib,
  VISIT_TYPE_LABELS,
  VisitorLog,
  VisitType,
} from "@/lib/security-visitor-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
} from "../production-admin-components";

type DateRangeFilter = "today" | "7days" | "30days" | "all";
type StatusFilter = "all" | "active" | "checked_out";
type TypeFilter = "all" | VisitType;

export function VisitorLogAdminClient() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const [logs, setLogs] = useState<VisitorLog[]>(initialMockVisitorLogs);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);
  const [idCardSignedUrl, setIdCardSignedUrl] = useState<string | null>(null);
  const [isRevealingIdCard, setIsRevealingIdCard] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete & Demo State
  const [logToDelete, setLogToDelete] = useState<VisitorLog | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all");
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const openDetailModal = useCallback((log: VisitorLog) => {
    setIdCardSignedUrl(null);
    setIsRevealingIdCard(false);
    setSelectedLog(log);
  }, []);

  // Load logs from Supabase
  useEffect(() => {
    let mounted = true;
    if (!supabase) return;

    async function fetchLogs() {
      try {
        const { data, error } = await supabase!
          .from("visitor_logs")
          .select("*")
          .order("checked_in_at", { ascending: false });

        if (mounted && !error && data && data.length > 0) {
          setLogs(data as VisitorLog[]);
        }
      } catch {
        // Fallback to local
      }
    }

    void fetchLogs();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const refreshData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("visitor_logs")
        .select("*")
        .order("checked_in_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setLogs(data as VisitorLog[]);
        setToastMessage("Data buku tamu berhasil disinkronkan.");
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const selectedLogId = selectedLog?.id;
  const selectedLogPhotoPath = selectedLog?.visitor_photo_path;

  // Load visitor photo signed URL when item selected
  useEffect(() => {
    if (!selectedLogId || !selectedLogPhotoPath || !supabase) return;

    let active = true;

    async function loadPhoto() {
      if (
        !selectedLogPhotoPath ||
        selectedLogPhotoPath.startsWith("blob:") ||
        selectedLogPhotoPath.startsWith("visitor-photos/demo-")
      ) {
        return;
      }

      try {
        const { data } = await supabase!.storage
          .from("security-visitor-attachments")
          .createSignedUrl(selectedLogPhotoPath, 600);

        if (active && data?.signedUrl) {
          setSelectedLog((prev) => (prev && prev.id === selectedLogId ? { ...prev, visitor_photo_url: data.signedUrl } : prev));
        }
      } catch {
        // Ignore
      }
    }

    void loadPhoto();

    return () => {
      active = false;
    };
  }, [selectedLogId, selectedLogPhotoPath, supabase]);

  // Reveal ID card photo
  async function handleRevealIdCard() {
    if (!selectedLog) return;
    if (!selectedLog.id_card_photo_path) {
      setToastMessage("Tidak ada dokumen identitas untuk kunjungan ini.");
      return;
    }

    if (selectedLog.id_card_photo_path.startsWith("blob:")) {
      setIdCardSignedUrl(selectedLog.id_card_photo_path);
      return;
    }

    if (!supabase) {
      setIdCardSignedUrl("/assets/brand/official-cgv-logo-trimmed.png");
      return;
    }

    setIsRevealingIdCard(true);
    try {
      const { data, error } = await supabase.storage
        .from("security-visitor-attachments")
        .createSignedUrl(selectedLog.id_card_photo_path, 300);

      if (error || !data?.signedUrl) {
        setToastMessage("Gagal memuat dokumen dari vault privat.");
      } else {
        setIdCardSignedUrl(data.signedUrl);
      }
    } catch {
      setToastMessage("Terjadi gangguan saat dekripsi dokumen.");
    } finally {
      setIsRevealingIdCard(false);
    }
  }

  // Delete visitor log (individual)
  async function confirmDeleteVisitor() {
    if (!logToDelete) return;
    const targetId = logToDelete.id;
    const targetName = logToDelete.visitor_name;
    setIsDeleting(true);

    if (supabase) {
      try {
        const { error } = await supabase.rpc("delete_visitor_log", {
          p_visitor_id: targetId,
        });

        if (error) {
          await supabase.from("visitor_logs").delete().eq("id", targetId);
        }
      } catch {
        // Fallback local delete
      }
    }

    setLogs((prev) => prev.filter((item) => item.id !== targetId));
    if (selectedLog?.id === targetId) {
      setSelectedLog(null);
    }
    setLogToDelete(null);
    setIsDeleting(false);
    setToastMessage(`Log kunjungan ${targetName} berhasil dihapus.`);
  }

  // Clear all demo logs
  async function handleClearAllLogs() {
    if (supabase) {
      try {
        await supabase.from("visitor_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch {}
    }
    setLogs([]);
    setSelectedLog(null);
    setIsResetModalOpen(false);
    setToastMessage("Semua data log kunjungan berhasil dikosongkan.");
  }

  // Restore initial mock demo logs
  function handleRestoreMockLogs() {
    setLogs(initialMockVisitorLogs);
    setIsResetModalOpen(false);
    setToastMessage("Data demo awal berhasil dimuat kembali.");
  }

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Date filter
      if (dateFilter === "today") {
        if (!isTodayWib(log.checked_in_at)) return false;
      } else if (dateFilter === "7days") {
        const itemDate = new Date(log.checked_in_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (itemDate < sevenDaysAgo) return false;
      } else if (dateFilter === "30days") {
        const itemDate = new Date(log.checked_in_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (itemDate < thirtyDaysAgo) return false;
      }

      // Cluster filter
      if (clusterFilter !== "all" && log.cluster.toLowerCase() !== clusterFilter.toLowerCase()) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && log.visit_type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          log.visitor_name.toLowerCase().includes(q) ||
          log.cluster.toLowerCase().includes(q) ||
          log.unit_number.toLowerCase().includes(q) ||
          log.facility_name.toLowerCase().includes(q) ||
          log.vehicle_plate.toLowerCase().includes(q) ||
          log.institution.toLowerCase().includes(q) ||
          log.purpose.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [logs, dateFilter, clusterFilter, typeFilter, statusFilter, searchQuery]);

  // Paginated dataset
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

  // Overview metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const active = logs.filter((l) => l.status === "active").length;
    const kurir = logs.filter((l) => l.visit_type === "kurir").length;
    const tamu = logs.filter((l) => l.visit_type === "tamu").length;
    const teknisi = logs.filter((l) => l.visit_type === "teknisi").length;

    return { total, active, kurir, tamu, teknisi };
  }, [logs]);

  return (
    <ProductionAdminShell
      active="buku-tamu"
      title="Buku Tamu Security"
      subtitle="Riwayat & Monitoring Kunjungan Pos Keamanan"
      userLabel="Pengurus RT 010"
      roleLabel="Otorisasi Pengurus"
      isSuperAdmin={true}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-3 text-xs font-mono font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <IconSliders size={13} className="text-slate-600" />
            <span>Kelola Demo</span>
          </button>
          <Link
            href="/security/"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[10px] bg-primary px-3 text-xs font-mono font-bold text-accent shadow-sm hover:bg-primary/90 transition-colors"
          >
            <span>Buka Dashboard Pos</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      }
    >
      <ProductionPageIntro
        eyebrow="Keamanan & Ketertiban"
        title="Buku Tamu & Log Pengunjung Pos Security"
        text="Pantau seluruh riwayat akses warga, kurir logistik, tamu pribadi, dan teknisi vendor yang masuk ke lingkungan RT 010 / RW 021 Cipta Greenville."
      />

      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 rounded-xl bg-slate-900 p-3 text-xs font-mono font-bold text-emerald-400 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCheck size={16} />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <IconX size={15} />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <ProductionMetricCard
          label="Total Kunjungan"
          value={String(metrics.total)}
          helper="Semua catatan pos"
          icon="shield"
          tone="green"
        />
        <ProductionMetricCard
          label="Sedang Aktif"
          value={String(metrics.active)}
          helper="Masih di lingkungan"
          icon="home"
          tone="gold"
        />
        <ProductionMetricCard
          label="Kurir & Paket"
          value={String(metrics.kurir)}
          helper="Pengantaran barang"
          icon="briefcase"
          tone="blue"
        />
        <ProductionMetricCard
          label="Tamu & Teknisi"
          value={String(metrics.tamu + metrics.teknisi)}
          helper="Warga & perbaikan"
          icon="users"
          tone="green"
        />
      </section>

      {/* Main Panel */}
      <ProductionPanel>
        <ProductionPanelHeader
          title="Riwayat Kunjungan Pengunjung"
          subtitle={`Menampilkan ${filteredLogs.length} dari ${logs.length} total catatan buku tamu`}
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-3 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <IconSliders size={13} />
                <span>Kelola Demo</span>
              </button>
              <button
                type="button"
                onClick={refreshData}
                disabled={loading}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[10px] border border-black/10 bg-white px-3 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <IconRefresh size={13} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Memuat..." : "Segarkan Data"}</span>
              </button>
            </div>
          }
        />

        {/* Filter Toolbar */}
        <div className="border-t border-black/8 bg-slate-50/60 p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Pencarian
              </label>
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Nama, blok/Aurora, plat, no. rumah..."
                  className="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 pl-9 text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconSearch size={15} />
                </div>
              </div>
            </div>

            {/* Date Preset */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Rentang Waktu
              </label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as DateRangeFilter);
                  setCurrentPage(1);
                }}
                className="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini Saja</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
              </select>
            </div>

            {/* Cluster Filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Blok / Cluster
              </label>
              <select
                value={clusterFilter}
                onChange={(e) => {
                  setClusterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary"
              >
                <option value="all">Semua Cluster</option>
                {CGV_CLUSTERS.map((c) => (
                  <option key={c} value={c}>
                    Cluster {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Jenis
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as TypeFilter);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary"
                >
                  <option value="all">Semua</option>
                  <option value="kurir">Kurir</option>
                  <option value="tamu">Tamu</option>
                  <option value="teknisi">Teknisi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary"
                >
                  <option value="all">Semua</option>
                  <option value="active">Di Lingkungan</option>
                  <option value="checked_out">Sudah Keluar</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table View on Desktop / Cards on Mobile */}
        <div className="overflow-x-auto">
          {paginatedLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400 mb-2">
                <IconFileText size={24} />
              </div>
              <p className="mt-2 text-sm font-mono font-bold text-slate-800 uppercase tracking-wider">
                TIDAK ADA DATA KUNJUNGAN YANG SESUAI
              </p>
              <p className="mt-1 text-xs text-slate-400 mb-4 font-sans">
                Coba atur ulang pencarian atau muat ulang data demo.
              </p>
              <button
                type="button"
                onClick={handleRestoreMockLogs}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-mono font-bold text-accent shadow-sm hover:bg-primary/90 transition-colors"
              >
                <IconRefresh size={13} />
                <span>Muat Ulang Data Demo</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/8 bg-slate-50/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Pengunjung</th>
                  <th className="py-3.5 px-4">Tujuan</th>
                  <th className="py-3.5 px-4">Jenis & Keperluan</th>
                  <th className="py-3.5 px-4">Waktu Masuk / Keluar</th>
                  <th className="py-3.5 px-4">Durasi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paginatedLogs.map((log) => {
                  const typeMeta = VISIT_TYPE_LABELS[log.visit_type] || VISIT_TYPE_LABELS.lainnya;
                  const isActive = log.status === "active";

                  return (
                    <tr
                      key={log.id}
                      onClick={() => openDetailModal(log)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.visitor_name}</div>
                        {log.vehicle_plate && (
                          <span className="font-mono text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <IconCar size={11} />
                            <span>{log.vehicle_plate}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {log.destination_type === "house" ? (
                          <div>
                            <span className="font-bold text-emerald-950">
                              Cluster {log.cluster}
                            </span>
                            <span className="block text-slate-500 font-medium">
                              No. {log.unit_number}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-700">
                            {log.facility_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${typeMeta.tone}`}>
                            {typeMeta.iconKey === "package" ? (
                              <IconPackage size={10} />
                            ) : typeMeta.iconKey === "wrench" ? (
                              <IconWrench size={10} />
                            ) : (
                              <IconUsers size={10} />
                            )}
                            <span>{typeMeta.label}</span>
                          </span>
                          {log.institution && (
                            <span className="text-[10px] text-slate-500 font-mono font-semibold">
                              • {log.institution}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 truncate max-w-xs text-xs">{log.purpose}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        <div className="font-semibold text-slate-900">
                          {formatWibDateTime(log.checked_in_at)}
                        </div>
                        {log.checked_out_at && (
                          <div className="text-[10px] text-slate-500">
                            Keluar: {formatWibTime(log.checked_out_at)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {calculateVisitDuration(log.checked_in_at, log.checked_out_at)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 border border-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Di Lingkungan
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                            Sudah Keluar
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(log);
                            }}
                            className="min-h-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogToDelete(log);
                            }}
                            title="Hapus Catatan Ini"
                            className="min-h-8 w-8 inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/8 p-4 bg-slate-50/40 font-mono">
            <span className="text-xs text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="min-h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </ProductionPanel>

      {/* Detail Modal / Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-[#fdfcf9] border border-black/10 shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 bg-primary text-white">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">DOSSIER KUNJUNGAN (AUDIT PENGURUS)</h3>
                <p className="text-[10px] font-mono text-white/70">ID: {selectedLog.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <IconX size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 font-mono">
              {/* Destination Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Tujuan Kunjungan
                </span>
                <p className="text-lg font-black text-emerald-950 mt-0.5">
                  {selectedLog.destination_type === "house"
                    ? `Cluster ${selectedLog.cluster} No. ${selectedLog.unit_number}`
                    : selectedLog.facility_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-emerald-900">
                    Kategori: {VISIT_TYPE_LABELS[selectedLog.visit_type]?.label || "Kunjungan"}
                  </span>
                  {selectedLog.status === "active" ? (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Aktif di Lingkungan
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      Sudah Keluar
                    </span>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Nama Pengunjung</span>
                  <span className="font-bold text-slate-900">{selectedLog.visitor_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Keperluan</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[220px]">{selectedLog.purpose}</span>
                </div>
                {selectedLog.institution && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Perusahaan / Ekspedisi</span>
                    <span className="font-bold text-slate-900">{selectedLog.institution}</span>
                  </div>
                )}
                {selectedLog.vehicle_plate && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Plat Kendaraan</span>
                    <span className="font-mono font-bold text-slate-900">{selectedLog.vehicle_plate}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Waktu Masuk</span>
                  <span className="font-semibold text-slate-900">{formatWibDateTime(selectedLog.checked_in_at)}</span>
                </div>
                {selectedLog.checked_out_at && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Waktu Keluar</span>
                    <span className="font-semibold text-slate-900">{formatWibDateTime(selectedLog.checked_out_at)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Durasi</span>
                  <span className="font-bold text-emerald-800">{calculateVisitDuration(selectedLog.checked_in_at, selectedLog.checked_out_at)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Petugas Masuk</span>
                  <span className="font-medium text-slate-700">{selectedLog.checked_in_by_name}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedLog.notes && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Catatan Internal Petugas:</span>
                  <p className="text-slate-600">{selectedLog.notes}</p>
                </div>
              )}

              {/* Photos */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  DOKUMENTASI FOTO POS
                </span>

                {/* Visitor Photo */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <span className="text-xs font-mono font-bold text-slate-800 block mb-2">Foto Wajah Pengunjung</span>
                  {selectedLog.visitor_photo_url || selectedLog.visitor_photo_path ? (
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video max-h-48 grid place-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedLog.visitor_photo_url || selectedLog.visitor_photo_path}
                        alt={`Foto ${selectedLog.visitor_name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-slate-100 grid place-items-center text-xs text-slate-400 font-mono">
                      Foto tidak tersedia
                    </div>
                  )}
                </div>

                {/* ID Card Photo */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-800">Foto Identitas (KTP/SIM)</span>
                    <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      AES-256 PRIVAT
                    </span>
                  </div>

                  {idCardSignedUrl ? (
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video max-h-48 grid place-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={idCardSignedUrl}
                        alt="Foto Identitas KTP"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : selectedLog.id_card_photo_path ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                      <p className="text-xs font-mono text-slate-600 mb-3">
                        Dokumen identitas disimpan di vault privat.
                      </p>
                      <button
                        type="button"
                        onClick={handleRevealIdCard}
                        disabled={isRevealingIdCard}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-mono font-bold text-accent shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <IconUnlock size={14} />
                        <span>{isRevealingIdCard ? "Mendeskripsi Berkas..." : "Buka Foto Identitas"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 rounded-xl bg-slate-100 grid place-items-center text-xs text-slate-400 font-mono">
                      Tidak ada foto identitas untuk kunjungan ini
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-mono">
              <button
                type="button"
                onClick={() => setLogToDelete(selectedLog)}
                className="min-h-10 px-4 cursor-pointer rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <IconTrash size={13} />
                <span>Hapus Log Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="min-h-10 px-5 cursor-pointer rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Log */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#fdfcf9] border border-black/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 border border-rose-200">
                <IconTrash size={18} />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">Hapus Catatan Kunjungan?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus data buku tamu atas nama{" "}
              <strong className="text-slate-900 font-bold">{logToDelete.visitor_name}</strong> (Tujuan: {logToDelete.destination_type === "house" ? `Cluster ${logToDelete.cluster} No. ${logToDelete.unit_number}` : logToDelete.facility_name})?
            </p>

            <div className="flex gap-2 pt-2 font-mono">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                disabled={isDeleting}
                className="flex-1 min-h-10 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteVisitor}
                disabled={isDeleting}
                className="flex-1 min-h-10 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kelola & Reset Demo Data */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#fdfcf9] border border-black/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  <IconSliders size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">Kelola Data Demo</h3>
                  <p className="text-[10px] font-mono text-slate-500">Pilihan manajemen dataset buku tamu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center cursor-pointer"
              >
                <IconX size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Dashboard ini saat ini menggunakan dataset contoh/demo. Anda dapat mengembalikan data simulasi awal atau mengosongkan seluruh catatan untuk pengujian formulir baru.
            </p>

            <div className="space-y-2.5 pt-1 font-mono">
              <button
                type="button"
                onClick={handleRestoreMockLogs}
                className="w-full min-h-12 p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 transition-all text-left flex items-start gap-3 cursor-pointer"
              >
                <IconRefresh size={18} className="text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">Muat Ulang Data Demo Awal</div>
                  <div className="text-[10px] text-emerald-800 font-sans">
                    Mengembalikan 6 catatan simulasi (kurir Shopee, Gojek, tamu warga Aurora & Bukit, teknisi Telkom).
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleClearAllLogs}
                className="w-full min-h-12 p-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100/80 transition-all text-left flex items-start gap-3 cursor-pointer"
              >
                <IconTrash size={18} className="text-rose-800 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-rose-950">Kosongkan Semua Data</div>
                  <div className="text-[10px] text-rose-800 font-sans">
                    Menghapus seluruh entri kunjungan agar dashboard bersih untuk input uji coba dari awal.
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-end font-mono">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="min-h-9 px-4 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </ProductionAdminShell>
  );
}
