"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginState = "checking" | "ready" | "submitting" | "signed-in" | "error";

export function AdminLoginClient() {
  const router = useRouter();
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
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<LoginState>("ready");
  const [message, setMessage] = useState(
    supabaseState.error || "Masuk dengan email dan password akun pengurus CGV10.",
  );

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    // Check if user already has an active session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data?.session?.user) {
        setState("signed-in");
        setMessage("Anda sudah login. Membuka admin...");
        router.replace("/admin/");
      }
    });

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setState("error");
      setMessage("Konfigurasi Supabase belum siap.");
      return;
    }

    setState("submitting");
    setMessage("Memvalidasi kredensial...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setState("ready");
      setMessage(
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi tidak sesuai. Periksa kembali penulisan Anda."
          : error.message,
      );
      return;
    }

    if (data?.session) {
      setState("signed-in");
      setMessage("Login berhasil. Membuka admin...");
      router.replace("/admin/");
    }
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
              Portal Pengurus
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-primary sm:text-5xl">
              Masuk ke admin operasional CGV10.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              Ruang kerja pengurus untuk mengelola informasi, layanan, dan data
              warga sesuai kewenangan masing-masing.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_24px_60px_rgba(18,32,24,0.12)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">Login admin</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Gunakan akun pengurus yang sudah terdaftar.</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                Akses terlindungi
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

              <div className="grid gap-2 text-sm font-bold text-foreground">
                <label htmlFor="admin-password" className="font-bold text-foreground">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-border bg-white px-4 pr-12 text-base font-medium outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Password"
                    disabled={isBusy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
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
              Jika akun belum memiliki akses pengurus, hubungi administrator portal.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
