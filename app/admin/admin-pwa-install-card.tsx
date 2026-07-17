"use client";

import { useEffect, useState } from "react";
import { Icon } from "../components/portal";

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

export function AdminPwaInstallCard() {
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

  async function installAdminApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  const instruction =
    platform === "ios"
      ? "Di Safari, tetap di halaman Admin ini, tekan Bagikan, lalu pilih Tambahkan ke Layar Utama."
      : platform === "android"
        ? "Jika tombol belum muncul, buka halaman Admin lewat Chrome, tekan menu titik tiga, lalu pilih Instal aplikasi."
        : "Buka menu browser dari halaman Admin ini, lalu pilih Instal aplikasi jika tersedia.";

  return (
    <section className="mb-5 rounded-[20px] border border-primary/15 bg-primary text-white shadow-[0_18px_50px_rgba(0,61,52,0.18)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-accent-soft text-primary [&>svg]:h-6 [&>svg]:w-6">
            <Icon name="building" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              Aplikasi Admin Dashboard
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight">
              {installed ? "Admin Dashboard sudah berjalan sebagai aplikasi." : "Pasang shortcut Admin di layar HP."}
            </h2>
            {!installed ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/74">
                {instruction} Setelah terpasang, pengurus cukup tap ikon
                CGV10 Admin tanpa mengetik alamat website.
              </p>
            ) : (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/74">
                Shortcut ini langsung membuka `/admin` selama session login
                pengurus masih aktif.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          {installPrompt && !installed ? (
            <button
              type="button"
              onClick={installAdminApp}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[12px] bg-accent px-5 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Pasang Admin
            </button>
          ) : null}
          <a
            href="/admin/?source=admin-install-card"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[12px] border border-white/16 bg-white/10 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Buka Admin
          </a>
        </div>
      </div>
    </section>
  );
}
