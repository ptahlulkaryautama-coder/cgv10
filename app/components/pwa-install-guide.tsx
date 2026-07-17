"use client";

import { useEffect, useState } from "react";

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

export function PwaInstallGuide({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    queueMicrotask(() => {
      setInstalled(isStandaloneMode());
      const userAgent = window.navigator.userAgent.toLowerCase();
      setPlatform(/iphone|ipad|ipod/.test(userAgent) ? "ios" : /android/.test(userAgent) ? "android" : "other");
    });

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  const instruction =
    platform === "ios"
      ? "Buka lewat Safari, tekan Bagikan, lalu pilih Tambahkan ke Layar Utama."
      : platform === "android"
        ? "Jika tombol belum tersedia, buka lewat Chrome lalu pilih menu ⋮ dan Instal aplikasi."
        : "Buka menu browser dan pilih Instal aplikasi jika tersedia.";

  return (
    <section id="install-portal" className={compact ? "mt-6" : "border-y border-border bg-surface"}>
      <div className={compact ? "rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5" : "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 xl:px-10"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                <path d="M7 3.5h10A1.5 1.5 0 0 1 18.5 5v14A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5ZM10 17.5h4" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Aplikasi CGV10</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {installed ? "Sudah terpasang di perangkat ini." : "Pasang ikon CGV10 di layar HP."}
              </h2>
              {!installed ? <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">{instruction}</p> : null}
            </div>
          </div>

          {installPrompt && !installed ? (
            <button
              type="button"
              onClick={installApp}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Pasang aplikasi
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
