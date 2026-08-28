"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SPLASH_KEY = "cgv10_splash_shown_v1";

export function PortalSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      const alreadySeen = localStorage.getItem(SPLASH_KEY);
      if (!alreadySeen) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);
      }
    } catch {
      // localStorage not available — skip splash
    }
  }, []);

  function dismiss() {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(SPLASH_KEY, "1");
      } catch {
        // ignore
      }
    }, 450);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-[#f8f5ef] transition-opacity duration-450 ease-in-out ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Layar pembuka Portal Warga CGV"
    >
      {/* HERO PHOTO — top 62% */}
      <div className="relative flex-none" style={{ height: "62svh" }}>
        <Image
          src="/images/cgv-splash-bg.jpg"
          alt="Lingkungan Cipta Greenville saat senja"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />

        {/* Bottom gradient blending into cream */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f5ef] to-transparent" />

        {/* Subtle dark vignette on top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />

        {/* Logo circle — near road, clean white circle */}
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
          <div className="h-[96px] w-[96px] overflow-hidden rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.38)]">
            <Image
              src="/assets/brand/official-cgv-logo.png"
              alt="Logo Portal Warga CGV"
              width={200}
              height={200}
              priority
              className="h-full w-full object-cover"
              style={{ objectPosition: "20% center" }}
            />
          </div>
          <p
            className="text-[11px] font-black uppercase tracking-[0.2em] text-white"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.5)" }}
          >
            Cipta Greenville
          </p>
        </div>
      </div>

      {/* WELCOME SECTION — bottom 38% */}
      <div className="flex flex-1 flex-col items-center justify-between px-7 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-7">
        <div className="text-center">
          <h1 className="text-[2rem] font-black leading-tight tracking-tight text-foreground">
            SELAMAT DATANG
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-muted">
            Portal Resmi Warga Cipta Greenville
          </p>
        </div>

        <div className="w-full">
          <Link
            href="/masuk/"
            onClick={dismiss}
            className="flex min-h-[3.25rem] w-full cursor-pointer items-center justify-center rounded-2xl bg-primary px-6 text-[15px] font-black text-white shadow-[0_12px_28px_rgba(0,61,52,0.3)] transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Masuk / Daftar Warga
          </Link>
        </div>
      </div>
    </div>
  );
}
