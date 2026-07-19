"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useSyncExternalStore } from "react";

const consentKey = "cgv10_privacy_consent";
const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

type ConsentState = "unknown" | "accepted" | "declined";

function normalizeConsent(value: string | null): ConsentState {
  return value === "accepted" || value === "declined" ? value : "unknown";
}

function subscribeToConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cgv10-consent-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cgv10-consent-change", callback);
  };
}

function getConsentSnapshot() {
  if (typeof window === "undefined") return "unknown";
  return normalizeConsent(window.localStorage.getItem(consentKey));
}

function sendAnalyticsEvent(name: string, data: Record<string, unknown>) {
  if (!analyticsEndpoint || typeof navigator === "undefined") return;

  const payload = JSON.stringify({
    name,
    path: window.location.pathname,
    ts: new Date().toISOString(),
    ...data,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(analyticsEndpoint, new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch(analyticsEndpoint, {
    method: "POST",
    body: payload,
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt the portal experience.
  });
}

export function PrivacyConsent() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    () => "unknown",
  );

  useEffect(() => {
    if (consent !== "accepted") return;
    sendAnalyticsEvent("page_view", { referrer: document.referrer || null });
  }, [consent, pathname]);

  useReportWebVitals((metric) => {
    if (consent !== "accepted") return;
    sendAnalyticsEvent("web_vital", {
      id: metric.id,
      metric: metric.name,
      value: metric.value,
      rating: "rating" in metric ? metric.rating : undefined,
    });
  });

  function saveConsent(nextConsent: Exclude<ConsentState, "unknown">) {
    window.localStorage.setItem(consentKey, nextConsent);
    window.dispatchEvent(new Event("cgv10-consent-change"));
  }

  if (consent !== "unknown") return null;

  return (
    <section
      aria-label="Persetujuan privasi"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-4 shadow-[0_24px_70px_rgba(20,90,58,0.22)] sm:bottom-5 sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Privasi warga tetap dijaga.
          </p>
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
            Portal bisa mencatat data teknis ringan, misalnya halaman yang dibuka
            dan kecepatan akses. Data dari form tetap hanya untuk membantu
            pengurus menindaklanjuti kebutuhan warga.
            Baca ringkasannya di{" "}
            <Link href="/privasi/" className="font-semibold text-primary underline-offset-4 hover:underline">
              Kebijakan Privasi
            </Link>
            .
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => saveConsent("declined")}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Nanti saja
          </button>
          <button
            type="button"
            onClick={() => saveConsent("accepted")}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Setuju
          </button>
        </div>
      </div>
    </section>
  );
}
