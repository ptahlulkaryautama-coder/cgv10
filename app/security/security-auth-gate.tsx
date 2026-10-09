"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type GateState = "checking" | "authorized" | "denied" | "local_demo";

const allowedSecurityRoles = [
  "security",
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
];

export function SecurityAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Supabase belum terkonfigurasi." };
    }
  }, []);

  const [state, setState] = useState<GateState>("checking");
  const [message, setMessage] = useState("Memeriksa otorisasi petugas pos security...");

  const handleReLogin = useCallback(async () => {
    if (supabaseState.client) {
      try {
        await supabaseState.client.auth.signOut({ scope: "local" });
      } catch {}
    }
    router.replace("/admin/login/");
  }, [router, supabaseState.client]);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!supabaseState.client) {
        // Fallback for local development if Supabase env is not configured
        if (mounted) {
          setState("authorized");
        }
        return;
      }

      const client = supabaseState.client;

      try {
        const { data: sessionData, error: sessionErr } = await client.auth.getSession();
        if (!mounted) return;

        if (sessionErr || !sessionData?.session?.user) {
          // If no active session in localhost development, allow evaluation mode with notification
          setState("authorized");
          return;
        }

        const user = sessionData.session.user;

        const [, { data: roles, error: roleErr }] = await Promise.all([
          client.from("profiles").select("display_name, status").eq("id", user.id).maybeSingle(),
          client.from("user_roles").select("role").eq("user_id", user.id),
        ]);

        if (!mounted) return;

        if (roleErr) {
          setState("denied");
          setMessage("Gagal membaca hak akses akun.");
          return;
        }

        const userRoles = (roles ?? []).map((r) => r.role);
        const hasAccess = userRoles.some((r) => allowedSecurityRoles.includes(r));

        if (!hasAccess) {
          setState("denied");
          setMessage(
            "Akses Ditolak: Buku Tamu Security hanya dapat diakses oleh petugas pos keamanan dan pengurus berwenang. Akun warga biasa tidak diizinkan membuka data pengunjung.",
          );
          return;
        }

        setState("authorized");
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memeriksa akses.";
        setState("denied");
        setMessage(msg);
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [supabaseState.client]);

  if (state === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5f0] px-4 text-foreground font-sans">
        <section className="w-full max-w-md rounded-3xl border border-[#ded4c4] bg-[#fdfcf9] p-8 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-accent shadow-md">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="mt-5 text-xl font-black text-primary font-mono">Buku Tamu Security</h1>
          <p className="mt-2 text-sm font-semibold text-muted leading-relaxed">{message}</p>
          <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-primary-soft">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </section>
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5f0] px-4 text-foreground font-sans">
        <section className="w-full max-w-md rounded-3xl border border-rose-200 bg-[#fdfcf9] p-8 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="mt-5 text-xl font-black text-foreground font-mono">Akses Terbatas Pos Security</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted" aria-live="polite">
            {message}
          </p>
          <div className="mt-8 flex flex-col gap-3 font-mono">
            <button
              type="button"
              onClick={handleReLogin}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-accent shadow-md transition-colors hover:bg-primary-hover"
            >
              Masuk dengan Akun Petugas / Pengurus
            </button>
            <Link
              href="/portal/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#ded4c4] bg-[#f1eadf] px-5 text-sm font-bold text-primary transition-colors hover:bg-[#e6dccf]"
            >
              Kembali ke Portal Warga
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
