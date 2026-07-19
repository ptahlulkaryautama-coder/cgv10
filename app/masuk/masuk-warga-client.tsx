"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginState = "checking" | "ready" | "submitting" | "signed-in" | "error";
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
  "nikodiponako7@gmail.com",
]);

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  ketua_rt: "Ketua RT",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  palugada_reviewer: "Reviewer PALUGADA",
};

function getSafeNextPath() {
  if (typeof window === "undefined") return "/portal/";

  const next = new URLSearchParams(window.location.search).get("next");
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/portal/";
  }

  return next;
}

export function MasukWargaClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Koneksi portal belum siap. Coba muat ulang halaman." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>(
    supabaseState.error ? "error" : "checking",
  );
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa akun warga...",
  );
  const [nextPath] = useState(getSafeNextPath);
  const [userEmail, setUserEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let mounted = true;

    async function loadSession() {
      const { data, error } = await client.auth.getSession();
      if (!mounted) return;

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      const user = data.session?.user;
      if (!user) {
        setState("ready");
        setMessage("Masuk dengan email dan password yang sudah didaftarkan.");
        return;
      }

      setUserEmail(user.email ?? "");
      const { data: roleData } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!mounted) return;
      setRoles(((roleData ?? []) as RoleRow[]).map((row) => row.role));
      setState("signed-in");
      setMessage("Akun aktif. Pilih tujuan yang ingin dibuka.");
    }

    void loadSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(loadSession, 0));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState("error");
      setMessage("Koneksi portal belum siap. Coba muat ulang halaman.");
      return;
    }

    setState("submitting");
    setMessage("Memvalidasi login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setState("ready");
      setMessage(error.message);
      return;
    }

    const activeUser = data.user;
    const { data: roleData } = activeUser
      ? await supabase.from("user_roles").select("role").eq("user_id", activeUser.id)
      : { data: [] };
    const nextRoles = ((roleData ?? []) as RoleRow[]).map((row) => row.role);
    const normalizedEmail = (activeUser?.email ?? email).toLowerCase();
    const hasAdminAccess =
      nextRoles.some((role) => adminRoles.has(role)) ||
      knownPengurusEmails.has(normalizedEmail);

    setUserEmail(activeUser?.email ?? email.trim());
    setRoles(nextRoles);
    setState("signed-in");

    if (hasAdminAccess && nextPath === "/portal/") {
      setMessage("Akun pengurus terdeteksi. Pilih Dashboard Pengurus atau Portal Warga.");
      return;
    }

    setMessage("Login berhasil. Membuka tujuan...");
    window.location.assign(nextPath);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setRoles([]);
    setUserEmail("");
    setState("ready");
    setMessage("Anda sudah keluar.");
  }

  const isBusy = state === "checking" || state === "submitting";
  const isSignedIn = state === "signed-in";
  const hasAdminRole =
    roles.some((role) => adminRoles.has(role)) ||
    knownPengurusEmails.has(userEmail.toLowerCase());
  const statusLabel =
    roles.length > 0
      ? roles.map((role) => roleLabels[role] ?? role).join(", ")
      : hasAdminRole
        ? "Pengurus"
        : "Warga";

  return (
    <div className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <div className="rounded-xl border border-white/14 bg-white/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
              Login warga
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {isSignedIn ? "Akun aktif" : "Masuk ke portal"}
            </h2>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            Aman
          </span>
        </div>

        {isSignedIn ? (
          <div className="mt-6">
            <div className="rounded-xl border border-accent-soft/40 bg-accent-soft/18 p-4 text-sm leading-6 text-white/86">
              <p className="font-semibold text-white">{userEmail || "User aktif"}</p>
              <p className="mt-1">
                Status: {statusLabel}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href={nextPath}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
              >
                Lanjutkan akses
              </Link>
              <Link
                href="/portal/"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Portal warga
              </Link>
              {hasAdminRole ? (
                <Link
                  href="/admin/?source=login-admin-cta"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-accent-soft/40 bg-white/10 px-4 text-sm font-semibold text-accent-soft transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                >
                  Buka Dashboard Pengurus
                </Link>
              ) : null}
              {hasAdminRole ? (
                <Link
                  href="/admin/?source=login-install-admin"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-primary transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                >
                  Pasang dashboard di HP
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Keluar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-white">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isBusy}
                placeholder="nama@email.com"
                className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
                placeholder="Password"
                className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
              />
            </label>
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state === "submitting" ? "Memproses..." : "Masuk"}
            </button>
          </form>
        )}

        <div
          className="mt-5 rounded-xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-semibold leading-6 text-white/82"
          aria-live="polite"
        >
          {message}
        </div>
      </div>
    </div>
  );
}
