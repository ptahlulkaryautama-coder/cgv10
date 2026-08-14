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

  useEffect(() => {
    queueMicrotask(() => {
      setInstalled(isStandaloneMode());
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

  if (installed || !installPrompt) return null;

  return (
    <section className="mb-4 rounded-xl border border-primary/15 bg-primary px-3 py-2.5 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
            <Icon name="building" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Pasang Admin CGV10 di HP</p>
            <p className="mt-0.5 truncate text-[11px] text-white/68">Akses lebih cepat untuk pengurus.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={installAdminApp}
          className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-accent px-3 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Pasang
        </button>
      </div>
    </section>
  );
}
