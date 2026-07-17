"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "../production-admin-components";

type DebugState = "checking" | "not_logged_in" | "access_denied" | "loaded" | "error";

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

    const loadedRoles = (roleData ?? []) as RoleRow[];

    setProfile(profileData ?? null);
    setRoles(loadedRoles);
    setProfileError(loadedProfileError?.message ?? "");
    setRoleError(loadedRoleError?.message ?? "");

    if (loadedProfileError || loadedRoleError) {
      setState("error");
      setMessage("Session aktif, tetapi query profile atau role gagal.");
      return;
    }

    if (!loadedRoles.some((row) => row.role === "super_admin")) {
      setState("access_denied");
      setMessage("Debug production hanya tersedia untuk super_admin.");
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

  const isSuperAdmin = roles.some((row) => row.role === "super_admin");
  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const roleSummary = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "-";
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
      value: roleSummary,
      helper: roleHelper,
      tone: roles.length > 0 ? "ok" : "warn",
    },
  ];

  return (
    <ProductionAdminShell
      active="debug"
      title="Debug"
      subtitle="Super admin diagnostics"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleSummary}
      isSuperAdmin={isSuperAdmin}
      action={
        <ProductionActionButton onClick={loadDiagnostics} primary>
          Refresh
        </ProductionActionButton>
      }
    >
      <ProductionPageIntro
        eyebrow="Runtime check"
        title={
          <>
            Admin Diagnostics <br />
            <span className="italic">Super Admin Only</span>
          </>
        }
        text="Halaman ini tetap memakai Supabase Auth dan RLS untuk membaca profile serta role. Akses konten debug dibatasi untuk role super_admin."
        side={<ProductionStatusPill>{state === "loaded" ? "Debug OK" : state.replaceAll("_", " ")}</ProductionStatusPill>}
      />

      {state === "not_logged_in" ? (
        <ProductionPanel>
          <div className="p-5">
            <h2 className="text-lg font-bold text-foreground">Login diperlukan</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Debug production memerlukan session Supabase aktif dan role super_admin.
            </p>
            <div className="mt-4">
              <ProductionActionButton href="/admin/login/" primary>
                Masuk admin
              </ProductionActionButton>
            </div>
          </div>
        </ProductionPanel>
      ) : null}

      {state === "access_denied" ? (
        <ProductionPanel>
          <div className="p-5">
            <h2 className="text-lg font-bold text-foreground">Access denied</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Session aktif, tetapi role super_admin tidak ditemukan di user_roles.
              Navigasi Debug juga disembunyikan untuk role selain super_admin.
            </p>
          </div>
        </ProductionPanel>
      ) : null}

      {state === "checking" ? (
        <ProductionPanel>
          <div className="p-5">
            <h2 className="text-lg font-bold text-foreground">Memeriksa akses debug...</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Profile dan user_roles sedang dibaca melalui RLS sebelum diagnostics ditampilkan.
            </p>
          </div>
        </ProductionPanel>
      ) : null}

      {state === "error" ? (
        <ProductionPanel>
          <div className="p-5">
            <h2 className="text-lg font-bold text-foreground">Debug error</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">{message}</p>
          </div>
        </ProductionPanel>
      ) : null}

      {state === "loaded" && isSuperAdmin ? (
        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,0.68fr)_minmax(320px,0.32fr)]">
          <ProductionPanel>
            <ProductionPanelHeader title={message} subtitle="Koneksi, Auth, profile, dan role production." />
            <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
              {diagnostics.map((item) => (
                <DiagnosticCard key={item.label} item={item} />
              ))}
            </div>
          </ProductionPanel>

          <aside className="grid gap-5">
            <ProductionPanel>
              <div className="p-5">
                <h2 className="text-lg font-black text-foreground">Error detail</h2>
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
              </div>
            </ProductionPanel>

            <ProductionPanel>
              <div className="p-5">
                <h2 className="text-lg font-black text-foreground">Checklist cepat</h2>
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
                    Debug hanya untuk super_admin.
                  </li>
                </ul>
              </div>
            </ProductionPanel>
          </aside>
        </div>
      ) : null}
    </ProductionAdminShell>
  );
}
