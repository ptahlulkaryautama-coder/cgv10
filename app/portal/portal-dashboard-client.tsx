"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { kabarArticles, palugadaDraftItems } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PortalSplashScreen } from "./portal-splash-screen";

type PortalNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "billing" | "announcement" | "system";
  unread: boolean;
  link?: string;
};

const initialNotifications: PortalNotification[] = [
  {
    id: "notif-1",
    title: "Tagihan Iuran Agustus 2026",
    message: "Iuran IPL RT 010 sebesar Rp 10.000 bulan ini dapat dicek dan dikonfirmasi.",
    time: "Baru saja",
    type: "billing",
    unread: true,
    link: "/keuangan/",
  },
  {
    id: "notif-2",
    title: "Pengumuman Kepengurusan RT 010",
    message: "Susunan pengurus RT 010 Cipta Greenville periode baru telah terbit.",
    time: "2 jam yang lalu",
    type: "announcement",
    unread: true,
    link: "/kabar-warga/",
  },
  {
    id: "notif-3",
    title: "Akun Warga Terverifikasi",
    message: "Akses Portal Warga Cipta Greenville telah aktif & terhubung ke sistem RT 010.",
    time: "Kemarin",
    type: "system",
    unread: false,
    link: "/portal/profil-rumah/",
  },
];

type PortalUser = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  blockAddress?: string;
  iplStatus?: "LUNAS" | "BELUM DIBAYAR" | "PENDING";
  tagihanLabel?: string;
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

// Minimalist Vector Line Icons
function IconLayanan({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function IconKeuangan({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function IconPalugada({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconKabar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconCheck({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconAdminLock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconPhoneDownload({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <path d="M12 18h.01" />
      <path d="M12 7v6" />
      <path d="M9 10l3 3 3-3" />
    </svg>
  );
}

const categories = [
  { id: "semua", label: "Semua" },
  { id: "layanan", label: "Layanan" },
  { id: "iuran", label: "Iuran & Kas" },
  { id: "palugada", label: "PALUGADA" },
  { id: "kabar", label: "Kabar Warga" },
];

const quickActions = [
  {
    id: "layanan",
    title: "Layanan Warga",
    subtitle: "Ajukan surat & laporan lingkungan",
    href: "/layanan/#form-layanan",
    icon: IconLayanan,
    accentColor: "border-[#D4AF37]/30 hover:border-[#D4AF37]/60",
    badge: "LAYANAN RT",
  },
  {
    id: "iuran",
    title: "Iuran & Keuangan",
    subtitle: "Cek kas RT & riwayat iuran",
    href: "/keuangan/",
    icon: IconKeuangan,
    accentColor: "border-amber-500/30 hover:border-amber-500/60",
    badge: "TRANSPARANSI",
  },
  {
    id: "palugada",
    title: "PALUGADA CGV",
    subtitle: "Katalog produk & jasa tetangga",
    href: "/palugada/",
    icon: IconPalugada,
    accentColor: "border-emerald-500/30 hover:border-emerald-500/60",
    badge: "KLASTER",
  },
  {
    id: "kabar",
    title: "Kabar Warga",
    subtitle: "Pengumuman & agenda kegiatan",
    href: "/kabar-warga/",
    icon: IconKabar,
    accentColor: "border-blue-500/30 hover:border-blue-500/60",
    badge: "INFORMASI",
  },
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

// Tarif iuran RT per bulan
const TARIF_IURAN = 10_000;

function getCurrentMonthLabel(): string {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function PortalDashboardClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient() };
    } catch {
      return { client: null };
    }
  }, []);

  const [user, setUser] = useState<PortalUser | null>(null);
  const [isChecking, setIsChecking] = useState(() => Boolean(supabaseState.client));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>(initialNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  function markAllNotificationsAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function toggleNotificationRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  }

  // Close notifications popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // Listen for PWA install prompt
  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsChecking(false);
      return;
    }
    const client = supabase;
    let mounted = true;

    async function loadUser() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUser = sessionData.session?.user;
      if (!mounted) return;

      if (!activeUser) {
        setUser(null);
        setIsChecking(false);
        return;
      }

      const email = (activeUser.email ?? "").toLowerCase();
      let profile: { display_name?: string; avatar_url?: string } | null = null;
      const { data: profileData, error: profileErr } = await client
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (profileErr && profileErr.message.includes("avatar_url")) {
        const { data: fallbackProfile } = await client
          .from("profiles")
          .select("display_name")
          .eq("id", activeUser.id)
          .maybeSingle();
        profile = fallbackProfile;
      } else {
        profile = profileData;
      }

      const [{ data: roleRows }, { data: regRequest }] = await Promise.all([
        client.from("user_roles").select("role").eq("user_id", activeUser.id),
        // Ambil data display_name, cluster & blok dari pendaftaran warga yang sudah approved / terdaftar
        client
          .from("resident_registration_requests")
          .select("display_name, cluster, block_or_unit")
          .or(`requested_user_id.eq.${activeUser.id},email.ilike.${email}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (!mounted) return;

      const roles = ((roleRows ?? []) as RoleRow[]).map((row) => row.role);
      const hasRole = roles.some((role) => adminRoles.has(role));
      const isKnown = knownPengurusEmails.has(email);
      const cluster = regRequest?.cluster || "Cipta Greenville";
      const block = regRequest?.block_or_unit || "RT 010 / RW 021";

      const emailPrefix = activeUser.email?.split("@")[0] || "Warga CGV10";
      const profileName = profile?.display_name?.trim() || "";
      const regName = regRequest?.display_name?.trim() || "";
      const metaName = (
        (activeUser.user_metadata?.display_name as string | undefined) ||
        (activeUser.user_metadata?.full_name as string | undefined) ||
        ""
      ).trim();

      // Priority logic:
      // 1. If profileName exists and is NOT equal to emailPrefix, use profileName.
      // 2. Otherwise if regName or metaName is available, use that.
      // 3. Fallback to profileName if present, else emailPrefix.
      let finalDisplayName = emailPrefix;
      if (profileName && profileName.toLowerCase() !== emailPrefix.toLowerCase()) {
        finalDisplayName = profileName;
      } else if (regName && regName.toLowerCase() !== emailPrefix.toLowerCase()) {
        finalDisplayName = regName;
      } else if (metaName && metaName.toLowerCase() !== emailPrefix.toLowerCase()) {
        finalDisplayName = metaName;
      } else if (profileName) {
        finalDisplayName = profileName;
      }

      // Sync profiles.display_name if empty or defaulted to email prefix but a better human name exists
      if ((!profileName || profileName.toLowerCase() === emailPrefix.toLowerCase()) && finalDisplayName !== emailPrefix) {
        void client.from("profiles").update({ display_name: finalDisplayName }).eq("id", activeUser.id);
      }

      const resolvedAvatarUrl =
        profile?.avatar_url ||
        (activeUser.user_metadata?.avatar_url as string | undefined) ||
        undefined;

      setUser({
        id: activeUser.id,
        displayName: finalDisplayName,
        email: activeUser.email,
        avatarUrl: resolvedAvatarUrl,
        isAdmin: hasRole || isKnown,
        blockAddress: `${cluster} • ${block}`,
        // iplStatus dan tagihan: belum terhubung ke tabel iuran_payments
        // Ditampilkan sebagai info tarif umum, bukan status personal
        iplStatus: undefined,
        tagihanLabel: `Iuran ${getCurrentMonthLabel()}: Rp ${formatRupiah(TARIF_IURAN)}`,
      });
      setIsChecking(false);
    }

    void loadUser();
    const { data: { subscription } } = client.auth.onAuthStateChange(() =>
      window.setTimeout(loadUser, 0)
    );

    // Realtime: re-fetch profile saat display_name diubah (misal dari tab admin settings)
    let profileChannel: ReturnType<typeof client.channel> | null = null;
    client.auth.getSession().then(({ data: sessionData }) => {
      const uid = sessionData.session?.user?.id;
      if (!uid || !mounted) return;
      profileChannel = client
        .channel(`profile-changes-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${uid}`,
          },
          () => {
            if (mounted) void loadUser();
          },
        )
        .subscribe();
    }).catch(() => { /* ignore */ });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (profileChannel) void client.removeChannel(profileChannel);
    };
  }, [supabaseState.client]);

  // Handle PWA Install click
  function handleInstallClick() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cgv10:open-pwa-install"));
    }
  }

  const initial = user ? user.displayName.charAt(0).toUpperCase() : "W";
  const displayName = isChecking
    ? "Memuat Akun..."
    : user
      ? user.displayName
      : "Selamat Datang";
  const addressText = user?.blockAddress || "Cipta Greenville · RT 010 / RW 021";

  // Dynamic filtering based on activeCategory and searchQuery
  const filteredQuickActions = useMemo(() => {
    return quickActions.filter((act) => {
      const matchesCategory =
        activeCategory === "semua" || act.id === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const filteredKabar = useMemo(() => {
    return kabarArticles.filter((art) => {
      const matchesCategory =
        activeCategory === "semua" || activeCategory === "kabar";
      const matchesSearch =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const filteredPalugada = useMemo(() => {
    return palugadaDraftItems.filter((item) => {
      const matchesCategory =
        activeCategory === "semua" || activeCategory === "palugada";
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#001713] pb-24 text-slate-100 font-sans selection:bg-[#D4AF37]/30">
      <PortalSplashScreen />

      {/* ── LUXURY HEADER BAR WITH MOVED ADMIN & INSTALL CTAs ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#001d18]/95 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          
          {/* Brand Logo & Cluster Identifier */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#D4AF37] to-[#8C6B1C] p-[1.5px] shadow-[0_4px_16px_rgba(212,175,55,0.25)]">
              <div className="h-full w-full rounded-full overflow-hidden bg-[#00241B]">
                <Image
                  src="/assets/brand/official-cgv-logo.png"
                  alt="Logo Portal Warga CGV"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "20% center" }}
                  priority
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white">CGV10</span>
                <span className="h-3.5 w-px bg-white/20" />
                <span className="text-[11px] font-bold tracking-widest text-[#D4AF37] uppercase">
                  Cipta Greenville
                </span>
              </div>
              <p className="text-[9.5px] font-medium tracking-wider text-slate-400">
                Portal Warga · RT 010 / RW 021
              </p>
            </div>
          </div>

          {/* Header Controls: Admin CTA + Install HP CTA + Notification + Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* CTA 1: Buka Admin Dashboard (Single line, no wrap, crisp ratio) */}
            {user?.isAdmin ? (
              <Link
                href="/admin/?source=portal-header"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent px-3 text-xs font-extrabold text-[#E8C865] shadow-[0_2px_10px_rgba(212,175,55,0.15)] hover:border-[#D4AF37] hover:bg-[#D4AF37]/25 transition-all"
                title="Buka Admin Dashboard Pengurus"
              >
                <IconAdminLock className="h-3.5 w-3.5 shrink-0 text-[#E8C865]" />
                <span>Buka Admin</span>
              </Link>
            ) : null}

            {/* CTA 2: Install HP (Single line, no wrap, crisp ratio) */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-white/[0.06] px-3 text-xs font-bold text-slate-200 hover:border-white/30 hover:bg-white/14 hover:text-white transition-all cursor-pointer"
              title="Install Portal di HP"
            >
              <IconPhoneDownload className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
              <span>Install HP</span>
            </button>

            {/* Notification Bell with Interactive Popover */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                aria-label="Notifikasi Warga"
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all cursor-pointer ${
                  showNotifications
                    ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#E8C865]"
                    : "border-white/12 bg-white/[0.05] text-slate-300 hover:border-[#D4AF37]/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#D4AF37] text-[8px] font-black text-black shadow-[0_0_8px_rgba(212,175,55,0.9)] animate-pulse" />
                )}
              </button>

              {/* Popover Notifikasi Warga */}
              {showNotifications && (
                <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-[#D4AF37]/40 bg-[#00241b] p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#E8C865]">Notifikasi Warga</h3>
                      {unreadCount > 0 ? (
                        <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-black text-black">
                          {unreadCount} baru
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                          Semua dibaca
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-bold text-[#E8C865] hover:underline"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`group relative rounded-xl border p-3 transition-all ${
                          item.unread
                            ? "border-[#D4AF37]/40 bg-white/[0.08]"
                            : "border-white/10 bg-white/[0.03] opacity-80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {item.type === "billing" ? "💳" : item.type === "announcement" ? "📢" : "ℹ️"}
                            </span>
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">{item.time}</span>
                        </div>

                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{item.message}</p>

                        <div className="mt-2.5 flex items-center justify-between border-t border-white/8 pt-2">
                          {item.link ? (
                            <Link
                              href={item.link}
                              onClick={() => {
                                toggleNotificationRead(item.id);
                                setShowNotifications(false);
                              }}
                              className="text-[11px] font-bold text-[#E8C865] hover:underline flex items-center gap-1"
                            >
                              <span>Lihat Detail</span>
                              <span>→</span>
                            </Link>
                          ) : <span />}

                          <button
                            type="button"
                            onClick={() => toggleNotificationRead(item.id)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-white"
                          >
                            {item.unread ? "Tandai dibaca" : "Buka kembali"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-white/10 pt-2.5 text-center">
                    <Link
                      href="/kabar-warga/"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-slate-300 hover:text-[#E8C865] transition-colors"
                    >
                      Buka Kabar & Pengumuman Warga &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <Link
              href={user ? "/portal/profil-rumah/" : "/masuk/?next=/portal/"}
              className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#D4AF37]/35 bg-gradient-to-r from-[#D4AF37]/15 to-[#00241b] px-2.5 text-xs font-bold text-white transition-all hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/25"
            >
              {user?.avatarUrl ? (
                <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/60 shadow-sm group-hover:scale-105 transition-transform">
                  <Image
                    src={user.avatarUrl}
                    alt={displayName}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#E8C865] to-[#B8942F] text-[11px] font-black text-[#15140b] shadow-sm group-hover:scale-105 transition-transform">
                  {initial}
                </span>
              )}
              <span className="truncate max-w-[130px] font-bold text-[#E8C865]">{displayName}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ── 1. RESIDENT CONTROL CENTER HERO CARD ── */}
        <section className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#002b23] via-[#00382e] to-[#00241b] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:p-8">
          
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(0deg,white_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WARGA AKTIF RT 010
                </span>
                {user?.iplStatus === "LUNAS" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E8C865]">
                    <IconCheck className="text-[#E8C865]" />
                    IPL LUNAS
                  </span>
                )}
                {user?.iplStatus === "BELUM DIBAYAR" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
                    IPL BELUM DIBAYAR
                  </span>
                )}
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {getTimeGreeting()},
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {displayName}
              </h1>
              <p className="mt-1.5 text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0 text-[#E8C865]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>{addressText}</span>
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
                  <p className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Tagihan Bulan Ini</p>
                  <p className="text-sm font-black text-[#E8C865]">{user?.tagihanLabel ?? `Iuran ${getCurrentMonthLabel()}: Rp ${formatRupiah(TARIF_IURAN)}`}</p>
                </div>
                <Link
                  href="/keuangan/"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C865] to-[#B8942F] px-5 text-xs font-black text-[#15140b] shadow-[0_8px_20px_rgba(212,175,55,0.3)] transition-all hover:brightness-110 active:scale-95"
                >
                  <span>Riwayat Keuangan & Kas</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-md">
              <div className="space-y-1">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">Iuran / Bulan</p>
                <p className="text-base font-black text-[#E8C865]">Rp {formatRupiah(TARIF_IURAN)}</p>
                <p className="text-[9px] font-semibold text-emerald-400">Tarif resmi RT 010</p>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-3">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">RT / RW</p>
                <p className="text-base font-black text-white">010 / 021</p>
                <p className="text-[9px] font-semibold text-slate-400">Cipta Greenville</p>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-3">
                <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">Riwayat Kas</p>
                <p className="text-base font-black text-white">Lihat →</p>
                <p className="text-[9px] font-semibold text-amber-400">
                  <a href="/keuangan/" className="hover:underline">Transparansi keuangan</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. SEARCH & DYNAMIC INTERACTIVE CATEGORY FILTER PILLS ── */}
        <section className="space-y-3">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-[#D4AF37]">
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Cari layanan warga, transparansi kas, kabar lingkungan, atau lapak PALUGADA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-[#00241b] py-3.5 pl-11 pr-10 text-xs text-white placeholder:text-slate-500 shadow-inner focus:border-[#D4AF37]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-xs text-slate-400 hover:text-white"
              >
                ✕ Hapus
              </button>
            ) : null}
          </div>

          {/* Dynamic Filter Pills: Clicking any pill filters the content below */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/15 text-[#E8C865] shadow-md ring-1 ring-[#D4AF37]/30"
                      : "border border-white/10 bg-[#00241b]/60 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 3. DYNAMICALLY FILTERED AKSI CEPAT WARGA ── */}
        {(activeCategory === "semua" || filteredQuickActions.length > 0) && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">AKSES CEPAT WARGA</p>
                <h2 className="text-lg font-black tracking-tight text-white">Pintu Utama Portal</h2>
              </div>
              <Link href="/layanan/" className="text-xs font-bold text-[#D4AF37] hover:underline underline-offset-4">
                Lihat Semua →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {filteredQuickActions.map((act) => {
                const ActionIcon = act.icon;
                return (
                  <Link
                    key={act.id}
                    href={act.href}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b from-[#002b23] to-[#00201a] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 ${act.accentColor}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E8C865] shadow-inner group-hover:scale-105 transition-transform">
                          <ActionIcon />
                        </span>
                        <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                          {act.badge}
                        </span>
                      </div>

                      <h3 className="mt-4 text-sm font-black text-white group-hover:text-[#E8C865] transition-colors">
                        {act.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400 leading-4">
                        {act.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-bold text-[#D4AF37]">
                      <span>Buka Pintu</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 4. DYNAMICALLY FILTERED KABAR LINGKUNGAN TERBARU ── */}
        {(activeCategory === "semua" || activeCategory === "kabar") && filteredKabar.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">KABAR & AGENDA</p>
                <h2 className="text-lg font-black tracking-tight text-white">Informasi Terbaru Lingkungan</h2>
              </div>
              <Link href="/kabar-warga/" className="text-xs font-bold text-[#D4AF37] hover:underline underline-offset-4">
                Semua Kabar →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {filteredKabar.slice(0, 3).map((article, idx) => (
                <Link
                  key={article.title || idx}
                  href="/kabar-warga/"
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#00241b] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#001713]">
                    <Image
                      src={article.coverImageSrc || "/assets/decb3499-157d-4c87-bdde-f72bae03a537.png"}
                      alt={article.coverImageAlt || article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00241b] via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-[#E8C865] backdrop-blur-md">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                      {article.publishedAt} · {article.readTime}
                    </p>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-extrabold text-white group-hover:text-[#E8C865] transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. DYNAMICALLY FILTERED PALUGADA CGV (Katalog Lapak Tetangga) ── */}
        {(activeCategory === "semua" || activeCategory === "palugada") && filteredPalugada.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">PALUGADA CGV</p>
                <h2 className="text-lg font-black tracking-tight text-white">Lapak & Jasa Tetangga</h2>
              </div>
              <Link href="/palugada/" className="text-xs font-bold text-[#D4AF37] hover:underline underline-offset-4">
                Lihat Katalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {filteredPalugada.map((item) => (
                <Link
                  key={item.id}
                  href="/palugada/"
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#00241b] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-300">
                        {item.category}
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Aktif
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-extrabold text-white group-hover:text-[#E8C865] transition-colors">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">{item.owner}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-[#D4AF37]">
                    <span>Hubungi Lapak</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. EXECUTIVE TRANSPARANSI KAS SUMMARY ── */}
        {(activeCategory === "semua" || activeCategory === "iuran") && (
          <section className="pt-2">
            <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#002b23] via-[#00382e] to-[#00241b] p-6 shadow-2xl sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-[9.5px] font-extrabold uppercase tracking-widest text-[#E8C865]">
                    TRANSPARANSI KAS RT 010 CIPTA GREENVILLE
                  </span>
                  <h3 className="mt-2 text-xl font-black text-white">
                    Laporan Keuangan Lingkungan Terbuka
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-lg leading-relaxed">
                    Pengurus RT 010 mencatat setiap iuran dan penggunaan dana kas secara jujur dan transparan untuk kenyamanan seluruh warga.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <Link
                    href="/keuangan/"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-5 text-xs font-black text-[#15140b] shadow-[0_8px_20px_rgba(212,175,55,0.25)] transition-all hover:brightness-110"
                  >
                    Lihat Laporan Keuangan
                  </Link>
                  <Link
                    href="/pengurus/"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-bold text-white hover:bg-white/10"
                  >
                    Struktur Pengurus
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
