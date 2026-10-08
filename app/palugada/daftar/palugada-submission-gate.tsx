"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PalugadaSubmissionForm } from "./palugada-submission-form";

type GateState = "checking" | "authenticated" | "guest" | "unconfigured";

export function PalugadaSubmissionGate() {
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
    return <PalugadaSubmissionForm />;
  }

  if (state === "checking") {
    return (
      <div className="rounded-3xl border border-[#DED4C4] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 rounded-full border-2 border-[#003D34] border-t-transparent animate-spin" />
        <p className="mt-3 text-sm font-semibold text-stone-700">
          Memeriksa status akun warga...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-3xl border border-[#DED4C4] bg-gradient-to-br from-[#002B24] to-[#001D18] p-6 sm:p-8 text-white shadow-xl lg:grid-cols-[0.65fr_0.35fr] lg:items-center">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#E8C865]">
            Akun Warga Diperlukan
          </span>
          <span className="text-xs text-white/70">Lingkungan CGV</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
          Masuk terlebih dahulu untuk mendaftarkan usaha Anda.
        </h2>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
          Katalog PALUGADA dapat diakses oleh seluruh warga dan umum, tetapi pendaftaran lapak dikhususkan untuk warga CGV10 terdaftar agar lapak terhubung ke akun Anda dan bisa Anda kelola kapan saja.
        </p>
        {state === "unconfigured" && (
          <p className="text-[11px] text-[#E8C865] bg-black/30 rounded-xl p-2.5">
            ℹ️ Mode autentikasi offline/lokal aktif. Silakan masuk melalui halaman login warga.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/masuk/?next=/palugada/daftar/"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] px-6 text-sm font-black text-[#15140B] shadow-lg hover:brightness-110 transition-all active:scale-95"
        >
          <span>🔐 Masuk untuk Mendaftar Lapak</span>
        </Link>
        <Link
          href="/palugada/"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-xs font-bold text-white hover:bg-white/20 transition-all"
        >
          Lihat Katalog PALUGADA →
        </Link>
      </div>
    </div>
  );
}

