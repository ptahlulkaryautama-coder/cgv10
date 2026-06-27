import Image from "next/image";
import {
  Icon,
  PageHero,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "../components/portal";
import { marketplaceItems, palugadaCategories } from "@/lib/portal-data";

const campaignNotes = [
  {
    title: "Dari warga, untuk warga",
    text: "PALUGADA CGV disiapkan sebagai ruang promosi agar usaha, barang, jasa, kuliner, dan properti warga lebih mudah ditemukan.",
    icon: "users",
  },
  {
    title: "Direktori dulu",
    text: "Tahap awal menampilkan struktur katalog dan contoh format, sambil menunggu data resmi dan kontak WA yang disetujui.",
    icon: "file",
  },
  {
    title: "Belum transaksi aktif",
    text: "Belum ada pembayaran, keranjang, akun penjual, database, atau proses jual beli aktif di halaman ini.",
    icon: "shield",
  },
] as const;

export default function PalugadaPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="PALUGADA CGV — Marketplace Warga"
        title="Kampanye prioritas untuk promosi dan direktori warga."
        text="PALUGADA CGV adalah ruang awal di dalam CGV10 untuk memperkenalkan promosi warga. Halaman ini masih berupa preview katalog yang perlu validasi, bukan sistem transaksi aktif."
      />
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <div className="mb-8 grid gap-5 rounded-2xl border border-white/14 bg-white/8 p-4 sm:grid-cols-[240px_1fr] sm:items-center sm:p-5 lg:mb-10">
            <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-white">
              <Image
                src="/assets/brand/palugada-logo-proposal.png"
                alt="Proposal sementara logo PALUGADA CGV untuk pratinjau sub-brand marketplace warga"
                fill
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 240px, 85vw"
                className="object-contain p-3"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Logo proposal
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                PALUGADA CGV — Marketplace Warga.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">
                Proposal ini ditampilkan sebagai bahan review sub-brand dan
                kampanye prioritas, tanpa menggantikan identitas utama CGV10 di
                navigasi.
              </p>
            </div>
          </div>
          <p className="mb-8 max-w-3xl text-base leading-7 text-white/82">
            Fokus tahap awal adalah memperkenalkan kategori, format kartu, dan
            cara warga memahami PALUGADA sebelum data resmi, aturan item, dan
            kontak disetujui pengurus.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {palugadaCategories.map((category) => (
              <article
                key={category.title}
                className="rounded-2xl border border-white/14 bg-white/8 p-5"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white/12 text-accent-soft">
                  <Icon name={category.icon} />
                </div>
                <h2 className="font-semibold">{category.title}</h2>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
          <SectionHeading
            eyebrow="Kampanye Tahap 1"
            title="Ruang promosi warga yang dimulai dari katalog preview."
            text="PALUGADA CGV dibuat penting sejak awal karena membantu warga melihat arah marketplace komunitas sebagai ruang promosi dan direktori yang bisa ditinjau bersama."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {campaignNotes.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-foreground">
                  <Icon name={item.icon} />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 xl:px-10">
        <PlaceholderNotice>
          Item di bawah jelas ditandai sebagai contoh format. Tidak ada
          transaksi, pembayaran, keranjang, database, akun penjual, atau tombol
          WA aktif sampai data, aturan item, dan kontak resmi disetujui
          pengurus.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Contoh format
              </p>
              <div className="space-y-3">
                {marketplaceItems.map((field) => (
                  <div
                    key={field.label}
                    className="grid gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[0.45fr_0.55fr] sm:gap-4"
                  >
                    <span className="text-sm text-muted">{field.label}</span>
                    <span className="text-sm font-semibold text-foreground sm:text-right">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled
                className="mt-5 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary/70"
              >
                WA belum tersedia
              </button>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
