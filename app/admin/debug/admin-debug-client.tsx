"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DebugState = "checking" | "not_logged_in" | "loaded" | "error";

type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  status: "invited" | "active" | "suspended";
};

type RoleRow = {
  role: string;
  assigned_at: string;
};

type DiagnosticItem = {
  label: string;
  value: string;
  helper: string;
  tone?: "ok" | "warn" | "neutral";
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function maskKey(value: string) {
  if (!value) {
    return "Tidak tersedia";
  }

  if (value.length <= 14) {
    return `${value.slice(0, 4)}...`;
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function formatBoolean(value: boolean) {
  return value ? "Ya" : "Tidak";
}

function getHostFromUrl(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return "URL tidak valid";
  }
}

function StatusPill({ state }: { state: DebugState }) {
  const tone =
    state === "loaded"
      ? "border-primary/20 bg-primary-soft text-primary"
      : state === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-accent/30 bg-accent-soft text-foreground";

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${tone}`}>
      {state.replaceAll("_", " ")}
    </span>
  );
}

function DiagnosticCard({ item }: { item: DiagnosticItem }) {
  const tone =
    item.tone === "ok"
      ? "border-primary/20 bg-primary-soft/50"
      : item.tone === "warn"
        ? "border-accent/35 bg-accent-soft/60"
        : "border-border bg-white";

  return (
    <article className={`rounded-[16px] border p-4 ${tone}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {item.label}
      </p>
      <p className="mt-2 break-words text-base font-black text-foreground">
        {item.value}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted">
        {item.helper}
      </p>
    </article>
  );
}

export function AdminDebugClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch (error) {
      console.error(error);
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);

  const supabase = supabaseState.client;
  const [state, setState] = useState<DebugState>(
    supabaseState.error ? "error" : "checking",
  );
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa session dan koneksi Supabase...",
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [authError, setAuthError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [roleError, setRoleError] = useState("");

  const loadDiagnostics = useCallback(async () => {
    if (!supabase) {
      setState("error");
      setMessage("Konfigurasi Supabase belum siap.");
      return;
    }

    setState("checking");
    setMessage("Memeriksa session dan koneksi Supabase...");
    setAuthError("");
    setProfileError("");
    setRoleError("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setUser(null);
      setProfile(null);
      setRoles([]);
      setAuthError(sessionError.message);
      setState("error");
      setMessage("Gagal membaca session Supabase.");
      return;
    }

    const activeUser = sessionData.session?.user ?? null;
    setUser(activeUser);

    if (!activeUser) {
      setProfile(null);
      setRoles([]);
      setState("not_logged_in");
      setMessage("Belum ada session login aktif.");
      return;
    }

    const [{ data: profileData, error: loadedProfileError }, { data: roleData, error: loadedRoleError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, email, status")
          .eq("id", activeUser.id)
          .maybeSingle<Profile>(),
        supabase
          .from("user_roles")
          .select("role, assigned_at")
          .eq("user_id", activeUser.id)
          .order("assigned_at", { ascending: true }),
      ]);

    setProfile(profileData ?? null);
    setRoles((roleData ?? []) as RoleRow[]);
    setProfileError(loadedProfileError?.message ?? "");
    setRoleError(loadedRoleError?.message ?? "");

    if (loadedProfileError || loadedRoleError) {
      setState("error");
      setMessage("Session aktif, tetapi query profile atau role gagal.");
      return;
    }

    setState("loaded");
    setMessage("Diagnostics berhasil dimuat.");
  }, [supabase]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadDiagnostics();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadDiagnostics]);

  const profileHelper = profile?.email ?? (profileError || "Profile belum terbaca.");
  const roleHelper = roleError || "Role dibaca dari public.user_roles via RLS.";

  const diagnostics: DiagnosticItem[] = [
    {
      label: "Supabase URL",
      value: supabaseUrl || "Tidak tersedia",
      helper: `Host: ${supabaseUrl ? getHostFromUrl(supabaseUrl) : "-"}`,
      tone: supabaseUrl ? "ok" : "warn",
    },
    {
      label: "Anon key publik",
      value: maskKey(supabaseAnonKey),
      helper: "Ditampilkan sebagian saja. Service role key tidak boleh ada di frontend.",
      tone: supabaseAnonKey ? "ok" : "warn",
    },
    {
      label: "Session aktif",
      value: formatBoolean(Boolean(user)),
      helper: user?.email ?? "Login diperlukan untuk membaca profile dan role.",
      tone: user ? "ok" : "warn",
    },
    {
      label: "Auth user id",
      value: user?.id ?? "-",
      helper: "UUID ini harus sama dengan public.profiles.id dan public.user_roles.user_id.",
      tone: user ? "ok" : "neutral",
    },
    {
      label: "Profile",
      value: profile ? `${profile.display_name} (${profile.status})` : "-",
      helper: profileHelper,
      tone: profile ? "ok" : "warn",
    },
    {
      label: "Roles",
      value: roles.length > 0 ? roles.map((row) => row.role).join(", ") : "-",
      helper: roleHelper,
      tone: roles.length > 0 ? "ok" : "warn",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
              CGV10 Production Admin
            </p>
            <h1 className="mt-2 text-2xl font-black text-primary sm:text-3xl">
              Admin Diagnostics
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Admin
            </Link>
            <Link
              href="/admin/login/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={loadDiagnostics}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.68fr)_minmax(320px,0.32fr)] lg:px-8">
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
                Runtime Check
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground">
                {message}
              </h2>
            </div>
            <StatusPill state={state} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {diagnostics.map((item) => (
              <DiagnosticCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)]">
            <h2 className="text-lg font-black text-foreground">
              Error detail
            </h2>
            <dl className="mt-4 grid gap-3 text-sm">
              {[
                ["Auth", authError || "OK"],
                ["Profile", profileError || "OK"],
                ["Role", roleError || "OK"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-white p-3">
                  <dt className="font-bold text-muted">{label}</dt>
                  <dd className="mt-1 break-words font-black text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)]">
            <h2 className="text-lg font-black text-foreground">
              Checklist cepat
            </h2>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-muted">
              <li className="rounded-xl bg-cream px-3 py-2">
                Supabase URL harus sama antara local dan production.
              </li>
              <li className="rounded-xl bg-cream px-3 py-2">
                Auth user id harus sama dengan profile dan role.
              </li>
              <li className="rounded-xl bg-cream px-3 py-2">
                CSP production harus mengizinkan domain Supabase.
              </li>
              <li className="rounded-xl bg-cream px-3 py-2">
                Clear service worker/cache setelah deploy besar.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
