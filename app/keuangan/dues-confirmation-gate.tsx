"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { DuesConfirmationForm } from "./dues-confirmation-form";

type GateState = "checking" | "authenticated" | "guest" | "unconfigured";

export function DuesConfirmationGate() {
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
    return <DuesConfirmationForm />;
  }

  if (state === "checking") {
    return (
      <section
        id="konfirmasi-iuran"
        className="scroll-mt-28 border-y border-border bg-surface"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
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
      id="konfirmasi-iuran"
      className="scroll-mt-28 border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-5 rounded-2xl border border-accent/45 bg-accent-soft/65 p-5 shadow-sm sm:p-6 lg:grid-cols-[0.7fr_0.3fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Login warga diperlukan
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ringkasan kas terbuka, konfirmasi iuran hanya untuk warga yang
              sudah masuk.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/78">
              Masuk sebagai warga CGV10 agar bukti pembayaran terhubung ke akun
              dan bisa dicocokkan bendahara dengan data rumah.
            </p>
            {state === "unconfigured" ? (
              <p className="mt-3 text-xs leading-5 text-foreground/68">
                Auth produksi belum aktif di environment ini. Form konfirmasi
                akan tersedia setelah login warga tersambung.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/masuk/?next=/keuangan/%23konfirmasi-iuran"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
            >
              Masuk warga
            </Link>
            <Link
              href="/kontak/#kontak-cepat"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-surface px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
            >
              Kontak bendahara
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
