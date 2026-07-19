import Link from "next/link";
import { Icon, PwaInstallGuide } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { AdminDashboardShortcut } from "./admin-dashboard-shortcut";

type PortalAction = {
  title: string;
  text: string;
  href: string;
  icon: IconName;
  tone: "primary" | "accent" | "surface";
};

const primaryActions: PortalAction[] = [
  {
    title: "Layanan Warga",
    text: "Ajukan surat, laporan lingkungan, keamanan, atau urusan iuran.",
    href: "/layanan/#form-layanan",
    icon: "message",
    tone: "surface",
  },
  {
    title: "PALUGADA CGV",
    text: "Cari produk dan jasa dari tetangga sendiri.",
    href: "/palugada/",
    icon: "store",
    tone: "accent",
  },
  {
    title: "Kabar Warga",
    text: "Baca pengumuman, agenda, dan kabar yang dekat dengan kita.",
    href: "/kabar-warga/",
    icon: "megaphone",
    tone: "surface",
  },
  {
    title: "Keuangan",
    text: "Cek kas RT dan catatan iuran secara ringkas.",
    href: "/keuangan/",
    icon: "wallet",
    tone: "surface",
  },
];

const secondaryActions: PortalAction[] = [
  {
    title: "Pengurus",
    text: "Lihat siapa mengurus apa, biar tidak salah pintu.",
    href: "/pengurus/",
    icon: "users",
    tone: "surface",
  },
  {
    title: "Kontak Penting",
    text: "Pilih jalur pesan sesuai urusannya.",
    href: "/kontak/",
    icon: "phone",
    tone: "surface",
  },
  {
    title: "Daftar PALUGADA",
    text: "Punya usaha atau jasa? Masukkan ke katalog warga.",
    href: "/masuk/?next=/palugada/daftar/",
    icon: "briefcase",
    tone: "surface",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ActionTile({ action }: { action: PortalAction }) {
  const toneClass = {
    primary:
      "border-primary/20 bg-primary text-white shadow-[0_18px_50px_rgba(0,61,52,0.22)]",
    accent:
      "border-accent/45 bg-accent-soft text-foreground shadow-[0_18px_45px_rgba(212,175,55,0.18)]",
    surface: "border-border bg-surface text-foreground shadow-sm",
  }[action.tone];

  const iconClass = {
    primary: "bg-white/12 text-accent-soft",
    accent: "bg-background text-primary",
    surface: "bg-primary-soft text-primary",
  }[action.tone];

  const textClass = action.tone === "primary" ? "text-white/78" : "text-muted";

  return (
    <Link
      href={action.href}
      className={`group grid min-h-32 cursor-pointer rounded-xl border p-3 transition-colors duration-200 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-40 sm:rounded-2xl sm:p-4 ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-10 w-10 place-items-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl ${iconClass}`}>
          <Icon name={action.icon} />
        </span>
        <span className="hidden h-9 w-9 place-items-center rounded-full border border-current/15 text-current transition-colors duration-200 group-hover:bg-current/8 sm:grid">
          <ArrowIcon />
        </span>
      </div>
      <div className="mt-3 sm:mt-5">
        <h2 className="text-sm font-semibold tracking-tight sm:text-lg">{action.title}</h2>
        <p className={`mt-1.5 line-clamp-2 text-xs leading-5 sm:mt-2 sm:text-sm sm:leading-6 ${textClass}`}>{action.text}</p>
      </div>
    </Link>
  );
}

export default function PortalWargaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-primary px-4 pb-6 pt-4 text-white sm:px-6 sm:pb-8 sm:pt-5 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
                Portal Warga
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                CGV10
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-white/18 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Situs publik
            </Link>
          </div>

          <div className="mt-5 rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur sm:mt-8 sm:p-5">
            <p className="text-sm font-medium text-white/72">
              Cipta Greenville - RT 010 / RW 021
            </p>
            <p className="mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:mt-3 sm:text-4xl">
              Yang sering dicari warga, taruh di depan.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base">
              Urus layanan, cek iuran, baca kabar, atau cari lapak warga tanpa
              muter-muter.
            </p>
            <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
              <Link
                href="/layanan/#form-layanan"
                className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:flex-none sm:px-5"
              >
                Ajukan layanan
              </Link>
              <Link
                href="/palugada/"
                className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:flex-none sm:px-5"
              >
                Cari lapak warga
              </Link>
            </div>
          </div>

          <AdminDashboardShortcut />
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {primaryActions.map((action) => (
              <ActionTile key={action.title} action={action} />
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Lainnya yang juga penting
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  Jalur cepat lain
                </h2>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {secondaryActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex min-h-24 cursor-pointer flex-col items-start gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl sm:p-4"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={action.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">{action.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted sm:text-sm">{action.text}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <PwaInstallGuide compact />
        </div>
      </section>
    </main>
  );
}
