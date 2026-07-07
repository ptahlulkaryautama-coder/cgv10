import type { Metadata } from "next";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
  ProgressBar,
  cx,
} from "../components";
import { FinanceLedgerBoard } from "./finance-ledger-board";
import { IuranConfirmationBoard } from "./iuran-confirmation-board";
import { financeTotals, financeTransactions } from "@/lib/portal-data";

const incomeBreakdown = [
  ["Dana kas RT", "Rp 2.000.000", "100%"],
  ["Sumbangan warga", "Rp 1.000.000", "50%"],
  ["KPU sebelumnya", "Rp 1.000.000", "50%"],
  ["Pendaftaran calon", "Rp 1.500.000", "75%"],
];

const spendingBreakdown = [["Belum ada kas keluar", "Rp 0", "0%"]];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export const metadata: Metadata = {
  title: "Keuangan Admin | CGV10",
  description: "Preview modul keuangan admin CGV10.",
};

export default function AdminFinancePage() {
  return (
    <AdminShell
      active="keuangan"
      title="Keuangan"
      subtitle="Buku Kas CGV10 - Juni 2026"
      action={<ActionButton primary href="#tambah-transaksi">Tambah Transaksi</ActionButton>}
    >
      <PageIntro
        eyebrow="Pengelolaan Keuangan"
        title={
          <>
            Buku Kas <span className="italic">CGV10</span>
          </>
        }
        text="Halaman ini menjadi tempat bendahara mencocokkan konfirmasi iuran, menambah transaksi, mengelola kategori, menyiapkan ringkasan publik, dan menahan data sensitif sebelum tampil di Portal Warga."
        side={<ActionButton primary href="#tambah-transaksi">Tambah Transaksi</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Kas Masuk" value={formatCurrency(financeTotals.income)} helper={`${financeTransactions.length} transaksi masuk`} icon="wallet" />
        <MetricCard label="Kas Keluar" value={formatCurrency(financeTotals.expense)} helper="Belum ada kas keluar" icon="file" tone="red" />
        <MetricCard label="Iuran Masuk" value="4 konfirmasi" helper="2 perlu dicocokkan" icon="message" tone="gold" />
        <MetricCard label="Saldo Publik" value={formatCurrency(financeTotals.endingBalance)} helper="Selaras dengan portal" icon="shield" tone="dark" />
      </section>

      <IuranConfirmationBoard />

      <section className="mb-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Saldo Harian - Juni 2026" subtitle="Representasi saldo akumulatif bulan berjalan." />
          <div className="px-5 pb-5">
            <div className="flex h-48 items-end gap-3 border-b border-l border-border px-4 pb-4">
              {["28%", "34%", "31%", "58%", "52%", "74%", "69%", "86%", "78%", "92%"].map((height, index) => (
                <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full max-w-8 rounded-t-full bg-emerald-600/80" style={{ height }} />
                  <span className="text-[10px] font-semibold text-muted">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Komposisi Kas Masuk" subtitle="Breakdown sumber dana untuk ringkasan internal." />
          <div className="grid gap-5 px-5 pb-5 sm:grid-cols-[150px_1fr] sm:items-center">
            <div className="mx-auto h-36 w-36 rounded-full bg-[conic-gradient(#1a7a50_0_45%,#c9a55a_45%_68%,#2b6cb0_68%_88%,#c8c4bc_88%_100%)] p-7">
              <div className="h-full w-full rounded-full bg-[#fdfcf9]" />
            </div>
            <div className="space-y-3">
              {incomeBreakdown.map(([label, value], index) => (
                <div key={label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted">
                    <span
                      className={cx(
                        "h-3 w-3 rounded-sm",
                        index === 0 ? "bg-emerald-600" : index === 1 ? "bg-accent" : index === 2 ? "bg-blue-600" : "bg-stone-300",
                      )}
                    />
                    {label}
                  </span>
                  <strong className="text-foreground">{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <FinanceLedgerBoard />

      <Panel>
        <PanelHeader title="Rekap per Kategori - Juni 2026" subtitle="Breakdown sumber dan penggunaan dana secara lengkap." />
        <div className="grid gap-8 px-5 pb-5 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Sumber Masuk</p>
            <div className="space-y-4">
              {incomeBreakdown.map(([label, value, width]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">{label}</span>
                    <strong className="text-emerald-700">{value}</strong>
                  </div>
                  <ProgressBar value={width} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Penggunaan Keluar</p>
            <div className="space-y-4">
              {spendingBreakdown.map(([label, value, width]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">{label}</span>
                    <strong className="text-red-700">{value}</strong>
                  </div>
                  <ProgressBar value={width} tone="red" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </AdminShell>
  );
}
