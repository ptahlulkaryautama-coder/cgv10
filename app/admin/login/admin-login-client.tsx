"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginState = "checking" | "ready" | "submitting" | "signed-in" | "error";

export function AdminLoginClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch (error) {
      console.error(error);
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa sesi admin...",
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    let mounted = true;

    client.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      if (data.session) {
        setState("signed-in");
        setMessage("Anda sudah login. Membuka admin...");
        window.location.assign("/admin/");
        return;
      }

      setState("ready");
      setMessage("Masuk dengan email dan password Supabase yang sudah diberi role admin.");
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState("error");
      setMessage("Konfigurasi Supabase belum siap.");
      return;
    }

    setState("submitting");
    setMessage("Memvalidasi kredensial...");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setState("ready");
      setMessage(error.message);
      return;
    }

    setState("signed-in");
    setMessage("Login berhasil. Membuka admin...");
    window.location.assign("/admin/");
  }

  const isBusy = state === "checking" || state === "submitting" || state === "signed-in";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <section className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)] lg:items-center">
          <div className="max-w-2xl">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              CGV10 Portal Warga
            </Link>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Production Admin
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-primary sm:text-5xl">
              Masuk ke admin operasional CGV10.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              Shell ini memakai Supabase Auth client-side karena build masih static export.
              Akses data tetap dikunci oleh RLS dan role yang tersimpan di Supabase.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_24px_60px_rgba(18,32,24,0.12)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">Login admin</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Email/password Supabase.</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                RLS aktif
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-foreground">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-12 rounded-xl border border-border bg-white px-4 text-base font-medium outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="admin@cgv10.id"
                  disabled={isBusy}
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-foreground">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-12 rounded-xl border border-border bg-white px-4 text-base font-medium outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Password"
                  disabled={isBusy}
                />
              </label>
            </div>

            <div
              className="mt-5 rounded-xl border border-border bg-cream px-4 py-3 text-sm font-semibold leading-6 text-muted"
              aria-live="polite"
            >
              {message}
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "submitting" ? "Memproses..." : "Masuk"}
            </button>

            <p className="mt-4 text-xs leading-5 text-muted">
              Tidak ada service role key di frontend. Jika akun belum punya role admin,
              halaman admin akan menampilkan status terlindungi.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
