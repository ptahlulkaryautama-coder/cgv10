"use client";

import { useEffect, useState } from "react";

export interface ReceiptData {
  name: string;
  cluster: string;
  blockOrUnit: string;
  residentId: string;
  monthPeriod: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNo: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * SCREEN 6: KUITANSI PEMBAYARAN (Modal / Sub-Screen)
 * Sesuai mockup layar keenam:
 * Header: ← Kuitansi Pembayaran
 * Kuitansi Kertas Digital:
 *  - Logo Cipta Green Ville & RT 010 / RW 021
 *  - KUITANSI PEMBAYARAN IURAN
 *  - Format Key-Value bertitik dua rapi (Nama, Blok/No, ID Warga, Bulan, Tanggal Bayar, Jumlah, Metode, No. Ref)
 *  - Ucapan terima kasih
 *  - Ilustrasi perumahan hijau & slogan "Bersama Membangun Lingkungan yang Lebih Baik"
 *  - Tepi bergerigi kuitansi
 * Tombol Bawah: [Unduh PDF] dan [Bagikan]
 */
export function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !data) return null;

  const fullUnit = `${data.cluster} ${data.blockOrUnit}`.trim();

  function handleShare() {
    const text = `*KUITANSI PEMBAYARAN IURAN RT 010 / RW 021*\n\n` +
      `Nama: ${data?.name}\n` +
      `Blok / No: ${fullUnit}\n` +
      `ID Warga: ${data?.residentId}\n` +
      `Bulan: ${data?.monthPeriod}\n` +
      `Tanggal: ${data?.paymentDate}\n` +
      `Jumlah: ${formatRupiah(data?.amount ?? 50000)}\n` +
      `Metode: ${data?.paymentMethod}\n` +
      `No. Ref: ${data?.referenceNo}\n\n` +
      `_Terima kasih atas pembayaran iuran RT 010 / RW 021 Cipta Green Ville._`;

    if (navigator.share) {
      navigator.share({ title: "Kuitansi Iuran CGV10", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handlePrintOrDownload() {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 300);
  }

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
            <span>Kuitansi Pembayaran</span>
          </button>
          <div className="w-6" />
        </div>

        {/* Receipt Body Container (Matching Screen 6 Mockup) */}
        <div className="p-4 max-h-[82vh] overflow-y-auto">
          <div className="relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/90 pb-7">
            {/* Kop & Logo */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-950 leading-none">
                    CIPTA
                  </span>
                  <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-800 leading-none">
                    GREEN VILLE
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-800 leading-tight">
                  RT 010 / RW 021
                </p>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                  Cipta Green Ville
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="my-4 text-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                KUITANSI PEMBAYARAN IURAN
              </h3>
            </div>

            {/* Table Details with Colon Alignment */}
            <div className="space-y-1.5 text-xs text-slate-700 py-1">
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">Nama</span>
                <span className="col-span-8 font-bold text-slate-900">: {data.name}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">Blok / No</span>
                <span className="col-span-8 font-bold text-slate-900">: {fullUnit}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">ID Warga</span>
                <span className="col-span-8 font-mono font-bold text-slate-900">: {data.residentId}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">Bulan</span>
                <span className="col-span-8 font-bold text-emerald-800">: {data.monthPeriod}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">Tanggal Bayar</span>
                <span className="col-span-8 text-slate-800 font-semibold">: {data.paymentDate}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">Jumlah</span>
                <span className="col-span-8 font-black text-slate-900">: {formatRupiah(data.amount)}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">Metode</span>
                <span className="col-span-8 text-slate-800 font-semibold">: {data.paymentMethod}</span>
              </div>
              <div className="grid grid-cols-12">
                <span className="col-span-4 text-slate-500 font-medium">No. Ref</span>
                <span className="col-span-8 font-mono text-slate-800 font-semibold">: {data.referenceNo}</span>
              </div>
            </div>

            {/* Note & Illustration (Screen 6 Mockup) */}
            <div className="mt-4 border-t border-slate-100 pt-3 text-center">
              <p className="text-[10px] leading-relaxed text-slate-500">
                Terima kasih atas pembayaran iuran <br />
                RT 010 / RW 021 Cipta Green Ville.
              </p>

              {/* Houses Sketch Illustration */}
              <div className="my-2.5 flex items-center justify-center opacity-70 text-emerald-700">
                <svg className="h-6 w-32" viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 25h150M15 25V15l10-8 10 8v10M45 25V12l12-9 12 9v13M80 25V16l8-6 8 6v9M105 25V10l15-7 15 7v15M20 25v-5h6v5M52 25v-7h8v7M115 25v-8h10v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <p className="text-[9.5px] font-medium italic text-emerald-800 font-serif">
                &ldquo;Bersama Membangun Lingkungan yang Lebih Baik&rdquo;
              </p>
            </div>

            {/* Sawtooth / Jagged Bottom Paper Edge */}
            <div className="absolute -bottom-2 left-0 right-0 h-2.5 overflow-hidden">
              <svg className="w-full text-[#f8faf9]" viewBox="0 0 400 10" preserveAspectRatio="none" fill="currentColor">
                <path d="M0,0 L10,10 L20,0 L30,10 L40,0 L50,10 L60,0 L70,10 L80,0 L90,10 L100,0 L110,10 L120,0 L130,10 L140,0 L150,10 L160,0 L170,10 L180,0 L190,10 L200,0 L210,10 L220,0 L230,10 L240,0 L250,10 L260,0 L270,10 L280,0 L290,10 L300,0 L310,10 L320,0 L330,10 L340,0 L350,10 L360,0 L370,10 L380,0 L390,10 L400,0 L400,10 L0,10 Z" />
              </svg>
            </div>
          </div>

          {/* Action Buttons: Unduh PDF & Bagikan */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePrintOrDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{downloading ? "Memproses..." : "Unduh PDF"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{copied ? "Tersalin!" : "Bagikan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
