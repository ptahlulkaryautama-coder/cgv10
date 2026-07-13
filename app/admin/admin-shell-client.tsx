"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminRole = "super_admin" | "ketua_rt" | "sekretaris" | "bendahara";
type LoadState = "checking" | "not_logged_in" | "loading_profile" | "no_admin_role" | "authorized" | "error";

type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  status: "invited" | "active" | "suspended";
};

type UserRoleRow = {
  role: string;
  assigned_at: string;
};

const adminRoles: AdminRole[] = ["super_admin", "ketua_rt", "sekretaris", "bendahara"];

const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  ketua_rt: "Ketua RT",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
};

const roleDescriptions: Record<AdminRole, string> = {
  super_admin: "Akses penuh untuk aktivasi admin, role, konfigurasi, dan audit.",
  ketua_rt: "Akses pengawasan lintas modul untuk operasional RT.",
  sekretaris: "Akses data warga, layanan, konten, dan administrasi portal.",
  bendahara: "Akses keuangan dan konfirmasi iuran.",
};

function getPrimaryRole(rows: UserRoleRow[]): AdminRole | null {
  const roles = rows.map((row) => row.role);
  return adminRoles.find((role) => roles.includes(role)) ?? null;
}

function formatRole(role: AdminRole) {
  return roleLabels[role];
}

export function AdminShellClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch (error) {
      console.error(error);
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [state, setState] = useState<LoadState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa sesi Supabase...",
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [primaryRole, setPrimaryRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    let mounted = true;

    async function loadSessionAndRole() {
      setState("checking");
      setMessage("Memeriksa sesi Supabase...");

      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (!mounted) {
        return;
      }

      if (sessionError) {
        setState("error");
        setMessage(sessionError.message);
        return;
      }

      const activeUser = sessionData.session?.user ?? null;
      setUser(activeUser);

      if (!activeUser) {
        setProfile(null);
        setRoles([]);
        setPrimaryRole(null);
        setState("not_logged_in");
        setMessage("Not logged in");
        return;
      }

      setState("loading_profile");
      setMessage("Memuat profile dan role dari Supabase...");

      const [{ data: profileData, error: profileError }, { data: roleData, error: roleError }] =
        await Promise.all([
          client
            .from("profiles")
            .select("id, display_name, email, status")
            .eq("id", activeUser.id)
            .maybeSingle<Profile>(),
          client
            .from("user_roles")
            .select("role, assigned_at")
            .eq("user_id", activeUser.id)
            .order("assigned_at", { ascending: true }),
        ]);

      if (!mounted) {
        return;
      }

      if (profileError) {
        setState("error");
        setMessage(`Gagal memuat profile: ${profileError.message}`);
        return;
      }

      if (roleError) {
        setState("error");
        setMessage(`Gagal memuat role: ${roleError.message}`);
        return;
      }

      const loadedRoles = (roleData ?? []) as UserRoleRow[];
      const adminRole = getPrimaryRole(loadedRoles);

      setProfile(profileData ?? null);
      setRoles(loadedRoles);
      setPrimaryRole(adminRole);

      if (!adminRole) {
        setState("no_admin_role");
        setMessage("Logged in but no admin role");
        return;
      }

      setState("authorized");
      setMessage(`Logged in as ${adminRole}`);
    }

    loadSessionAndRole();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        loadSessionAndRole();
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    setMessage("Logout diproses...");
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRoles([]);
    setPrimaryRole(null);
    setState("not_logged_in");
    setMessage("Not logged in");
  }

  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const roleNames = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "Belum ada role";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
              CGV10 Production Admin
            </p>
            <h1 className="mt-2 text-2xl font-black text-primary sm:text-3xl">Admin Shell</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin-preview/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Static demo
            </Link>
            <Link
              href="/admin/login/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Login
            </Link>
            <Link
              href="/admin/debug/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Debug
            </Link>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)] lg:px-8">
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
                Protected state
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground">{message}</h2>
            </div>
            <StateBadge state={state} role={primaryRole} />
          </div>

          {state === "not_logged_in" ? (
            <ProtectedMessage
              title="Not logged in"
              text="Belum ada sesi Supabase aktif di browser ini. Login diperlukan sebelum admin production dapat membaca data yang dilindungi RLS."
              actionHref="/admin/login/"
              actionText="Masuk admin"
            />
          ) : null}

          {state === "no_admin_role" ? (
            <ProtectedMessage
              title="Logged in but no admin role"
              text="Akun Supabase aktif, tetapi tidak memiliki role super_admin, ketua_rt, sekretaris, atau bendahara di tabel user_roles."
            />
          ) : null}

          {state === "authorized" && primaryRole ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <InfoPanel label="Status akses" value={`Logged in as ${primaryRole}`} helper={roleDescriptions[primaryRole]} />
              <InfoPanel label="Role utama" value={formatRole(primaryRole)} helper="Role diambil dari tabel user_roles." />
              <InfoPanel label="Profile" value={profile?.display_name || "Tanpa nama tampilan"} helper={visibleEmail} />
              <InfoPanel label="Status akun" value={profile?.status ?? "Profile belum terbaca"} helper="Status dari tabel profiles." />
            </div>
          ) : null}

          {state === "checking" || state === "loading_profile" ? (
            <div className="mt-6 rounded-xl border border-border bg-cream p-4 text-sm font-semibold text-muted">
              {message}
            </div>
          ) : null}

          {state === "error" ? (
            <ProtectedMessage
              title="Admin shell error"
              text={message}
              actionHref="/admin/login/"
              actionText="Kembali ke login"
            />
          ) : null}
        </section>

        <aside className="grid gap-5">
          <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)]">
            <h2 className="text-lg font-black text-foreground">Session</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="rounded-xl border border-border bg-white p-3">
                <dt className="font-bold text-muted">Email</dt>
                <dd className="mt-1 break-words font-black text-foreground">{visibleEmail}</dd>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <dt className="font-bold text-muted">Roles</dt>
                <dd className="mt-1 break-words font-black text-foreground">{roleNames}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)]">
            <h2 className="text-lg font-black text-foreground">Phase B scope</h2>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-muted">
              <li className="rounded-xl bg-cream px-3 py-2">Supabase Auth client-side.</li>
              <li className="rounded-xl bg-cream px-3 py-2">Profile and role read via RLS.</li>
              <li className="rounded-xl bg-cream px-3 py-2">No portal_posts wiring yet.</li>
              <li className="rounded-xl bg-cream px-3 py-2">No media upload handling yet.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

function StateBadge({ state, role }: { state: LoadState; role: AdminRole | null }) {
  const label = role ? `Logged in as ${role}` : state.replaceAll("_", " ");
  const tone =
    state === "authorized"
      ? "border-primary/20 bg-primary-soft text-primary"
      : state === "not_logged_in" || state === "no_admin_role"
        ? "border-accent/30 bg-accent-soft text-foreground"
        : "border-border bg-cream text-muted";

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${tone}`}>
      {label}
    </span>
  );
}

function ProtectedMessage({
  title,
  text,
  actionHref,
  actionText,
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionText?: string;
}) {
  return (
    <div className="mt-6 rounded-[16px] border border-border bg-cream p-5">
      <h3 className="text-lg font-black text-foreground">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{text}</p>
      {actionHref && actionText ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
}

function InfoPanel({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-lg font-black text-primary">{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted">{helper}</p>
    </div>
  );
}
