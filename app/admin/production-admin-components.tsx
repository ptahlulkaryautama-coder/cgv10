import Image from "next/image";
import Link from "next/link";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { AdminMobileNavigation } from "./admin-mobile-navigation";

export type ProductionAdminSection = "dashboard" | "warga" | "iuran" | "intake" | "palugada" | "portal-posts" | "pengaturan" | "debug";

type ProductionNavItem = {
  id: ProductionAdminSection | "login";
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
  superAdminOnly?: boolean;
};

const productionNav: ProductionNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/", icon: "home" },
  {
    id: "warga",
    label: "Data Warga",
    href: "/admin/warga/",
    icon: "users",
    badge: "New",
  },
  {
    id: "iuran",
    label: "Iuran",
    href: "/admin/iuran/",
    icon: "wallet",
    badge: "New",
  },
  {
    id: "intake",
    label: "Permintaan",
    href: "/admin/intake/",
    icon: "message",
    badge: "New",
  },
  {
    id: "palugada",
    label: "PALUGADA",
    href: "/admin/palugada/",
    icon: "store",
    badge: "New",
  },
  {
    id: "portal-posts",
    label: "Portal Posts",
    href: "/admin/portal-posts/",
    icon: "shield",
    badge: "Live",
  },
  {
    id: "pengaturan",
    label: "Pengaturan",
    href: "/admin/pengaturan/",
    icon: "users",
    badge: "Akses",
  },
  {
    id: "debug",
    label: "Debug",
    href: "/admin/debug/",
    icon: "building",
    badge: "SA",
    superAdminOnly: true,
  },
];

const supportNav: ProductionNavItem[] = [
  { id: "login", label: "Login", href: "/admin/login/", icon: "users" },
];

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getVisibleNav(isSuperAdmin: boolean) {
  return productionNav.filter((item) => !item.superAdminOnly || isSuperAdmin);
}

function NavItem({
  item,
  active,
}: {
  item: ProductionNavItem;
  active: ProductionAdminSection;
}) {
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

export function ProductionAdminShell({
  active,
  title,
  subtitle,
  userLabel,
  roleLabel,
  isSuperAdmin,
  action,
  children,
}: {
  active: ProductionAdminSection;
  title: string;
  subtitle: string;
  userLabel: string;
  roleLabel: string;
  isSuperAdmin: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f3efe6] text-foreground">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Lewati navigasi admin
      </a>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 bg-primary text-white md:block">
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
                <p className="truncate text-sm font-bold text-white">CGV10 Admin</p>
                <p className="mt-0.5 truncate text-[11px] font-semibold tracking-[0.04em] text-accent">
                  Portal Pengelola
                </p>
              </div>
              <span className="absolute right-4 top-5 rounded-full border border-accent/25 bg-accent/14 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-accent">
                Live
              </span>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
              <div>
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Production
                </p>
                <div className="space-y-1">
                  {getVisibleNav(isSuperAdmin).map((item) => (
                    <NavItem key={item.id} item={item} active={active} />
                  ))}
                </div>
              </div>
              <div>
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  Referensi
                </p>
                <div className="space-y-1">
                  {supportNav.map((item) => (
                    <NavItem key={item.id} item={item} active={active} />
                  ))}
                </div>
              </div>
            </nav>

            <div className="border-t border-white/7 p-4">
              <div className="flex items-center gap-3 rounded-[10px] p-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/35 bg-accent/14 text-xs font-bold text-accent">
                  RT
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-white/90">
                    {userLabel}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-white/42">
                    {roleLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="hidden h-7 border-b border-accent/10 bg-primary text-center text-[11px] font-semibold leading-7 tracking-[0.04em] text-accent/75 md:block">
            CGV10 Admin · Pengelolaan Lingkungan
          </div>
          <header className="sticky top-0 z-30 border-b border-white/10 bg-primary text-white md:border-black/8 md:bg-[#f3efe6]/90 md:text-foreground md:backdrop-blur-xl">
            <div className="flex min-h-[60px] items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2 md:hidden">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 bg-white/8 text-accent">
                    <Icon name="building" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-accent">CGV10 Admin</p>
                    <h1 className="truncate text-sm font-bold text-white">{title}</h1>
                    <p className="mt-0.5 truncate text-[10px] font-semibold text-white/62">{roleLabel}</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 text-xs sm:text-sm md:flex">
                  <Link
                    href="/admin/"
                    className="hidden font-semibold text-muted transition-colors hover:text-primary sm:inline"
                  >
                    Admin
                  </Link>
                  <span className="hidden text-muted sm:inline">/</span>
                  <h1 className="truncate font-bold text-foreground">{title}</h1>
                  <span className="text-muted">/</span>
                  <p className="hidden truncate text-muted sm:block">{subtitle}</p>
                </div>
                <p className="hidden mt-0.5 truncate text-[11px] font-semibold text-muted sm:hidden">
                  {userLabel} · {roleLabel}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 md:flex">
                <Link
                  href="/"
                  className="hidden min-h-9 items-center justify-center rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-semibold text-muted transition-colors duration-200 hover:border-accent/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
                >
                  Lihat Portal
                </Link>
                {action}
              </div>
            </div>
          </header>
          <div id="admin-main-content" className="px-4 py-5 pb-28 sm:px-6 sm:py-7 sm:pb-28 md:px-8 md:pb-7">{children}</div>
        </div>
      </div>
      <AdminMobileNavigation active={active} isSuperAdmin={isSuperAdmin} />
    </main>
  );
}

export function ProductionPageIntro({
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
    <section className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-accent before:h-px before:w-5 before:bg-accent/70">
          {eyebrow}
        </p>
        <h2 className="mt-2 max-w-3xl text-2xl font-bold leading-[1.12] tracking-tight text-primary sm:text-[28px] md:mt-3 md:text-[34px]">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-5 text-muted sm:mt-3 sm:leading-6 sm:text-sm">
          {text}
        </p>
      </div>
      {side}
    </section>
  );
}

export function ProductionPanel({
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

export function ProductionPanelHeader({
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

export function ProductionActionButton({
  children,
  href,
  primary,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const className = cx(
    "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
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
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

export function ProductionStatusPill({ children }: { children: React.ReactNode }) {
  const value = String(children);
  const tone =
    value.includes("Denied") || value.includes("Error") || value.includes("tidak")
      ? "border-red-200 bg-red-50 text-red-700"
      : value.includes("Review") || value.includes("Draft") || value.includes("Loading")
        ? "border-accent/35 bg-accent-soft text-foreground"
        : value.includes("Read-only") || value.includes("content:read") || value.includes("OK")
          ? "border-emerald-200 bg-emerald-50 text-primary"
          : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center justify-center rounded-full border px-3 py-1 text-center text-xs font-bold leading-none",
        tone,
      )}
    >
      {children}
    </span>
  );
}

export function ProductionMetricCard({
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

  const tagTone =
    tone === "dark"
      ? "bg-accent/18 text-accent"
      : tone === "gold"
        ? "bg-accent-soft text-foreground"
        : tone === "blue"
          ? "bg-blue-50 text-blue-700"
          : tone === "red"
            ? "bg-red-50 text-red-700"
            : "bg-primary-soft text-primary";

  return (
    <article
      className={cx(
        "min-h-0 rounded-[16px] border p-3 shadow-[0_6px_18px_rgba(12,24,16,0.06)] md:min-h-32 md:rounded-[18px] md:p-5 md:shadow-[0_12px_30px_rgba(12,24,16,0.07)]",
        cardTone,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]", tagTone)}>
          {label}
        </span>
        <span className={cx("grid h-9 w-9 place-items-center rounded-[10px] [&>svg]:h-5 [&>svg]:w-5", tone === "dark" ? "bg-white/10 text-accent" : "bg-background text-primary")}>
          <Icon name={icon} />
        </span>
      </div>
      <p className="mt-3 text-xl font-bold tracking-tight md:mt-4 md:text-2xl" suppressHydrationWarning>
        {value}
      </p>
      <p className={cx("mt-1.5 text-[11px] leading-4 md:mt-2 md:text-xs md:leading-5", tone === "dark" ? "text-white/70" : "text-muted")}>
        {helper}
      </p>
    </article>
  );
}
