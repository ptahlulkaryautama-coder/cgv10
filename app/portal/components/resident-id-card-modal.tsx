"use client";

import { useEffect, useState } from "react";

interface ResidentIdCardProps {
  displayName?: string;
  cluster?: string;
  blockOrUnit?: string;
  residentId?: string;
  familyCardNo?: string;
  status?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SCREEN 2: KARTU IURAN DIGITAL (Full View Modal)
 * Sesuai mockup layar kedua: Card putih vertikal elegan dengan lengkungan hijau atas,
 * avatar melingkar, Nama, Blok/Unit, ID Warga, No. KK, QR Code scannable, dan
 * footer lengkung daun dengan slogan "Bersama Membangun Lingkungan yang Lebih Baik".
 */
export function ResidentIdCardModal({
  displayName = "Budi Santoso",
  cluster = "Chiswick",
  blockOrUnit = "A-12",
  residentId = "CGV-010-0012",
  familyCardNo = "3271010101010012",
  isOpen,
  onClose,
}: ResidentIdCardProps) {
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

  if (!isOpen) return null;

  const fullAddress = `${cluster} ${blockOrUnit}`.trim().toUpperCase();

  function handleShare() {
    const text = `KARTU IURAN DIGITAL RT 010 / RW 021 Cipta Green Ville\nNama: ${displayName}\nAlamat: ${fullAddress}\nID Warga: ${residentId}\nNo. KK: ${familyCardNo}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Kartu Iuran Digital - ${displayName}`,
          text,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* App Bar Header */}
        <div className="flex items-center justify-between bg-[#00473e] px-4 py-3.5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kartu Iuran Digital</span>
          </button>
          <div className="w-6" />
        </div>

        {/* Card Body (Vertical Card matching Screen 2 Mockup) */}
        <div className="relative bg-white px-5 pt-4 pb-0 text-slate-800">
          {/* Top Row: Logo Cipta Green Ville & RT 010 / RW 021 */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
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

          {/* Curved Green Banner with Avatar */}
          <div className="relative mt-2 flex flex-col items-center justify-center">
            {/* Background green decorative arc */}
            <div className="absolute top-0 h-16 w-full rounded-t-full bg-gradient-to-b from-emerald-50 to-transparent -z-0" />
            
            {/* Avatar Circle with Green Ring */}
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#00473e] p-1 shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-emerald-900">
                <svg className="h-10 w-10 text-[#00473e]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Resident Name & Unit */}
            <h3 className="relative z-10 mt-3 text-lg font-black text-slate-900 leading-tight">
              {displayName}
            </h3>
            <p className="relative z-10 mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              {fullAddress}
            </p>
          </div>

          {/* Grid ID Warga & No. KK */}
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-center">
            <div>
              <span className="block text-[10px] font-semibold uppercase text-slate-400">ID Warga</span>
              <span className="text-xs font-extrabold text-slate-900 font-mono">{residentId}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-slate-400">No. KK</span>
              <span className="text-xs font-extrabold text-slate-900 font-mono">{familyCardNo}</span>
            </div>
          </div>

          {/* Large Scannable QR Code */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <svg className="h-32 w-32 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                {/* 3 Main Corner Markers */}
                <rect x="10" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
                
                <rect x="64" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="72" y="18" width="10" height="10" rx="2" fill="currentColor" />
                
                <rect x="10" y="64" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="18" y="72" width="10" height="10" rx="2" fill="currentColor" />

                {/* Matrix Pixel Blocks */}
                <rect x="42" y="12" width="6" height="6" rx="1.5" />
                <rect x="52" y="12" width="6" height="6" rx="1.5" />
                <rect x="42" y="24" width="6" height="6" rx="1.5" />
                <rect x="52" y="32" width="6" height="6" rx="1.5" />
                <rect x="12" y="44" width="6" height="6" rx="1.5" />
                <rect x="24" y="44" width="6" height="6" rx="1.5" />
                <rect x="36" y="44" width="6" height="6" rx="1.5" />
                <rect x="48" y="44" width="6" height="6" rx="1.5" />
                <rect x="60" y="44" width="6" height="6" rx="1.5" />
                <rect x="72" y="44" width="6" height="6" rx="1.5" />
                <rect x="84" y="44" width="6" height="6" rx="1.5" />
                <rect x="44" y="56" width="6" height="6" rx="1.5" />
                <rect x="56" y="56" width="6" height="6" rx="1.5" />
                <rect x="68" y="56" width="6" height="6" rx="1.5" />
                <rect x="80" y="56" width="6" height="6" rx="1.5" />
                <rect x="44" y="68" width="6" height="6" rx="1.5" />
                <rect x="56" y="68" width="6" height="6" rx="1.5" />
                <rect x="68" y="68" width="6" height="6" rx="1.5" />
                <rect x="80" y="68" width="6" height="6" rx="1.5" />
                <rect x="44" y="80" width="6" height="6" rx="1.5" />
                <rect x="56" y="80" width="6" height="6" rx="1.5" />
                <rect x="68" y="80" width="6" height="6" rx="1.5" />
                <rect x="80" y="80" width="6" height="6" rx="1.5" />
              </svg>
            </div>
          </div>

          {/* Bottom Wave with Leaves & Slogan (Screen 2 Mockup) */}
          <div className="relative -mx-5 overflow-hidden bg-gradient-to-r from-emerald-800 to-[#00473e] px-4 py-4 text-center text-white">
            {/* Green Leaf Graphic Motif */}
            <div className="flex items-center justify-center gap-1.5 opacity-90 mb-1">
              <svg className="h-4 w-4 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
              </svg>
            </div>
            <p className="text-xs font-medium italic tracking-wide text-emerald-100 font-serif">
              &ldquo;Bersama Membangun Lingkungan yang Lebih Baik&rdquo;
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 p-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00473e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#003831] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{copied ? "Tersalin!" : "Bagikan Kartu"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SCREEN 1 MINI CARD: KARTU IURAN DIGITAL
 * Sesuai mockup layar pertama:
 * Background dark emerald gradient (#003D34),
 * Header: KARTU IURAN DIGITAL / RT 010 / RW 021 / Cipta Green Ville + Logo Cipta Green Ville
 * Body Left: Nama, Blok/No, ID Warga
 * Body Right: Mini QR Code box scannable
 */
export function ResidentIdCardMini({
  displayName = "Budi Santoso",
  cluster = "Chiswick",
  blockOrUnit = "A-12",
  residentId = "CGV-010-0012",
  onClick,
}: {
  displayName?: string;
  cluster?: string;
  blockOrUnit?: string;
  residentId?: string;
  onClick: () => void;
}) {
  const fullAddress = `${cluster} ${blockOrUnit}`.trim();

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#003D34] via-[#00473e] to-[#01352d] p-4 text-white shadow-lg border border-emerald-600/30 transition-all active:scale-[0.99] hover:shadow-xl"
    >
      {/* Top Row: Title & Logo */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wide text-white leading-tight">
            KARTU IURAN DIGITAL
          </h3>
          <p className="text-[11px] font-bold text-emerald-300 leading-tight">
            RT 010 / RW 021
          </p>
          <p className="text-[10px] text-emerald-200/90 leading-tight">
            Cipta Green Ville
          </p>
        </div>

        {/* Logo Cipta Greenville on the Right */}
        <div className="flex flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900 p-1">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
          </div>
          <span className="text-[7px] font-black uppercase tracking-wider text-emerald-200 mt-0.5">
            CIPTA GREEN VILLE
          </span>
        </div>
      </div>

      {/* Main Info & QR Row */}
      <div className="mt-3.5 flex items-end justify-between gap-3">
        {/* Left Side: Nama, Blok/No, ID Warga */}
        <div className="space-y-1.5 min-w-0">
          <div>
            <span className="block text-[9px] font-medium text-emerald-200/80 leading-none">
              Nama
            </span>
            <span className="text-xs font-extrabold text-white truncate block leading-tight mt-0.5">
              {displayName}
            </span>
          </div>

          <div>
            <span className="block text-[9px] font-medium text-emerald-200/80 leading-none">
              Blok / No
            </span>
            <span className="text-xs font-bold text-emerald-100 truncate block leading-tight mt-0.5">
              {fullAddress}
            </span>
          </div>

          <div>
            <span className="block text-[9px] font-medium text-emerald-200/80 leading-none">
              ID Warga
            </span>
            <span className="text-xs font-mono font-bold text-emerald-200 truncate block leading-tight mt-0.5">
              {residentId}
            </span>
          </div>
        </div>

        {/* Right Side: QR Code in White Box */}
        <div className="flex flex-col items-center rounded-xl bg-white p-1.5 shadow-md shrink-0 group-hover:scale-105 transition-transform">
          <svg className="h-14 w-14 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
            <rect x="10" y="10" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
            <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
            <rect x="64" y="10" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
            <rect x="72" y="18" width="10" height="10" rx="2" fill="currentColor" />
            <rect x="10" y="64" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
            <rect x="18" y="72" width="10" height="10" rx="2" fill="currentColor" />
            
            <rect x="42" y="14" width="6" height="6" rx="1" />
            <rect x="52" y="22" width="6" height="6" rx="1" />
            <rect x="42" y="44" width="16" height="16" rx="2" />
            <rect x="68" y="44" width="8" height="8" rx="1" />
            <rect x="44" y="68" width="8" height="8" rx="1" />
            <rect x="68" y="68" width="12" height="12" rx="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
