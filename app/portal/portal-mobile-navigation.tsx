"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";

const navItems: Array<{ label: string; href: string; icon: IconName; primary?: boolean }> = [
  { label: "Beranda", href: "/portal/", icon: "home" },
  { label: "Kabar", href: "/kabar-warga/", icon: "megaphone" },
  { label: "Layanan", href: "/layanan/", icon: "message", primary: true },
  { label: "PALUGADA", href: "/palugada/", icon: "store" },
  { label: "Akun", href: "/portal/profil-rumah/", icon: "users" },
];

export function PortalMobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi aplikasi warga" className="fixed inset-x-0 bottom-0 z-40 grid h-[4.6rem] grid-cols-5 border-t border-black/10 bg-[#fffdf8]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
      {navItems.map((item) => {
        const active = item.href === "/portal/" ? pathname === "/portal" || pathname === "/portal/" : pathname.startsWith(item.href.replace(/\/$/, ""));
        return (
          <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${item.primary ? "-mt-5 h-14 rounded-full border-4 border-[#f3efe6] bg-primary text-accent shadow-[0_5px_14px_rgba(0,61,52,0.24)]" : active ? "bg-primary-soft text-primary" : "text-muted hover:bg-primary-soft/55 hover:text-primary"}`}>
            <span className="[&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
