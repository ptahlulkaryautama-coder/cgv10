import Link from "next/link";
import { Icon, PwaInstallGuide } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { AdminDashboardShortcut } from "./admin-dashboard-shortcut";
import { PortalMobileDashboard } from "./portal-mobile-dashboard";
import { PortalMobileNavigation } from "./portal-mobile-navigation";

type PortalAction = {
  title: string;
  text: string;
  helper: string;
  cta: string;
  href: string;
  icon: IconName;
  tone: "primary" | "accent" | "surface";
};

const primaryActions: PortalAction[] = [
  {
    title: "Layanan Warga",
    text: "Ajukan surat, laporan lingkungan, keamanan, atau urusan iuran.",
    helper: "Ditindaklanjuti oleh pengurus RT",
    cta: "Ajukan kebutuhan",
    href: "/layanan/#form-layanan",
    icon: "message",
    tone: "primary",
  },
  {
    title: "PALUGADA CGV",
    text: "Cari produk dan jasa dari tetangga sendiri.",
    helper: "Untuk belanja atau mencari jasa di CGV",
    cta: "Cari lapak",
    href: "/palugada/",
    icon: "store",
    tone: "accent",
  },
  {
    title: "Kabar Warga",
    text: "Baca pengumuman, agenda, dan kabar yang dekat dengan kita.",
    helper: "Untuk mengetahui info terbaru lingkungan",
    cta: "Baca kabar",
    href: "/kabar-warga/",
    icon: "megaphone",
    tone: "surface",
  },
  {
    title: "Keuangan",
    text: "Cek kas RT dan catatan iuran secara ringkas.",
    helper: "Untuk memantau informasi iuran dan kas",
    cta: "Lihat keuangan",
    href: "/keuangan/",
    icon: "wallet",
    tone: "surface",
  },
];

const secondaryActions: PortalAction[] = [
  {
    title: "Pengurus",
    text: "Lihat siapa mengurus apa, biar tidak salah pintu.",
    helper: "Kenali struktur dan penanggung jawab RT",
    cta: "Lihat pengurus",
    href: "/pengurus/",
    icon: "users",
    tone: "surface",
  },
  {
    title: "Kontak Penting",
    text: "Pilih jalur pesan sesuai urusannya.",
    helper: "Hubungi pihak yang tepat untuk kebutuhan Anda",
    cta: "Buka kontak",
    href: "/kontak/",
    icon: "phone",
    tone: "surface",
  },
  {
    title: "Daftar PALUGADA",
    text: "Punya usaha atau jasa? Masukkan ke katalog warga.",
    helper: "Untuk warga yang ingin menawarkan produk atau jasa",
    cta: "Daftarkan lapak",
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
      "border-primary bg-primary text-white shadow-[0_14px_30px_rgba(0,61,52,0.22)]",
    accent:
      "border-accent bg-accent-soft text-foreground shadow-[0_10px_24px_rgba(212,175,55,0.13)]",
    surface: "border-[#c8d0c9] bg-surface text-foreground shadow-[0_6px_18px_rgba(0,61,52,0.06)]",
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
      className={`group flex min-h-30 cursor-pointer flex-col rounded-xl border p-4 transition-colors duration-200 hover:border-primary hover:shadow-[0_10px_24px_rgba(0,61,52,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-32 sm:rounded-2xl ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-10 w-10 place-items-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl ${iconClass}`}>
          <Icon name={action.icon} />
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-current/25 text-current transition-colors duration-200 group-hover:bg-current/10">
          <ArrowIcon />
        </span>
      </div>
      <div className="mt-3">
        <h2 className="text-[0.95rem] font-semibold tracking-tight sm:text-base">{action.title}</h2>
        <p className={`mt-1.5 text-sm leading-5 sm:leading-6 ${textClass}`}>{action.text}</p>
      </div>
      <div className={`mt-auto pt-3 text-xs font-medium leading-5 ${textClass}`}>
        <span className="block">{action.helper}</span>
        <span className="mt-1 block font-semibold text-current">{action.cta} →</span>
      </div>
    </Link>
  );
}

export default function PortalWargaPage() {
  return (
    <>
      <PortalMobileDashboard />
      <main className="hidden min-h-screen bg-background text-foreground md:block">
      <section className="bg-primary px-4 pb-6 pt-4 text-white sm:px-6 sm:pb-8 sm:pt-5 lg:px-8">
        <div className="mx-auto max-w-6xl">
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

          <div className="mt-5 max-w-3xl rounded-2xl border border-white/18 bg-white/10 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)] sm:mt-6 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
              Untuk seluruh warga CGV10
            </p>
            <p className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Apa yang ingin Anda lakukan hari ini?
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:mt-4 sm:text-base">
              Pilih kebutuhan Anda di bawah. Setiap pintu menjelaskan tujuan,
              langkah berikutnya, dan pihak yang akan membantu.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/layanan/#form-layanan"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-5"
              >
                Saya perlu bantuan pengurus
              </Link>
              <Link
                href="/palugada/"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-white/35 bg-transparent px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-5"
              >
                Saya cari produk atau jasa
              </Link>
            </div>
          </div>

          <AdminDashboardShortcut />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Pilih kebutuhan
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Semua pintu utama, tanpa perlu menebak.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Mulai dari satu kebutuhan yang paling sesuai; Anda selalu bisa kembali ke portal ini.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
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
      <PortalMobileNavigation />
    </>
  );
}
