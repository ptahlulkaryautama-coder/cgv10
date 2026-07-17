"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ServiceRequestForm } from "./service-request-form";

type GateState = "checking" | "authenticated" | "guest" | "unconfigured";

export function ServiceRequestGate() {
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;
        setState(data.session ? "authenticated" : "guest");
      } catch {
        if (!mounted) return;
        setState("unconfigured");
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (state === "authenticated") {
    return <ServiceRequestForm />;
  }

  if (state === "checking") {
    return (
      <section
        id="form-layanan"
        className="scroll-mt-28 border-y border-border bg-surface"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              Memeriksa akses warga...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="form-layanan"
      className="scroll-mt-28 border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="grid gap-5 rounded-2xl border border-accent/45 bg-accent-soft/65 p-5 shadow-sm sm:p-6 lg:grid-cols-[0.7fr_0.3fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Login warga diperlukan
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Informasi layanan terbuka, pengajuan layanan hanya untuk warga
              yang sudah masuk.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/78">
              Masuk sebagai warga CGV10 agar laporan, administrasi, dan
              aspirasi terhubung ke akun serta bisa ditindaklanjuti pengurus
              dengan konteks yang jelas.
            </p>
            {state === "unconfigured" ? (
              <p className="mt-3 text-xs leading-5 text-foreground/68">
                Auth produksi belum aktif di environment ini. Form pengajuan
                akan tersedia setelah login warga tersambung.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/masuk/?next=/layanan/%23form-layanan"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
            >
              Masuk warga
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
