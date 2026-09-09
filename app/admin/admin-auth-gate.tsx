"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type GateState = "checking" | "authorized" | "denied" | "error";

const productionAdminRoles = [
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

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const [state, setState] = useState<GateState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(supabaseState.error || "Memeriksa sesi admin...");

  const clearStaleSession = useCallback(async () => {
    try {
      if (supabaseState.client) {
        await supabaseState.client.auth.signOut({ scope: "local" });
      }
    } catch {}
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cgv10-session");
        for (const key of Object.keys(window.localStorage)) {
          if (key.startsWith("sb-") || key.includes("supabase") || key.includes("auth-token")) {
            window.localStorage.removeItem(key);
          }
        }
      }
    } catch {}
  }, [supabaseState.client]);

  const handleReLogin = useCallback(async () => {
    await clearStaleSession();
    window.location.assign("/admin/login/");
  }, [clearStaleSession]);

  useEffect(() => {
    if (isLoginPage || !supabaseState.client) return;

    const client = supabaseState.client;
    let mounted = true;

    async function evaluateUser(activeUser: import("@supabase/supabase-js").User | null) {
      if (!mounted) return;

      if (!activeUser) {
        setState("denied");
        setMessage("Sesi login admin diperlukan.");
        router.replace("/admin/login/");
        return;
      }

      setState("checking");
      setMessage("Memeriksa kewenangan dan role admin...");

      try {
        const [{ data: profile, error: profileError }, { data: roles, error: roleError }] =
          await Promise.all([
            client.from("profiles").select("status").eq("id", activeUser.id).maybeSingle(),
            client.from("user_roles").select("role").eq("user_id", activeUser.id),
          ]);

        if (!mounted) return;

        if (profileError || roleError) {
          const rawErr = `${profileError?.message || ""} ${roleError?.message || ""}`.toLowerCase();
          if (
            rawErr.includes("jwt") ||
            rawErr.includes("token") ||
            rawErr.includes("bad request") ||
            rawErr.includes("unauthorized") ||
            rawErr.includes("401") ||
            rawErr.includes("400")
          ) {
            await clearStaleSession();
            router.replace("/admin/login/");
            return;
          }

          setState("error");
          setMessage(profileError?.message || roleError?.message || "Gagal memeriksa akses admin.");
          return;
        }

        if (profile?.status !== "active") {
          setState("denied");
          setMessage("Akun admin Anda belum aktif atau sedang dinonaktifkan. Silakan hubungi pengurus RT.");
          return;
        }

        const hasAdminRole = (roles ?? []).some((row) => productionAdminRoles.includes(row.role));
        if (!hasAdminRole) {
          setState("denied");
          setMessage("Akun ini terdaftar, namun belum memiliki hak akses/role pengurus admin CGV10.");
          return;
        }

        setState("authorized");
      } catch (err: unknown) {
        if (!mounted) return;
        const errMsg = err instanceof Error ? err.message : "Gagal memeriksa otorisasi admin.";
        setState("error");
        setMessage(errMsg);
      }
    }

    // Subscribe to auth events (including INITIAL_SESSION on page hydration)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setState("denied");
        router.replace("/admin/login/");
      } else if (session?.user) {
        await evaluateUser(session.user);
      } else if (event === "INITIAL_SESSION" && !session) {
        await evaluateUser(null);
      }
    });

    // Fallback getSession check
    client.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        await clearStaleSession();
        router.replace("/admin/login/");
        return;
      }
      if (session?.user) {
        await evaluateUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearStaleSession, isLoginPage, router, supabaseState.client]);

  if (isLoginPage) return children;
  if (state === "authorized") return children;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3efe6] px-4 text-foreground">
      <section className="w-full max-w-md rounded-[20px] border border-black/8 bg-[#fdfcf9] p-6 text-center shadow-[0_20px_60px_rgba(12,24,16,0.12)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3.5 19 6v5.2c0 4.1-2.8 7.9-7 9.3-4.2-1.4-7-5.2-7-9.3V6l7-2.5Z" />
            <path d="M9.5 12 11 13.5l3.5-4" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-black text-primary">
          {state === "checking" ? "Memeriksa akses" : state === "denied" ? "Akses Terbatas" : "Admin Tidak Tersedia"}
        </h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted" aria-live="polite">{message}</p>
        
        {state === "checking" ? (
          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-primary-soft">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleReLogin}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] bg-primary px-5 text-sm font-bold text-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Masuk Kembali
            </button>
            <Link
              href="/portal/"
              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-border bg-white px-5 text-sm font-bold text-foreground transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Portal Warga
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

