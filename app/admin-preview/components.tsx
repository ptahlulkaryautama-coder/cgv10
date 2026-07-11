import Image from "next/image";
import Link from "next/link";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { HydrationMarker } from "./hydration-marker";

export type AdminSection =
  | "dashboard"
  | "portal"
  | "kabar"
  | "warga"
  | "layanan"
  | "keuangan"
  | "program"
  | "palugada"
  | "dokumen"
  | "pengaturan";

type SidebarItem = {
  id: AdminSection;
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
};

const primaryNav: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin-preview/", icon: "home" },
  { id: "portal", label: "Portal Warga", href: "/admin-preview/portal-warga/", icon: "shield", badge: "Static" },
  { id: "warga", label: "Data Warga", href: "/admin-preview/data-warga/", icon: "users", badge: "250" },
  { id: "layanan", label: "Layanan", href: "/admin-preview/layanan/", icon: "message", badge: "5" },
  { id: "keuangan", label: "Keuangan", href: "/admin-preview/keuangan/", icon: "wallet" },
];

const supportNav: SidebarItem[] = [
  { id: "program", label: "Program & Kegiatan", href: "/admin-preview/program-kegiatan/", icon: "calendar" },
  { id: "palugada", label: "PALUGADA", href: "/admin-preview/palugada/", icon: "store", badge: "4" },
  { id: "dokumen", label: "Dokumen", href: "/admin-preview/dokumen/", icon: "file" },
  { id: "pengaturan", label: "Pengaturan", href: "/admin-preview/pengaturan/", icon: "building" },
];

const allAdminNav = [...primaryNav, ...supportNav];

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function NavItem({ item, active }: { item: SidebarItem; active: AdminSection }) {
  const isActive = item.id === active;

  return (
    <Link
      href={item.href}
      className={cx(
        "flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-left text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        isActive
          ? "bg-accent/13 text-accent shadow-[inset_3px_0_0_var(--accent)]"
          : "text-white/58 hover:bg-white/7 hover:text-white",
      )}
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center text-current [&>svg]:h-4 [&>svg]:w-4">
        <Icon name={item.icon} />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-accent/18 px-2 py-0.5 text-[10px] font-bold text-accent">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function MobileAdminNav({ active }: { active: AdminSection }) {
  return (
    <nav
      aria-label="Navigasi admin mobile"
      className="flex gap-2 overflow-x-auto border-b border-black/8 bg-[#efe8da] px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {allAdminNav.map((item) => {
        const isActive = item.id === active;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cx(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[10px] border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "border-primary bg-primary text-accent"
                : "border-black/10 bg-white text-muted hover:border-primary/30 hover:text-primary",
            )}
          >
            <span className="[&>svg]:h-4 [&>svg]:w-4">
              <Icon name={item.icon} />
            </span>
            {item.label}
            {item.badge ? (
              <span
                className={cx(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  isActive ? "bg-accent/18 text-accent" : "bg-primary-soft text-primary",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  active,
  title,
  subtitle,
  action,
  children,
}: {
  active: AdminSection;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f3efe6] text-foreground">
      <HydrationMarker />
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 bg-primary text-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col border-r border-accent/10">
            <div className="relative flex items-center gap-3 border-b border-white/7 px-5 py-5">
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-[10px] border border-white/10 bg-white/6 p-1.5 shadow-sm">
                <Image
                  src="/assets/brand/cgv10-mark.svg"
                  alt="CGV10"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">CGV10 Admin Preview</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold tracking-[0.04em] text-accent">
                  Static prototype
                </p>
              </div>
              <span className="absolute right-4 top-5 rounded-full border border-accent/25 bg-accent/14 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-accent">
                Demo
              </span>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
              <div>
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Utama
                </p>
                <div className="space-y-1">
                  {primaryNav.map((item) => (
                    <NavItem key={item.id} item={item} active={active} />
                  ))}
                </div>
              </div>
              <div>
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Aset & Data
                </p>
                <div className="space-y-1">
                  {supportNav.map((item) => (
                    <NavItem key={item.id} item={item} active={active} />
                  ))}
                </div>
              </div>
            </nav>

            <div className="border-t border-white/7 p-4">
              <div className="flex items-center gap-3 rounded-[10px] p-2 transition-colors duration-200 hover:bg-white/6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/35 bg-accent/14 text-xs font-bold text-accent">
                  RT
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-white/90">Admin Pengurus</p>
                  <p className="mt-0.5 truncate text-[11px] text-white/42">RT 010 / RW 021</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="h-7 border-b border-accent/10 bg-primary text-center text-[11px] font-semibold leading-7 tracking-[0.04em] text-accent/75">
            Admin Preview CGV10 - prototype statis
          </div>
          <header className="sticky top-0 z-30 border-b border-black/8 bg-[#f3efe6]/90 backdrop-blur-xl">
            <div className="flex min-h-[60px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Link
                    href="/admin-preview/"
                    className="hidden font-semibold text-muted transition-colors hover:text-primary sm:inline"
                  >
                    Admin
                  </Link>
                  <span className="hidden text-muted sm:inline">/</span>
                  <h1 className="truncate font-bold text-foreground">{title}</h1>
                  <span className="text-muted">/</span>
                  <p className="truncate text-muted">{subtitle}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/"
                  className="hidden min-h-9 items-center justify-center rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-semibold text-muted transition-colors duration-200 hover:border-accent/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                >
                  Lihat Portal
                </Link>
                {action}
              </div>
            </div>
            <MobileAdminNav active={active} />
          </header>
          <div className="px-4 py-7 sm:px-6 lg:px-8">
            <div className="not-hydrated-only mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
              Mode interaktif admin belum aktif. Jalankan dari dev/static
              server agar tombol, filter, modal, dan update status bisa bekerja.
            </div>
            <div className="mb-5 rounded-[14px] border border-accent/35 bg-accent-soft px-4 py-3 text-sm font-semibold leading-6 text-foreground">
              Mode preview statis belum terhubung ke database Supabase. Aksi,
              perubahan status, dan edit konten hanya simulasi di state browser.
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export function PageIntro({
  eyebrow,
  title,
  text,
  side,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  side?: React.ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-accent before:h-px before:w-5 before:bg-accent/70">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl text-[28px] font-bold leading-[1.08] tracking-tight text-primary sm:text-[34px]">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-[13px] leading-6 text-muted sm:text-sm">
          {text}
        </p>
      </div>
      {side}
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[20px] border border-black/8 bg-[#fdfcf9] shadow-[0_2px_8px_rgba(12,24,16,0.06),0_8px_32px_rgba(12,24,16,0.08)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
        <p className="mt-1 break-words text-xs leading-5 text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function ActionButton({
  children,
  href,
  primary,
}: {
  children: React.ReactNode;
  href?: string;
  primary?: boolean;
}) {
  const className = cx(
    "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    primary
      ? "border border-primary bg-primary text-accent shadow-sm hover:bg-primary-hover"
      : "border border-black/10 bg-white text-muted hover:border-accent/35 hover:text-primary",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  const value = String(children);
  const tone = value.includes("Review") || value.includes("Validasi") || value.includes("Draft")
    ? "border-accent/35 bg-accent-soft text-foreground"
    : value.includes("Tahan") || value.includes("Pending")
      ? "border-red-200 bg-red-50 text-red-700"
      : value.includes("Baru") || value.includes("Masuk")
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-emerald-200 bg-emerald-50 text-primary";

  return (
    <span className={cx("inline-flex min-h-7 items-center justify-center rounded-full border px-3 py-1 text-center text-xs font-bold leading-none", tone)}>
      {children}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "green",
}: {
  label: string;
  value: string;
  helper: string;
  icon: IconName;
  tone?: "green" | "gold" | "blue" | "red" | "dark";
}) {
  const cardTone = {
    green: "border-emerald-100 bg-[#fdfcf9] text-primary",
    gold: "border-accent/30 bg-[#fdfcf9] text-foreground",
    blue: "border-blue-100 bg-[#fdfcf9] text-blue-800",
    red: "border-red-100 bg-[#fdfcf9] text-red-700",
    dark: "border-primary bg-primary text-white",
  }[tone];

  const tagTone = tone === "dark"
    ? "bg-accent/18 text-accent"
    : tone === "gold"
      ? "bg-accent-soft text-foreground"
      : tone === "blue"
        ? "bg-blue-50 text-blue-700"
        : tone === "red"
          ? "bg-red-50 text-red-700"
          : "bg-primary-soft text-primary";

  return (
    <article className={cx("min-h-32 rounded-[18px] border p-5 shadow-[0_12px_30px_rgba(12,24,16,0.07)]", cardTone)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]", tagTone)}>
          {label}
        </span>
        <span className={cx("grid h-9 w-9 place-items-center rounded-[10px] [&>svg]:h-5 [&>svg]:w-5", tone === "dark" ? "bg-white/10 text-accent" : "bg-background text-primary")}>
          <Icon name={icon} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className={cx("mt-2 text-xs leading-5", tone === "dark" ? "text-white/70" : "text-muted")}>
        {helper}
      </p>
    </article>
  );
}

export function ProgressBar({
  value,
  tone = "green",
}: {
  value: string;
  tone?: "green" | "gold" | "red" | "blue";
}) {
  const color = {
    green: "bg-emerald-600",
    gold: "bg-accent",
    red: "bg-red-500",
    blue: "bg-blue-600",
  }[tone];

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e7e0d5]">
      <div className={cx("h-full rounded-full", color)} style={{ width: value }} />
    </div>
  );
}
