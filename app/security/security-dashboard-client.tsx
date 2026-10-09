"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CGV_CLUSTERS } from "@/app/components/searchable-cluster-select";
import { SecurityCameraCapture } from "@/app/components/security-camera-capture";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconCar,
  IconCheck,
  IconClock,
  IconFileText,
  IconHome,
  IconLogOut,
  IconPackage,
  IconPlus,
  IconRadioTower,
  IconRefresh,
  IconScanFace,
  IconSearch,
  IconShield,
  IconShieldCheck,
  IconSliders,
  IconTrash,
  IconUnlock,
  IconUser,
  IconUsers,
  IconWrench,
  IconX,
} from "@/app/components/security-icons";
import {
  calculateVisitDuration,
  compressImageFile,
  formatWibDateOnly,
  formatWibDateTime,
  formatWibTime,
  initialMockVisitorLogs,
  isTodayWib,
  VISIT_TYPE_LABELS,
  VisitorLog,
  VisitorLogFormInput,
  VisitType,
} from "@/lib/security-visitor-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type TabFilter = "active" | "today" | "checked_out" | "all";
type CategoryFilter = "all" | VisitType;

const popularClusters = ["Aurora", "Bukit", "Cendana", "Danau", "Flamboyan"];

const quickPresets: {
  label: string;
  type: VisitType;
  purpose: string;
  institution: string;
  iconKey: "package" | "users" | "wrench";
}[] = [
  { label: "Shopee Express", type: "kurir", purpose: "Antar Paket Shopee", institution: "Shopee Xpress", iconKey: "package" },
  { label: "Gojek / Gofood", type: "kurir", purpose: "Antar Makanan / Dokumen", institution: "Gojek", iconKey: "package" },
  { label: "Grab Instant", type: "kurir", purpose: "Pengantaran GrabExpress", institution: "Grab", iconKey: "package" },
  { label: "Tamu Pribadi", type: "tamu", purpose: "Kunjungan Silaturahmi", institution: "", iconKey: "users" },
  { label: "Teknisi Internet", type: "teknisi", purpose: "Perbaikan Jaringan WiFi / Kabel", institution: "IndiHome / Biznet", iconKey: "wrench" },
  { label: "J&T / SiCepat", type: "kurir", purpose: "Kirim Paket Ekspedisi", institution: "J&T Cargo", iconKey: "package" },
];

const initialFormState: VisitorLogFormInput = {
  visitor_name: "",
  destination_type: "house",
  cluster: "Aurora",
  unit_number: "",
  facility_name: "",
  visit_type: "kurir",
  purpose: "",
  institution: "",
  vehicle_plate: "",
  visitor_photo_file: null,
  visitor_photo_preview: null,
  id_card_photo_file: null,
  id_card_photo_preview: null,
  id_card_required: false,
  notes: "",
};

export function SecurityDashboardClient() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const [logs, setLogs] = useState<VisitorLog[]>(initialMockVisitorLogs);
  const [activeTab, setActiveTab] = useState<TabFilter>("active");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);
  const [form, setForm] = useState<VisitorLogFormInput>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [idCardSignedUrl, setIdCardSignedUrl] = useState<string | null>(null);
  const [isRevealingIdCard, setIsRevealingIdCard] = useState(false);
  const [notification, setNotification] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  // Delete & Demo State
  const [logToDelete, setLogToDelete] = useState<VisitorLog | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Haptic feedback utility
  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 25, 15]);
      } catch {}
    }
  }, []);

  // Live Digital Clock & Date (WIB)
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTimestamp(now.getTime());
      setCurrentTime(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now) + " WIB",
      );
      setCurrentDate(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(now),
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const openDetailModal = useCallback((log: VisitorLog) => {
    setIdCardSignedUrl(null);
    setIsRevealingIdCard(false);
    setSelectedLog(log);
  }, []);

  // Load visitor logs from Supabase
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
        // Ignore fallback
      }
    }

    void fetchLogs();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Refresh logs from Supabase
  const refreshLogs = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("visitor_logs")
        .select("*")
        .order("checked_in_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setLogs(data as VisitorLog[]);
        setNotification({ message: "Data pos berhasil disinkronisasi.", tone: "success" });
      }
    } catch {
      // Ignore
    }
  }, [supabase]);

  const selectedLogId = selectedLog?.id;
  const selectedLogPhotoPath = selectedLog?.visitor_photo_path;

  // Generate short-lived signed URLs for selected log photos
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

  // Explicit action to reveal ID card photo
  async function handleRevealIdCard() {
    if (!selectedLog) return;
    triggerHaptic();
    if (!selectedLog.id_card_photo_path) {
      setNotification({ message: "Tidak ada berkas identitas tersimpan.", tone: "error" });
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
        setNotification({ message: "Gagal memuat dokumen dari vault privat.", tone: "error" });
      } else {
        setIdCardSignedUrl(data.signedUrl);
      }
    } catch {
      setNotification({ message: "Gangguan koneksi ke vault identitas.", tone: "error" });
    } finally {
      setIsRevealingIdCard(false);
    }
  }

  // Check-out visitor (Idempotent)
  async function handleCheckout(visitorId: string, event?: React.MouseEvent) {
    if (event) event.stopPropagation();
    triggerHaptic();
    setCheckoutLoadingId(visitorId);

    const nowIso = new Date().toISOString();
    const officer = "Slamet (Pos Utama)";

    if (supabase) {
      try {
        const { error } = await supabase.rpc("checkout_visitor", {
          p_visitor_id: visitorId,
        });

        if (error) {
          await supabase
            .from("visitor_logs")
            .update({
              status: "checked_out",
              checked_out_at: nowIso,
              checked_out_by_name: officer,
            })
            .eq("id", visitorId);
        }
      } catch {
        // Fallback local
      }
    }

    setLogs((prev) =>
      prev.map((item) => {
        if (item.id === visitorId) {
          if (item.status === "checked_out") return item;
          return {
            ...item,
            status: "checked_out",
            checked_out_at: nowIso,
            checked_out_by_name: officer,
            updated_at: nowIso,
          };
        }
        return item;
      }),
    );

    if (selectedLog?.id === visitorId) {
      setSelectedLog((prev) =>
        prev
          ? {
              ...prev,
              status: "checked_out",
              checked_out_at: prev.checked_out_at || nowIso,
              checked_out_by_name: prev.checked_out_by_name || officer,
            }
          : null,
      );
    }

    setCheckoutLoadingId(null);
    setNotification({ message: "Subjek berhasil dicatat checkout.", tone: "success" });
  }

  // Delete visitor log (individual)
  async function confirmDeleteVisitor() {
    if (!logToDelete) return;
    const targetId = logToDelete.id;
    const targetName = logToDelete.visitor_name;
    setIsDeleting(true);
    triggerHaptic();

    if (supabase) {
      try {
        const { error } = await supabase.rpc("delete_visitor_log", {
          p_visitor_id: targetId,
        });

        if (error) {
          await supabase.from("visitor_logs").delete().eq("id", targetId);
        }
      } catch {
        // Fallback local
      }
    }

    setLogs((prev) => prev.filter((item) => item.id !== targetId));
    if (selectedLog?.id === targetId) {
      setSelectedLog(null);
    }
    setLogToDelete(null);
    setIsDeleting(false);
    setNotification({ message: `Catatan ${targetName} berhasil dihapus.`, tone: "success" });
  }

  // Clear all demo logs
  async function handleClearAllLogs() {
    triggerHaptic();
    if (supabase) {
      try {
        await supabase.from("visitor_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch {}
    }
    setLogs([]);
    setSelectedLog(null);
    setIsResetModalOpen(false);
    setNotification({ message: "Seluruh catatan buku tamu berhasil dikosongkan.", tone: "success" });
  }

  // Restore initial mock demo logs
  function handleRestoreMockLogs() {
    triggerHaptic();
    setLogs(initialMockVisitorLogs);
    setIsResetModalOpen(false);
    setNotification({ message: "Dataset demo awal berhasil dipulihkan.", tone: "success" });
  }

  // Handle Form Submission with idempotency
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    triggerHaptic();

    if (!form.visitor_name.trim()) {
      setSubmitError("Nama pengunjung wajib diisi.");
      return;
    }

    if (form.destination_type === "house") {
      if (!form.cluster) {
        setSubmitError("Silakan pilih cluster/blok tujuan.");
        return;
      }
      if (!form.unit_number.trim()) {
        setSubmitError("Nomor rumah tujuan wajib diisi.");
        return;
      }
    } else {
      if (!form.facility_name.trim()) {
        setSubmitError("Nama fasilitas/area tujuan wajib diisi.");
        return;
      }
    }

    if (!form.purpose.trim()) {
      setSubmitError("Keperluan kunjungan wajib diisi.");
      return;
    }

    if (!form.visitor_photo_preview && !form.visitor_photo_file) {
      setSubmitError("Foto wajah subjek wajib diambil sebelum diverifikasi.");
      return;
    }

    if (form.id_card_required && !form.id_card_photo_preview && !form.id_card_photo_file) {
      setSubmitError("Foto identitas wajib diambil sesuai parameter pos.");
      return;
    }

    setIsSubmitting(true);

    const idempotencyKey = form.idempotency_key || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();
    const officer = "Slamet (Pos Utama)";

    let visitorPhotoPath = form.visitor_photo_preview || "";
    let idCardPhotoPath = form.id_card_photo_preview || "";

    if (supabase) {
      try {
        if (form.visitor_photo_file) {
          const compressed = await compressImageFile(form.visitor_photo_file, 1280, 0.82);
          const path = `visitor-photos/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
          const { error: uploadErr } = await supabase.storage
            .from("security-visitor-attachments")
            .upload(path, compressed, { contentType: "image/jpeg" });

          if (!uploadErr) {
            visitorPhotoPath = path;
          }
        }

        if (form.id_card_photo_file) {
          const compressedId = await compressImageFile(form.id_card_photo_file, 1280, 0.85);
          const path = `id-cards/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
          const { error: uploadErr } = await supabase.storage
            .from("security-visitor-attachments")
            .upload(path, compressedId, { contentType: "image/jpeg" });

          if (!uploadErr) {
            idCardPhotoPath = path;
          }
        }

        const { data, error } = await supabase.rpc("create_visitor_log", {
          p_idempotency_key: idempotencyKey,
          p_visitor_name: form.visitor_name.trim(),
          p_destination_type: form.destination_type,
          p_cluster: form.destination_type === "house" ? form.cluster : "Umum",
          p_unit_number: form.destination_type === "house" ? form.unit_number.trim() : "",
          p_facility_name: form.destination_type !== "house" ? form.facility_name.trim() : "",
          p_visit_type: form.visit_type,
          p_purpose: form.purpose.trim(),
          p_institution: form.institution.trim(),
          p_vehicle_plate: form.vehicle_plate.trim().toUpperCase(),
          p_visitor_photo_path: visitorPhotoPath,
          p_id_card_photo_path: idCardPhotoPath,
          p_id_card_required: form.id_card_required,
          p_notes: form.notes.trim(),
        });

        if (!error && data) {
          const createdLog = data as VisitorLog;
          setLogs((prev) => [createdLog, ...prev.filter((item) => item.id !== createdLog.id)]);
        }
      } catch (err: unknown) {
        console.warn("Supabase save error, retaining in local state:", err);
      }
    }

    const newLog: VisitorLog = {
      id: `SEC-${Date.now().toString().slice(-6)}`,
      idempotency_key: idempotencyKey,
      visitor_name: form.visitor_name.trim(),
      destination_type: form.destination_type,
      cluster: form.destination_type === "house" ? form.cluster : "Umum",
      unit_number: form.destination_type === "house" ? form.unit_number.trim() : "",
      facility_name: form.destination_type !== "house" ? form.facility_name.trim() : "",
      visit_type: form.visit_type,
      purpose: form.purpose.trim(),
      institution: form.institution.trim(),
      vehicle_plate: form.vehicle_plate.trim().toUpperCase(),
      visitor_photo_path: visitorPhotoPath,
      visitor_photo_url: form.visitor_photo_preview,
      id_card_photo_path: idCardPhotoPath,
      id_card_photo_url: form.id_card_photo_preview,
      id_card_required: form.id_card_required,
      notes: form.notes.trim(),
      status: "active",
      checked_in_at: nowIso,
      checked_in_by_name: officer,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setLogs((prev) => [newLog, ...prev.filter((item) => item.id !== newLog.id)]);
    setIsSubmitting(false);
    setIsFormOpen(false);
    setForm(initialFormState);
    setNotification({ message: `Izin akses ${newLog.visitor_name} berhasil diterbitkan.`, tone: "success" });
  }

  function applyPreset(preset: (typeof quickPresets)[number]) {
    triggerHaptic();
    setForm((prev) => ({
      ...prev,
      visit_type: preset.type,
      purpose: preset.purpose,
      institution: preset.institution,
    }));
  }

  // Generate WhatsApp Notification message for residents
  function generateWaUrl(log: VisitorLog) {
    const destination =
      log.destination_type === "house"
        ? `Cluster ${log.cluster} No. ${log.unit_number}`
        : log.facility_name;
    const text = encodeURIComponent(
      `*PEMBERITAHUAN POS SECURITY RT 010 / RW 021*\n\n` +
        `Halo Bapak/Ibu penghuni *${destination}*,\n\n` +
        `Petugas Pos Utama menginformasikan bahwa terdapat tamu/kurir yang baru saja melapor di pos menuju rumah Anda:\n` +
        `• *Nama:* ${log.visitor_name} (${log.institution || VISIT_TYPE_LABELS[log.visit_type]?.label || "Tamu"})\n` +
        `• *Keperluan:* ${log.purpose}\n` +
        `• *Kendaraan/Plat:* ${log.vehicle_plate || "-"}\n` +
        `• *Waktu Masuk:* ${formatWibTime(log.checked_in_at)} WIB\n\n` +
        `Terima kasih atas kerja samanya.\n_Pos Keamanan Cipta Greenville_`,
    );
    return `https://wa.me/?text=${text}`;
  }

  // Calculate detailed stats
  const stats = useMemo(() => {
    const todayLogs = logs.filter((l) => isTodayWib(l.checked_in_at));
    const activeLogs = logs.filter((l) => l.status === "active");
    const checkedOutToday = todayLogs.filter((l) => l.status === "checked_out");

    const kurirActive = activeLogs.filter((l) => l.visit_type === "kurir").length;
    const tamuActive = activeLogs.filter((l) => l.visit_type === "tamu").length;
    const teknisiActive = activeLogs.filter((l) => l.visit_type === "teknisi").length;

    const longVisits = activeLogs.filter((l) => {
      if (!currentTimestamp) return false;
      const durationMs = currentTimestamp - new Date(l.checked_in_at).getTime();
      return durationMs > 3 * 3600 * 1000;
    }).length;

    return {
      totalToday: todayLogs.length,
      activeTotal: activeLogs.length,
      checkedOutToday: checkedOutToday.length,
      kurirActive,
      tamuActive,
      teknisiActive,
      longVisits,
    };
  }, [logs, currentTimestamp]);

  // Filter & search logs
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (activeTab === "active") {
      result = result.filter((l) => l.status === "active");
    } else if (activeTab === "today") {
      result = result.filter((l) => isTodayWib(l.checked_in_at));
    } else if (activeTab === "checked_out") {
      result = result.filter((l) => l.status === "checked_out");
    }

    if (categoryFilter !== "all") {
      result = result.filter((l) => l.visit_type === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((l) => {
        return (
          l.visitor_name.toLowerCase().includes(q) ||
          l.cluster.toLowerCase().includes(q) ||
          l.unit_number.toLowerCase().includes(q) ||
          l.facility_name.toLowerCase().includes(q) ||
          l.vehicle_plate.toLowerCase().includes(q) ||
          l.institution.toLowerCase().includes(q) ||
          l.purpose.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [logs, activeTab, categoryFilter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-foreground pb-28 md:pb-16 font-sans antialiased selection:bg-primary-soft selection:text-primary">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 inset-x-4 max-w-md mx-auto z-50 rounded-2xl p-4 text-xs font-mono font-bold shadow-2xl flex items-center justify-between transition-all ${
            notification.tone === "success"
              ? "bg-primary text-white border border-accent/40 shadow-[0_12px_36px_rgba(0,61,52,0.3)]"
              : "bg-rose-950 text-rose-100 border border-rose-500/50 shadow-[0_12px_36px_rgba(244,63,94,0.3)]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.tone === "success" ? <IconCheck size={18} className="text-accent" /> : <IconAlertTriangle size={18} className="text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white/70 hover:text-white ml-3 cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* Bespoke Header - Live Web Brand Alignment (Deep Emerald Green + Gold Accent) */}
      <header className="sticky top-0 z-30 border-b border-accent/15 bg-primary text-white shadow-lg backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Pos Satpam Insignia & Live Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 border border-white/15 text-accent shadow-sm">
                <IconShieldCheck size={22} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase font-mono text-white">
                  GATEWAY POS UTAMA
                </h1>
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[9px] font-mono font-bold text-accent uppercase tracking-widest border border-accent/40">
                  RT 010
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80 font-medium mt-0.5">
                <span className="inline-flex items-center gap-1.5 text-accent font-mono text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE SEC-OPS
                </span>
                <span className="text-white/30">•</span>
                <span className="font-mono text-accent font-bold text-[11px] tracking-wider" suppressHydrationWarning>
                  {currentTime || "WIB"}
                </span>
                <span className="hidden sm:inline text-white/30">•</span>
                <span className="hidden sm:inline text-white/70 text-[10px] font-mono">
                  {currentDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions for Pengurus / Portal & Reset Demo Data */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                refreshLogs();
              }}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 text-xs font-mono font-bold text-white hover:bg-white/20 transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Sinkronisasi data pos dari server"
            >
              <IconRefresh size={13} className="text-accent" />
              <span className="hidden md:inline">Sync</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setIsResetModalOpen(true);
              }}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-mono font-bold text-white hover:bg-white/20 transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Kelola data demo buku tamu"
            >
              <IconSliders size={13} className="text-accent" />
              <span className="hidden sm:inline">Kelola Demo</span>
            </button>
            <Link
              href="/admin/buku-tamu/"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-accent/40 bg-accent px-3.5 text-xs font-mono font-bold text-primary transition-all hover:bg-accent-soft active:scale-95 shadow-sm"
              title="Buka interface monitor pengurus"
            >
              <span>Audit Pengurus</span>
              <IconArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-3.5 sm:px-4 py-4 space-y-4">
        {/* Tactical Quick Action Dock */}
        <section aria-label="Aksi Cepat Pos" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <IconRadioTower size={12} className="text-primary" />
              <span>TEMPLATES // REGISTRASI CEPAT:</span>
            </span>
            <span className="text-[10px] font-mono text-muted">1-Tap Fast Logging</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setForm({
                    ...initialFormState,
                    visit_type: preset.type,
                    purpose: preset.purpose,
                    institution: preset.institution,
                  });
                  setSubmitError(null);
                  setIsFormOpen(true);
                  triggerHaptic();
                }}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#ded4c4] bg-white p-2.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-[#fdfbf7] active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary border border-primary/20 group-hover:border-primary/50">
                    {preset.iconKey === "package" ? (
                      <IconPackage size={14} />
                    ) : preset.iconKey === "wrench" ? (
                      <IconWrench size={14} />
                    ) : (
                      <IconUsers size={14} />
                    )}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-muted group-hover:text-primary transition-colors">
                    + PASS
                  </span>
                </div>
                <div className="mt-2 font-bold text-xs text-foreground line-clamp-1 group-hover:text-primary">
                  {preset.label}
                </div>
                <div className="text-[10px] font-mono text-muted truncate">
                  {preset.institution || preset.purpose}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Primary Hero Action Button */}
        <section>
          <button
            type="button"
            onClick={() => {
              setForm(initialFormState);
              setSubmitError(null);
              setIsFormOpen(true);
              triggerHaptic();
            }}
            className="group relative w-full min-h-16 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-[#004d42] to-primary p-1 shadow-[0_10px_25px_rgba(0,61,52,0.22)] transition-all hover:shadow-[0_14px_32px_rgba(0,61,52,0.3)] active:scale-[0.99] border border-accent/30"
          >
            <div className="flex h-full w-full items-center justify-between rounded-[14px] bg-primary/80 px-4 sm:px-6 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary shadow-md transition-transform group-hover:scale-105 duration-200">
                  <IconPlus size={24} />
                </span>
                <div className="text-left">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase font-mono">
                    TERBITKAN IZIN MASUK BARU
                  </h2>
                  <p className="text-xs text-accent-soft/85 font-medium">
                    Rekam foto wajah, verifikasi identitas, dan catat kendaraan pengunjung
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 justify-center rounded-xl bg-accent px-4 py-2 text-xs font-mono font-bold text-primary shadow-md group-hover:bg-accent-soft transition-colors">
                <span>AKTIFKAN KAMERA</span>
                <IconArrowRight size={13} />
              </span>
            </div>
          </button>
        </section>

        {/* Tactical Command Matrix (KPI HUD) */}
        <section aria-label="Ringkasan pos keamanan" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Di Lingkungan (FOCAL POINT) */}
          <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-primary via-primary to-[#002d27] p-4 sm:p-5 text-white shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/20 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-accent border border-accent/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE IN-PERIMETER
              </span>
              <span className="text-[10px] font-mono text-accent-soft/70">LIVE SENSORS</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white drop-shadow-sm">
                {stats.activeTotal}
              </p>
              <div className="text-right text-xs font-mono font-medium text-white/90 leading-tight space-y-1">
                <div className="flex items-center justify-end gap-1.5">
                  <IconPackage size={12} className="text-sky-300" />
                  <span>{stats.kurirActive} Kurir</span>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <IconUsers size={12} className="text-accent" />
                  <span>{stats.tamuActive} Tamu</span>
                  <span className="text-white/40">•</span>
                  <IconWrench size={12} className="text-amber-300" />
                  <span>{stats.teknisiActive} Teknisi</span>
                </div>
              </div>
            </div>

            {stats.longVisits > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-mono font-bold text-amber-200 border border-amber-400/40">
                <IconAlertTriangle size={14} className="text-amber-300" />
                <span>{stats.longVisits} subjek berada di dalam &gt; 3 jam</span>
              </div>
            )}
          </div>

          {/* Card 2: Kedatangan Hari Ini */}
          <div className="rounded-2xl border border-[#ded4c4] bg-white p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                THROUGHPUT HARI INI
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary border border-primary/20">
                <IconCheck size={16} />
              </span>
            </div>
            <div className="mt-2">
              <p className="text-3xl sm:text-4xl font-mono font-black text-primary">
                {stats.totalToday}
              </p>
              <p className="mt-0.5 text-xs text-muted font-medium">
                Total entri akses pos gerbang utama
              </p>
            </div>
          </div>

          {/* Card 3: Sudah Keluar */}
          <div className="rounded-2xl border border-[#ded4c4] bg-white p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                DEPARTED // KELUAR
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1eadf] text-muted border border-[#ded4c4]">
                <IconLogOut size={16} />
              </span>
            </div>
            <div className="mt-2">
              <p className="text-3xl sm:text-4xl font-mono font-black text-muted">
                {stats.checkedOutToday}
              </p>
              <p className="mt-0.5 text-xs text-muted font-medium">
                Subjek telah terverifikasi keluar
              </p>
            </div>
          </div>
        </section>

        {/* Tactical Search & Filter Bar */}
        <section className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tamu, blok (mis: Aurora 12), plat nomor, instansi..."
              className="w-full min-h-12 rounded-xl border border-[#ded4c4] bg-white px-4 pl-11 text-xs font-mono font-medium text-foreground placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <IconSearch size={18} />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-[#f1eadf] px-2 py-1 text-[10px] font-mono font-bold text-muted hover:text-foreground cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <nav aria-label="Status Kunjungan" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("active");
                triggerHaptic();
              }}
              className={`min-h-10 flex-1 min-w-[140px] rounded-xl px-4 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "active"
                  ? "bg-primary text-white shadow-md border border-primary"
                  : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Di Lingkungan</span>
              <span className={`rounded px-1.5 py-0.2 text-[10px] ${activeTab === "active" ? "bg-white/20 text-white font-bold" : "bg-[#f1eadf] text-muted"}`}>
                {stats.activeTotal}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("today");
                triggerHaptic();
              }}
              className={`min-h-10 flex-1 min-w-[110px] rounded-xl px-3 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "today"
                  ? "bg-primary text-white shadow-md border border-primary"
                  : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
              }`}
            >
              <span>Hari Ini</span>
              <span className={`rounded px-1.5 py-0.2 text-[10px] ${activeTab === "today" ? "bg-white/20 text-white font-bold" : "bg-[#f1eadf] text-muted"}`}>
                {stats.totalToday}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("checked_out");
                triggerHaptic();
              }}
              className={`min-h-10 flex-1 min-w-[110px] rounded-xl px-3 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "checked_out"
                  ? "bg-primary text-white shadow-md border border-primary"
                  : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
              }`}
            >
              <span>Sudah Keluar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                triggerHaptic();
              }}
              className={`min-h-10 flex-1 min-w-[80px] rounded-xl px-3 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary text-white shadow-md border border-primary"
                  : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
              }`}
            >
              <span>Semua</span>
            </button>
          </nav>

          {/* Subcategory Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            <span className="text-[10px] font-mono text-muted self-center mr-1">TYPE:</span>
            {[
              { key: "all", label: "Semua", icon: null },
              { key: "kurir", label: "Kurir & Paket", icon: <IconPackage size={12} /> },
              { key: "tamu", label: "Tamu Warga", icon: <IconUsers size={12} /> },
              { key: "teknisi", label: "Teknisi", icon: <IconWrench size={12} /> },
              { key: "lainnya", label: "Lainnya", icon: <IconFileText size={12} /> },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.key as CategoryFilter);
                  triggerHaptic();
                }}
                className={`min-h-7 shrink-0 rounded-lg px-2.5 text-[11px] font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === cat.key
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Enhanced Visitor Tactical Cards */}
        <section className="space-y-3" aria-label="Daftar Pengunjung">
          {filteredLogs.length === 0 ? (
            <div className="rounded-2xl border border-[#ded4c4] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary border border-primary/20">
                <IconFileText size={22} />
              </div>
              <h2 className="mt-3 text-sm font-mono font-bold text-foreground uppercase tracking-wider">
                TIDAK ADA DATA KUNJUNGAN
              </h2>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto font-sans">
                {activeTab === "active"
                  ? "Semua pengunjung saat ini sudah keluar dari lingkungan atau belum ada kunjungan baru."
                  : "Coba ubah kata kunci pencarian atau parameter filter."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-mono font-bold text-accent shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <IconPlus size={14} />
                  <span>CATAT PENGUNJUNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreMockLogs}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#ded4c4] bg-[#f1eadf] px-4 text-xs font-mono font-bold text-primary shadow-sm hover:bg-[#e6dccf] transition-all cursor-pointer"
                >
                  <IconRefresh size={13} />
                  <span>MUAT ULANG DATA DEMO</span>
                </button>
              </div>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const typeMeta = VISIT_TYPE_LABELS[log.visit_type] || VISIT_TYPE_LABELS.lainnya;
              const isActive = log.status === "active";
              const isPastDay = !isTodayWib(log.checked_in_at);

              const durationMs = currentTimestamp > 0 ? currentTimestamp - new Date(log.checked_in_at).getTime() : 0;
              const isOverstay = isActive && durationMs > 3 * 3600 * 1000;
              const isMediumStay = isActive && durationMs > 1 * 3600 * 1000 && !isOverstay;

              return (
                <article
                  key={log.id}
                  onClick={() => openDetailModal(log)}
                  className={`group relative cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.99] shadow-sm ${
                    isOverstay
                      ? "border-amber-400 bg-[#fffdfa] ring-1 ring-amber-300"
                      : "border-[#ded4c4]"
                  }`}
                >
                  {/* Top Row: Destination Hero Tag & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Destination Hero Tag */}
                      {log.destination_type === "house" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft border border-primary/20 px-2.5 py-1 text-xs font-mono font-bold text-primary tracking-wide">
                          <IconHome size={13} className="text-primary" />
                          <span>CLUSTER {log.cluster.toUpperCase()} NO. {log.unit_number}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1eadf] border border-[#ded4c4] px-2.5 py-1 text-xs font-mono font-bold text-foreground tracking-wide">
                          <IconBuilding size={13} className="text-muted" />
                          <span>{log.facility_name.toUpperCase()}</span>
                        </span>
                      )}

                      {/* Visit Type Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border ${typeMeta.tone}`}>
                        {typeMeta.iconKey === "package" ? (
                          <IconPackage size={11} />
                        ) : typeMeta.iconKey === "wrench" ? (
                          <IconWrench size={11} />
                        ) : (
                          <IconUsers size={11} />
                        )}
                        <span>{typeMeta.label}</span>
                      </span>

                      {/* Multi-day Alert */}
                      {isPastDay && isActive && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-900 border border-amber-300">
                          OVERNIGHT
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                        DEPARTED
                      </span>
                    )}
                  </div>

                  {/* Middle Row: Visitor Identity, Purpose & Plate */}
                  <div className="flex items-start gap-3.5">
                    {/* Visitor Photo Avatar with clean frame */}
                    <div className="relative shrink-0 overflow-hidden rounded-xl border border-[#ded4c4] bg-[#f8f5f0] h-14 w-14 shadow-sm">
                      {log.visitor_photo_url || log.visitor_photo_path ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={log.visitor_photo_url || log.visitor_photo_path}
                          alt={log.visitor_name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-muted">
                          <IconUser size={22} />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0.5 border border-dashed border-primary/20 rounded-lg" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground truncate leading-snug">
                          {log.visitor_name}
                        </h3>
                        {log.institution && (
                          <span className="rounded bg-sky-50 px-1.5 py-0.2 text-[10px] font-mono font-bold text-sky-800 border border-sky-200 shrink-0">
                            {log.institution}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-muted line-clamp-1">
                        <strong className="font-semibold text-foreground">Keperluan:</strong> {log.purpose}
                      </p>

                      {/* License Plate & Timestamps */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        {log.vehicle_plate && (
                          <span className="inline-flex items-center gap-1 rounded bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                            <IconCar size={11} className="text-primary" />
                            <span className="tracking-wider">{log.vehicle_plate}</span>
                          </span>
                        )}

                        <span className="text-muted flex items-center gap-1">
                          <IconClock size={11} className="text-muted" />
                          <span>{formatWibTime(log.checked_in_at)}</span>
                          {isPastDay ? ` (${formatWibDateOnly(log.checked_in_at)})` : ""}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            isOverstay
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : isMediumStay
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-[#f1eadf] text-muted"
                          }`}
                        >
                          <span>{calculateVisitDuration(log.checked_in_at, log.checked_out_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Tactile Action Buttons & Delete */}
                  <div className="mt-3.5 pt-3 border-t border-[#ded4c4]/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-muted">
                      OFFICER: <strong>{log.checked_in_by_name || "POS UTAMA"}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={generateWaUrl(log)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="min-h-8 cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-xs font-mono font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        title="Kirim pemberitahuan via WhatsApp"
                      >
                        <span>WA Warga</span>
                      </a>

                      {isActive && (
                        <button
                          type="button"
                          onClick={(e) => handleCheckout(log.id, e)}
                          disabled={checkoutLoadingId === log.id}
                          className="min-h-8 cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-mono font-bold text-accent shadow-sm transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                        >
                          <IconLogOut size={13} />
                          <span>{checkoutLoadingId === log.id ? "Memproses..." : "Checkout"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(log);
                        }}
                        className="min-h-8 cursor-pointer inline-flex items-center justify-center gap-1 rounded-lg border border-[#ded4c4] bg-[#f1eadf] px-2.5 text-xs font-mono font-bold text-primary hover:bg-[#e6dccf] transition-colors shadow-sm"
                      >
                        <span>Detail</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogToDelete(log);
                        }}
                        className="min-h-8 w-8 cursor-pointer inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors shadow-sm"
                        title="Hapus data kunjungan ini"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* Arrival Form Modal ("Formulir Pos Jaga") */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[94vh] flex flex-col rounded-3xl bg-[#fdfcf9] border border-[#ded4c4] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-foreground">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-primary text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 border border-white/20 text-accent">
                  <IconScanFace size={22} />
                </span>
                <div>
                  <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-white">FORM REGISTRASI ACCESS PASS</h2>
                  <p className="text-[10px] font-mono text-accent">GATEWAY SEC-OPS // RT 010</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Quick Template Presets Bar */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-primary mb-1.5">
                  TEMPLATES // PRESET CEPAT:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="min-h-8 shrink-0 rounded-lg border border-[#ded4c4] bg-white px-3 text-[11px] font-mono font-medium text-foreground shadow-sm hover:border-primary/50 hover:bg-[#f1eadf] transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Notice */}
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-3 text-[11px] font-mono text-primary leading-relaxed flex items-start gap-2.5">
                <IconShield size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Seluruh citra biometrik dan identitas dienkripsi privat dan diaudit secara legal untuk pos pengamanan RT 010.</span>
              </div>

              {submitError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-mono font-bold text-rose-800 flex items-center gap-2">
                  <IconAlertTriangle size={15} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Nama Pengunjung */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Nama Subjek / Pengunjung <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.visitor_name}
                  onChange={(e) => setForm({ ...form, visitor_name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-4 text-xs font-mono font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
              </div>

              {/* Destination Type Toggle */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Tujuan Lokasi <span className="text-rose-600 font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: "house" });
                      triggerHaptic();
                    }}
                    className={`min-h-11 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      form.destination_type === "house"
                        ? "bg-primary text-white border border-primary shadow-sm"
                        : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
                    }`}
                  >
                    <IconHome size={14} />
                    <span>Rumah Warga</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: "facility" });
                      triggerHaptic();
                    }}
                    className={`min-h-11 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      form.destination_type === "facility"
                        ? "bg-primary text-white border border-primary shadow-sm"
                        : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
                    }`}
                  >
                    <IconBuilding size={14} />
                    <span>Fasilitas / Umum</span>
                  </button>
                </div>
              </div>

              {/* Destination Fields */}
              {form.destination_type === "house" ? (
                <div className="space-y-3 rounded-xl border border-[#ded4c4] bg-white p-3.5 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1.5">
                      Pilih Blok / Cluster:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {popularClusters.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, cluster: c });
                            triggerHaptic();
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                            form.cluster === c
                              ? "bg-primary text-white shadow-sm"
                              : "bg-[#f1eadf] text-primary border border-[#ded4c4] hover:bg-[#e6dccf]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1">
                        Daftar Cluster
                      </label>
                      <select
                        value={form.cluster}
                        onChange={(e) => setForm({ ...form, cluster: e.target.value })}
                        className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-3 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                      >
                        {CGV_CLUSTERS.map((c) => (
                          <option key={c} value={c}>
                            Cluster {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-muted mb-1">
                        Nomor Rumah / Unit <span className="text-rose-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        value={form.unit_number}
                        onChange={(e) => setForm({ ...form, unit_number: e.target.value })}
                        placeholder="Contoh: 12"
                        className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-4 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-foreground mb-1.5">
                    Nama Fasilitas / Area Tujuan <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.facility_name}
                    onChange={(e) => setForm({ ...form, facility_name: e.target.value })}
                    placeholder="Contoh: Balai Warga, Lapangan, Musholla"
                    className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-4 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              )}

              {/* Jenis Kunjungan Buttons */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Kategori Akses <span className="text-rose-600 font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["kurir", "tamu", "teknisi", "lainnya"] as VisitType[]).map((typeKey) => {
                    const item = VISIT_TYPE_LABELS[typeKey];
                    const isSelected = form.visit_type === typeKey;
                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, visit_type: typeKey });
                          triggerHaptic();
                        }}
                        className={`min-h-10 rounded-xl px-2 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white border border-primary shadow-sm"
                            : "bg-white text-muted border border-[#ded4c4] hover:text-foreground hover:bg-[#f1eadf]"
                        }`}
                      >
                        {item.iconKey === "package" ? (
                          <IconPackage size={13} />
                        ) : item.iconKey === "wrench" ? (
                          <IconWrench size={13} />
                        ) : (
                          <IconUsers size={13} />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keperluan */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Keperluan / Deskripsi <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="Contoh: Pengantaran paket kilat, Kunjungan keluarga"
                  className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-4 text-xs font-mono font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Ekspedisi & Plat Nomor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">
                    Instansi / Ekspedisi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    placeholder="Contoh: Shopee, Gojek, PLN"
                    className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-4 text-xs font-mono font-medium text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">
                    Plat Kendaraan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.vehicle_plate}
                    onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value.toUpperCase() })}
                    placeholder="Contoh: BP 1234 XY"
                    className="w-full min-h-11 rounded-xl border border-[#ded4c4] bg-white px-4 text-xs font-mono font-bold text-foreground outline-none focus:border-primary uppercase"
                  />
                </div>
              </div>

              {/* Camera Capture Section */}
              <div className="space-y-4 pt-3 border-t border-[#ded4c4]">
                <SecurityCameraCapture
                  label="Foto Wajah Pengunjung"
                  type="visitor"
                  required
                  initialPreview={form.visitor_photo_preview}
                  onPhotoCaptured={(file, previewUrl) => {
                    setForm((prev) => ({
                      ...prev,
                      visitor_photo_file: file,
                      visitor_photo_preview: previewUrl,
                    }));
                  }}
                  onPhotoCleared={() => {
                    setForm((prev) => ({
                      ...prev,
                      visitor_photo_file: null,
                      visitor_photo_preview: null,
                    }));
                  }}
                />

                <SecurityCameraCapture
                  label="Foto KTP / Kartu Identitas"
                  type="id_card"
                  required={form.id_card_required}
                  initialPreview={form.id_card_photo_preview}
                  onPhotoCaptured={(file, previewUrl) => {
                    setForm((prev) => ({
                      ...prev,
                      id_card_photo_file: file,
                      id_card_photo_preview: previewUrl,
                    }));
                  }}
                  onPhotoCleared={() => {
                    setForm((prev) => ({
                      ...prev,
                      id_card_photo_file: null,
                      id_card_photo_preview: null,
                    }));
                  }}
                />
              </div>

              {/* Catatan Petugas */}
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">
                  Catatan Tambahan Petugas (Internal POS)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Instruksi khusus atau catatan pengamanan..."
                  className="w-full rounded-xl border border-[#ded4c4] bg-white p-3 text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#ded4c4] flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="min-h-11 flex-1 cursor-pointer rounded-xl border border-[#ded4c4] bg-[#f1eadf] text-xs font-mono font-bold text-muted hover:text-foreground transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 flex-1 cursor-pointer rounded-xl bg-primary px-4 text-xs font-mono font-bold text-accent shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <IconShieldCheck size={16} />
                  <span>{isSubmitting ? "MEMPROSES LOG..." : "TERBITKAN ACCESS PASS"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Detail & Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[94vh] flex flex-col rounded-3xl bg-[#fdfcf9] border border-[#ded4c4] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-primary text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-white">GATEWAY ACCESS DOSSIER</h2>
                  {selectedLog.status === "active" ? (
                    <span className="rounded bg-accent/20 border border-accent/40 px-2 py-0.5 text-[9px] font-mono font-bold text-accent uppercase">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="rounded bg-white/10 border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold text-white/80 uppercase">
                      COMPLETED
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono text-accent">PASS ID: {selectedLog.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Destination Hero Banner */}
              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                  VERIFIED DESTINATION PERMIT
                </span>
                <p className="text-lg font-mono font-black text-primary mt-0.5">
                  {selectedLog.destination_type === "house"
                    ? `Cluster ${selectedLog.cluster} No. ${selectedLog.unit_number}`
                    : selectedLog.facility_name}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="rounded bg-white border border-primary/20 px-2 py-0.5 text-[11px] font-mono font-bold text-primary">
                    {VISIT_TYPE_LABELS[selectedLog.visit_type]?.label || "Kunjungan"}
                  </span>
                  {selectedLog.institution && (
                    <span className="text-xs font-mono text-primary font-bold">
                      • {selectedLog.institution}
                    </span>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl border border-[#ded4c4] bg-white p-4 space-y-2.5 text-xs font-mono shadow-sm">
                <div className="flex justify-between py-1 border-b border-[#ded4c4]/60">
                  <span className="text-muted">Nama Subjek</span>
                  <span className="font-bold text-foreground text-sm">{selectedLog.visitor_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ded4c4]/60">
                  <span className="text-muted">Keperluan</span>
                  <span className="font-medium text-foreground text-right max-w-[220px]">{selectedLog.purpose}</span>
                </div>
                {selectedLog.vehicle_plate && (
                  <div className="flex justify-between py-1 border-b border-[#ded4c4]/60 items-center">
                    <span className="text-muted">Plat Nomor</span>
                    <span className="rounded bg-primary-soft px-2 py-0.5 font-bold text-primary text-[11px] border border-primary/20">
                      {selectedLog.vehicle_plate}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-[#ded4c4]/60">
                  <span className="text-muted">Waktu Masuk</span>
                  <span className="font-medium text-foreground">{formatWibDateTime(selectedLog.checked_in_at)}</span>
                </div>
                {selectedLog.checked_out_at && (
                  <div className="flex justify-between py-1 border-b border-[#ded4c4]/60">
                    <span className="text-muted">Waktu Keluar</span>
                    <span className="font-medium text-foreground">{formatWibDateTime(selectedLog.checked_out_at)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-[#ded4c4]/60">
                  <span className="text-muted">Durasi Akses</span>
                  <span className="font-bold text-primary">
                    {calculateVisitDuration(selectedLog.checked_in_at, selectedLog.checked_out_at)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Petugas Jaga</span>
                  <span className="font-medium text-foreground">{selectedLog.checked_in_by_name || "Pos Utama"}</span>
                </div>
              </div>

              {/* WhatsApp Notification Dispatcher Action */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-mono font-bold text-emerald-950 block">Notifikasi WhatsApp Penghuni</span>
                  <span className="text-emerald-800 text-[11px]">Kirim berkas kedatangan ke warga</span>
                </div>
                <a
                  href={generateWaUrl(selectedLog)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-8 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-mono font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <span>KIRIM WA</span>
                </a>
              </div>

              {/* Notes if any */}
              {selectedLog.notes && (
                <div className="rounded-xl border border-[#ded4c4] bg-white p-3 text-xs font-mono shadow-sm">
                  <span className="font-bold text-primary block mb-1">Catatan Khusus Petugas:</span>
                  <p className="text-foreground">{selectedLog.notes}</p>
                </div>
              )}

              {/* Photo Evidence Section */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary block">
                  BUKTI VERIFIKASI OPTIK POS
                </span>

                {/* Visitor Photo */}
                <div className="rounded-xl border border-[#ded4c4] bg-white p-3 shadow-sm">
                  <span className="text-xs font-mono font-bold text-foreground block mb-2">Citra Wajah Pengunjung</span>
                  {selectedLog.visitor_photo_url || selectedLog.visitor_photo_path ? (
                    <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video max-h-52 grid place-items-center border border-[#ded4c4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedLog.visitor_photo_url || selectedLog.visitor_photo_path}
                        alt={`Foto ${selectedLog.visitor_name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg bg-[#f8f5f0] border border-[#ded4c4] grid place-items-center text-xs font-mono text-muted">
                      Foto wajah tidak terlampir
                    </div>
                  )}
                </div>

                {/* ID Card Photo (Encrypted & Protected) */}
                <div className="rounded-xl border border-[#ded4c4] bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-foreground">Dokumen Identitas (KTP / SIM)</span>
                    <span className="text-[9px] font-mono font-bold text-primary bg-primary-soft border border-primary/20 px-2 py-0.5 rounded">
                      AES-256 ENCRYPTED
                    </span>
                  </div>

                  {idCardSignedUrl ? (
                    <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video max-h-52 grid place-items-center border border-[#ded4c4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={idCardSignedUrl}
                        alt="Foto Identitas KTP"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : selectedLog.id_card_photo_path ? (
                    <div className="p-4 rounded-lg bg-[#f8f5f0] border border-dashed border-[#ded4c4] text-center">
                      <p className="text-xs font-mono text-muted mb-3">
                        Dokumen identitas disimpan di vault terenkripsi. Akses memerlukan dekripsi eksplisit.
                      </p>
                      <button
                        type="button"
                        onClick={handleRevealIdCard}
                        disabled={isRevealingIdCard}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-mono font-bold text-accent shadow-md hover:bg-primary-hover transition-all disabled:opacity-50"
                      >
                        {isRevealingIdCard ? (
                          <>
                            <IconRefresh size={13} className="animate-spin" />
                            <span>MENDESKRIPSI DOKUMEN...</span>
                          </>
                        ) : (
                          <>
                            <IconUnlock size={14} />
                            <span>DEKRIPSI DOKUMEN IDENTITAS</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 rounded-lg bg-[#f8f5f0] border border-[#ded4c4] grid place-items-center text-xs font-mono text-muted">
                      Tidak ada foto identitas terlampir (opsional)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action with Delete Button */}
            <div className="p-4 bg-[#f8f5f0] border-t border-[#ded4c4] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="min-h-10 px-4 cursor-pointer rounded-xl border border-[#ded4c4] bg-white text-xs font-mono font-bold text-muted hover:text-foreground shadow-sm"
                >
                  TUTUP
                </button>
                <button
                  type="button"
                  onClick={() => setLogToDelete(selectedLog)}
                  className="min-h-10 px-3.5 cursor-pointer rounded-xl border border-rose-200 bg-rose-50 text-xs font-mono font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <IconTrash size={13} />
                  <span>HAPUS LOG</span>
                </button>
              </div>

              {selectedLog.status === "active" && (
                <button
                  type="button"
                  onClick={() => handleCheckout(selectedLog.id)}
                  disabled={checkoutLoadingId === selectedLog.id}
                  className="min-h-10 px-5 cursor-pointer rounded-xl bg-primary text-accent text-xs font-mono font-bold shadow-md hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <IconLogOut size={14} />
                  <span>{checkoutLoadingId === selectedLog.id ? "MENYIMPAN..." : "CATAT KELUAR"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Individual Log Deletion */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-[#fdfcf9] p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200 text-foreground">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <IconTrash size={22} />
            </div>
            <h3 className="mt-4 text-center text-sm font-mono font-bold uppercase tracking-wider text-rose-950">
              HAPUS CATATAN KUNJUNGAN?
            </h3>
            <p className="mt-2 text-center text-xs text-muted font-sans leading-relaxed">
              Anda akan menghapus entri log pengunjung atas nama <strong className="text-foreground font-bold">{logToDelete.visitor_name}</strong> (Tujuan: {logToDelete.destination_type === "house" ? `Cluster ${logToDelete.cluster} No. ${logToDelete.unit_number}` : logToDelete.facility_name}).
            </p>
            <div className="mt-6 flex gap-3 font-mono">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                disabled={isDeleting}
                className="min-h-10 flex-1 rounded-xl border border-[#ded4c4] bg-white text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={confirmDeleteVisitor}
                disabled={isDeleting}
                className="min-h-10 flex-1 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-lg hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "MENGHAPUS..." : "YA, HAPUS LOG"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage / Reset Demo Data Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-[#fdfcf9] p-6 shadow-2xl border border-[#ded4c4] animate-in fade-in zoom-in-95 duration-200 text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded4c4]">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary border border-primary/20">
                  <IconSliders size={14} />
                </span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">MANAJEMEN DATASET DEMO</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg bg-[#f1eadf] text-muted hover:text-foreground cursor-pointer"
              >
                <IconX size={15} />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted font-sans leading-relaxed">
              Konfigurasi dataset simulasi untuk pengujian fungsionalitas formulir dan monitoring pos keamanan.
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={handleRestoreMockLogs}
                className="w-full min-h-12 flex items-center justify-between rounded-xl border border-primary/20 bg-primary-soft p-3 text-xs font-mono text-left hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary border border-primary/20 shrink-0">
                    <IconRefresh size={15} />
                  </span>
                  <div>
                    <span className="block font-bold text-primary">Muat Ulang Dataset Awal</span>
                    <span className="text-[10px] text-muted font-sans">Pulihkan entri sampel kurir & tamu default</span>
                  </div>
                </div>
                <IconArrowRight size={14} className="text-primary" />
              </button>

              <button
                type="button"
                onClick={handleClearAllLogs}
                className="w-full min-h-12 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-mono text-left hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-rose-600 border border-rose-200 shrink-0">
                    <IconTrash size={15} />
                  </span>
                  <div>
                    <span className="block font-bold text-rose-700">Kosongkan Seluruh Data</span>
                    <span className="text-[10px] text-rose-600/80 font-sans">Bersihkan semua entri untuk pengujian dari 0</span>
                  </div>
                </div>
                <IconArrowRight size={14} className="text-rose-600" />
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-[#ded4c4] text-right">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="min-h-9 px-4 rounded-xl border border-[#ded4c4] bg-white text-xs font-mono font-bold text-muted hover:text-foreground cursor-pointer"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
