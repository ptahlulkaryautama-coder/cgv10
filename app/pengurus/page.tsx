import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePreview } from "../components/image-preview";
import { Icon, PageShell, SectionHeading } from "../components/portal";
import {
  pengurusIdentity,
  pengurusLeadership,
  type PengurusMember,
} from "@/lib/cgv10-master-data";

const officialChart = {
  src: "/assets/pengurus/RT10-Official-Pengurus.jpeg",
  alt: "Bagan resmi Pengurus RT 010 RW 021 rev.01 termasuk Penasehat",
};

export const metadata: Metadata = {
  title: "Pengurus RT 010 / RW 021 | CGV10",
  description:
    "Struktur resmi Pengurus RT 010 / RW 021 Cipta Greenville rev.01 termasuk Penasehat.",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getLeadershipPhoto(member: PengurusMember) {
  const photos: Partial<Record<string, { src: string; alt: string }>> = {
    "ketua-rt-doddy-dharma": {
      src: "/assets/pengurus/doddy-dharma-optimized.jpg",
      alt: "Doddy Dharma, Ketua RT 010 RW 021",
    },
    "sekretaris-zulhendy-masruddin": {
      src: "/assets/pengurus/zulhendy-masruddin-optimized.jpg",
      alt: "Zulhendy Masruddin, Sekretaris RT 010 RW 021",
    },
    "bendahara-niko-diponako": {
      src: "/assets/pengurus/niko-diponako-optimized.jpg",
      alt: "Niko Diponako, Bendahara RT 010 RW 021",
    },
  };

  return photos[member.id] ?? null;
}

function LeadershipCard({
  member,
  index,
}: {
  member: PengurusMember;
  index: number;
}) {
  const featured = index === 0;
  const photo = getLeadershipPhoto(member);

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
        featured
          ? "border-accent/45 bg-primary text-white md:col-span-2 xl:col-span-1"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {photo ? (
          <ImagePreview
            src={photo.src}
            alt={photo.alt}
            title={member.nama}
            caption={`${member.jabatan} - RT 010 / RW 021`}
            className="h-20 w-20 rounded-2xl border border-white/20 bg-accent-soft shadow-sm sm:h-24 sm:w-24"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={96}
              height={96}
              className="h-20 w-20 object-cover sm:h-24 sm:w-24"
              priority
            />
          </ImagePreview>
        ) : (
          <div
            className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-xl font-semibold sm:h-24 sm:w-24 sm:text-2xl ${
              featured ? "bg-accent-soft text-foreground" : "bg-primary-soft text-primary"
            }`}
          >
            {getInitials(member.nama)}
          </div>
        )}
        <span
          className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${
            featured ? "bg-white/12 text-accent-soft" : "bg-accent-soft text-foreground"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <p
        className={`mt-6 text-xs font-semibold uppercase tracking-[0.16em] ${
          featured ? "text-accent-soft" : "text-primary"
        }`}
      >
        {member.jabatan}
      </p>
      <h2
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          featured ? "text-white" : "text-foreground"
        }`}
      >
        {member.nama}
      </h2>
      <p className={`mt-4 text-sm leading-6 ${featured ? "text-white/76" : "text-muted"}`}>
        Pimpinan utama RT 010 / RW 021 untuk koordinasi resmi warga Cipta
        Greenville.
      </p>
    </article>
  );
}

export default function PengurusPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-primary text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_52%,#006d5b_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-18 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              {pengurusIdentity.lingkungan}
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {pengurusIdentity.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              Struktur resmi Pengurus RT 010 / RW 021 rev.01 untuk wilayah{" "}
              {pengurusIdentity.wilayah}, termasuk Penasehat, pimpinan utama,
              bidang, dan koordinator cluster.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#kontak-pengurus"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-base font-semibold text-foreground shadow-[0_18px_42px_rgba(212,175,55,0.24)] transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Lihat pimpinan utama
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)]">
            <div className="grid gap-4 rounded-xl border border-white/14 bg-white/10 p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-primary">
                  <Icon name="file" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    Bagan Resmi Rev.01
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Referensi struktur terbaru
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/76">
                    Halaman ini disederhanakan agar warga langsung melihat
                    pimpinan utama dan bagan organisasi resmi.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Penasehat", "Pimpinan", "Bidang"].map((label) => (
                  <span
                    key={label}
                    className="rounded-xl border border-white/14 bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kontak-pengurus" className="scroll-mt-28 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <SectionHeading
            eyebrow="Pimpinan Utama"
            title="Ketua, Sekretaris, dan Bendahara."
            text="Tiga peran utama tetap ditampilkan terpisah agar warga mudah mengenali rujukan koordinasi harian."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pengurusLeadership.map((member, index) => (
              <LeadershipCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Struktur Organisasi"
              title="Bagan resmi Pengurus RT 010 / RW 021 rev.01."
              text="Bagan resmi menjadi sumber utama struktur organisasi, termasuk Penasehat. Ini menggantikan diagram digital sebelumnya agar garis hubungan tidak membingungkan di layar kecil."
            />
            <span className="w-fit rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
              Termasuk Penasehat
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-surface shadow-[0_28px_80px_rgba(0,61,52,0.14)]">
            <div className="border-b border-border bg-primary px-5 py-5 text-white sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    Dokumen visual
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Bagan Resmi Pengurus
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-white/76">
                  Klik gambar untuk melihat bagan dalam pratinjau lebih besar.
                </p>
              </div>
            </div>

            <ImagePreview
              src={officialChart.src}
              alt={officialChart.alt}
              title="Bagan Resmi Pengurus RT 010 / RW 021 rev.01"
              caption="Struktur resmi termasuk Penasehat, pimpinan utama, bidang, dan koordinator cluster."
              className="block bg-background p-3 sm:p-5"
            >
              <Image
                src={officialChart.src}
                alt={officialChart.alt}
                width={1800}
                height={1200}
                sizes="(min-width: 1024px) 1120px, 94vw"
                className="h-auto w-full rounded-xl border border-border bg-white object-contain"
                priority
              />
            </ImagePreview>
          </div>

          <p className="mt-5 text-sm leading-6 text-muted">
            {pengurusIdentity.note}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
