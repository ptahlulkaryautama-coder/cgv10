"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PortalUser = { displayName: string; isAdmin: boolean };
type RoleRow = { role: string };

const adminRoles = new Set([
  "super_admin",
  "ketua_rt",
  "sekretaris",
  "bendahara",
  "palugada_reviewer",
]);

const shortcuts: Array<{ label: string; href: string; icon: IconName; tone: string }> = [
  { label: "Lapor", href: "/layanan/#form-layanan", icon: "message", tone: "bg-red-50 text-red-700" },
  { label: "Iuran", href: "/keuangan/", icon: "wallet", tone: "bg-accent-soft text-foreground" },
  { label: "PALUGADA", href: "/palugada/", icon: "store", tone: "bg-primary-soft text-primary" },
  { label: "Kabar", href: "/kabar-warga/", icon: "megaphone", tone: "bg-blue-50 text-blue-700" },
];

const updates = [
  { title: "Kabar dan pengumuman lingkungan", meta: "Lihat informasi terbaru dari pengurus", href: "/kabar-warga/", icon: "megaphone" as IconName },
  { title: "Butuh bantuan atau ingin melapor?", meta: "Pilih kategori, lalu kirim permintaan", href: "/layanan/#form-layanan", icon: "message" as IconName },
];

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

      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        client.from("profiles").select("display_name").eq("id", activeUser.id).maybeSingle(),
        client.from("user_roles").select("role").eq("user_id", activeUser.id),
      ]);
      if (!mounted) return;

      const roles = ((roleRows ?? []) as RoleRow[]).map((row) => row.role);
      setUser({
        displayName: profile?.display_name || activeUser.email?.split("@")[0] || "Warga CGV10",
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

  const greeting = isChecking ? "Memuat akun Anda..." : user ? `Halo, ${user.displayName}` : "Selamat datang di CGV10";

  return (
    <main className="min-h-screen bg-[#f3efe6] pb-24 text-foreground md:hidden">
      <header className="bg-primary px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/8 text-accent-soft">
              <Icon name="home" />
            </span>
            <div>
              <p className="text-sm font-bold">CGV10</p>
              <p className="text-[10px] font-semibold tracking-[0.04em] text-accent-soft">CIPTA GREENVILLE</p>
            </div>
          </div>
          <Link href="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft" aria-label="Buka situs publik">
            <Icon name="home" />
          </Link>
        </div>
        <div className="mt-5">
          <p className="text-sm font-medium text-white/70">{greeting}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Apa yang perlu Anda lakukan?</h1>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className="rounded-2xl border border-primary/12 bg-[#fffdf8] p-4 shadow-[0_8px_22px_rgba(12,24,16,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Status akun</p>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {user ? "Akun warga siap digunakan" : "Masuk untuk akses pribadi"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {user ? "Lihat rumah, iuran, dan riwayat layanan Anda." : "Buka informasi rumah dan layanan yang terhubung ke akun Anda."}
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon name="shield" /></span>
          </div>
          <Link
            href={user ? "/portal/profil-rumah/" : "/masuk/?next=/portal/"}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {user ? "Lihat Rumah Saya" : "Masuk Warga"}
          </Link>
        </div>
      </section>

      {user?.isAdmin ? (
        <section className="px-4 pt-3">
          <Link href="/admin/?source=portal-mobile" className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-accent/35 bg-accent-soft px-4 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex items-center gap-2.5"><span className="text-primary"><Icon name="building" /></span>Menu Pengurus tersedia</span>
            <span className="text-primary" aria-hidden="true">→</span>
          </Link>
        </section>
      ) : null}

      <section className="px-4 pt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Akses cepat</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight">Pilih kebutuhan</h2>
          </div>
          <Link href="/layanan/" className="text-xs font-bold text-primary underline-offset-4 hover:underline">Lihat layanan</Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {shortcuts.map((item) => (
            <Link key={item.label} href={item.href} className="flex min-h-[5.55rem] flex-col items-center justify-center gap-2 rounded-xl border border-black/7 bg-[#fffdf8] px-1 text-center shadow-[0_3px_12px_rgba(12,24,16,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${item.tone}`}><Icon name={item.icon} /></span>
              <span className="text-[10px] font-bold leading-3 text-foreground">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Yang terbaru</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight">Informasi untuk Anda</h2>
          </div>
          <Link href="/kabar-warga/" className="text-xs font-bold text-primary underline-offset-4 hover:underline">Semua kabar</Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-black/7 bg-[#fffdf8] shadow-[0_3px_12px_rgba(12,24,16,0.05)]">
          {updates.map((item) => (
            <Link key={item.title} href={item.href} className="flex min-h-[4.75rem] items-center gap-3 border-b border-border px-3 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Icon name={item.icon} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-foreground">{item.title}</span><span className="mt-0.5 block text-xs leading-4 text-muted">{item.meta}</span></span>
              <span className="text-primary" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
