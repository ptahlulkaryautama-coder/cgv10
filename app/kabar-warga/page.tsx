import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePreview } from "../components/image-preview";
import { Icon, PageShell } from "../components/portal";
import { announcements, kegiatanItems } from "@/lib/portal-data";

const livingStats = [
  ["4", "Pengumuman"],
  ["5", "Dokumentasi"],
  ["1", "Pusat kabar"],
] as const;

export const metadata: Metadata = {
  title: "Kabar Warga | CGV10",
  description:
    "Kabar Warga CGV10 menggabungkan pengumuman resmi dan dokumentasi kegiatan warga.",
};

export default function KabarWargaPage() {
  const mainNotice = announcements[0];
  const featuredActivity = kegiatanItems[0];

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_48%,#006d5b_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-20 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Kabar Warga CGV10
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Satu halaman untuk kabar resmi dan cerita warga.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              Pengumuman dan dokumentasi digabung menjadi pusat informasi yang
              lebih natural: warga melihat kabar penting dan cerita komunitas
              tanpa berpindah konteks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#pengumuman"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Lihat pengumuman
              </Link>
              <Link
                href="#dokumentasi"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Buka dokumentasi
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-4">
            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-xl bg-foreground/20 sm:min-h-[460px]">
                <Image
                  src={featuredActivity.imageSrc}
                  alt={featuredActivity.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 580px, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/86 via-primary/18 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/22 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                  Hari ini di lingkungan
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap gap-2">
                    {["Pengumuman", "Dokumentasi"].map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {livingStats.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/14 bg-white/10 p-4"
                  >
                    <p className="text-3xl font-semibold text-accent-soft">
                      {value}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {label}
                    </p>
                  </div>
                ))}
                <div className="rounded-xl border border-white/14 bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                    Ritme warga
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/76">
                    Kabar terbaru disusun agar warga cepat tahu apa yang perlu
                    dibaca dan diingat kembali.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pengumuman"
        className="scroll-mt-28 border-b border-border bg-surface"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.76fr_1.24fr] lg:px-8 lg:py-20 xl:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Pengumuman Resmi
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Kabar penting tampil seperti papan informasi yang terawat.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted">
              Area ini khusus untuk informasi resmi, pengingat administrasi,
              dan kabar lingkungan yang perlu mudah dibaca ulang.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-2xl border border-accent/45 bg-accent-soft/55 p-5 shadow-sm sm:p-6">
              <p className="mb-5 inline-flex rounded-full bg-primary px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
                Pengumuman utama
              </p>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-surface text-primary shadow-sm">
                <Icon name={mainNotice.icon} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {mainNotice.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-foreground">
                {mainNotice.text}
              </p>
            </article>

            <div className="grid gap-3">
              {announcements.slice(1).map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="dokumentasi"
        className="scroll-mt-28 border-y border-border bg-background"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Dokumentasi Warga
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Cerita komunitas dibuat visual, hangat, dan mudah dibagikan.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted">
                Dokumentasi memberi energi pada portal karena warga melihat
                bukti kegiatan, bukan hanya membaca informasi.
              </p>
            </div>
            <Link
              href={featuredActivity.href}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:w-fit"
            >
              Buka dokumentasi utama
            </Link>
          </div>

          <article className="mb-6 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
              <div className="relative min-h-[320px] bg-cream sm:min-h-[440px]">
                <ImagePreview
                  src={featuredActivity.imageSrc}
                  alt={featuredActivity.imageAlt}
                  title={featuredActivity.title}
                  caption="Dokumentasi utama kegiatan"
                  className="h-full min-h-[320px] sm:min-h-[440px]"
                >
                  <Image
                    src={featuredActivity.imageSrc}
                    alt={featuredActivity.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 640px, 92vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/58 via-primary/8 to-transparent" />
                </ImagePreview>
              </div>
              <div className="flex flex-col justify-center p-5 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Dokumentasi utama
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {featuredActivity.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-muted">
                  {featuredActivity.detailDescription}
                </p>
                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                  {["Foto", "Cerita", "Arsip"].map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border bg-surface p-4"
                    >
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="mt-2 text-muted">Tersusun</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {kegiatanItems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <div className="relative aspect-[4/3] bg-cream">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 230px, (min-width: 640px) 43vw, 92vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-primary/4 to-transparent" />
                  <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/88 text-primary shadow-sm">
                    <Icon name={item.icon} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="mb-3 inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                    Dokumentasi
                  </p>
                  <h3 className="text-lg font-semibold leading-snug text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
