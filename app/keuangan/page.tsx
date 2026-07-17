import type { Metadata } from "next";
import {
  Icon,
  PageShell,
  SectionHeading,
} from "../components/portal";
import { AuthAwareAction } from "../components/auth-aware-action";
import { DuesConfirmationGate } from "./dues-confirmation-gate";
import {
  financeTotals,
  financeTransactions as transactions,
} from "@/lib/portal-data";

export const metadata: Metadata = {
  title: "Keuangan",
  description:
    "Laporan Keuangan RT 010 Perumahan Cipta Green Ville periode Januari-Juni 2026.",
};

const reportTitle = "Laporan Keuangan RT 010";
const reportSubtitle = "Perumahan Cipta Green Ville";
const reportPeriod = "Januari-Juni 2026";
const reportStatus = "Laporan Pengurus";
const totalAvailableFunds = financeTotals.openingBalance + financeTotals.income;
const maxExpense = Math.max(...transactions.map((item) => item.subtotal));

const summaryCards = [
  {
    title: "Saldo Awal",
    value: financeTotals.openingBalance,
    detail: "Total dana tersedia dikurangi pemasukan periode berjalan.",
    icon: "wallet",
  },
  {
    title: "Pemasukan Januari-Juni 2026",
    value: financeTotals.income,
    detail: "Pemasukan resmi periode laporan.",
    icon: "message",
  },
  {
    title: "Pengeluaran Januari-Juni 2026",
    value: financeTotals.expense,
    detail: "Total rincian pengeluaran pada tabel laporan.",
    icon: "file",
  },
  {
    title: "Saldo Akhir per Juni 2026",
    value: financeTotals.endingBalance,
    detail: "Saldo akhir laporan resmi RT 010.",
    icon: "shield",
  },
] as const;

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

export default function KeuanganPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Financial Period
              </p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {reportTitle}
              </h1>
              <p className="mt-4 text-lg font-semibold text-white/88">
                {reportSubtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                  {reportPeriod}
                </span>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  {reportStatus}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/14 bg-white/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Saldo akhir per Juni 2026
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {formatCurrency(financeTotals.endingBalance)}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/78">
                Laporan ini memakai angka resmi pengurus. Saldo awal dihitung
                dari total dana tersedia Rp11.010.000 dikurangi pemasukan
                periode berjalan Rp2.500.000.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                    RT 010
                  </span>
                </div>
                <h2 className="mt-5 text-sm font-semibold text-muted">
                  {item.title}
                </h2>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                  {formatCurrency(item.value)}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Visual Laporan"
            title="Alur dana periode Januari-Juni 2026."
            text="Diagram ini memakai angka resmi yang sama dengan summary dan rincian transaksi."
          />

          <div className="mt-10 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Diagram Dana Tersedia
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Saldo awal ditambah pemasukan periode berjalan, lalu
                    dikurangi pengeluaran resmi.
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {reportPeriod}
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                {[
                  ["Saldo Awal", financeTotals.openingBalance, "bg-primary"],
                  ["Pemasukan", financeTotals.income, "bg-emerald-600"],
                ].map(([label, value, color]) => (
                  <div key={label as string}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-foreground">
                        {label}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(value as number)}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-primary-soft">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{
                          width: `${((value as number) / totalAvailableFunds) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border border-primary/15 bg-background p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-muted">
                      Total dana tersedia
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(totalAvailableFunds)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">
                      Pengeluaran
                    </span>
                    <span className="font-semibold text-red-700">
                      {formatCurrency(financeTotals.expense)}
                    </span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-red-50">
                    <div
                      className="h-full rounded-full bg-red-700"
                      style={{
                        width: `${(financeTotals.expense / totalAvailableFunds) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-accent/35 bg-accent-soft p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-foreground">
                      Saldo akhir
                    </p>
                    <p className="text-2xl font-semibold text-primary">
                      {formatCurrency(financeTotals.endingBalance)}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Grafik Pengeluaran
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Panjang bar menunjukkan perbandingan nominal antar item,
                    bukan nilai baru.
                  </p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Total {formatCurrency(financeTotals.expense)}
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                {transactions.map((item, index) => (
                  <div key={item.description}>
                    <div className="mb-2 grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <p className="min-w-0 text-sm font-semibold text-foreground">
                        {index + 1}. {item.shortLabel}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-primary-soft">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(item.subtotal / maxExpense) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
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
                Total expenditure
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
                      Total expenditure
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

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-5 rounded-2xl border border-border bg-background p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Iuran Warga
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Konfirmasi iuran atau tanyakan catatan pembayaran.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                Warga bisa mengirim konfirmasi iuran dengan nama, cluster,
                nomor WhatsApp, periode, nominal, dan bukti pembayaran.
              </p>
            </div>
            <AuthAwareAction
              href="/keuangan/#konfirmasi-iuran"
              guestHref="/masuk/?next=/keuangan/%23konfirmasi-iuran"
              guestLabel="Masuk untuk konfirmasi"
              authenticatedLabel="Konfirmasi iuran"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            />
          </div>
        </div>
      </section>

      <DuesConfirmationGate />
    </PageShell>
  );
}
