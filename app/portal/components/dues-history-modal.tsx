"use client";

import { useEffect, useState } from "react";
import type { ReceiptData } from "./receipt-modal";

export type DuesHistoryRecapRow = {
  household_id: string;
  cluster: string;
  block_or_unit: string;
  payment_id: string;
  paid_at: string;
  amount: number;
  method: "transfer" | "cash" | "qris" | "other";
  reference_no: string | null;
  payer_name: string | null;
  verification_status: "pending" | "verified" | "rejected" | "void";
  due_period_month: number | null;
  due_period_year: number | null;
  period_count: number;
  period_label: string;
};

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: (data: ReceiptData) => void;
  residentName?: string;
  cluster?: string;
  blockOrUnit?: string;
  residentId?: string;
  recapRows?: DuesHistoryRecapRow[];
}

const DEFAULT_MONTHS_2026 = [
  { month: "Januari", paid: true, date: "05 Jan 2026", ref: "202601050012" },
  { month: "Februari", paid: true, date: "04 Feb 2026", ref: "202602040019" },
  { month: "Maret", paid: true, date: "06 Mar 2026", ref: "202603060007" },
  { month: "April", paid: true, date: "05 Apr 2026", ref: "202604050033" },
  { month: "Mei", paid: true, date: "04 Mei 2026", ref: "202605040015" },
  { month: "Juni", paid: true, date: "06 Jun 2026", ref: "202606060021" },
  { month: "Juli", paid: true, date: "05 Jul 2026", ref: "202607050044" },
  { month: "Agustus", paid: true, date: "05 Agu 2026", ref: "202608050008" },
  { month: "September", paid: true, date: "05 Sep 2026", ref: "202609050001" },
  { month: "Oktober", paid: false, date: "-", ref: "" },
  { month: "November", paid: false, date: "-", ref: "" },
  { month: "Desember", paid: false, date: "-", ref: "" },
];

function formatPaymentDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * SCREEN 4: RIWAYAT IURAN (Modal / Sub-Screen)
 * Sesuai mockup layar keempat:
 * Header: ← Riwayat Iuran
 * Dropdown Tahun: 2026 ⌄
 * Tabel Header: Bulan | Status | Tanggal Bayar | >
 * Baris per bulan dengan badge hijau ✔ Lunas, tanggal bayar, dan chevron panah kanan
 * yang saat diklik langsung membuka Kuitansi Pembayaran resmi (Screen 6).
 */
export function DuesHistoryModal({
  isOpen,
  onClose,
  onOpenReceipt,
  residentName = "Budi Santoso",
  cluster = "Chiswick",
  blockOrUnit = "A-12",
  residentId = "CGV-010-0012",
  recapRows = [],
}: HistoryModalProps) {
  const [selectedYear, setSelectedYear] = useState("2026");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const verifiedRows = recapRows.filter((r) => r.verification_status === "verified");
  const hasRealVerifiedData = verifiedRows.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Top Header App Bar */}
        <div className="flex items-center justify-between bg-[#00473e] px-4 py-3.5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Riwayat Iuran</span>
          </button>
          <div className="w-6" />
        </div>

        {/* Content Body (Matching Screen 4 Mockup) */}
        <div className="p-4 max-h-[82vh] overflow-y-auto">
          {/* Year Selector Dropdown Pill */}
          <div className="mb-3.5 flex items-center justify-start">
            <div className="relative inline-block">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 shadow-sm"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Table Header: Bulan | Status | Tanggal Bayar */}
          <div className="grid grid-cols-12 border-b border-slate-200 pb-2 px-1 text-[11px] font-bold text-slate-700">
            <div className="col-span-4">Bulan</div>
            <div className="col-span-4 text-center">Status</div>
            <div className="col-span-4 text-right">Tanggal Bayar</div>
          </div>

          {/* Rows List */}
          <div className="divide-y divide-slate-100">
            {hasRealVerifiedData ? (
              verifiedRows.map((row) => {
                const dateLabel = formatPaymentDate(row.paid_at);
                const periodLabel = row.period_label || `Bulan ${row.due_period_month || 9}`;

                return (
                  <div
                    key={row.payment_id}
                    onClick={() => {
                      onClose();
                      onOpenReceipt({
                        name: residentName,
                        cluster,
                        blockOrUnit,
                        residentId,
                        monthPeriod: periodLabel,
                        paymentDate: dateLabel,
                        amount: Number(row.amount) || 50000,
                        paymentMethod: row.method === "transfer" ? "Transfer Bank (BCA)" : row.method.toUpperCase(),
                        referenceNo: row.reference_no || row.payment_id.slice(0, 10),
                      });
                    }}
                    role="button"
                    tabIndex={0}
                    className="grid grid-cols-12 items-center py-3 px-1 text-xs hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="col-span-4 font-semibold text-slate-900 truncate">
                      {periodLabel}
                    </div>
                    <div className="col-span-4 flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Lunas
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center justify-end gap-1 text-right text-[11px] text-slate-500 font-medium">
                      <span>{dateLabel}</span>
                      <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })
            ) : (
              DEFAULT_MONTHS_2026.map((item) => (
                <div
                  key={item.month}
                  onClick={() => {
                    if (item.paid) {
                      onClose();
                      onOpenReceipt({
                        name: residentName,
                        cluster,
                        blockOrUnit,
                        residentId,
                        monthPeriod: `${item.month} ${selectedYear}`,
                        paymentDate: item.date,
                        amount: 50000,
                        paymentMethod: "Transfer Bank (BCA)",
                        referenceNo: item.ref,
                      });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`grid grid-cols-12 items-center py-3 px-1 text-xs transition-colors ${
                    item.paid
                      ? "hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-slate-900"
                      : "opacity-40 text-slate-400"
                  }`}
                >
                  <div className="col-span-4 font-semibold">
                    {item.month}
                  </div>
                  <div className="col-span-4 flex justify-center">
                    {item.paid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Lunas
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        Belum
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 flex items-center justify-end gap-1 text-right text-[11px] font-medium text-slate-500">
                    <span>{item.date}</span>
                    {item.paid && (
                      <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
