import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/portal";
import type { IconName } from "@/lib/portal-data";
import { PersonalDuesRecap } from "./personal-dues-recap";

type ProfileCard = {
  title: string;
  value: string;
  text: string;
  icon: IconName;
};

const profileCards: ProfileCard[] = [
  {
    title: "Status profil",
    value: "Prototipe Fase Berikutnya",
    text: "Belum menjadi layanan aktif untuk warga.",
    icon: "file",
  },
  {
    title: "Verifikasi",
    value: "Belum aktif",
    text: "Verifikasi warga akan membutuhkan auth dan review pengurus.",
    icon: "shield",
  },
  {
    title: "Layanan terkait",
    value: "Siap diarahkan",
    text: "Layanan administrasi, iuran, dan laporan bisa memakai profil rumah.",
    icon: "message",
  },
];

const householdRows = [
  ["Rumah", "Unit warga", "Privat"],
  ["Anggota keluarga", "Belum diisi", "Privat"],
  ["Kendaraan", "Belum diisi", "Admin saja"],
  ["Dokumen pendukung", "Belum tersedia", "Admin saja"],
] as const;

const nextActions = [
  {
    title: "Lengkapi data dasar",
    text: "Nama kepala rumah, unit, jumlah anggota, dan kontak utama.",
  },
  {
    title: "Ajukan verifikasi",
    text: "Pengurus meninjau data sebelum status profil menjadi terverifikasi.",
  },
  {
    title: "Gunakan untuk layanan",
    text: "Profil rumah menjadi konteks untuk layanan, iuran, dan administrasi.",
  },
] as const;

export const metadata: Metadata = {
  title: "Profil Rumah | CGV10",
  description:
    "Prototipe profil rumah warga CGV10 untuk fase login warga dan pendataan rumah.",
};

export default function ProfilRumahPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-primary px-4 pb-8 pt-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
                Profil Rumah - Prototipe Fase Berikutnya
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                CGV10 Portal Warga
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/portal/"
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-white/18 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Portal
              </Link>
              <Link
                href="/masuk/"
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Masuk
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="rounded-2xl border border-white/14 bg-white/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-medium text-white/72">
                portalwargacgv.id
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Satu profil rumah untuk akses layanan warga.
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/76 sm:text-base">
                Halaman ini adalah prototipe tahap berikutnya, belum layanan
                aktif untuk warga. Strukturnya menunjukkan arah profil rumah
                tanpa menyimpan data pribadi.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {profileCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-white/14 bg-white/10 p-4"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-foreground">
                    <Icon name={card.icon} />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                    {card.title}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{card.value}</p>
                  <p className="mt-2 text-sm leading-5 text-white/70">
                    {card.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PersonalDuesRecap />

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Data rumah
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Struktur awal untuk profil warga.
                </h2>
              </div>
              <span className="rounded-full border border-accent/35 bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                Prototipe
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-border">
              {householdRows.map(([label, value, visibility]) => (
                <div
                  key={label}
                  className="grid gap-2 border-b border-border bg-background p-4 last:border-b-0 sm:grid-cols-[0.9fr_1fr_0.7fr] sm:items-center"
                >
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted">{value}</p>
                  <p className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {visibility}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-accent/35 bg-accent-soft/55 p-4">
              <p className="text-sm font-semibold text-foreground">
                Catatan privasi
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Data rumah, anggota keluarga, kendaraan, dokumen, dan bukti
                pembayaran tidak boleh dipublikasikan. Saat masuk produksi,
                fitur ini membutuhkan login, database, akses role, dan audit log.
              </p>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Langkah berikutnya
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Alur profil saat auth sudah siap.
            </h2>
            <div className="mt-6 space-y-3">
              {nextActions.map((action, index) => (
                <div
                  key={action.title}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {action.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/layanan/"
              className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Buka Layanan Warga
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
