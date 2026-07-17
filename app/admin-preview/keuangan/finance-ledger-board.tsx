"use client";

import { useMemo, useState } from "react";
import { Panel, PanelHeader, cx } from "../components";
import { financeTransactions } from "@/lib/portal-data";

type TransactionTone = "green" | "red" | "gold" | "blue";

type Transaction = {
  id: string;
  date: string;
  note: string;
  category: string;
  type: "Masuk" | "Keluar";
  amount: number;
  owner: string;
  visibility: "Publik" | "Internal";
  tone: TransactionTone;
};

const initialTransactions: Transaction[] = financeTransactions.map((item, index) => ({
  id: `FIN-${String(index + 1).padStart(3, "0")}`,
  date: `06-${String(index + 1).padStart(2, "0")}`,
  note: item.description,
  category: "Operasional",
  type: item.direction === "income" ? "Masuk" : "Keluar",
  amount: item.subtotal,
  owner: "Bendahara",
  visibility: "Publik",
  tone: item.direction === "income" ? "green" : index === 1 || index === 3 ? "gold" : "red",
}));

const transactionTypes = ["Semua", "Masuk", "Keluar"];
const categories = [
  "Semua",
  "Iuran",
  "Kegiatan",
  "Kas Pilot",
  "Keamanan",
  "Fasilitas",
  "Operasional",
  "Dokumen",
];

function CategoryBadge({
  category,
  tone,
}: {
  category: string;
  tone: TransactionTone;
}) {
  const className = {
    green: "bg-emerald-50 text-primary",
    red: "bg-red-50 text-red-700",
    gold: "bg-accent-soft text-foreground",
    blue: "bg-blue-50 text-blue-700",
  }[tone];

  return (
    <span
      className={cx(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
        className,
      )}
    >
      {category}
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceLedgerBoard() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Semua");
  const [category, setCategory] = useState("Semua");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedKey, setSelectedKey] = useState(initialTransactions[0].id);
  const [draft, setDraft] = useState({ note: "", amount: "", type: "Masuk" });

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesQuery = normalizedQuery
        ? [transaction.note, transaction.category, transaction.owner]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesType = type === "Semua" || transaction.type === type;
      const matchesCategory =
        category === "Semua" || transaction.category === category;

      return matchesQuery && matchesType && matchesCategory;
    });
  }, [category, query, transactions, type]);

  const selectedTransaction =
    filteredTransactions.find((transaction) => transaction.id === selectedKey) ??
    filteredTransactions[0] ??
    transactions[0];
  const currentBalance = transactions.reduce(
    (sum, item) => sum + (item.type === "Masuk" ? item.amount : -item.amount),
    0,
  );

  function addTransaction() {
    const amount = Number(draft.amount);
    if (!draft.note.trim() || !Number.isFinite(amount) || amount <= 0) return;

    const transaction: Transaction = {
      id: `FIN-${Date.now()}`,
      date: "06-30",
      note: draft.note.trim(),
      category: "Kas Pilot",
      type: draft.type as Transaction["type"],
      amount,
      owner: "Bendahara",
      visibility: "Publik",
      tone: draft.type === "Keluar" ? "red" : "green",
    };

    setTransactions((current) => [transaction, ...current]);
    setSelectedKey(transaction.id);
    setDraft({ note: "", amount: "", type: "Masuk" });
  }

  return (
    <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Ledger Transaksi"
          subtitle="Filter kas masuk/keluar, kategori, dan keterangan transaksi."
          action={
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                ["Tanggal,Keterangan,Kategori,Tipe,Nominal"].concat(
                  filteredTransactions.map((item) =>
                    [item.date, item.note, item.category, item.type, item.amount].join(","),
                  ),
                ).join("\n"),
              )}`}
              download="kas-cgv10.csv"
              className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors duration-200 hover:border-accent/35 hover:text-primary"
            >
              Export Kas
            </a>
          }
        />
        <div id="tambah-transaksi" className="grid gap-3 border-t border-border bg-white px-5 py-4 md:grid-cols-[minmax(0,1fr)_150px_140px_auto]">
          <input
            value={draft.note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            placeholder="Keterangan transaksi"
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <input
            value={draft.amount}
            onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
            inputMode="numeric"
            placeholder="Nominal"
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            <option>Masuk</option>
            <option>Keluar</option>
          </select>
          <button
            type="button"
            onClick={addTransaction}
            className="min-h-11 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-sm font-bold text-accent transition-colors duration-200 hover:bg-primary-hover"
          >
            Tambah
          </button>
        </div>
        <div className="grid gap-3 border-y border-border bg-[#f8f6f0] px-5 py-4 md:grid-cols-[minmax(0,1fr)_150px_170px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Cari keterangan transaksi..."
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {transactionTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <table className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="hidden px-5 py-3 sm:table-cell">Kategori</th>
                <th className="px-5 py-3 text-right">Nominal</th>
                <th className="hidden px-5 py-3 text-right md:table-cell">Saldo</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const key = transaction.id;

                return (
                  <tr
                    key={key}
                    className={cx(
                      "border-b border-border last:border-b-0",
                      key === selectedTransaction.id
                        ? "bg-primary-soft/40"
                        : "hover:bg-primary-soft/20",
                    )}
                  >
                    <td className="px-5 py-4 font-semibold text-muted">
                      {transaction.date}
                    </td>
                    <td className="px-3 py-4 sm:px-5">
                      <p className="break-words font-bold text-foreground">{transaction.note}</p>
                      <p className="mt-1 text-xs text-muted">
                        {transaction.owner} - {transaction.visibility}
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <CategoryBadge
                        category={transaction.category}
                        tone={transaction.tone}
                      />
                    </td>
                    <td
                      className={cx(
                        "px-5 py-4 text-right font-bold",
                        transaction.type === "Masuk"
                          ? "text-emerald-700"
                          : "text-red-700",
                      )}
                    >
                      {transaction.type === "Masuk" ? "+" : "-"}
                      {formatCurrency(transaction.amount).replace("Rp", "")}
                    </td>
                    <td className="hidden px-5 py-4 text-right font-bold text-muted md:table-cell">
                      {formatCurrency(currentBalance).replace("Rp", "")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedKey(key)}
                        className="min-h-8 cursor-pointer rounded-full border border-border bg-white px-3 text-xs font-bold text-muted transition-colors duration-200 hover:border-primary/30 hover:text-primary"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Detail Transaksi"
          subtitle="Konteks review sebelum ringkasan dipublish."
        />
        <div className="space-y-4 px-5 pb-5">
          <div className="rounded-[16px] border border-black/8 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                  {selectedTransaction.date} - {selectedTransaction.type}
                </p>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {selectedTransaction.note}
                </h3>
              </div>
              <CategoryBadge
                category={selectedTransaction.category}
                tone={selectedTransaction.tone}
              />
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              {[
                ["Nominal", formatCurrency(selectedTransaction.amount)],
                ["Saldo", formatCurrency(currentBalance)],
                ["PIC", selectedTransaction.owner],
                ["Visibility", selectedTransaction.visibility],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-t border-border pt-3"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-[16px] border border-accent/40 bg-accent-soft p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              Ringkasan publik
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Transaksi internal bisa tetap masuk rekap, tetapi detail sensitif
              tidak perlu tampil di portal warga.
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}
