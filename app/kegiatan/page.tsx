import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePreview } from "../components/image-preview";
import { Icon, PageShell, PlaceholderNotice } from "../components/portal";
import { kegiatanItems, type KegiatanItem } from "@/lib/portal-data";

type WorkflowStep = {
  title: string;
  text: string;
};

const workflowSteps: WorkflowStep[] = [
  {
    title: "Foto kegiatan dikumpulkan",
    text: "Materi dokumentasi diterima sebagai bahan kurasi, bukan langsung dipublikasikan.",
  },
  {
    title: "Pengurus memilih dokumentasi yang layak tampil",
    text: "Foto dipilih agar tetap sopan, relevan, dan sesuai kebutuhan arsip warga.",
  },
  {
    title: "Caption disetujui",
    text: "Keterangan singkat dicek supaya tidak memuat klaim, nama, atau tanggal yang belum resmi.",
  },
  {
    title: "Dokumentasi dipublikasikan",
    text: "Konten yang sudah disetujui dapat tampil sebagai arsip bersama di halaman Kegiatan.",
  },
];

const toneStyles: Record<KegiatanItem["tone"], string> = {
  primary: "bg-primary text-white",
  accent: "bg-accent-soft text-foreground",
  cream: "bg-cream text-foreground",
};

export const metadata: Metadata = {
  title: "Kegiatan | CGV10",
  description:
    "Halaman dokumentasi kegiatan warga CGV10 dalam Mode Tinjauan Pengurus.",
};

export default function KegiatanPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-primary text-white">
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-18 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Mode Tinjauan Pengurus
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Dokumentasi kegiatan warga untuk arsip bersama.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
              Halaman Kegiatan disiapkan sebagai arsip kurasi setelah kegiatan
              berlangsung. Foto, kategori, dan caption akan tampil setelah
              materi dipilih dan disetujui pengurus.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Contoh dokumentasi
              </span>
              <span className="inline-flex rounded-full border border-accent-soft/45 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                Bukan data resmi
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-3 shadow-[0_22px_70px_rgba(7,35,23,0.24)] sm:p-4">
            <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-white/14 bg-cream p-5 text-foreground">
                <div className="grid h-full min-h-[260px] grid-rows-[1fr_auto] gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-primary/18" />
                    <div className="rounded-2xl bg-accent/35" />
                    <div className="rounded-2xl bg-primary/12" />
                    <div className="col-span-2 rounded-2xl bg-surface p-4 shadow-sm">
                      <div className="h-3 w-24 rounded-full bg-primary/20" />
                      <div className="mt-4 h-20 rounded-xl bg-accent-soft" />
                    </div>
                    <div className="rounded-2xl bg-primary p-4 text-white shadow-sm">
                      <Icon name="calendar" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-surface/90 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Arsip kegiatan
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Visual ini adalah pratinjau contoh sampai foto kegiatan
                      dan caption resmi disetujui.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {["Pengumuman", "Kegiatan", "PALUGADA"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/14 bg-white/10 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/78">
                      {label === "Pengumuman"
                        ? "Informasi resmi sebelum atau saat kegiatan."
                        : label === "Kegiatan"
                          ? "Dokumentasi setelah kegiatan disetujui."
                          : "Katalog warga dan kampanye prioritas."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <PlaceholderNotice>
          Mode Tinjauan Pengurus: semua kartu di halaman ini adalah contoh
          dokumentasi dan simulasi format. Tidak ada sistem unggah, database,
          login, backend, admin dashboard, CMS galeri, atau posting dinamis.
        </PlaceholderNotice>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kegiatanItems.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:border-primary/30"
            >
              <div className={`${toneStyles[item.tone]} p-3`}>
                <ImagePreview
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  title={item.title}
                  caption="Contoh dokumentasi kegiatan"
                  className="aspect-[4/3] rounded-xl border border-current/15 bg-cream"
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 230px, (min-width: 640px) 43vw, 92vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/48 via-primary/4 to-transparent" />
                  <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/88 text-primary shadow-sm">
                    <Icon name={item.icon} />
                  </div>
                </ImagePreview>
              </div>
              <div className="p-5">
                <p className="mb-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                  Contoh dokumentasi
                </p>
                <h2 className="text-lg font-semibold leading-snug text-foreground">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors group-hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Lihat dokumentasi
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Alur persetujuan
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Dokumentasi dipilih dulu, baru dipublikasikan.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted">
                Kegiatan berbeda dari pengumuman. Pengumuman membantu warga
                mengetahui informasi sebelum atau saat acara, sedangkan Kegiatan
                menjadi arsip setelah dokumentasi layak tampil disetujui.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
