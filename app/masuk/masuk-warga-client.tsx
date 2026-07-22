"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginState = "checking" | "ready" | "submitting" | "signed-in" | "error";
type RoleRow = { role: string };
type AccessMode = "login" | "register";
type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  cluster: string;
  blockOrUnit: string;
  password: string;
};

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
  const [mode, setMode] = useState<AccessMode>("login");
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    cluster: "",
    blockOrUnit: "",
    password: "",
  });
  const [state, setState] = useState<LoginState>(
    supabaseState.error ? "error" : "checking",
  );
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa akun warga...",
  );
  const [registerMessage, setRegisterMessage] = useState("");
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
        if (!registerMessage) {
          setMessage("Masuk dengan email dan password yang sudah didaftarkan.");
        }
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
      if (!registerMessage) {
        setMessage("Akun aktif. Pilih tujuan yang ingin dibuka.");
      }
    }

    void loadSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(loadSession, 0));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, registerMessage]);

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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState("error");
      setMessage("Koneksi portal belum siap. Coba muat ulang halaman.");
      return;
    }

    const nextRegisterForm = {
      name: registerForm.name.trim(),
      email: registerForm.email.trim().toLowerCase(),
      phone: registerForm.phone.trim(),
      cluster: registerForm.cluster.trim(),
      blockOrUnit: registerForm.blockOrUnit.trim(),
      password: registerForm.password,
    };

    if (nextRegisterForm.password.length < 6) {
      setState("ready");
      setMessage("Password minimal 6 karakter.");
      return;
    }

    setState("submitting");
    setRegisterMessage("");
    setMessage("Mendaftarkan akun dan mengirim data ke antrean pengurus...");

    try {
      const { error: requestError } = await supabase.rpc(
        "submit_resident_registration_request",
        {
          p_email: nextRegisterForm.email,
          p_display_name: nextRegisterForm.name,
          p_phone: nextRegisterForm.phone,
          p_cluster: nextRegisterForm.cluster,
          p_block_or_unit: nextRegisterForm.blockOrUnit,
        },
      );

      if (requestError) {
        setState("ready");
        const errorMessage = `Pendaftaran belum masuk: ${requestError.message}`;
        setMessage(errorMessage);
        setRegisterMessage(errorMessage);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: nextRegisterForm.email,
        password: nextRegisterForm.password,
        options: {
          data: {
            display_name: nextRegisterForm.name,
          },
          emailRedirectTo:
            typeof window === "undefined"
              ? undefined
              : `${window.location.origin}/masuk/?next=/portal/`,
        },
      });

      const successMessage = signUpError
        ? signUpError.message.toLowerCase().includes("already")
          ? "Permintaan verifikasi sudah masuk ke admin. Email ini sudah terdaftar, jadi silakan masuk dengan password yang pernah dibuat."
          : `Permintaan verifikasi sudah masuk ke admin, tapi akun login belum selesai dibuat: ${signUpError.message}`
        : signUpData.session
          ? "Pendaftaran masuk ke antrean pengurus. Akun bisa login, akses warga aktif setelah disetujui."
          : "Pendaftaran masuk ke antrean pengurus. Cek email jika diminta konfirmasi akun.";

      setUserEmail(signUpData.user?.email ?? nextRegisterForm.email);
      setRegisterForm({
        name: "",
        email: "",
        phone: "",
        cluster: "",
        blockOrUnit: "",
        password: "",
      });
      setState("ready");
      setMessage(successMessage);
      setRegisterMessage(successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Pendaftaran belum masuk karena terjadi error di browser.";
      setState("ready");
      setMessage(errorMessage);
      setRegisterMessage(errorMessage);
    }
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

        {!isSignedIn ? (
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-white/14 bg-white/8 p-1">
            {(["login", "register"] as AccessMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                disabled={isBusy}
                className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-70 ${
                  mode === item
                    ? "bg-white text-primary"
                    : "text-white/76 hover:bg-white/10"
                }`}
              >
                {item === "login" ? "Masuk" : "Daftar warga"}
              </button>
            ))}
          </div>
        ) : null}

        {registerMessage ? (
          <div className="mt-5 rounded-xl border border-accent-soft/40 bg-accent-soft/18 px-4 py-3 text-sm font-semibold leading-6 text-white">
            {registerMessage}
          </div>
        ) : null}

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
        ) : mode === "login" ? (
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
        ) : (
          <form onSubmit={handleRegister} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-white">
              Nama warga
              <input
                value={registerForm.name}
                onChange={(event) => setRegisterForm((previous) => ({ ...previous, name: event.target.value }))}
                disabled={isBusy}
                required
                minLength={2}
                maxLength={120}
                placeholder="Nama sesuai data rumah"
                className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-white">
                Blok / cluster
                <input
                  value={registerForm.cluster}
                  onChange={(event) => setRegisterForm((previous) => ({ ...previous, cluster: event.target.value }))}
                  disabled={isBusy}
                  required
                  placeholder="Contoh: Colosseum"
                  className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Nomor rumah
                <input
                  value={registerForm.blockOrUnit}
                  onChange={(event) => setRegisterForm((previous) => ({ ...previous, blockOrUnit: event.target.value }))}
                  disabled={isBusy}
                  required
                  placeholder="Contoh: 12"
                  className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-white">
              WhatsApp
              <input
                type="tel"
                value={registerForm.phone}
                onChange={(event) => setRegisterForm((previous) => ({ ...previous, phone: event.target.value }))}
                disabled={isBusy}
                required
                placeholder="08xx"
                className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={registerForm.email}
                onChange={(event) => setRegisterForm((previous) => ({ ...previous, email: event.target.value }))}
                disabled={isBusy}
                placeholder="nama@email.com"
                className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white">
              Password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={registerForm.password}
                onChange={(event) => setRegisterForm((previous) => ({ ...previous, password: event.target.value }))}
                disabled={isBusy}
                placeholder="Minimal 6 karakter"
                className="min-h-12 rounded-xl border border-white/16 bg-white px-4 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
              />
            </label>
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state === "submitting" ? "Mengirim..." : "Daftar dan minta verifikasi"}
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
