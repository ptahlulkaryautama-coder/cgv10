"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type GateState = "checking" | "authorized" | "denied" | "error";

const productionAdminRoles = [
  "super_admin",
  "ketua_rt",
  "sekretaris",
  "bendahara",
  "palugada_reviewer",
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

  useEffect(() => {
    if (isLoginPage || !supabaseState.client) return;

    const client = supabaseState.client;
    let mounted = true;

    async function checkAccess() {
      setState("checking");
      setMessage("Memeriksa sesi dan role admin...");

      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (!mounted) return;

      if (sessionError) {
        setState("error");
        setMessage(sessionError.message);
        return;
      }

      const user = sessionData.session?.user;
      if (!user) {
        router.replace("/admin/login/");
        return;
      }

      const [{ data: profile, error: profileError }, { data: roles, error: roleError }] =
        await Promise.all([
          client.from("profiles").select("status").eq("id", user.id).maybeSingle(),
          client.from("user_roles").select("role").eq("user_id", user.id),
        ]);

      if (!mounted) return;

      if (profileError || roleError) {
        setState("error");
        setMessage(profileError?.message || roleError?.message || "Gagal memeriksa akses admin.");
        return;
      }

      if (profile?.status !== "active") {
        setState("denied");
        setMessage("Akun admin tidak aktif.");
        return;
      }

      const hasAdminRole = (roles ?? []).some((row) => productionAdminRoles.includes(row.role));
      if (!hasAdminRole) {
        setState("denied");
        setMessage("Akun ini tidak memiliki role admin production.");
        return;
      }

      setState("authorized");
    }

    void checkAccess();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(checkAccess, 0));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, router, supabaseState.client]);

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
          {state === "checking" ? "Memeriksa akses" : state === "denied" ? "Akses ditolak" : "Admin tidak tersedia"}
        </h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted" aria-live="polite">{message}</p>
        {state === "checking" ? (
          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-primary-soft">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        ) : (
          <Link href="/admin/login/" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-primary px-5 text-sm font-bold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Kembali ke login
          </Link>
        )}
      </section>
    </main>
  );
}
