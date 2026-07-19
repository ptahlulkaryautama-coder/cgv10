"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Icon } from "../components/portal";

type RoleRow = { role: string };

const adminRoles = new Set([
  "super_admin",
  "ketua_rt",
  "sekretaris",
  "bendahara",
  "palugada_reviewer",
]);

const knownPengurusEmails = new Set([
  "dharma.doddy9@yahoo.co.uk",
  "zulhendy@gmail.com",
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
          : "Email pengurus terdeteksi. Jika admin belum terbuka, jalankan role migration di Supabase.",
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
    <section className="mt-5 rounded-2xl border border-accent/35 bg-accent-soft p-4 text-foreground shadow-[0_18px_45px_rgba(212,175,55,0.18)] sm:mt-6 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-background text-primary">
          <Icon name="building" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Admin Pengurus
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Buka Admin Dashboard
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">{helper}</p>
        </div>
        <div className="grid gap-2 sm:min-w-44">
          <Link
            href="/admin/?source=portal-admin-shortcut"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Buka Admin
          </Link>
          <Link
            href="/admin/?source=portal-install-admin"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-primary/20 bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Pasang di HP
          </Link>
        </div>
      </div>
    </section>
  );
}
