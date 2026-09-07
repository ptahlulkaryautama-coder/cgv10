"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SectionHeading } from "../components/portal";
import { DuesConfirmationForm } from "./dues-confirmation-form";
import {
  financeTotals,
  financeTransactions as transactions,
} from "@/lib/portal-data";

type AuthState = "checking" | "authenticated" | "guest";

const reportPeriod = "Januari-Juni 2026";

const financeSummary = [
  {
    title: "Saldo Awal",
    value: financeTotals.openingBalance,
    tone: "bg-[#dce8f1] text-[#2f6f9f]",
  },
  {
    title: "Pemasukan",
    value: financeTotals.income,
    tone: "bg-[#dcefe4] text-[#25775f]",
  },
  {
    title: "Total tersedia",
    value: financeTotals.openingBalance + financeTotals.income,
    tone: "bg-[#e5ebef] text-[#24465e]",
  },
  {
    title: "Pengeluaran",
    value: financeTotals.expense,
    tone: "bg-[#fae8d8] text-[#bd6a1d]",
  },
  {
    title: "Saldo akhir",
    value: financeTotals.endingBalance,
    tone: "bg-[#f4dfdf] text-[#b34848]",
  },
] as const;

const expenseCategories = [
  { label: "Kegiatan & konsumsi", value: 4750000, color: "#2f6f9f" },
  { label: "Panitia & kas RW", value: 3800000, color: "#4d87c2" },
  { label: "Apresiasi", value: 2000000, color: "#61ae78" },
  { label: "Administrasi & perlengkapan", value: 150000, color: "#d78f21" },
  { label: "Sumbangan & transportasi", value: 300000, color: "#c75550" },
] as const;

const expenseDonutBackground = (() => {
  let start = 0;
  const segments = expenseCategories.map((category) => {
    const end = start + (category.value / financeTotals.expense) * 100;
    const segment = `${category.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
})();

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatPercentage(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format((value / financeTotals.expense) * 100);
}

export function KeuanganClient() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;
        if (data.session?.user) {
          setUserEmail(data.session.user.email || "");
          setAuthState("authenticated");
        } else {
          setAuthState("guest");
        }
      } catch {
        if (!mounted) return;
        setAuthState("guest");
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // 1. STATE CHECKING (MEMUAT)
  if (authState === "checking") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#002b23] border-t-[#D4AF37]" />
        <p className="mt-4 text-sm font-bold text-[#002b23]">Memeriksa Hak Akses Laporan Keuangan...</p>
      </div>
    );
  }

  // 2. STATE GUEST (TERKUNCI / KHUSUS WARGA TERDAFTAR)
  if (authState === "guest") {
    return (
      <section className="bg-[#f3efe6] text-foreground py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#002b23] via-[#00382e] to-[#00241b] text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="p-8 sm:p-12 text-center">
              {/* Badge Gembok Keamanan */}
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl border border-[#D4AF37]/50 bg-[#D4AF37]/20 shadow-[0_0_24px_rgba(212,175,55,0.3)]">
                <svg
                  className="h-10 w-10 text-[#E8C865]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#E8C865]">
                <span>🔒 Akses Terproteksi</span>
                <span>•</span>
                <span>Khusus Warga RT 010</span>
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Laporan Keuangan & Kas Bersifat Internal
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                Demi menjaga privasi, transparansi, dan keamanan lingkungan warga RT 010 RW 021 Cipta Greenville, rincian kas, komposisi pengeluaran, mutasi transaksi, dan formulir konfirmasi pembayaran iuran hanya dapat dilihat oleh <strong>warga yang sudah masuk (terdaftar)</strong>.
              </p>

              {/* Fitur yang terkunci */}
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <p className="font-bold text-xs text-[#E8C865]">📊 Rincian Kas Bulanan RT</p>
                  <p className="mt-1 text-[11px] text-white/70">Saldo awal, penerimaan iuran, dan saldo kas terkini.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <p className="font-bold text-xs text-[#E8C865]">🧾 Daftar Pengeluaran Resmi</p>
                  <p className="mt-1 text-[11px] text-white/70">Uraian biaya kegiatan, apresiasi, keamanan, dan kas RW.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <p className="font-bold text-xs text-[#E8C865]">💳 Konfirmasi Iuran Warga</p>
                  <p className="mt-1 text-[11px] text-white/70">Kirim bukti transfer agar dicocokkan otomatis oleh bendahara.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <p className="font-bold text-xs text-[#E8C865]">📈 Komposisi Pengeluaran</p>
                  <p className="mt-1 text-[11px] text-white/70">Grafik alokasi dana secara visual dan akuntabel.</p>
                </div>
              </div>

              {/* Tombol CTA Masuk */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link
                  href="/masuk/?next=/keuangan/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C865] to-[#B8942F] px-7 text-sm font-black text-[#15140b] shadow-[0_12px_28px_rgba(212,175,55,0.35)] transition-all hover:brightness-110"
                >
                  <span>Masuk ke Portal Warga</span>
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/masuk/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  Daftar Warga Baru
                </Link>
                <Link
                  href="/pengurus/"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-5 text-sm font-semibold text-white/75 transition-all hover:text-white hover:bg-black/30"
                >
                  Kontak Bendahara RT
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3. STATE AUTHENTICATED (WARGA TERDAFTAR / PENGURUS YANG SUDAH LOGIN)
  return (
    <>
      <div className="bg-emerald-950/80 border-b border-emerald-500/20 px-4 py-2 text-center text-xs font-bold text-emerald-200">
        🛡️ Mode Warga Terverifikasi aktif ({userEmail}). Laporan keuangan internal dapat diakses penuh.
      </div>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Laporan Keuangan"
            title="Ringkasan kas."
            text={`${reportPeriod} · angka utama dan komposisi pengeluaran.`}
          />

          <dl className="mt-8 grid overflow-hidden rounded-2xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-5">
            {financeSummary.map((item) => (
              <div
                key={item.title}
                className={`min-h-28 border-b border-border p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:min-h-32 lg:border-b-0 lg:border-r lg:last:border-r-0 ${item.tone}`}
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.12em]">{item.title}</dt>
                <dd className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">{formatCurrency(item.value)}</dd>
              </div>
            ))}
          </dl>

          <article className="mt-8 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Rincian pengeluaran</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Dikelompokkan dalam lima kategori agar lebih mudah dibaca.</p>
            </div>

            <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(14rem,0.65fr)_minmax(0,1.35fr)] lg:items-center">
              <div
                className="mx-auto grid h-56 w-56 place-items-center rounded-full p-7 sm:h-64 sm:w-64"
                style={{ backgroundImage: expenseDonutBackground }}
                role="img"
                aria-label={`Komposisi total pengeluaran ${formatCurrency(financeTotals.expense)} dalam lima kategori.`}
              >
                <div className="grid h-full w-full place-items-center rounded-full bg-background text-center shadow-inner">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted">Total</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-primary sm:text-2xl">{formatCurrency(financeTotals.expense)}</p>
                  </div>
                </div>
              </div>

              <dl className="divide-y divide-border">
                {expenseCategories.map((category) => (
                  <div key={category.label} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-4 first:pt-0 last:pb-0">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: category.color }} aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-foreground">{category.label}</dt>
                      <dd className="mt-1 text-sm text-muted">{formatCurrency(category.value)}</dd>
                    </div>
                    <span className="text-sm font-semibold text-primary">{formatPercentage(category.value)}%</span>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Rincian Pengeluaran"
            title="Daftar transaksi sesuai urutan laporan resmi."
            text="Nominal ditampilkan dalam Rupiah tanpa desimal."
          />

          <div className="mt-10 grid gap-4 lg:hidden">
            {transactions.map((item, index) => (
              <article
                key={item.description}
                className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold leading-6 text-foreground">
                      {item.description}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {item.quantity > 1
                        ? `${formatNumber(item.quantity)} x ${formatCurrency(item.unitAmount)}`
                        : "1 transaksi"}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-primary">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4 text-right">
              <p className="text-sm font-semibold text-muted">
                Total Pengeluaran
              </p>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {formatCurrency(financeTotals.expense)}
              </p>
            </div>
          </div>

          <div className="mt-10 hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th scope="col" className="w-16 px-4 py-4 font-semibold">
                      No
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Uraian
                    </th>
                    <th scope="col" className="px-4 py-4 text-right font-semibold">
                      Jumlah
                    </th>
                    <th scope="col" className="px-4 py-4 text-right font-semibold">
                      Satuan
                    </th>
                    <th scope="col" className="px-4 py-4 text-right font-semibold">
                      Nominal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item, index) => (
                    <tr
                      key={item.description}
                      className="border-b border-border bg-background last:border-b-0"
                    >
                      <td className="px-4 py-4 font-semibold text-primary">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 font-semibold leading-6 text-foreground">
                        {item.description}
                      </td>
                      <td className="px-4 py-4 text-right text-muted">
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="px-4 py-4 text-right text-muted">
                        {formatCurrency(item.unitAmount)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-primary">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary-soft">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-right font-semibold text-foreground"
                    >
                      Total Pengeluaran
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-primary">
                      {formatCurrency(financeTotals.expense)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="konfirmasi-iuran" className="scroll-mt-28">
        <DuesConfirmationForm />
      </section>
    </>
  );
}
