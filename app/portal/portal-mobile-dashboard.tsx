"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PortalSplashScreen } from "./portal-splash-screen";

type PortalUser = { displayName: string; isAdmin: boolean };
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

const shortcuts: Array<{
  label: string;
  href: string;
  icon: IconName;
  bg: string;
  iconColor: string;
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
    bg: "bg-gradient-to-br from-amber-400 to-yellow-500",
    iconColor: "text-amber-900",
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
    meta: "Lihat informasi terbaru dari pengurus",
    href: "/kabar-warga/",
    icon: "megaphone" as IconName,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    title: "Butuh bantuan atau ingin melapor?",
    meta: "Pilih kategori, lalu kirim permintaan",
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

export function PortalMobileDashboard() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient() };
    } catch {
      return { client: null };
    }
  }, []);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isChecking, setIsChecking] = useState(() => Boolean(supabaseState.client));

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) {
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
      const [{ data: profile }, { data: roleRows }, { data: regRequest }] = await Promise.all([
        client.from("profiles").select("display_name").eq("id", activeUser.id).maybeSingle(),
        client.from("user_roles").select("role").eq("user_id", activeUser.id),
        client
          .from("resident_registration_requests")
          .select("display_name")
          .or(`requested_user_id.eq.${activeUser.id},email.ilike.${email}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (!mounted) return;

      const roles = ((roleRows ?? []) as RoleRow[]).map((row) => row.role);

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

      setUser({
        displayName: finalDisplayName,
        isAdmin: roles.some((role) => adminRoles.has(role)),
      });
      setIsChecking(false);
    }

    void loadUser();
    const { data: { subscription } } = client.auth.onAuthStateChange(() => window.setTimeout(loadUser, 0));
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseState.client]);

  const initial = user ? user.displayName.charAt(0).toUpperCase() : "W";

  return (
    <main className="min-h-screen bg-[#f3efe6] pb-24 text-foreground md:hidden">
      {/* Opening splash screen — shown once ever on first launch */}
      <PortalSplashScreen />
      {/* ── HERO HEADER ───────────────────────────────────── */}
      <header className="relative overflow-hidden pb-7 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        {/* Layered gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#002c26] via-[#003D34] to-[#005548]" />
        {/* Subtle dot texture */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]" aria-hidden="true">
          <defs>
            <pattern id="pdots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pdots)" />
        </svg>
        {/* Gold ring accents */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-[3px] border-accent/18" />
        <div className="pointer-events-none absolute -bottom-6 right-2 h-24 w-24 rounded-full border-2 border-accent/12" />

        {/* Top bar — Logo circle + Cipta Greenville branding */}
        <div className="relative flex items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            {/* Circle logo — consistent with splash & portal */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_3px_10px_rgba(0,0,0,0.25)]">
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
            <div>
              <p className="text-[13px] font-extrabold tracking-wide leading-none text-white">Cipta Greenville</p>
              <p className="mt-0.5 text-[9px] font-bold tracking-[0.12em] text-accent-soft uppercase">Portal Warga · RT 010</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-[11px] font-semibold text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            aria-label="Buka situs publik"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Situs Publik
          </Link>
        </div>

        {/* User Greeting — Name + Address (matching UI/UX photo) */}
        <div className="relative mt-5 flex items-end px-4">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
              {getTimeGreeting()}
            </p>
            <h1 className="mt-1 text-[1.45rem] font-black leading-[1.2] tracking-tight text-white">
              {isChecking
                ? "Memuat..."
                : user
                  ? user.displayName
                  : "Selamat Datang"}
            </h1>
            <p className="mt-1 text-[11px] font-medium text-white/55">
              {user ? "Warga CGV · RT 010 Cipta Greenville" : "Portal Resmi Warga Cipta Greenville"}
            </p>
          </div>
          <div className="shrink-0 self-end">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-lg font-black text-foreground shadow-[0_0_0_3px_rgba(212,175,55,0.3)]">
              {initial}
            </span>
          </div>
        </div>
      </header>

      {/* ── AUTH CARD ─────────────────────────────────────── */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_10px_32px_rgba(0,61,52,0.1)]">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
          <div className="pointer-events-none absolute -bottom-5 right-8 h-16 w-16 rounded-full bg-accent/8" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">Status akun</p>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {user ? "Akun warga siap digunakan" : "Masuk untuk akses pribadi"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {user
                  ? "Lihat rumah, iuran, dan riwayat layanan Anda."
                  : "Buka informasi rumah dan layanan yang terhubung ke akun Anda."}
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-accent-soft shadow-[0_6px_16px_rgba(0,61,52,0.25)]">
              <Icon name="shield" />
            </span>
          </div>
          <Link
            href={user ? "/portal/profil-rumah/" : "/masuk/?next=/portal/"}
            className="mt-3.5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(0,61,52,0.28)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {user ? "Lihat Rumah Saya" : "Masuk Warga"}
          </Link>
        </div>
      </section>

      {/* ── ADMIN BANNER ──────────────────────────────────── */}
      {user?.isAdmin ? (
        <section className="px-4 pt-3">
          <Link
            href="/admin/?source=portal-mobile"
            className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-accent/40 bg-gradient-to-r from-accent-soft to-[#fef9e6] px-4 text-sm font-bold text-foreground shadow-[0_4px_12px_rgba(212,175,55,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-accent-soft">
                <Icon name="building" />
              </span>
              Menu Pengurus tersedia
            </span>
            <span className="font-bold text-primary" aria-hidden="true">→</span>
          </Link>
        </section>
      ) : null}

      {/* ── SHORTCUT GRID ─────────────────────────────────── */}
      <section className="px-4 pt-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">Akses cepat</p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight">Pilih kebutuhan</h2>
          </div>
          <Link href="/layanan/" className="text-xs font-bold text-primary underline-offset-4 hover:underline">Lihat layanan</Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {shortcuts.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center gap-2 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                className={`grid h-[3.6rem] w-[3.6rem] place-items-center rounded-[18px] shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-transform duration-200 group-active:scale-90 ${item.bg}`}
              >
                <span className={`scale-110 ${item.iconColor}`}>
                  <Icon name={item.icon} />
                </span>
              </span>
              <span className="text-[10.5px] font-bold leading-tight text-foreground">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── UPDATES ───────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">Yang terbaru</p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight">Informasi untuk Anda</h2>
          </div>
          <Link href="/kabar-warga/" className="text-xs font-bold text-primary underline-offset-4 hover:underline">Semua kabar</Link>
        </div>
        <div className="mt-3 space-y-2.5">
          {updates.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-black/7 bg-white p-3.5 shadow-[0_3px_12px_rgba(12,24,16,0.05)] transition-all duration-200 hover:shadow-[0_6px_18px_rgba(0,61,52,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.iconBg}`}>
                <Icon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{item.title}</span>
                <span className="mt-0.5 block text-xs leading-4 text-muted">{item.meta}</span>
              </span>
              <span className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
