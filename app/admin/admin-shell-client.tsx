"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "./production-admin-components";

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
        setMessage("Belum ada session login aktif.");
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
        setMessage("Akun aktif, tetapi belum punya role admin production.");
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
    setMessage("Belum ada session login aktif.");
  }

  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const roleNames = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "Belum ada role";
  const roleLabel = primaryRole ? formatRole(primaryRole) : roleNames;
  const isSuperAdmin = primaryRole === "super_admin";
  const isLoading = state === "checking" || state === "loading_profile";

  return (
    <ProductionAdminShell
      active="dashboard"
      title="Dashboard"
      subtitle="Production overview"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleLabel}
      isSuperAdmin={isSuperAdmin}
      action={
        user ? (
          <ProductionActionButton onClick={handleLogout} primary>
            Logout
          </ProductionActionButton>
        ) : (
          <ProductionActionButton href="/admin/login/" primary>
            Masuk
          </ProductionActionButton>
        )
      }
    >
      <ProductionPageIntro
        eyebrow="Cipta Greenville - RT 010 / RW 021"
        title={
          <>
            Ringkasan Operasional <br />
            <span className="italic">Admin Production CGV10</span>
          </>
        }
        text="Dashboard production memakai Supabase Auth, RLS, profile, role, dan permission. Modul live dipisahkan dari admin-preview yang tetap menjadi prototype statis."
        side={<ProductionStatusPill>{state === "authorized" ? "Auth OK" : "Loading access"}</ProductionStatusPill>}
      />

      <section aria-label="Ringkasan production" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProductionMetricCard label="Auth" value={user ? "Active" : "Required"} helper={visibleEmail} icon="users" />
        <ProductionMetricCard label="Role" value={primaryRole ? formatRole(primaryRole) : "-"} helper={roleDescriptions[primaryRole ?? "sekretaris"] ?? "Role dari user_roles."} icon="shield" tone="gold" />
        <ProductionMetricCard label="Portal Posts" value="Read-only" helper="Supabase + RLS + content:read" icon="file" tone="green" />
        <ProductionMetricCard label="Admin Preview" value="Static" helper="Demo tetap terpisah" icon="building" tone="dark" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <ProductionPanel>
          <ProductionPanelHeader
            title="Modul Production"
            subtitle="Modul yang sudah memakai jalur data production, bukan state demo browser."
          />
          <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
            <a
              href="/admin/portal-posts/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <ProductionStatusPill>Supabase read-only</ProductionStatusPill>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Portal Posts</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Membaca portal_posts lewat Supabase Auth, RLS, dan permission content:read.
              </p>
              <div className="mt-4 grid gap-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Status</span>
                  <span className="font-bold text-primary">Supabase read-only</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Permission</span>
                  <span className="font-bold text-primary">content:read</span>
                </div>
                <span className="pt-2 font-bold text-primary group-hover:text-primary-hover">
                  Buka Portal Posts
                </span>
              </div>
            </a>

            <a
              href="/admin-preview/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent-soft text-foreground [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPreviewIcon />
                </span>
                <ProductionStatusPill>Static demo</ProductionStatusPill>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Admin Preview</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Prototype dashboard tetap terpisah untuk presentasi UI dan alur modul.
              </p>
              <div className="mt-4 border-t border-border pt-3">
                <span className="text-sm font-bold text-primary group-hover:text-primary-hover">
                  Buka Static Demo
                </span>
              </div>
            </a>
          </div>
        </ProductionPanel>

        <ProductionPanel>
          <ProductionPanelHeader
            title="Access State"
            subtitle="Status session dan role production saat ini."
          />
          <div className="space-y-3 px-5 pb-5">
            <InfoRow label="State" value={isLoading ? "Memuat akses..." : message} />
            <InfoRow label="Email" value={visibleEmail} />
            <InfoRow label="Roles" value={roleNames} />
            <InfoRow label="Debug nav" value={isSuperAdmin ? "Visible for super_admin" : "Hidden"} />
          </div>
        </ProductionPanel>
      </section>

      {state === "not_logged_in" ? (
        <ProtectedMessage
          title="Login diperlukan"
          text="Belum ada session Supabase aktif. Login admin diperlukan sebelum dashboard production dapat membaca data RLS."
          actionHref="/admin/login/"
          actionText="Masuk admin"
        />
      ) : null}

      {state === "no_admin_role" ? (
        <ProtectedMessage
          title="Access denied"
          text="Akun Supabase aktif, tetapi tidak memiliki role super_admin, ketua_rt, sekretaris, atau bendahara di user_roles."
        />
      ) : null}

      {state === "error" ? (
        <ProtectedMessage
          title="Admin shell error"
          text={message}
          actionHref="/admin/login/"
          actionText="Kembali ke login"
        />
      ) : null}
    </ProductionAdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-foreground">{value}</p>
    </div>
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
    <ProductionPanel className="mt-5">
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{text}</p>
        {actionHref && actionText ? (
          <ProductionActionButton href={actionHref} primary>
            {actionText}
          </ProductionActionButton>
        ) : null}
      </div>
    </ProductionPanel>
  );
}

function ProductionPortalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d="M12 3.5 19 6v5.2c0 4.1-2.8 7.9-7 9.3-4.2-1.4-7-5.2-7-9.3V6l7-2.5Z" />
      <path d="M8.5 10.5h7M8.5 14h5" />
    </svg>
  );
}

function ProductionPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d="M4.5 5.5h15v11h-15z" />
      <path d="M8 20h8M10 16.5 9.5 20M14 16.5l.5 3.5M8 9h8M8 12.5h5" />
    </svg>
  );
}
