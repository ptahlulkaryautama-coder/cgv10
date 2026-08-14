import type { Metadata } from "next";
import { PageShell, SectionHeading } from "../components/portal";
import { DuesConfirmationGate } from "./dues-confirmation-gate";
import {
  financeTotals,
  financeTransactions as transactions,
} from "@/lib/portal-data";

export const metadata: Metadata = {
  title: "Keuangan",
  description:
    "Ringkasan keuangan RT 010 Perumahan Cipta Green Ville periode Januari-Juni 2026.",
};

const reportTitle = "Laporan Keuangan RT 010";
const reportSubtitle = "Perumahan Cipta Green Ville";
const reportPeriod = "Januari-Juni 2026";
const reportStatus = "Ringkasan Pengurus";

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

export default function KeuanganPage() {
  return (
    <PageShell>
      <section className="relative isolate overflow-hidden border-b border-primary-hover bg-primary text-white">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[28px] border-accent/30" />
          <div className="absolute right-[17%] top-10 h-32 w-32 rounded-full border border-white/20" />
          <div className="absolute bottom-0 right-0 h-24 w-[52%] border-l border-t border-white/10" />
          <div className="absolute bottom-16 right-[34%] h-3 w-3 rounded-full bg-accent" />
          <div className="absolute bottom-24 right-[42%] h-2 w-2 rounded-full bg-white/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Periode Laporan
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
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
                <a
                  href="#konfirmasi-iuran"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  Konfirmasi iuran
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Laporan Keuangan"
            title="Ringkasan kas."
            text={`${reportPeriod} · angka utama dan komposisi pengeluaran.`}
          />

          <dl className="mt-8 grid overflow-hidden rounded-2xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-5">
            {financeSummary.map((item) => (
              <div key={item.title} className={`min-h-28 border-b border-border p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:min-h-32 lg:border-b-0 lg:border-r lg:last:border-r-0 ${item.tone}`}>
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
              <div className="mx-auto grid h-56 w-56 place-items-center rounded-full p-7 sm:h-64 sm:w-64" style={{ backgroundImage: expenseDonutBackground }} role="img" aria-label={`Komposisi total pengeluaran ${formatCurrency(financeTotals.expense)} dalam lima kategori.`}>
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

      <DuesConfirmationGate />
    </PageShell>
  );
}
