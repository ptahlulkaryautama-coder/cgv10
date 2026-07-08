import Link from "next/link";
import { Icon, PwaInstallGuide } from "../components/portal";
import type { IconName } from "@/lib/portal-data";

type PortalAction = {
  title: string;
  text: string;
  href: string;
  icon: IconName;
  tone: "primary" | "accent" | "surface";
};

const primaryActions: PortalAction[] = [
  {
    title: "Profil Rumah",
    text: "Lihat rancangan data rumah, status verifikasi, anggota, dan kendaraan.",
    href: "/portal/profil-rumah/",
    icon: "home",
    tone: "primary",
  },
  {
    title: "Layanan Warga",
    text: "Ajukan keluhan, administrasi, keamanan, atau konfirmasi iuran.",
    href: "/layanan/#form-layanan",
    icon: "message",
    tone: "surface",
  },
  {
    title: "PALUGADA CGV",
    text: "Lihat katalog warga atau daftarkan lapak untuk kurasi.",
    href: "/palugada/",
    icon: "store",
    tone: "accent",
  },
  {
    title: "Kabar Warga",
    text: "Pantau pengumuman, dokumentasi kegiatan, dan agenda lingkungan.",
    href: "/kabar-warga/",
    icon: "megaphone",
    tone: "surface",
  },
  {
    title: "Keuangan",
    text: "Lihat ringkasan kas RT dan struktur transparansi iuran.",
    href: "/keuangan/",
    icon: "wallet",
    tone: "surface",
  },
];

const secondaryActions: PortalAction[] = [
  {
    title: "Masuk Warga",
    text: "Gerbang akses fase login.",
    href: "/masuk/",
    icon: "shield",
    tone: "surface",
  },
  {
    title: "Pengurus",
    text: "Struktur koordinasi warga.",
    href: "/pengurus/",
    icon: "users",
    tone: "surface",
  },
  {
    title: "Kontak Penting",
    text: "Akses kanal pengurus dan kontak lingkungan.",
    href: "/kontak/",
    icon: "phone",
    tone: "surface",
  },
  {
    title: "Daftar PALUGADA",
    text: "Kirim draft lapak warga dengan foto produk.",
    href: "/palugada/daftar/",
    icon: "briefcase",
    tone: "surface",
  },
];

const statusItems = [
  ["Status portal", "Phase 2 preview"],
  ["Profil rumah", "Siap dirancang"],
  ["Akses warga", "Belum aktif"],
] as const;

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
      className={`group grid min-h-40 cursor-pointer rounded-2xl border p-4 transition-colors duration-200 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${iconClass}`}>
          <Icon name={action.icon} />
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-current/15 text-current transition-colors duration-200 group-hover:bg-current/8">
          <ArrowIcon />
        </span>
      </div>
      <div className="mt-5">
        <h2 className="text-lg font-semibold tracking-tight">{action.title}</h2>
        <p className={`mt-2 text-sm leading-6 ${textClass}`}>{action.text}</p>
      </div>
    </Link>
  );
}

export default function PortalWargaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-primary px-4 pb-8 pt-5 text-white sm:px-6 lg:px-8">
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

          <div className="mt-8 rounded-2xl border border-white/14 bg-white/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <p className="text-sm font-medium text-white/72">
              Cipta Greenville - RT 010 / RW 021
            </p>
            <p className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Akses cepat untuk kebutuhan warga harian.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
              Buka profil rumah, layanan, kabar, transparansi iuran, dan
              PALUGADA dari satu layar ringan yang siap dipasang di mobile.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/masuk/"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Masuk Warga
              </Link>
              <Link
                href="/portal/profil-rumah/"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-white/18 bg-white/10 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Lihat Profil Rumah
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="-mt-14 grid gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[0_22px_60px_rgba(0,61,52,0.13)] sm:grid-cols-3">
            {statusItems.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {label}
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {primaryActions.map((action) => (
              <ActionTile key={action.title} action={action} />
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Akses lainnya
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  Modul pendukung warga
                </h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {secondaryActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={action.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">{action.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-muted">{action.text}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-accent/45 bg-accent-soft/55 p-5">
            <p className="text-sm font-semibold text-foreground">
              Status fase PWA
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Ini adalah shell Portal Warga untuk akses cepat. Data masih
              prototype statis; login, profil rumah, database, dan notifikasi
              warga bisa masuk produksi setelah backend dan aturan akses
              disetujui.
            </p>
          </div>

          <PwaInstallGuide compact />
        </div>
      </section>
    </main>
  );
}
