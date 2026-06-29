import Image from "next/image";
import Link from "next/link";
import { navItems, type IconName } from "@/lib/portal-data";
import { ActiveNavLink } from "./active-nav-link";

const iconPaths: Record<IconName, string> = {
  home: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z",
  users:
    "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5M3.5 19a5 5 0 0 1 10 0M13.8 14.5a4.5 4.5 0 0 1 4.7 4.5",
  wallet:
    "M4.5 7.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h12M16 13h4.5M17.5 13h.1",
  megaphone:
    "M4 13.5V9.8l9.8-4.2v12.1L4 13.5Zm9.8-1.4h2.1a3.3 3.3 0 0 0 0-6.6h-2.1M7 14.8l1.3 3.7h2.8l-1.8-3.1",
  store:
    "M5 9.5 6.5 4h11L19 9.5M7 12.5V20h10v-7.5M9 20v-4h6v4M5 9.5c.2 1.2 1.1 1.9 2.2 1.9 1 0 1.7-.5 2.1-1.2.5.7 1.2 1.2 2.2 1.2s1.7-.5 2.2-1.2c.4.7 1.1 1.2 2.1 1.2 1.1 0 2-.7 2.2-1.9",
  phone:
    "M8.5 4.5 6.2 6.8c-.5.5-.6 1.3-.3 2a22 22 0 0 0 9.3 9.3c.7.3 1.5.2 2-.3l2.3-2.3-3.4-3.4-1.6 1.6a13.5 13.5 0 0 1-4.2-4.2l1.6-1.6-3.4-3.4Z",
  shield:
    "M12 3.5 19 6v5.2c0 4.1-2.8 7.9-7 9.3-4.2-1.4-7-5.2-7-9.3V6l7-2.5Zm-3 8.2 2 2 4-4",
  calendar:
    "M6.5 4v3M17.5 4v3M4.5 8.5h15M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2.5 6h2.5M13 14.5h2.5",
  file: "M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 20V5A1.5 1.5 0 0 1 6.5 3.5ZM14 3.5V8h4M8 12h8M8 16h6",
  briefcase:
    "M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M4 8.5h16v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9Zm0 4.5h16M10 13h4",
  utensils:
    "M6 3.5v7M8.5 3.5v7M4 3.5v7a2.5 2.5 0 0 0 5 0v-7M6.5 13v7M15.5 3.5c2.2 1.5 3.5 3.8 3.5 6.5 0 2.2-1 3.4-2.5 3.8V20",
  building:
    "M4.5 20.5h15M6.5 20.5V5A1.5 1.5 0 0 1 8 3.5h8A1.5 1.5 0 0 1 17.5 5v15.5M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2",
  qr: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h2.5M20 14h-1.5M14 17h6M14 20h2.5M19.5 20h.1M7 7h.1M17 7h.1M7 17h.1",
  message:
    "M5.5 5.5h13A1.5 1.5 0 0 1 20 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3v-3A1.5 1.5 0 0 1 4 15.5V7a1.5 1.5 0 0 1 1.5-1.5ZM8 9.5h8M8 13h5",
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/96 backdrop-blur print:static print:bg-background print:backdrop-blur-none">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati navigasi
      </a>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8 lg:py-4 xl:px-10">
        <details className="group/details relative shrink-0">
          <summary
            aria-label="Lihat identitas portal CGV10"
            className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl outline-none transition-colors marker:hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3 [&::-webkit-details-marker]:hidden"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-surface shadow-sm sm:h-12 sm:w-12">
              <Image
                src="/assets/brand/cgv10-header-mark.svg"
                alt="CGV10"
                width="48"
                height="48"
                className="h-10 w-10 rounded-[0.9rem] sm:h-11 sm:w-11"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight text-primary sm:text-2xl">
                CGV10
              </span>
              <span className="mt-1 hidden text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted min-[430px]:block">
                Portal Digital Warga
              </span>
            </span>
          </summary>
          <div className="absolute left-0 top-full z-40 mt-3 w-72 rounded-2xl border border-border bg-surface p-4 text-center shadow-[0_24px_70px_rgba(20,90,58,0.18)]">
            <div className="mx-auto grid h-36 w-full place-items-center overflow-hidden rounded-2xl border border-border bg-background p-3">
              <Image
                src="/assets/brand/official-cgv-logo.png"
                alt="Portal Warga CGV"
                width="230"
                height="150"
                className="h-28 w-auto object-contain"
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              CGV10 — Portal Digital Warga
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Identitas portal warga
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Menampilkan logo lengkap Portal Warga CGV sebagai identitas
              resmi.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Buka beranda
            </Link>
          </div>
        </details>

        {/* Keep identity badges separate from the compact CGV10 header mark. */}
        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted shadow-sm xl:flex">
          <span className="grid h-7 min-w-16 place-items-center whitespace-nowrap rounded-full border border-dashed border-border bg-primary-soft px-3 text-primary">
            Cipta Greenville
          </span>
          <span className="h-6 w-px bg-border" />
          <details className="group/details relative">
            <summary
              aria-label="Lihat identitas RT 010 / RW 021"
              className="grid h-10 w-10 cursor-pointer list-none place-items-center overflow-hidden rounded-full border border-border bg-surface shadow-sm transition-colors duration-200 marker:hidden hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface [&::-webkit-details-marker]:hidden"
            >
              <Image
                src="/assets/brand/official-rt-logo.png"
                alt="Logo RT 010"
                width="40"
                height="40"
                className="h-9 w-9 object-contain"
              />
            </summary>
            <div className="absolute left-1/2 top-full z-40 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-border bg-surface p-4 text-center shadow-[0_24px_70px_rgba(20,90,58,0.18)]">
              <div className="mx-auto grid h-44 w-44 place-items-center overflow-hidden rounded-2xl border border-border bg-background p-3">
                <Image
                  src="/assets/brand/official-rt-logo.png"
                  alt="Logo resmi RT 010 / RW 021"
                  width="190"
                  height="190"
                  className="h-40 w-40 object-contain"
                />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">
                Identitas RT 010 / RW 021
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Cipta Greenville
              </p>
            </div>
          </details>
          <span className="grid h-7 min-w-24 place-items-center whitespace-nowrap rounded-full border border-dashed border-border bg-accent-soft px-3 text-foreground">
            RT 010 / RW 021
          </span>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-4 text-sm font-medium text-muted lg:flex xl:gap-5"
        >
          {navItems.map(([label, href]) => (
            <ActiveNavLink key={label} href={href}>
              {label}
            </ActiveNavLink>
          ))}
        </nav>

        <Link
          href="/pengurus/#kontak-pengurus"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-[380px]:hidden sm:px-4"
        >
          Hubungi Pengurus
        </Link>
      </div>
      <nav
        aria-label="Navigasi utama mobile"
        className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 text-sm font-semibold text-muted [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {navItems.map(([label, href]) => (
          <ActiveNavLink key={label} href={href} mobile>
            {label}
          </ActiveNavLink>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 xl:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-24 place-items-center overflow-hidden rounded-2xl border border-border bg-background px-2">
            <Image
              src="/assets/brand/official-cgv-logo.png"
              alt="Portal Warga CGV"
              width="140"
              height="72"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              CGV10 - Portal Digital Warga
            </p>
            <p className="mt-1 text-xs text-muted">
              Terhubung - Terlibat - Terpercaya
            </p>
          </div>
        </div>
        <p>Cipta Greenville • RT 010 / RW 021</p>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="overflow-x-clip bg-background text-foreground"
    >
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-64 max-w-5xl rounded-full bg-primary-soft/60 blur-2xl" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20 xl:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-muted">{text}</p>
    </div>
  );
}

export function PlaceholderNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-accent/35 bg-accent-soft/55 p-5 text-sm leading-6 text-foreground">
      {children}
    </div>
  );
}
