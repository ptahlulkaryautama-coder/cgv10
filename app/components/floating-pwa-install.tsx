"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDismissedSnapshot() {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem("cgv10_pwa_floating_dismissed") === "true";
}

function getPlatformSnapshot(): "ios" | "android" | "other" {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

function subscribeDummy() {
  return () => {};
}

export function FloatingPwaInstall() {
  const isStandalone = useSyncExternalStore(subscribeStandalone, isStandaloneMode, () => false);
  const isStorageDismissed = useSyncExternalStore(subscribeStorage, getDismissedSnapshot, () => true);
  const platform = useSyncExternalStore(subscribeDummy, getPlatformSnapshot, () => "other" as const);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedManually, setInstalledManually] = useState(false);
  const [dismissedManually, setDismissedManually] = useState<boolean | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const dismissed = dismissedManually !== null ? dismissedManually : isStorageDismissed;
  const installed = isStandalone || installedManually;

  useEffect(() => {
    if (isStandalone) return;

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalledManually(true);
      setInstallPrompt(null);
    }

    // Custom event to force trigger prompt from other buttons
    function handleOpenPrompt() {
      setDismissedManually(false);
      setShowIosGuide(platform === "ios");
      if (installPrompt) {
        installPrompt.prompt();
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("cgv10:open-pwa-install", handleOpenPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("cgv10:open-pwa-install", handleOpenPrompt);
    };
  }, [installPrompt, isStandalone, platform]);

  function handleDismiss() {
    setDismissedManually(true);
    sessionStorage.setItem("cgv10_pwa_floating_dismissed", "true");
  }

  async function handleInstallAction() {
    if (platform === "ios") {
      setShowIosGuide(true);
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
        setDismissedManually(true);
      }
    } else {
      // Fallback instruction for browsers where prompt isn't directly triggerable
      setShowIosGuide(true);
    }
  }

  if (installed || dismissed) {
    // If iOS guide modal is explicitly triggered, show modal even if card dismissed
    if (!showIosGuide) return null;
  }

  return (
    <>
      {/* ── FLOATING PWA INSTALL BANNER (LUXURY EMERALD & GOLD) ── */}
      {!dismissed && !installed && (
        <aside
          aria-label="Pasang Aplikasi Portal CGV10"
          className="fixed bottom-4 inset-x-3.5 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-[420px] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#00241b]/95 backdrop-blur-xl p-4 sm:p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white ring-1 ring-white/10">
            {/* Subtle glow background */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#D4AF37]/15 blur-2xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />

            {/* Close (X) button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Tutup banner instalasi"
              className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Top row: App Icon + Titles */}
            <div className="flex items-start gap-3.5 pr-6">
              {/* App Icon */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#00382e] shadow-md shadow-black/40">
                <svg
                  className="h-6 w-6 text-[#E8C865]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-black text-[#15140b]">
                  10
                </span>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  Pasang Aplikasi Portal CGV10
                </h3>
                <p className="mt-0.5 text-xs text-slate-300/90 leading-relaxed line-clamp-2">
                  Akses cepat layanan warga, iuran &amp; kabar lingkungan langsung dari layar HP Anda.
                </p>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-3.5 flex items-center justify-end gap-2.5 pt-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>

              <button
                type="button"
                onClick={handleInstallAction}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C865] to-[#B8942F] px-4 py-2 text-xs font-black text-[#15140b] shadow-[0_4px_14px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span>Pasang Aplikasi</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── IOS / MANUAL INSTALLATION GUIDANCE MODAL ── */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/40 bg-[#00241b] p-5 sm:p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#D4AF37]/20 text-[#E8C865]">
                  📱
                </span>
                <h4 className="text-base font-bold text-white">Panduan Pasang di Layar HP</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-200">
              {platform === "ios" ? (
                <>
                  <p className="font-semibold text-[#E8C865]">
                    Khusus iPhone / iPad (Browser Safari):
                  </p>
                  <ol className="list-decimal space-y-2 pl-4 text-slate-300">
                    <li>
                      Pastikan membuka portal di browser <strong>Safari</strong>.
                    </li>
                    <li>
                      Tekan tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas di bagian bawah layar).
                    </li>
                    <li>
                      Gulir ke bawah dan pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>).
                    </li>
                    <li>
                      Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon CGV10 akan muncul di layar utama HP Anda.
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-semibold text-[#E8C865]">
                    Panduan Pasang (Android / Chrome):
                  </p>
                  <ol className="list-decimal space-y-2 pl-4 text-slate-300">
                    <li>
                      Tekan tombol menu titik tiga (<strong>⋮</strong>) di pojok kanan atas browser Chrome.
                    </li>
                    <li>
                      Pilih menu <strong>&quot;Instal aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                    </li>
                    <li>
                      Konfirmasi pemasangan. Aplikasi siap dibuka langsung dari homescreen.
                    </li>
                  </ol>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowIosGuide(false);
                  handleDismiss();
                }}
                className="w-full sm:w-auto rounded-xl bg-[#D4AF37] px-5 py-2.5 text-xs font-black text-[#15140b] shadow-md hover:brightness-110"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
