"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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

export function AdminDashboardShortcut() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [visible, setVisible] = useState(false);
  const [helper, setHelper] = useState("Shortcut admin untuk pengurus.");

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let mounted = true;

    async function loadAccess() {
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;
      if (!mounted || !user) {
        setVisible(false);
        return;
      }

      const email = (user.email ?? "").toLowerCase();
      const { data: roleData } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!mounted) return;

      const roles = ((roleData ?? []) as RoleRow[]).map((row) => row.role);
      const hasAdminRole = roles.some((role) => adminRoles.has(role));
      const isKnownPengurus = knownPengurusEmails.has(email);

      setVisible(hasAdminRole || isKnownPengurus);
      setHelper(
        hasAdminRole
          ? `Role aktif: ${roles.join(", ")}`
          : "Email pengurus terdeteksi. Hak akses admin belum terbaca dari sesi ini.",
      );
    }

    void loadAccess();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(loadAccess, 0));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!visible) return null;

  return (
    <section className="mt-5 rounded-2xl border border-accent/45 bg-accent-soft p-4 text-foreground shadow-[0_18px_45px_rgba(212,175,55,0.22)] sm:mt-6 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-background text-primary shadow-sm">
          <svg
            className="h-6 w-6 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Admin Pengurus
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            Buka Admin Dashboard
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">{helper}</p>
        </div>
        <div className="grid gap-2 sm:min-w-44">
          <Link
            href="/admin/?source=portal-admin-shortcut"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Buka Admin</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/admin/?source=portal-install-admin"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-primary/20 bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Install di HP
          </Link>
        </div>
      </div>
    </section>
  );
}
