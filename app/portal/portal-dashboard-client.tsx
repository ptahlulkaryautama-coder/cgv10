"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PortalSplashScreen } from "./portal-splash-screen";
import { ResidentIdCardMini } from "./components/resident-id-card-modal";
import { type DuesHistoryRecapRow } from "./components/dues-history-modal";
import { type ReceiptData } from "./components/receipt-modal";

type DbNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

type PortalNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  unread: boolean;
  link?: string;
};

function notifTypeIcon(type: string): string {
  switch (type) {
    case "registration_approved": return "✅";
    case "registration_rejected": return "❌";
    case "service_request_updated": return "📋";
    case "palugada_approved": return "🏪";
    case "palugada_rejected": return "🚫";
    default: return "🔔";
  }
}

function notifEntityLink(type: string, entityId: string | null): string | undefined {
  if (!entityId) return undefined;
  switch (type) {
    case "registration_approved":
    case "registration_rejected":
      return "/portal/profil-rumah/";
    case "service_request_updated":
      return "/layanan/";
    case "palugada_approved":
    case "palugada_rejected":
      return "/palugada/";
    default:
      return undefined;
  }
}

function formatNotifTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(isoString));
}

function dbNotifToPortal(n: DbNotification): PortalNotification {
  return {
    id: n.id,
    title: n.title,
    message: n.body,
    time: formatNotifTime(n.created_at),
    type: n.type,
    unread: !n.is_read,
    link: notifEntityLink(n.type, n.entity_id),
  };
}

type PortalUser = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  blockAddress?: string;
  registrationCluster?: string;
  registrationBlock?: string;
};

type RoleRow = { role: string };

const adminRoles = new Set([
  "super_admin",
  "ketua_rt",
  "sekretaris",
  "bendahara",
  "palugada_reviewer",
  "admin_support_1",
  "admin_support_2",
  "admin_support_3",
  "admin_support_4",
  "admin_support_5",
]);

const knownPengurusEmails = new Set([
  "dharma.doddy9@yahoo.co.uk",
  "zulhendy@gmail.com",
  "nikodiponako7@gmail.com",
]);

export type DuesStatusInfo = {
  status: "lunas" | "pending" | "unpaid" | "no_data";
  statusText: string;
  coverageText?: string;
  monthlyAmount: number;
  lastPaymentDate?: string;
  pendingCount: number;
  pendingAmount: number;
  recapRows: DuesHistoryRecapRow[];
};

const DEFAULT_MONTHS_2026 = [
  { month: "Januari", paid: true, date: "05 Jan 2026", ref: "202601050012" },
  { month: "Februari", paid: true, date: "04 Feb 2026", ref: "202602040019" },
  { month: "Maret", paid: true, date: "06 Mar 2026", ref: "202603060007" },
  { month: "April", paid: true, date: "05 Apr 2026", ref: "202604050033" },
  { month: "Mei", paid: true, date: "04 Mei 2026", ref: "202605040015" },
  { month: "Juni", paid: true, date: "06 Jun 2026", ref: "202606060021" },
  { month: "Juli", paid: true, date: "05 Jul 2026", ref: "202607050044" },
  { month: "Agustus", paid: true, date: "05 Agu 2026", ref: "202608050008" },
  { month: "September", paid: true, date: "05 Sep 2026", ref: "202609050001" },
  { month: "Oktober", paid: false, date: "-", ref: "" },
  { month: "November", paid: false, date: "-", ref: "" },
  { month: "Desember", paid: false, date: "-", ref: "" },
];

function formatPaymentDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function computeDuesStatus(rows: DuesHistoryRecapRow[]): DuesStatusInfo {
  const verifiedRows = rows.filter((r) => r.verification_status === "verified");
  const pendingRows = rows.filter((r) => r.verification_status === "pending");
  const pendingAmount = pendingRows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const latestVerifiedPayment = [...verifiedRows].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  )[0];

  const lastPaymentDate = latestVerifiedPayment
    ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
        new Date(latestVerifiedPayment.paid_at)
      )
    : "05 Sep 2026";

  const coverageDates = verifiedRows
    .map((row) => {
      if (!row.due_period_month || !row.due_period_year) return null;
      return new Date(row.due_period_year, row.due_period_month - 1 + row.period_count, 0);
    })
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime());

  const latestCoverageDate = coverageDates[0] || null;
  const coverageText = latestCoverageDate
    ? new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(latestCoverageDate)
    : "September 2026";

  const now = new Date();
  const currentEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  if (pendingRows.length > 0 && (!latestCoverageDate || latestCoverageDate < currentEndOfMonth)) {
    return {
      status: "pending",
      statusText: `${pendingRows.length} Menunggu Verifikasi`,
      coverageText,
      monthlyAmount: 50_000,
      lastPaymentDate,
      pendingCount: pendingRows.length,
      pendingAmount,
      recapRows: rows,
    };
  }

  return {
    status: "lunas",
    statusText: `LUNAS S/D ${coverageText.toUpperCase()}`,
    coverageText,
    monthlyAmount: 50_000,
    lastPaymentDate: lastPaymentDate || "05 Sep 2026",
    pendingCount: pendingRows.length,
    pendingAmount,
    recapRows: rows,
  };
}

export type PortalScreenView =
  | "beranda"       // Screen 1
  | "kartu-id"      // Screen 2
  | "status-iuran"  // Screen 3
  | "riwayat"       // Screen 4
  | "pembayaran"    // Screen 5
  | "kuitansi"      // Screen 6
  | "lainnya";      // Menu Drawer/Screen

export function PortalDashboardClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient() };
    } catch {
      return { client: null };
    }
  }, []);

  const [user, setUser] = useState<PortalUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [duesInfo, setDuesInfo] = useState<DuesStatusInfo>(() => computeDuesStatus([]));
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── SEAMLESS NATIVE-SCREEN VIEW STATE ROUTER ──
  const [activeScreen, setActiveScreen] = useState<PortalScreenView>("beranda");
  const [navHistory, setNavHistory] = useState<PortalScreenView[]>([]);

  // Screen Sub-States
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedPayMethod, setSelectedPayMethod] = useState<"bank" | "qris" | "ewallet">("bank");
  const [showPayDetail, setShowPayDetail] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedIdCard, setCopiedIdCard] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Navigates to a new screen and preserves back history
  function navigateTo(screen: PortalScreenView) {
    setNavHistory((prev) => [...prev, activeScreen]);
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Back button handler
  function navigateBack() {
    if (navHistory.length > 0) {
      const prevScreen = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveScreen(prevScreen);
    } else {
      setActiveScreen("beranda");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Switch direct tab from bottom nav
  function switchTab(screen: "beranda" | "riwayat" | "pembayaran" | "lainnya") {
    if (activeScreen === screen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setNavHistory([]);
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllNotificationsAsRead() {
    const supabase = supabaseState.client;
    if (!supabase) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await supabase.from("portal_notifications").update({ is_read: true }).eq("is_read", false);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) return;
    const client = supabase;

    let mounted = true;
    let profileChannel: ReturnType<typeof client.channel> | null = null;
    let notifChannel: ReturnType<typeof client.channel> | null = null;

    async function loadUserData(userId: string, authEmail?: string) {
      try {
        const { data: profile } = await client
          .from("resident_profiles")
          .select("id, full_name, email, cluster, block_number, house_number, phone_number, is_active, admin_note")
          .eq("id", userId)
          .maybeSingle();

        const { data: roleRows } = await client
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        const assignedRoles = (roleRows || []).map((r: RoleRow) => r.role);
        const hasAdminRole = assignedRoles.some((role: string) => adminRoles.has(role));
        const hasKnownPengurusEmail = authEmail ? knownPengurusEmails.has(authEmail.toLowerCase().trim()) : false;
        const isAdmin = hasAdminRole || hasKnownPengurusEmail;

        if (mounted && profile) {
          const blockAddress = [profile.cluster, profile.block_number ? `Blok ${profile.block_number}` : "", profile.house_number ? `No. ${profile.house_number}` : ""]
            .filter(Boolean)
            .join(" ");

          setUser({
            id: profile.id,
            displayName: profile.full_name || authEmail?.split("@")[0] || "Warga RT 010",
            email: profile.email || authEmail || "",
            isAdmin,
            blockAddress: blockAddress || "Cipta Green Ville · RT 010 / RW 021",
            registrationCluster: profile.cluster || "Chiswick",
            registrationBlock: profile.block_number ? `${profile.block_number}${profile.house_number ? `-${profile.house_number}` : ""}` : "A-12",
          });
        } else if (mounted) {
          setUser({
            id: userId,
            displayName: authEmail?.split("@")[0] || "Budi Santoso",
            email: authEmail || "",
            isAdmin,
            blockAddress: "Cipta Green Ville · RT 010 / RW 021",
            registrationCluster: "Chiswick",
            registrationBlock: "A-12",
          });
        }
      } catch {
        if (mounted) {
          setUser({
            id: userId,
            displayName: "Budi Santoso",
            email: authEmail || "",
            isAdmin: false,
            blockAddress: "Cipta Green Ville · RT 010 / RW 021",
            registrationCluster: "Chiswick",
            registrationBlock: "A-12",
          });
        }
      } finally {
        if (mounted) setIsChecking(false);
      }
    }

    async function loadDuesData(userId: string) {
      try {
        const { data: rows } = await client
          .from("dues_recap_rows")
          .select("*")
          .eq("household_id", userId)
          .order("paid_at", { ascending: false });

        if (mounted && rows) {
          setDuesInfo(computeDuesStatus(rows as DuesHistoryRecapRow[]));
        }
      } catch {
        // use defaults
      }
    }

    async function loadNotifications(userId: string) {
      try {
        const { data: notifRows } = await client
          .from("portal_notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (mounted && notifRows && notifRows.length > 0) {
          setNotifications((notifRows as DbNotification[]).map(dbNotifToPortal));
        }
      } catch {
        // ignore
      }
    }

    void client.auth.getUser().then(({ data }) => {
      if (!data.user) {
        if (mounted) setIsChecking(false);
        return;
      }
      const userId = data.user.id;
      const userEmail = data.user.email;
      void loadUserData(userId, userEmail);
      void loadDuesData(userId);
      void loadNotifications(userId);
      if (!mounted) return;

      const profileTopic = `resident-profile-${userId}-${Math.random().toString(36).slice(2, 7)}`;
      profileChannel = client
        .channel(profileTopic)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "resident_profiles", filter: `id=eq.${userId}` },
          () => void loadUserData(userId, userEmail),
        )
        .subscribe();

      const notifTopic = `portal-notifs-${userId}-${Math.random().toString(36).slice(2, 7)}`;
      notifChannel = client
        .channel(notifTopic)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "portal_notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            const newNotif = dbNotifToPortal(payload.new as DbNotification);
            setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
          },
        )
        .subscribe();
    });

    return () => {
      mounted = false;
      if (profileChannel) void client.removeChannel(profileChannel);
      if (notifChannel) void client.removeChannel(notifChannel);
    };
  }, [supabaseState.client]);

  const displayName = isChecking
    ? "Memuat Akun..."
    : user
      ? user.displayName
      : "Budi Santoso";
  const userCluster = user?.registrationCluster || "Chiswick";
  const userBlock = user?.registrationBlock || "A-12";
  const userShortId = user?.id ? user.id.replace(/-/g, "").slice(0, 4).toUpperCase() : "0012";
  const residentId = `CGV-010-${userShortId}`;
  const fullAddress = `${userCluster} ${userBlock}`.trim();

  // Helper to open latest verified receipt
  function openLatestReceipt() {
    setReceiptData({
      name: displayName,
      cluster: userCluster,
      blockOrUnit: userBlock,
      residentId,
      monthPeriod: "September 2026",
      paymentDate: duesInfo.lastPaymentDate || "05 Sep 2026",
      amount: 50000,
      paymentMethod: "Transfer Bank (BCA)",
      referenceNo: "202609050001",
    });
    navigateTo("kuitansi");
  }

  function handleShareIdCard() {
    const text = `KARTU IURAN DIGITAL RT 010 / RW 021 Cipta Green Ville\nNama: ${displayName}\nAlamat: ${fullAddress}\nID Warga: ${residentId}\nNo. KK: 3271010101010012`;
    if (navigator.share) {
      navigator.share({ title: `Kartu Iuran Digital - ${displayName}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedIdCard(true);
      setTimeout(() => setCopiedIdCard(false), 2500);
    }
  }

  function handleCopyRekening() {
    navigator.clipboard.writeText("7310889901");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  }

  function handleConfirmWA() {
    const text = `Halo Bendahara RT 010 Cipta Green Ville, saya ingin konfirmasi pembayaran iuran:\n\n` +
      `Nama: ${displayName}\n` +
      `Unit: ${fullAddress}\n` +
      `ID Warga: ${residentId}\n` +
      `Periode: Oktober 2026\n` +
      `Nominal: Rp ${duesInfo.monthlyAmount.toLocaleString("id-ID")}\n` +
      `Metode: ${selectedPayMethod === "bank" ? "Transfer Bank BCA" : selectedPayMethod === "qris" ? "QRIS" : "E-Wallet"}\n\n` +
      `Berikut bukti pembayarannya. Mohon diverifikasi. Terima kasih!`;
    const waUrl = `https://wa.me/628117761010?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }

  function handleShareReceipt() {
    if (!receiptData) return;
    const text = `*KUITANSI PEMBAYARAN IURAN RT 010 / RW 021*\n\n` +
      `Nama: ${receiptData.name}\n` +
      `Blok / No: ${receiptData.cluster} ${receiptData.blockOrUnit}\n` +
      `ID Warga: ${receiptData.residentId}\n` +
      `Bulan: ${receiptData.monthPeriod}\n` +
      `Tanggal: ${receiptData.paymentDate}\n` +
      `Jumlah: ${formatRupiah(receiptData.amount)}\n` +
      `Metode: ${receiptData.paymentMethod}\n` +
      `No. Ref: ${receiptData.referenceNo}\n\n` +
      `_Terima kasih atas pembayaran iuran RT 010 / RW 021 Cipta Green Ville._`;

    if (navigator.share) {
      navigator.share({ title: "Kuitansi Iuran CGV10", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    }
  }

  function handlePrintPdf() {
    setDownloadingPdf(true);
    setTimeout(() => {
      window.print();
      setDownloadingPdf(false);
    }, 300);
  }

  const verifiedRows = duesInfo.recapRows.filter((r) => r.verification_status === "verified");
  const hasRealVerifiedData = verifiedRows.length > 0;

  return (
    <div className="min-h-screen bg-[#edf2ef] text-slate-800 font-sans flex justify-center selection:bg-emerald-200">
      <PortalSplashScreen />

      {/* ── CENTRAL APP SHELL CONTAINER (Pixel-Perfect Smartphone View) ── */}
      <div className="w-full max-w-sm min-h-screen bg-[#f8faf9] shadow-2xl relative flex flex-col pb-16">
        
        {/* ========================================================================= */}
        {/* ── SCREEN 1: BERANDA (HOME SCREEN) ────────────────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "beranda" && (
          <div className="flex-1 animate-in fade-in duration-150">
            {/* Top Green App Bar */}
            <header className="sticky top-0 z-40 bg-[#00473e] px-4 py-3 text-white shadow-sm">
              <div className="flex items-center justify-between">
                {/* Left: Hamburger Drawer Menu */}
                <button
                  type="button"
                  onClick={() => navigateTo("lainnya")}
                  aria-label="Menu Aplikasi"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>

                {/* Center: Logo & RT 010 / RW 021 */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900 p-1 shadow-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300 leading-none">
                      RT 010 / RW 021
                    </p>
                    <h1 className="text-xs font-black text-white leading-tight mt-0.5">
                      Cipta Green Ville
                    </h1>
                  </div>
                </div>

                {/* Right: Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    aria-label="Notifikasi Warga"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-[#00473e]" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-900">Notifikasi Warga</span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] font-bold text-emerald-700 hover:underline"
                          >
                            Tandai dibaca
                          </button>
                        )}
                      </div>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((item) => (
                            <div key={item.id} className={`rounded-xl p-2.5 text-xs ${item.unread ? "bg-emerald-50 text-emerald-950 font-medium" : "bg-slate-50 text-slate-600"}`}>
                              <div className="flex items-center gap-1.5">
                                <span>{notifTypeIcon(item.type)}</span>
                                <span className="font-bold">{item.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">{item.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block">{item.time}</span>
                            </div>
                          ))
                        ) : (
                          <p className="py-4 text-center text-xs text-slate-400">Belum ada notifikasi baru.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Entrance Gate Photo Banner */}
            <div className="p-4 pb-1">
              <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-emerald-950 shadow-sm">
                <Image
                  src="/images/cgv-splash-bg.jpg"
                  alt="Pintu Gerbang Cipta Green Ville"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                  <span className="font-bold drop-shadow">Asri, Bersih & Harmonis</span>
                  <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9.5px] font-bold backdrop-blur-sm">
                    Tembesi Sagulung
                  </span>
                </div>
              </div>
            </div>

            {/* Resident Greeting */}
            <div className="px-4 py-2 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-slate-500 leading-none">
                  Halo,
                </span>
                <h2 className="text-base font-extrabold text-slate-900 truncate leading-tight mt-0.5">
                  {displayName}
                </h2>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-none mt-0.5">
                  {fullAddress}
                </span>
              </div>
            </div>

            {/* Card 1: Kartu Iuran Digital Mini (Click to Screen 2) */}
            <div className="px-4 pt-1">
              <ResidentIdCardMini
                displayName={displayName}
                cluster={userCluster}
                blockOrUnit={userBlock}
                residentId={residentId}
                onClick={() => navigateTo("kartu-id")}
              />
            </div>

            {/* Card 2: Status Iuran Card (Click to Screen 3) */}
            <div className="px-4 pt-3">
              <div
                onClick={() => navigateTo("status-iuran")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigateTo("status-iuran")}
                className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 hover:border-emerald-600 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Checkmark & Lunas Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">
                        Status Iuran
                      </span>
                      <span className="block text-xs font-black text-emerald-700 leading-tight">
                        LUNAS
                      </span>
                      <span className="block text-[10px] font-bold text-slate-600 leading-tight">
                        S/D {duesInfo.coverageText?.toUpperCase() || "SEPTEMBER 2026"}
                      </span>
                    </div>
                  </div>

                  {/* Right: Iuran Bulanan & Terakhir Bayar */}
                  <div className="text-right space-y-1">
                    <div>
                      <span className="block text-[9.5px] text-slate-400">Iuran Bulanan</span>
                      <span className="text-xs font-black text-slate-900">
                        Rp {duesInfo.monthlyAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-slate-400">Terakhir Bayar</span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {duesInfo.lastPaymentDate || "05 Sep 2026"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── SCREEN 2: KARTU IURAN DIGITAL (FULL VIEW) ──────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "kartu-id" && (
          <div className="flex-1 bg-white animate-in fade-in duration-150">
            {/* Top Bar with Back Button */}
            <header className="sticky top-0 z-40 bg-[#00473e] px-4 py-3.5 text-white shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={navigateBack}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Kartu Iuran Digital</span>
              </button>
              <div className="w-6" />
            </header>

            {/* Card Body */}
            <div className="p-5 text-slate-800 space-y-3">
              {/* Card Header: Logo & RT Info */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-950 leading-none">
                      CIPTA
                    </span>
                    <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-800 leading-none">
                      GREEN VILLE
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-800 leading-tight">
                    RT 010 / RW 021
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                    Cipta Green Ville
                  </p>
                </div>
              </div>

              {/* Curved Green Banner with Avatar */}
              <div className="relative mt-2 flex flex-col items-center justify-center pt-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#00473e] p-1 shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-emerald-900">
                    <svg className="h-10 w-10 text-[#00473e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-black text-slate-900 leading-tight">
                  {displayName}
                </h3>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  {fullAddress}
                </p>
              </div>

              {/* Grid ID Warga & No. KK */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-center">
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">ID Warga</span>
                  <span className="text-xs font-extrabold text-slate-900 font-mono">{residentId}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">No. KK</span>
                  <span className="text-xs font-extrabold text-slate-900 font-mono">3271010101010012</span>
                </div>
              </div>

              {/* Large Clean QR Code */}
              <div className="my-4 flex flex-col items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <svg className="h-32 w-32 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
                    <rect x="64" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="72" y="18" width="10" height="10" rx="2" fill="currentColor" />
                    <rect x="10" y="64" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="18" y="72" width="10" height="10" rx="2" fill="currentColor" />
                    
                    <rect x="42" y="12" width="6" height="6" rx="1.5" />
                    <rect x="52" y="12" width="6" height="6" rx="1.5" />
                    <rect x="42" y="24" width="6" height="6" rx="1.5" />
                    <rect x="52" y="32" width="6" height="6" rx="1.5" />
                    <rect x="12" y="44" width="6" height="6" rx="1.5" />
                    <rect x="24" y="44" width="6" height="6" rx="1.5" />
                    <rect x="36" y="44" width="6" height="6" rx="1.5" />
                    <rect x="48" y="44" width="6" height="6" rx="1.5" />
                    <rect x="60" y="44" width="6" height="6" rx="1.5" />
                    <rect x="72" y="44" width="6" height="6" rx="1.5" />
                    <rect x="84" y="44" width="6" height="6" rx="1.5" />
                    <rect x="44" y="56" width="6" height="6" rx="1.5" />
                    <rect x="56" y="56" width="6" height="6" rx="1.5" />
                    <rect x="68" y="56" width="6" height="6" rx="1.5" />
                    <rect x="80" y="56" width="6" height="6" rx="1.5" />
                    <rect x="44" y="68" width="6" height="6" rx="1.5" />
                    <rect x="56" y="68" width="6" height="6" rx="1.5" />
                    <rect x="68" y="68" width="6" height="6" rx="1.5" />
                    <rect x="80" y="68" width="6" height="6" rx="1.5" />
                    <rect x="44" y="80" width="6" height="6" rx="1.5" />
                    <rect x="56" y="80" width="6" height="6" rx="1.5" />
                    <rect x="68" y="80" width="6" height="6" rx="1.5" />
                    <rect x="80" y="80" width="6" height="6" rx="1.5" />
                  </svg>
                </div>
              </div>

              {/* Bottom Wave with Leaves & Slogan */}
              <div className="relative -mx-5 overflow-hidden bg-gradient-to-r from-emerald-800 to-[#00473e] px-4 py-4 text-center text-white">
                <div className="flex items-center justify-center gap-1.5 opacity-90 mb-1">
                  <svg className="h-4 w-4 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium italic tracking-wide text-emerald-100 font-serif">
                  &ldquo;Bersama Membangun Lingkungan yang Lebih Baik&rdquo;
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleShareIdCard}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00473e] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#003831] transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{copiedIdCard ? "Tersalin ke Clipboard!" : "Bagikan Kartu"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── SCREEN 3: STATUS IURAN ─────────────────────────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "status-iuran" && (
          <div className="flex-1 animate-in fade-in duration-150">
            {/* Top Bar with Back Button */}
            <header className="sticky top-0 z-40 bg-[#00473e] px-4 py-3.5 text-white shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={navigateBack}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Status Iuran</span>
              </button>
              <div className="w-6" />
            </header>

            <div className="p-4 space-y-3.5">
              {/* Top Hero Pill: Solid Green with Checkmark */}
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide uppercase leading-tight">
                    IURAN LUNAS S/D {duesInfo.coverageText?.toUpperCase() || "SEPTEMBER 2026"}
                  </h3>
                </div>
              </div>

              {/* 2-Column Stat Box */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500">
                    Iuran Bulanan
                  </span>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    Rp {duesInfo.monthlyAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-semibold text-slate-500">
                    Terakhir Bayar
                  </span>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {duesInfo.lastPaymentDate || "05 Sep 2026"}
                  </p>
                </div>
              </div>

              {/* Iuran Bulan Ini Callout Card with "Bayar Sekarang >" */}
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <span className="block text-[11px] font-semibold text-slate-500">
                      Iuran bulan ini
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      Rp {duesInfo.monthlyAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo("pembayaran")}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#00473e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#003831] active:scale-[0.99] transition-all"
                >
                  <span>Bayar Sekarang</span>
                  <span>&gt;</span>
                </button>
              </div>

              {/* 4 Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo("pembayaran")}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 transition-all group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Bayar Iuran</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("riwayat")}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 transition-all group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Riwayat Iuran</span>
                </button>

                <button
                  type="button"
                  onClick={openLatestReceipt}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 transition-all group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Kuitansi</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("riwayat")}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 transition-all group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Rekap Iuran</span>
                </button>
              </div>

              {/* Bottom Info Card */}
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                      Status Warga
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      Aktif
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Keterangan: </span>
                  <span>Iuran RT terbayar sampai {duesInfo.coverageText || "September 2026"}.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── SCREEN 4: RIWAYAT IURAN ────────────────────────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "riwayat" && (
          <div className="flex-1 bg-white animate-in fade-in duration-150">
            {/* Top Bar with Back Button */}
            <header className="sticky top-0 z-40 bg-[#00473e] px-4 py-3.5 text-white shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={navigateBack}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Riwayat Iuran</span>
              </button>
              <div className="w-6" />
            </header>

            <div className="p-4 space-y-3">
              {/* Year Dropdown Selector */}
              <div className="flex items-center justify-start">
                <div className="relative inline-block">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 shadow-sm"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Table Header: Bulan | Status | Tanggal Bayar */}
              <div className="grid grid-cols-12 border-b border-slate-200 pb-2 px-1 text-[11px] font-bold text-slate-700">
                <div className="col-span-4">Bulan</div>
                <div className="col-span-4 text-center">Status</div>
                <div className="col-span-4 text-right">Tanggal Bayar</div>
              </div>

              {/* Rows List */}
              <div className="divide-y divide-slate-100">
                {hasRealVerifiedData ? (
                  verifiedRows.map((row) => {
                    const dateLabel = formatPaymentDate(row.paid_at);
                    const periodLabel = row.period_label || `Bulan ${row.due_period_month || 9}`;

                    return (
                      <div
                        key={row.payment_id}
                        onClick={() => {
                          setReceiptData({
                            name: displayName,
                            cluster: userCluster,
                            blockOrUnit: userBlock,
                            residentId,
                            monthPeriod: periodLabel,
                            paymentDate: dateLabel,
                            amount: Number(row.amount) || 50000,
                            paymentMethod: row.method === "transfer" ? "Transfer Bank (BCA)" : row.method.toUpperCase(),
                            referenceNo: row.reference_no || row.payment_id.slice(0, 10),
                          });
                          navigateTo("kuitansi");
                        }}
                        role="button"
                        tabIndex={0}
                        className="grid grid-cols-12 items-center py-3 px-1 text-xs hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <div className="col-span-4 font-semibold text-slate-900 truncate">
                          {periodLabel}
                        </div>
                        <div className="col-span-4 flex justify-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Lunas
                          </span>
                        </div>
                        <div className="col-span-4 flex items-center justify-end gap-1 text-right text-[11px] text-slate-500 font-medium">
                          <span>{dateLabel}</span>
                          <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  DEFAULT_MONTHS_2026.map((item) => (
                    <div
                      key={item.month}
                      onClick={() => {
                        if (item.paid) {
                          setReceiptData({
                            name: displayName,
                            cluster: userCluster,
                            blockOrUnit: userBlock,
                            residentId,
                            monthPeriod: `${item.month} ${selectedYear}`,
                            paymentDate: item.date,
                            amount: 50000,
                            paymentMethod: "Transfer Bank (BCA)",
                            referenceNo: item.ref,
                          });
                          navigateTo("kuitansi");
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`grid grid-cols-12 items-center py-3 px-1 text-xs transition-colors ${
                        item.paid
                          ? "hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-slate-900"
                          : "opacity-40 text-slate-400"
                      }`}
                    >
                      <div className="col-span-4 font-semibold">
                        {item.month}
                      </div>
                      <div className="col-span-4 flex justify-center">
                        {item.paid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Lunas
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                            Belum
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 flex items-center justify-end gap-1 text-right text-[11px] font-medium text-slate-500">
                        <span>{item.date}</span>
                        {item.paid && (
                          <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── SCREEN 5: PEMBAYARAN IURAN ─────────────────────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "pembayaran" && (
          <div className="flex-1 animate-in fade-in duration-150">
            {/* Top Bar with Back Button */}
            <header className="sticky top-0 z-40 bg-[#00473e] px-4 py-3.5 text-white shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (showPayDetail) setShowPayDetail(false);
                  else navigateBack();
                }}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{showPayDetail ? "Pilih Metode" : "Pembayaran Iuran"}</span>
              </button>
              <div className="w-6" />
            </header>

            <div className="p-4 space-y-4">
              {!showPayDetail ? (
                <>
                  {/* Blue Notice Banner */}
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-3.5 text-blue-900 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold leading-snug text-blue-900">
                      Pastikan data sudah sesuai sebelum melakukan pembayaran.
                    </p>
                  </div>

                  {/* Summary Amount Block */}
                  <div className="rounded-2xl bg-white p-5 text-center shadow-sm border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-500">
                      Iuran Bulanan
                    </span>
                    <div className="mt-1 text-2xl font-black text-slate-900">
                      Rp {duesInfo.monthlyAmount.toLocaleString("id-ID")}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Bulan : Oktober 2026</span>
                    </div>
                  </div>

                  {/* Methods List */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800">
                      Metode Pembayaran
                    </h4>

                    {/* Transfer Bank */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayMethod("bank");
                        setShowPayDetail(true);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border transition-all text-left group ${
                        selectedPayMethod === "bank"
                          ? "border-emerald-600 ring-1 ring-emerald-600"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 10h16v2H4zm0 4h16v2H4zm7-10l8 4H5l6-4zM2 20h20v2H2z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">Transfer Bank</h5>
                          <p className="text-[11px] text-slate-500">BCA, Mandiri, BNI, BRI, dll</p>
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* QRIS */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayMethod("qris");
                        setShowPayDetail(true);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border transition-all text-left group ${
                        selectedPayMethod === "qris"
                          ? "border-emerald-600 ring-1 ring-emerald-600"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v3h-3zm-5 5h3v3h-3zm5 0h3v3h-3zm-5-5h3v3h-3z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">QRIS</h5>
                          <p className="text-[11px] text-slate-500">Scan kode QR</p>
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* E-Wallet */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayMethod("ewallet");
                        setShowPayDetail(true);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border transition-all text-left group ${
                        selectedPayMethod === "ewallet"
                          ? "border-emerald-600 ring-1 ring-emerald-600"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">E-Wallet</h5>
                          <p className="text-[11px] text-slate-500">OVO, GoPay, DANA, ShopeePay, dll</p>
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Continue Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPayDetail(true)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#00473e] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#003831] active:scale-[0.99] transition-all"
                    >
                      <span>Lanjutkan Pembayaran</span>
                      <span>&gt;</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Step 2: Payment Detail */
                <div className="space-y-4">
                  {selectedPayMethod === "bank" ? (
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-900">Rekening Resmi Kas RT</span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          BCA
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Nomor Rekening:</span>
                          <span className="font-mono font-bold text-slate-900">7310889901</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Atas Nama:</span>
                          <span className="font-bold text-slate-900">KAS RT 010 CIPTA GREEN VILLE</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-slate-200/80 pt-1.5 font-bold">
                          <span className="text-slate-700">Jumlah Transfer:</span>
                          <span className="text-emerald-700">Rp {duesInfo.monthlyAmount.toLocaleString("id-ID")}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyRekening}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{copiedBank ? "Nomor Rekening Tersalin!" : "Salin Nomor Rekening"}</span>
                      </button>
                    </div>
                  ) : selectedPayMethod === "qris" ? (
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 text-center space-y-3">
                      <span className="text-xs font-bold text-slate-900 block">QRIS RT 010 Cipta Green Ville</span>
                      <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-200 p-2">
                        <svg className="h-36 w-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="10" y="10" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
                          <rect x="64" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="72" y="18" width="10" height="10" rx="2" fill="currentColor" />
                          <rect x="10" y="64" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="18" y="72" width="10" height="10" rx="2" fill="currentColor" />
                          <rect x="42" y="42" width="16" height="16" rx="2" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-500">Scan melalui BCA Mobile, Livin, GoPay, OVO, atau DANA</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
                      <span className="text-xs font-bold text-slate-900 block">E-Wallet Transfer</span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Transfer ke nomor OVO/GoPay/DANA resmi bendahara RT: <br />
                        <strong className="font-mono text-emerald-800 text-sm">0811-776-1010</strong> (a.n Bendahara RT 010)
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmWA}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00473e] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#003831] transition-colors"
                  >
                    <span>Konfirmasi via WhatsApp Bendahara</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 3.67C16.58 3.67 20.28 7.37 20.28 11.92C20.28 16.46 16.58 20.17 12.04 20.17C10.66 20.17 9.3 19.82 8.1 19.14L7.81 18.97L4.7 19.79L5.53 16.76L5.35 16.46C4.6 15.26 4.21 13.88 4.21 11.91C4.21 7.37 7.91 3.67 12.05 3.67Z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── SCREEN 6: KUITANSI PEMBAYARAN ──────────────────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "kuitansi" && receiptData && (
          <div className="flex-1 animate-in fade-in duration-150">
            {/* Top Bar with Back Button */}
            <header className="sticky top-0 z-40 bg-[#00473e] px-4 py-3.5 text-white shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={navigateBack}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Kuitansi Pembayaran</span>
              </button>
              <div className="w-6" />
            </header>

            <div className="p-4">
              <div className="relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/90 pb-7">
                {/* Kop & Logo */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-950 leading-none">
                        CIPTA
                      </span>
                      <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-800 leading-none">
                        GREEN VILLE
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-800 leading-tight">
                      RT 010 / RW 021
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                      Cipta Green Ville
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="my-4 text-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    KUITANSI PEMBAYARAN IURAN
                  </h3>
                </div>

                {/* Table Details */}
                <div className="space-y-1.5 text-xs text-slate-700 py-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">Nama</span>
                    <span className="col-span-8 font-bold text-slate-900">: {receiptData.name}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">Blok / No</span>
                    <span className="col-span-8 font-bold text-slate-900">: {receiptData.cluster} {receiptData.blockOrUnit}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">ID Warga</span>
                    <span className="col-span-8 font-mono font-bold text-slate-900">: {receiptData.residentId}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">Bulan</span>
                    <span className="col-span-8 font-bold text-emerald-800">: {receiptData.monthPeriod}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">Tanggal Bayar</span>
                    <span className="col-span-8 text-slate-800 font-semibold">: {receiptData.paymentDate}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">Jumlah</span>
                    <span className="col-span-8 font-black text-slate-900">: {formatRupiah(receiptData.amount)}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">Metode</span>
                    <span className="col-span-8 text-slate-800 font-semibold">: {receiptData.paymentMethod}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-4 text-slate-500 font-medium">No. Ref</span>
                    <span className="col-span-8 font-mono text-slate-800 font-semibold">: {receiptData.referenceNo}</span>
                  </div>
                </div>

                {/* Note & Illustration */}
                <div className="mt-4 border-t border-slate-100 pt-3 text-center">
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Terima kasih atas pembayaran iuran <br />
                    RT 010 / RW 021 Cipta Green Ville.
                  </p>

                  <div className="my-2.5 flex items-center justify-center opacity-70 text-emerald-700">
                    <svg className="h-6 w-32" viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 25h150M15 25V15l10-8 10 8v10M45 25V12l12-9 12 9v13M80 25V16l8-6 8 6v9M105 25V10l15-7 15 7v15M20 25v-5h6v5M52 25v-7h8v7M115 25v-8h10v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <p className="text-[9.5px] font-medium italic text-emerald-800 font-serif">
                    &ldquo;Bersama Membangun Lingkungan yang Lebih Baik&rdquo;
                  </p>
                </div>

                {/* Sawtooth / Jagged Bottom Paper Edge */}
                <div className="absolute -bottom-2 left-0 right-0 h-2.5 overflow-hidden">
                  <svg className="w-full text-[#f8faf9]" viewBox="0 0 400 10" preserveAspectRatio="none" fill="currentColor">
                    <path d="M0,0 L10,10 L20,0 L30,10 L40,0 L50,10 L60,0 L70,10 L80,0 L90,10 L100,0 L110,10 L120,0 L130,10 L140,0 L150,10 L160,0 L170,10 L180,0 L190,10 L200,0 L210,10 L220,0 L230,10 L240,0 L250,10 L260,0 L270,10 L280,0 L290,10 L300,0 L310,10 L320,0 L330,10 L340,0 L350,10 L360,0 L370,10 L380,0 L390,10 L400,0 L400,10 L0,10 Z" />
                  </svg>
                </div>
              </div>

              {/* Action Buttons: Unduh PDF & Bagikan */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  disabled={downloadingPdf}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{downloadingPdf ? "Menyiapkan..." : "Unduh PDF"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{copiedReceipt ? "Tersalin!" : "Bagikan"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── SCREEN 7: MENU LAINNYA ─────────────────────────────────────────────── */}
        {/* ========================================================================= */}
        {activeScreen === "lainnya" && (
          <div className="flex-1 bg-white animate-in fade-in duration-150 p-4 space-y-4">
            {/* Top Bar with Back Button */}
            <header className="sticky top-0 -mx-4 -mt-4 z-40 bg-[#00473e] px-4 py-3.5 text-white shadow-sm flex items-center justify-between">
              <button
                type="button"
                onClick={navigateBack}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Menu Warga & Layanan</span>
              </button>
              <div className="w-6" />
            </header>

            {/* Resident Info Box */}
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00473e] text-white text-lg font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Akun Warga Terdaftar
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 truncate">
                  {displayName}
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  {fullAddress} · <span className="font-mono text-emerald-800">{residentId}</span>
                </p>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Fitur & Layanan Utama
              </span>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Link
                  href="/portal/profil-rumah/"
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏠</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Profil Rumah & Anggota</span>
                      <span className="text-[10px] text-slate-500">Data KK, kendaraan, dan kontak</span>
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </Link>

                <Link
                  href="/layanan/"
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📋</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Layanan & Pengajuan Surat</span>
                      <span className="text-[10px] text-slate-500">Surat pengantar RT, izin renovasi, lapor warga</span>
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </Link>

                <Link
                  href="/kabar-warga/"
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📢</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Kabar Warga & Pengumuman</span>
                      <span className="text-[10px] text-slate-500">Informasi lingkungan & kegiatan RT 010</span>
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </Link>

                <Link
                  href="/palugada/"
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏪</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Lapak PALUGADA Warga</span>
                      <span className="text-[10px] text-slate-500">Pasar produk & jasa warga Cipta Greenville</span>
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </Link>
              </div>
            </div>

            {/* Admin Section if Admin */}
            {user?.isAdmin && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                  Akses Pengurus RT
                </span>
                <Link
                  href="/admin/"
                  className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-amber-950 shadow-sm hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏛</span>
                    <div>
                      <span className="block text-xs font-extrabold">Buka Dashboard Pengurus RT</span>
                      <span className="text-[10px] text-amber-800">Verifikasi iuran, approval surat, kelola warga</span>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700">→</span>
                </Link>
              </div>
            )}

            {/* Logout */}
            <div className="pt-2">
              <Link
                href="/keluar/"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar Akun Warga</span>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ── FIXED BOTTOM NAVIGATION BAR (MATCHING SCREEN 1 MOCKUP) ──────────────── */}
        {/* ========================================================================= */}
        <nav
          aria-label="Navigasi Bawah Portal Warga"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-sm border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-2xl"
        >
          <div className="grid grid-cols-4 text-center">
            {/* 1. Beranda */}
            <button
              type="button"
              onClick={() => switchTab("beranda")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                activeScreen === "beranda" ? "text-emerald-800 font-bold" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                activeScreen === "beranda" ? "bg-emerald-50 text-emerald-800" : ""
              }`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className={`text-[10px] ${activeScreen === "beranda" ? "font-extrabold text-emerald-900" : "font-medium text-slate-600"}`}>
                Beranda
              </span>
            </button>

            {/* 2. Riwayat */}
            <button
              type="button"
              onClick={() => switchTab("riwayat")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                activeScreen === "riwayat" ? "text-emerald-800 font-bold" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                activeScreen === "riwayat" ? "bg-emerald-50 text-emerald-800" : ""
              }`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                </svg>
              </div>
              <span className={`text-[10px] ${activeScreen === "riwayat" ? "font-extrabold text-emerald-900" : "font-medium text-slate-600"}`}>
                Riwayat
              </span>
            </button>

            {/* 3. Bayar */}
            <button
              type="button"
              onClick={() => switchTab("pembayaran")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                activeScreen === "pembayaran" ? "text-emerald-800 font-bold" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                activeScreen === "pembayaran" ? "bg-emerald-50 text-emerald-800" : ""
              }`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
              <span className={`text-[10px] ${activeScreen === "pembayaran" ? "font-extrabold text-emerald-900" : "font-medium text-slate-600"}`}>
                Bayar
              </span>
            </button>

            {/* 4. Lainnya */}
            <button
              type="button"
              onClick={() => switchTab("lainnya")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                activeScreen === "lainnya" ? "text-emerald-800 font-bold" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                activeScreen === "lainnya" ? "bg-emerald-50 text-emerald-800" : ""
              }`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </div>
              <span className={`text-[10px] ${activeScreen === "lainnya" ? "font-extrabold text-emerald-900" : "font-medium text-slate-600"}`}>
                Lainnya
              </span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}
