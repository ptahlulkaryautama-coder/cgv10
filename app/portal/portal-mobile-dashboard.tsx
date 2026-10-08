"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PortalSplashScreen } from "./portal-splash-screen";
import {
  ResidentIdCardMini,
  ResidentIdCardModal,
} from "./components/resident-id-card-modal";
import { DuesStatusModal } from "./components/dues-status-modal";
import { DuesHistoryModal } from "./components/dues-history-modal";
import { DuesPaymentModal } from "./components/dues-payment-modal";
import { ReceiptModal, type ReceiptData } from "./components/receipt-modal";

type PortalUser = {
  displayName: string;
  cluster: string;
  blockOrUnit: string;
  residentId: string;
  familyCardNo: string;
  isAdmin: boolean;
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

const shortcuts: Array<{
  label: string;
  href: string;
  icon: IconName;
  bg: string;
  iconColor: string;
  isAction?: "iuran";
}> = [
  {
    label: "Lapor",
    href: "/layanan/#form-layanan",
    icon: "message",
    bg: "bg-gradient-to-br from-red-400 to-rose-600",
    iconColor: "text-white",
  },
  {
    label: "Iuran",
    href: "/keuangan/",
    icon: "wallet",
    bg: "bg-gradient-to-br from-emerald-500 to-[#00473e]",
    iconColor: "text-white",
    isAction: "iuran",
  },
  {
    label: "PALUGADA",
    href: "/palugada/",
    icon: "store",
    bg: "bg-gradient-to-br from-[#003D34] to-[#006b57]",
    iconColor: "text-accent-soft",
  },
  {
    label: "Kabar",
    href: "/kabar-warga/",
    icon: "megaphone",
    bg: "bg-gradient-to-br from-blue-400 to-indigo-600",
    iconColor: "text-white",
  },
];

const updates = [
  {
    title: "Kabar dan pengumuman lingkungan",
    meta: "Lihat informasi terbaru dari pengurus RT",
    href: "/kabar-warga/",
    icon: "megaphone" as IconName,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    title: "Butuh bantuan atau ingin melapor?",
    meta: "Pilih kategori, lalu kirim permintaan langsung",
    href: "/layanan/#form-layanan",
    icon: "message" as IconName,
    iconBg: "bg-red-50 text-red-600",
  },
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export type DuesRecapRow = {
  household_id: string;
  cluster: string;
  block_or_unit: string;
  unit_number: string | null;
  primary_contact_name: string | null;
  payment_id: string;
  paid_at: string;
  amount: number;
  method: "transfer" | "cash" | "qris" | "other";
  reference_no: string | null;
  payer_name: string | null;
  verification_status: "pending" | "verified" | "rejected" | "void";
  due_period_month: number | null;
  due_period_year: number | null;
  period_count: number;
  period_label: string;
};

export type DuesStatusInfo = {
  status: "lunas" | "pending" | "unpaid" | "no_data";
  statusText: string;
  coverageText?: string;
  monthlyAmount: number;
  lastPaymentDate?: string;
  pendingCount: number;
  pendingAmount: number;
  recapRows: DuesRecapRow[];
};

function computeDuesStatus(rows: DuesRecapRow[]): DuesStatusInfo {
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
    : undefined;

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
    : undefined;

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

  if (latestCoverageDate && latestCoverageDate >= currentEndOfMonth) {
    return {
      status: "lunas",
      statusText: `LUNAS S/D ${coverageText?.toUpperCase()}`,
      coverageText,
      monthlyAmount: 50_000,
      lastPaymentDate: lastPaymentDate || "05 Sep 2026",
      pendingCount: pendingRows.length,
      pendingAmount,
      recapRows: rows,
    };
  }

  if (rows.length === 0) {
    return {
      status: "no_data",
      statusText: "BELUM ADA REKAP IURAN",
      coverageText: undefined,
      monthlyAmount: 50_000,
      lastPaymentDate: undefined,
      pendingCount: 0,
      pendingAmount: 0,
      recapRows: [],
    };
  }

  const currentMonthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now);
  return {
    status: "unpaid",
    statusText: `BELUM LUNAS (${currentMonthLabel.toUpperCase()})`,
    coverageText,
    monthlyAmount: 50_000,
    lastPaymentDate,
    pendingCount: pendingRows.length,
    pendingAmount,
    recapRows: rows,
  };
}

export function PortalMobileDashboard() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient() };
    } catch {
      return { client: null };
    }
  }, []);

  const [user, setUser] = useState<PortalUser | null>(null);
  const [duesInfo, setDuesInfo] = useState<DuesStatusInfo>(() => computeDuesStatus([]));

  // Modal dialog states matching mockup screens
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) return;
    const client = supabase;

    let mounted = true;
    async function loadUser() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUser = sessionData.session?.user;
      if (!mounted) return;

      if (!activeUser) {
        setUser(null);
        return;
      }

      const email = (activeUser.email ?? "").toLowerCase();
      const [{ data: profile }, { data: roleRows }, { data: regRequest }] =
        await Promise.all([
          client
            .from("profiles")
            .select("display_name")
            .eq("id", activeUser.id)
            .maybeSingle(),
          client.from("user_roles").select("role").eq("user_id", activeUser.id),
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
      const isPengurus =
        roles.some((role) => adminRoles.has(role)) ||
        knownPengurusEmails.has(email);

      const emailPrefix = activeUser.email?.split("@")[0] || "Warga CGV10";
      const profileName = profile?.display_name?.trim() || "";
      const regName = regRequest?.display_name?.trim() || "";
      const metaName = (
        (activeUser.user_metadata?.display_name as string | undefined) ||
        (activeUser.user_metadata?.full_name as string | undefined) ||
        ""
      ).trim();

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

      const cluster = regRequest?.cluster || "Chiswick";
      const blockOrUnit = regRequest?.block_or_unit || "A-12";
      const shortId = activeUser.id.replace(/-/g, "").slice(0, 4).toUpperCase();
      const residentId = `CGV-010-${shortId || "0012"}`;

      setUser({
        displayName: finalDisplayName,
        cluster,
        blockOrUnit,
        residentId,
        familyCardNo: "3271010101010012",
        isAdmin: isPengurus,
      });

      // Load dues recap
      try {
        const { data: duesData } = await client.rpc("get_my_dues_recap");
        if (mounted && duesData && Array.isArray(duesData)) {
          setDuesInfo(computeDuesStatus(duesData as DuesRecapRow[]));
        }
      } catch {
        // ignore
      }
    }

    void loadUser();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(loadUser, 0));
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseState.client]);

  const displayName = user?.displayName || "Budi Santoso";
  const cluster = user?.cluster || "Chiswick";
  const blockOrUnit = user?.blockOrUnit || "A-12";
  const residentId = user?.residentId || "CGV-010-0012";

  function handleOpenReceiptDefault() {
    const verifiedRows = duesInfo.recapRows.filter((r) => r.verification_status === "verified");
    const latestVerified = verifiedRows.sort(
      (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
    )[0];

    if (latestVerified) {
      setReceiptData({
        name: displayName,
        cluster,
        blockOrUnit,
        residentId,
        monthPeriod: latestVerified.period_label || `Periode ${latestVerified.period_count} Bulan`,
        paymentDate: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
          new Date(latestVerified.paid_at)
        ),
        amount: Number(latestVerified.amount) || 50000,
        paymentMethod: latestVerified.method === "transfer" ? "Transfer Bank (BCA)" : latestVerified.method.toUpperCase(),
        referenceNo: latestVerified.reference_no || latestVerified.payment_id.slice(0, 10),
      });
    } else {
      setReceiptData({
        name: displayName,
        cluster,
        blockOrUnit,
        residentId,
        monthPeriod: "September 2026",
        paymentDate: "05 Sep 2026",
        amount: 50000,
        paymentMethod: "Transfer Bank (BCA)",
        referenceNo: "202609050001",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] pb-24 text-foreground md:hidden">
      {/* Opening splash screen — shown once ever on first launch */}
      <PortalSplashScreen />

      {/* ── TOP HEADER (Screen 1) ─────────────────────────────────── */}
      <header className="relative bg-[#00473e] text-white">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
              <Image
                src="/assets/brand/official-cgv-logo.png"
                alt="Logo CGV"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-black tracking-wide uppercase text-emerald-300 leading-none">
                RT 010 / RW 021
              </p>
              <h1 className="text-sm font-extrabold text-white leading-tight">
                Cipta Green Ville
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/kabar-warga/"
              aria-label="Notifikasi dan Kabar"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Hero Gate Image Banner */}
        <div className="relative h-32 w-full overflow-hidden bg-emerald-950">
          <Image
            src="/images/cgv-splash-bg.jpg"
            alt="Perumahan Cipta Green Ville"
            fill
            className="object-cover opacity-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00473e] via-transparent to-black/30" />
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-xs text-white/90">
            <span className="font-semibold drop-shadow-sm">Asri, Bersih & Guyub Rukun</span>
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
              Tembesi Sagulung
            </span>
          </div>
        </div>

        {/* Resident Greeting Header */}
        <div className="px-4 py-3 bg-[#00473e]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 border-2 border-emerald-400/60 text-lg font-bold text-white shadow-inner">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-emerald-200 leading-none">
                {getTimeGreeting()},
              </p>
              <h2 className="text-base font-extrabold text-white leading-tight">
                {displayName}
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                {cluster} {blockOrUnit}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── SCREEN 1: KARTU IURAN DIGITAL MINI & STATUS IURAN ────────── */}
      <section className="px-4 -mt-1 space-y-3 pt-3">
        {/* Digital ID Card Preview (Mini) */}
        <ResidentIdCardMini
          displayName={displayName}
          cluster={cluster}
          blockOrUnit={blockOrUnit}
          residentId={residentId}
          onClick={() => setShowIdCardModal(true)}
        />

        {/* Quick Dues Status Card */}
        <div
          onClick={() => setShowStatusModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setShowStatusModal(true)}
          className={`cursor-pointer rounded-2xl p-4 shadow-sm border transition-all active:scale-[0.99] ${
            duesInfo.status === "lunas"
              ? "bg-white border-emerald-200/80 hover:border-emerald-500"
              : duesInfo.status === "pending"
              ? "bg-amber-50/50 border-amber-300 hover:border-amber-500"
              : "bg-rose-50/40 border-rose-200 hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ${
                duesInfo.status === "lunas"
                  ? "bg-emerald-600"
                  : duesInfo.status === "pending"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}>
                {duesInfo.status === "lunas" ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                ) : duesInfo.status === "pending" ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </span>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Status Iuran Warga
                </span>
                <span className={`text-xs font-black ${
                  duesInfo.status === "lunas"
                    ? "text-emerald-800"
                    : duesInfo.status === "pending"
                    ? "text-amber-800"
                    : "text-rose-800"
                }`}>
                  {duesInfo.statusText}
                </span>
              </div>
            </div>
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            <div>
              <span className="block text-[10px] text-slate-400">Iuran Bulanan</span>
              <span className="text-xs font-bold text-slate-800">Rp {duesInfo.monthlyAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-400">Terakhir Verifikasi</span>
              <span className="text-xs font-semibold text-slate-800">{duesInfo.lastPaymentDate || "-"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADMIN BANNER IF APPLICABLE ─────────────────────────── */}
      {user?.isAdmin ? (
        <section className="px-4 pt-3">
          <Link
            href="/admin/?source=portal-mobile"
            className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent-soft to-[#fef9e6] px-4 text-xs font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary text-accent-soft text-xs">
                <Icon name="building" />
              </span>
              Dashboard Pengurus RT Aktif
            </span>
            <span className="font-bold text-primary" aria-hidden="true">→</span>
          </Link>
        </section>
      ) : null}

      {/* ── SHORTCUT GRID ──────────────────────────────────────── */}
      <section className="px-4 pt-5">
        <div className="flex items-end justify-between gap-3 mb-2.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800">
              Akses cepat
            </p>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Layanan Warga
            </h3>
          </div>
          <Link href="/layanan/" className="text-xs font-bold text-emerald-700 underline-offset-4 hover:underline">
            Semua
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {shortcuts.map((item) => (
            <div key={item.label}>
              {item.isAction === "iuran" ? (
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="group flex w-full flex-col items-center gap-1.5 rounded-2xl py-1 text-center"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl shadow-sm transition-transform duration-200 group-active:scale-90 ${item.bg}`}
                  >
                    <span className={`scale-110 ${item.iconColor}`}>
                      <Icon name={item.icon} />
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-800">
                    {item.label}
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl py-1 text-center"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl shadow-sm transition-transform duration-200 group-active:scale-90 ${item.bg}`}
                  >
                    <span className={`scale-110 ${item.iconColor}`}>
                      <Icon name={item.icon} />
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-800">
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── INFORMASI UNTUK ANDA ─────────────────────────────────── */}
      <section className="px-4 pt-5">
        <div className="flex items-end justify-between gap-3 mb-2.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800">
              Pengumuman
            </p>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Informasi untuk Anda
            </h3>
          </div>
          <Link href="/kabar-warga/" className="text-xs font-bold text-emerald-700 underline-offset-4 hover:underline">
            Lihat semua
          </Link>
        </div>

        <div className="space-y-2.5">
          {updates.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-emerald-500"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.iconBg}`}>
                <Icon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-900">{item.title}</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">{item.meta}</span>
              </span>
              <span className="shrink-0 text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FIXED BOTTOM NAVIGATION BAR ─────────────────────────── */}
      <nav
        aria-label="Navigasi Aplikasi Warga"
        className="fixed inset-x-0 bottom-0 z-40 grid h-[4.5rem] grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur md:hidden shadow-lg"
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-emerald-800"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-slate-500 hover:text-emerald-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Riwayat</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPaymentModal(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-slate-500 hover:text-emerald-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Bayar</span>
        </button>

        <Link
          href="/portal/profil-rumah/"
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-slate-500 hover:text-emerald-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Lainnya</span>
        </Link>
      </nav>

      {/* ── MODALS INTEGRATION (Screen 2, 3, 4, 5, 6) ───────────── */}
      {/* Screen 2: Digital ID Card Modal */}
      <ResidentIdCardModal
        isOpen={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        displayName={displayName}
        cluster={cluster}
        blockOrUnit={blockOrUnit}
        residentId={residentId}
        familyCardNo={user?.familyCardNo || "3271010101010012"}
        status="Aktif"
      />

      {/* Screen 3: Dues Status Modal Hub */}
      <DuesStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onOpenPayment={() => {
          setShowStatusModal(false);
          setShowPaymentModal(true);
        }}
        onOpenHistory={() => {
          setShowStatusModal(false);
          setShowHistoryModal(true);
        }}
        onOpenReceipt={() => {
          setShowStatusModal(false);
          handleOpenReceiptDefault();
        }}
        cluster={cluster}
        blockOrUnit={blockOrUnit}
        statusType={duesInfo.status}
        duesStatusText={duesInfo.statusText}
        coverageText={duesInfo.coverageText}
        monthlyAmount={duesInfo.monthlyAmount}
        lastPaymentDate={duesInfo.lastPaymentDate}
        pendingCount={duesInfo.pendingCount}
        pendingAmount={duesInfo.pendingAmount}
      />

      {/* Screen 4: Dues History Modal */}
      <DuesHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onOpenReceipt={(data) => {
          setShowHistoryModal(false);
          setReceiptData(data);
        }}
        residentName={displayName}
        cluster={cluster}
        blockOrUnit={blockOrUnit}
        residentId={residentId}
        recapRows={duesInfo.recapRows}
      />

      {/* Screen 5: Dues Payment Modal */}
      <DuesPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cluster={cluster}
        blockOrUnit={blockOrUnit}
      />

      {/* Screen 6: Official Digital Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
    </main>
  );
}
