"use client";

import { useEffect } from "react";

interface DuesStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment: () => void;
  onOpenHistory: () => void;
  onOpenReceipt: () => void;
  onOpenRecap?: () => void;
  cluster?: string;
  blockOrUnit?: string;
  statusType?: "lunas" | "pending" | "unpaid" | "no_data";
  duesStatusText?: string;
  coverageText?: string;
  monthlyAmount?: number;
  lastPaymentDate?: string;
  pendingCount?: number;
  pendingAmount?: number;
}

/**
 * SCREEN 3: STATUS IURAN (Modal / Sub-Screen)
 * Sesuai mockup layar ketiga:
 * Header: ← Status Iuran
 * Banner Pill Hijau: ✔ IURAN LUNAS S/D SEPTEMBER 2026
 * 2 Kolom Ringkasan: Iuran Bulanan (Rp 50.000) & Terakhir Bayar (05 Sep 2026)
 * Card Iuran Bulan Ini: Rp 50.000 + Tombol "Bayar Sekarang >"
 * 4 Tombol Grid Aksi: [Bayar Iuran], [Riwayat Iuran], [Kuitansi], [Rekap Iuran]
 * Card Bawah: Status Warga (Aktif) & Keterangan (Iuran RT terbayar sampai September 2026.)
 */
export function DuesStatusModal({
  isOpen,
  onClose,
  onOpenPayment,
  onOpenHistory,
  onOpenReceipt,
  onOpenRecap,
  cluster = "Chiswick",
  blockOrUnit = "A-12",
  statusType = "lunas",
  duesStatusText = "IURAN LUNAS S/D SEPTEMBER 2026",
  coverageText = "September 2026",
  monthlyAmount = 50000,
  lastPaymentDate = "05 Sep 2026",
  pendingCount = 0,
  pendingAmount = 0,
}: DuesStatusModalProps) {
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

  const headerBannerText = isPending
    ? `${pendingCount} Menunggu Verifikasi`
    : duesStatusText.toUpperCase();

  const descriptionText = isLunas
    ? `Iuran RT terbayar sampai ${coverageText || "September 2026"}.`
    : isPending
    ? `Pembayaran Rp ${pendingAmount.toLocaleString("id-ID")} sedang diverifikasi.`
    : `Terdapat iuran yang perlu dibayarkan untuk unit ${cluster} ${blockOrUnit}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#f8faf9] shadow-2xl transition-all">
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
            <span>Status Iuran</span>
          </button>
          <div className="w-6" />
        </div>

        {/* Content Body (Matching Screen 3 Mockup) */}
        <div className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Top Hero Pill Banner: Solid Green with Checkmark */}
          <div
            className={`flex items-center gap-3 rounded-2xl p-4 text-white shadow-md ${
              isPending
                ? "bg-gradient-to-r from-amber-600 to-amber-700"
                : isLunas
                ? "bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700"
                : "bg-gradient-to-r from-rose-600 to-rose-700"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
              {isPending ? (
                <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ) : isLunas ? (
                <svg className="h-6 w-6 text-emerald-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide uppercase leading-tight">
                {headerBannerText}
              </h3>
            </div>
          </div>

          {/* 2-Column Stat Box: Iuran Bulanan & Terakhir Bayar */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500">
                Iuran Bulanan
              </span>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                Rp {monthlyAmount.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-[11px] font-semibold text-slate-500">
                Terakhir Bayar
              </span>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {lastPaymentDate || "05 Sep 2026"}
              </p>
            </div>
          </div>

          {/* Iuran Bulan Ini Callout Card with "Bayar Sekarang >" Button */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-700">
              <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <span className="block text-[11px] font-semibold text-slate-500">
                  Iuran bulan ini
                </span>
                <span className="text-sm font-black text-slate-900">
                  Rp {monthlyAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPayment();
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#00473e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#003831] active:scale-[0.99] transition-all"
            >
              <span>Bayar Sekarang</span>
              <span>&gt;</span>
            </button>
          </div>

          {/* 4 Action Buttons Grid (Screen 3 Mockup) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Bayar Iuran */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPayment();
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 hover:shadow transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Bayar Iuran
              </span>
            </button>

            {/* Riwayat Iuran */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 hover:shadow transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Riwayat Iuran
              </span>
            </button>

            {/* Kuitansi */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceipt();
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 hover:shadow transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Kuitansi
              </span>
            </button>

            {/* Rekap Iuran */}
            <button
              type="button"
              onClick={() => {
                if (onOpenRecap) {
                  onClose();
                  onOpenRecap();
                } else {
                  onClose();
                  onOpenHistory();
                }
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200/80 hover:border-emerald-600 hover:shadow transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Rekap Iuran
              </span>
            </button>
          </div>

          {/* Bottom Info Card: Status Warga & Keterangan */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                  Status Warga
                </span>
                <span className="text-xs font-black text-emerald-700">
                  Aktif
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Keterangan: </span>
              <span>{descriptionText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
