"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DuesHistoryRecapRow as DuesRecapRow } from "./dues-history-modal";
import { type ReceiptData } from "./receipt-modal";

interface UnifiedDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "status" | "pay" | "history" | "kas";
  displayName?: string;
  cluster?: string;
  blockOrUnit?: string;
  residentId?: string;
  statusType?: "lunas" | "pending" | "unpaid" | "no_data";
  duesStatusText?: string;
  coverageText?: string;
  monthlyAmount?: number;
  lastPaymentDate?: string;
  pendingCount?: number;
  pendingAmount?: number;
  recapRows?: DuesRecapRow[];
  onOpenReceipt?: (data: ReceiptData) => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPaymentDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function UnifiedDuesModal({
  isOpen,
  onClose,
  initialTab = "status",
  displayName = "Warga CGV10",
  cluster = "Chiswick",
  blockOrUnit = "A-12",
  residentId = "CGV-010-0012",
  statusType = "lunas",
  duesStatusText = "Iuran Lunas s/d September 2026",
  coverageText,
  monthlyAmount = 50000,
  lastPaymentDate = "05 Sep 2026",
  pendingCount = 0,
  pendingAmount = 0,
  recapRows = [],
  onOpenReceipt,
}: UnifiedDuesModalProps) {
  const [userSelectedTab, setUserSelectedTab] = useState<"status" | "pay" | "history" | "kas" | null>(null);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setUserSelectedTab(null);
  }
  const activeTab = userSelectedTab ?? initialTab;
  const setActiveTab = (t: "status" | "pay" | "history" | "kas") => setUserSelectedTab(t);
  const [copiedBank, setCopiedBank] = useState(false);
  const [payMonthCount, setPayMonthCount] = useState(1);
  const [selectedPayMethod, setSelectedPayMethod] = useState<"bca" | "qris" | "manual">("bca");

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

  const isLunas = statusType === "lunas";
  const isPending = statusType === "pending" || pendingCount > 0;
  const isUnpaid = statusType === "unpaid";
  const totalPayAmount = monthlyAmount * payMonthCount;

  function copyBCA() {
    navigator.clipboard.writeText("8270102026");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  }

  function handleConfirmWA() {
    const text =
      `*KONFIRMASI PEMBAYARAN IURAN RT 010*\n\n` +
      `Nama: ${displayName}\n` +
      `Unit Rumah: ${cluster} ${blockOrUnit}\n` +
      `ID Warga: ${residentId}\n` +
      `Jumlah Bulan: ${payMonthCount} Bulan (${formatRupiah(totalPayAmount)})\n` +
      `Metode: ${selectedPayMethod.toUpperCase()}\n\n` +
      `_Mohon verifikasi pembayaran iuran kami. Terima kasih._`;
    window.open(`https://wa.me/628117761010?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleTriggerReceipt(row: DuesRecapRow) {
    const data: ReceiptData = {
      name: displayName,
      cluster,
      blockOrUnit,
      residentId,
      monthPeriod: row.period_label || `Periode ${row.period_count} Bulan`,
      paymentDate: formatPaymentDate(row.paid_at),
      amount: Number(row.amount) || monthlyAmount,
      paymentMethod: row.method === "transfer" ? "Transfer Bank (BCA)" : row.method.toUpperCase(),
      referenceNo: row.reference_no || row.payment_id.slice(0, 10),
    };

    if (onOpenReceipt) {
      onClose();
      onOpenReceipt(data);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#001f19] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-white">
        
        {/* ── HEADER & TABS BAR ── */}
        <div className="shrink-0 border-b border-white/10 bg-[#002b23] px-4 pt-3.5 pb-2 sm:px-6">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8942F] text-[#15140b] font-black text-sm shadow-md">
                💳
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white sm:text-base">
                  Pusat Layanan Iuran Warga
                </h2>
                <p className="text-[10.5px] font-semibold text-slate-400">
                  Unit: <span className="text-[#E8C865]">{cluster} — {blockOrUnit}</span> • {residentId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-all active:scale-90"
              title="Tutup Modal"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "status"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>📊</span>
              <span>Status & Tagihan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pay")}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "pay"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>💸</span>
              <span>Bayar Iuran</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>📜</span>
              <span>Riwayat & Kuitansi</span>
              {recapRows.length > 0 && (
                <span className="ml-0.5 rounded-full bg-black/30 px-1.5 py-0.2 text-[9px]">
                  {recapRows.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("kas")}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "kas"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>🏛</span>
              <span>Kas Lingkungan</span>
            </button>
          </div>
        </div>

        {/* ── TAB CONTENTS ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* ════════ TAB 1: STATUS & TAGIHAN ════════ */}
          {activeTab === "status" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Main Status Hero Card */}
              <div
                className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border shadow-lg ${
                  isPending
                    ? "bg-gradient-to-r from-amber-950/70 via-[#261c02] to-[#00241b] border-amber-500/40 text-amber-100"
                    : isUnpaid
                    ? "bg-gradient-to-r from-rose-950/70 via-[#2a0e14] to-[#00241b] border-rose-500/40 text-rose-100"
                    : "bg-gradient-to-r from-emerald-950/70 via-[#00382e] to-[#00241b] border-emerald-500/40 text-emerald-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md ${
                        isPending
                          ? "bg-amber-500 text-slate-950"
                          : isUnpaid
                          ? "bg-rose-500 text-white"
                          : "bg-emerald-500 text-slate-950 font-black"
                      }`}
                    >
                      {isPending ? "⏳" : isUnpaid ? "⚠️" : "✓"}
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Status Pembayaran Iuran
                      </span>
                      <h3 className="text-base font-black text-white sm:text-lg">
                        {duesStatusText}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isPending
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : isUnpaid
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {isPending ? "Pending Review" : isUnpaid ? "Perlu Bayar" : "Aktif / Terverifikasi"}
                  </span>
                </div>

                {coverageText && (
                  <p className="mt-3 text-xs text-slate-300 border-t border-white/10 pt-2.5">
                    Periode ter-cover sampai: <strong className="text-white">{coverageText}</strong>
                  </p>
                )}
              </div>

              {/* Pending Alert If Any */}
              {pendingCount > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-200 text-xs leading-relaxed">
                  <span className="text-lg">⏳</span>
                  <div>
                    <p className="font-bold text-amber-100">
                      {pendingCount} Pembayaran Menunggu Konfirmasi Bendahara RT ({formatRupiah(pendingAmount)})
                    </p>
                    <p className="mt-0.5 text-amber-300/90 text-[11px]">
                      Bukti transfer Anda sudah diterima sistem dan sedang dalam antrean pencatatan buku kas RT 010.
                    </p>
                  </div>
                </div>
              )}

              {/* 2 Metric Information Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tarif Bulanan RT 010</span>
                  <p className="mt-1 text-base font-black text-white">
                    {formatRupiah(monthlyAmount)}<span className="text-[10px] font-normal text-slate-400">/bln</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Ditetapkan per unit rumah</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Terakhir Verifikasi</span>
                  <p className="mt-1 text-base font-black text-white truncate">
                    {lastPaymentDate || "-"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Oleh Bendahara RT 010</p>
                </div>
              </div>

              {/* Quick Action CTA Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#00382e] to-[#00241b] p-4 shadow-md">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[#E8C865]">
                    {isLunas ? "Bayar Periode Depan / Di Muka" : "Selesaikan Tagihan Iuran"}
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Mendukung Transfer Bank BCA (Otomatis) & QRIS Resmi RT 010
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("pay")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-5 py-2.5 text-xs font-black text-slate-950 shadow-[0_4px_14px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all shrink-0"
                >
                  <span>💸</span>
                  <span>Bayar Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════ TAB 2: BAYAR IURAN ════════ */}
          {activeTab === "pay" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Payment Period Multiplier */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2.5">
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Pilih Jumlah Bulan Iuran
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPayMonthCount(num)}
                      className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                        payMonthCount === num
                          ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37] shadow-sm"
                          : "bg-white/[0.05] text-white border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {num} Bulan
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
                  <span className="text-slate-400">Total Nominal Pembayaran:</span>
                  <span className="text-base font-black text-[#E8C865]">
                    {formatRupiah(totalPayAmount)}
                  </span>
                </div>
              </div>

              {/* Method Selector Tabs */}
              <div className="space-y-2">
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Pilih Saluran Pembayaran
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod("bca")}
                    className={`flex items-center justify-center gap-2 rounded-2xl p-3 border text-xs font-bold transition-all ${
                      selectedPayMethod === "bca"
                        ? "bg-[#00382e] border-[#D4AF37] text-white shadow-md"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>🏦</span>
                    <span>Transfer Bank BCA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod("qris")}
                    className={`flex items-center justify-center gap-2 rounded-2xl p-3 border text-xs font-bold transition-all ${
                      selectedPayMethod === "qris"
                        ? "bg-[#00382e] border-[#D4AF37] text-white shadow-md"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>📱</span>
                    <span>QRIS Resmi RT 010</span>
                  </button>
                </div>
              </div>

              {/* Method Details: BCA */}
              {selectedPayMethod === "bca" && (
                <div className="rounded-2xl border border-white/10 bg-[#002820] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Bank Central Asia (BCA)</span>
                    <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[9.5px] font-bold">
                      Rekening Kas RT
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/40 p-3 border border-white/10">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-mono">NOMOR REKENING</span>
                      <span className="text-lg font-mono font-black text-white tracking-wider">
                        827-010-2026
                      </span>
                      <span className="block text-[10.5px] text-slate-300">a.n. RT 010 CIPTA GREENVILLE</span>
                    </div>

                    <button
                      type="button"
                      onClick={copyBCA}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition-all"
                    >
                      {copiedBank ? "✓ Tersalin!" : "📋 Salin"}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sertakan berita transfer: <strong className="text-white">{cluster} {blockOrUnit} - {residentId}</strong>
                  </p>
                </div>
              )}

              {/* Method Details: QRIS */}
              {selectedPayMethod === "qris" && (
                <div className="rounded-2xl border border-white/10 bg-[#002820] p-4 text-center space-y-3">
                  <span className="block text-xs font-bold text-slate-300">
                    Scan QRIS via BCA, GoPay, OVO, Dana, ShopeePay, dll.
                  </span>
                  
                  {/* QRIS Visual Demo */}
                  <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-2xl bg-white p-3 shadow-inner">
                    <svg className="h-32 w-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="5" y="5" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="13" y="13" width="14" height="14" rx="2" fill="currentColor" />
                      <rect x="65" y="5" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="73" y="13" width="14" height="14" rx="2" fill="currentColor" />
                      <rect x="5" y="65" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="13" y="73" width="14" height="14" rx="2" fill="currentColor" />
                      <rect x="42" y="42" width="16" height="16" rx="2" fill="currentColor" />
                      <rect x="42" y="10" width="8" height="20" rx="1" fill="currentColor" />
                      <rect x="10" y="42" width="20" height="8" rx="1" fill="currentColor" />
                      <rect x="65" y="65" width="12" height="12" rx="1" fill="currentColor" />
                    </svg>
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-1">
                      NMID: ID1026010021
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Atas Nama: <strong className="text-white">KAS RT 010 CIPTA GREENVILLE</strong>
                  </p>
                </div>
              )}

              {/* Confirmation CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleConfirmWA}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-black text-white shadow-lg active:scale-95 transition-all"
                >
                  <span className="text-base">💬</span>
                  <span>Kirim Bukti Transfer via WhatsApp Pengurus</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════ TAB 3: RIWAYAT & KUITANSI ════════ */}
          {activeTab === "history" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Transaksi Warga
                </span>
                <span className="text-[11px] font-bold text-[#D4AF37]">
                  {recapRows.length > 0 ? `${recapRows.length} Catatan Pembayaran` : "0 Transaksi"}
                </span>
              </div>

              {recapRows.length > 0 ? (
                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  {recapRows.map((item) => {
                    const isVerified = item.verification_status === "verified";
                    const isPendingRow = item.verification_status === "pending";

                    return (
                      <div
                        key={item.payment_id}
                        className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">
                              {item.period_label || `Iuran ${item.period_count} Bulan`}
                            </span>
                            {isVerified ? (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                                Lunas
                              </span>
                            ) : isPendingRow ? (
                              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                                Verifikasi
                              </span>
                            ) : (
                              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-400">
                                Ditolak
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {formatPaymentDate(item.paid_at)} • {formatRupiah(Number(item.amount) || monthlyAmount)} • {item.method.toUpperCase()}
                          </p>
                        </div>

                        {isVerified && (
                          <button
                            type="button"
                            onClick={() => handleTriggerReceipt(item)}
                            className="inline-flex items-center gap-1 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-bold text-[#E8C865] hover:bg-[#D4AF37] hover:text-slate-950 transition-all active:scale-95"
                          >
                            <span>🧾</span>
                            <span>Kuitansi</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback clean history view */
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center space-y-2">
                  <span className="text-2xl">📑</span>
                  <p className="text-xs font-bold text-white">Belum Ada Riwayat Transaksi Tercatat</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Setelah Anda melakukan pembayaran dan diverifikasi bendahara, rekap dan kuitansi digital akan tampil otomatis di sini.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("pay")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-black text-slate-950 hover:brightness-110"
                    >
                      <span>💸</span>
                      <span>Mulai Bayar Iuran</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════ TAB 4: KAS LINGKUNGAN ════════ */}
          {activeTab === "kas" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2">
                <span className="block text-[10px] font-black uppercase tracking-widest text-[#E8C865]">
                  Transparansi Keuangan Terbuka
                </span>
                <h3 className="text-sm font-black text-white">
                  Laporan Pemasukan & Pengeluaran RT 010
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pengurus RT 010 berkomitmen penuh menjaga akuntabilitas keuangan lingkungan. Semua iuran warga dialokasikan untuk kebersihan, keamanan, penerangan, dan fasilitas bersama.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-emerald-950/30 p-3.5">
                  <span className="block text-[10px] font-bold text-emerald-300">Alokasi Utama</span>
                  <p className="text-xs font-bold text-white mt-1">Keamanan & Pos Ronda</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Petugas satpam 24 jam</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-emerald-950/30 p-3.5">
                  <span className="block text-[10px] font-bold text-emerald-300">Fasilitas Bersama</span>
                  <p className="text-xs font-bold text-white mt-1">Kebersihan & Lampu PJU</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pemeliharaan taman & jalan</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/keuangan/"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E8C865] px-6 py-3 text-xs font-black text-slate-950 hover:brightness-110 shadow-lg"
                >
                  <span>📊</span>
                  <span>Buka Laporan Transparansi Kas Lengkap →</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="shrink-0 border-t border-white/10 bg-[#001713] px-4 py-3 sm:px-6 flex items-center justify-between text-[11px] text-slate-400">
          <Link
            href="/portal/profil-rumah/"
            onClick={onClose}
            className="text-[#D4AF37] hover:underline underline-offset-4 flex items-center gap-1 font-semibold"
          >
            <span>Rekap Rumah Saya</span>
            <span>→</span>
          </Link>
          <span>RT 010 / RW 021 Cipta Greenville</span>
        </div>
      </div>
    </div>
  );
}
