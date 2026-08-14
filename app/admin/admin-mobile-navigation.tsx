"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ProductionAdminSection } from "./production-admin-components";

type MobileNavItem = {
  id: ProductionAdminSection;
  label: string;
  href: string;
  icon: IconName;
  superAdminOnly?: boolean;
};

const primaryItems: MobileNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/", icon: "home" },
  { id: "intake", label: "Permintaan", href: "/admin/intake/", icon: "message" },
  { id: "warga", label: "Warga", href: "/admin/warga/", icon: "users" },
  { id: "iuran", label: "Iuran", href: "/admin/iuran/", icon: "wallet" },
];

const secondaryItems: MobileNavItem[] = [
  { id: "palugada", label: "PALUGADA", href: "/admin/palugada/", icon: "store" },
  { id: "portal-posts", label: "Portal Posts", href: "/admin/portal-posts/", icon: "file" },
  { id: "pengaturan", label: "Pengaturan", href: "/admin/pengaturan/", icon: "users" },
  { id: "debug", label: "Debug", href: "/admin/debug/", icon: "building", superAdminOnly: true },
];

export function AdminMobileNavigation({
  active,
  isSuperAdmin,
}: {
  active: ProductionAdminSection;
  isSuperAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    drawerRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      window.location.assign("/admin/login/");
    }
  }

  const visibleSecondaryItems = secondaryItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin,
  );

  return (
    <>
      <nav
        aria-label="Navigasi utama admin"
        className="fixed inset-x-0 bottom-0 z-40 grid h-[4.6rem] grid-cols-5 border-t border-black/10 bg-[#fffdf8]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden"
      >
        {primaryItems.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-primary-soft/55 hover:text-primary"
              }`}
            >
              <span className="[&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]">
                <Icon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-menu"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-muted transition-colors hover:bg-primary-soft/55 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        >
          <span className="grid h-[1.15rem] w-[1.15rem] place-items-center rounded-[0.3rem] border-2 border-current">
            <span className="h-0.5 w-2 rounded-full bg-current" />
          </span>
          <span>Menu</span>
        </button>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu admin"
            onClick={closeMenu}
            className="absolute inset-0 bg-primary/45"
          />
          <div
            id="admin-mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu admin lainnya"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 rounded-t-[1.5rem] border-t border-border bg-[#fffdf8] p-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] shadow-[0_-18px_48px_rgba(12,24,16,0.2)] outline-none"
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Admin CGV10</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">Menu lainnya</h2>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {visibleSecondaryItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-white px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/35 hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-primary [&>svg]:h-5 [&>svg]:w-5"><Icon name={item.icon} /></span>
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 text-left text-sm font-bold text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs">×</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
