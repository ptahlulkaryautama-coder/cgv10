"use client";

import { useEffect, useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluster?: string;
  blockOrUnit?: string;
  monthlyAmount?: number;
  residentName?: string;
  residentId?: string;
}

/**
 * SCREEN 5: PEMBAYARAN IURAN (Modal / Sub-Screen)
 * Sesuai mockup layar kelima:
 * Header: ← Pembayaran Iuran
 * Banner Info Biru: Pastikan data sudah sesuai sebelum melakukan pembayaran.
 * Rincian Nominal: Iuran Bulanan / Rp 50.000 / 📅 Bulan : Oktober 2026
 * Metode Pembayaran:
 *  - Transfer Bank (BCA, Mandiri, BNI, BRI, dll) >
 *  - QRIS (Scan kode QR) >
 *  - E-Wallet (OVO, GoPay, DANA, ShopeePay, dll) >
 * Tombol Utama: Lanjutkan Pembayaran > (membuka detail instruksi transfer / konfirmasi WA)
 */
export function DuesPaymentModal({
  isOpen,
  onClose,
  cluster = "Chiswick",
  blockOrUnit = "A-12",
  monthlyAmount = 50000,
  residentName = "Budi Santoso",
  residentId = "CGV-010-0012",
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "qris" | "ewallet">("bank");
  const [showDetail, setShowDetail] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const selectedMonth = "Oktober 2026";

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

  function handleCopyRekening() {
    navigator.clipboard.writeText("7310889901");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  }

  function handleConfirmWA() {
    const text = `Halo Bendahara RT 010 Cipta Green Ville, saya ingin konfirmasi pembayaran iuran:\n\n` +
      `Nama: ${residentName}\n` +
      `Unit: ${cluster} ${blockOrUnit}\n` +
      `ID Warga: ${residentId}\n` +
      `Periode: ${selectedMonth}\n` +
      `Nominal: Rp ${monthlyAmount.toLocaleString("id-ID")}\n` +
      `Metode: ${selectedMethod === "bank" ? "Transfer Bank BCA" : selectedMethod === "qris" ? "QRIS" : "E-Wallet"}\n\n` +
      `Berikut bukti pembayarannya. Mohon diverifikasi. Terima kasih!`;
    const waUrl = `https://wa.me/628117761010?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#f8faf9] shadow-2xl transition-all">
        {/* Top Header App Bar */}
        <div className="flex items-center justify-between bg-[#00473e] px-4 py-3.5 text-white">
          <button
            type="button"
            onClick={() => {
              if (showDetail) setShowDetail(false);
              else onClose();
            }}
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{showDetail ? "Kembali" : "Pembayaran Iuran"}</span>
          </button>
          <div className="w-6" />
        </div>

        {/* Content Body (Matching Screen 5 Mockup) */}
        <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">
          {!showDetail ? (
            <>
              {/* Blue Notice Banner */}
              <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-3.5 text-blue-900 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold leading-snug text-blue-900">
                  Pastikan data sudah sesuai sebelum melakukan pembayaran.
                </p>
              </div>

              {/* Dues Summary Amount Block */}
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm border border-slate-200/80">
                <span className="text-xs font-semibold text-slate-500">
                  Iuran Bulanan
                </span>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  Rp {monthlyAmount.toLocaleString("id-ID")}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Bulan : {selectedMonth}</span>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Metode Pembayaran
                </h4>

                {/* Transfer Bank */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("bank");
                    setShowDetail(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border transition-all text-left group ${
                    selectedMethod === "bank"
                      ? "border-emerald-600 ring-1 ring-emerald-600"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 10h16v2H4zm0 4h16v2H4zm7-10l8 4H5l6-4zM2 20h20v2H2z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Transfer Bank</h5>
                      <p className="text-[11px] text-slate-500">BCA, Mandiri, BNI, BRI, dll</p>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* QRIS */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("qris");
                    setShowDetail(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border transition-all text-left group ${
                    selectedMethod === "qris"
                      ? "border-emerald-600 ring-1 ring-emerald-600"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v3h-3zm-5 5h3v3h-3zm5 0h3v3h-3zm-5-5h3v3h-3z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">QRIS</h5>
                      <p className="text-[11px] text-slate-500">Scan kode QR</p>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* E-Wallet */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("ewallet");
                    setShowDetail(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm border transition-all text-left group ${
                    selectedMethod === "ewallet"
                      ? "border-emerald-600 ring-1 ring-emerald-600"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">E-Wallet</h5>
                      <p className="text-[11px] text-slate-500">OVO, GoPay, DANA, ShopeePay, dll</p>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Bottom Action Button: Lanjutkan Pembayaran > */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDetail(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#00473e] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#003831] active:scale-[0.99] transition-all"
                >
                  <span>Lanjutkan Pembayaran</span>
                  <span>&gt;</span>
                </button>
              </div>
            </>
          ) : (
            /* Step 2: Payment Detail & Instructions */
            <div className="space-y-4">
              {selectedMethod === "bank" ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900">Rekening Resmi Kas RT</span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      BCA
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Nomor Rekening:</span>
                      <span className="font-mono font-bold text-slate-900">7310889901</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Atas Nama:</span>
                      <span className="font-bold text-slate-900">KAS RT 010 CIPTA GREEN VILLE</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200/80 pt-1.5 font-bold">
                      <span className="text-slate-700">Jumlah Transfer:</span>
                      <span className="text-emerald-700">Rp {monthlyAmount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyRekening}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{copiedBank ? "Nomor Rekening Tersalin!" : "Salin Nomor Rekening"}</span>
                  </button>
                </div>
              ) : selectedMethod === "qris" ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">QRIS RT 010 Cipta Green Ville</span>
                  <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-200 p-2">
                    <svg className="h-36 w-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="10" y="10" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
                      <rect x="64" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="72" y="18" width="10" height="10" rx="2" fill="currentColor" />
                      <rect x="10" y="64" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="18" y="72" width="10" height="10" rx="2" fill="currentColor" />
                      <rect x="42" y="42" width="16" height="16" rx="2" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-500">Scan melalui BCA Mobile, Livin, GoPay, OVO, atau DANA</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">E-Wallet Transfer</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Transfer ke nomor OVO/GoPay/DANA resmi bendahara RT: <br />
                    <strong className="font-mono text-emerald-800 text-sm">0811-776-1010</strong> (a.n Bendahara RT 010)
                  </p>
                </div>
              )}

              {/* Confirm to WhatsApp Bendahara Button */}
              <button
                type="button"
                onClick={handleConfirmWA}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00473e] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#003831] transition-colors"
              >
                <span>Konfirmasi via WhatsApp Bendahara</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 3.67C16.58 3.67 20.28 7.37 20.28 11.92C20.28 16.46 16.58 20.17 12.04 20.17C10.66 20.17 9.3 19.82 8.1 19.14L7.81 18.97L4.7 19.79L5.53 16.76L5.35 16.46C4.6 15.26 4.21 13.88 4.21 11.91C4.21 7.37 7.91 3.67 12.05 3.67Z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
