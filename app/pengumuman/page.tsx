import {
  Icon,
  PageHero,
  PageShell,
  PlaceholderNotice,
} from "../components/portal";
import { announcements } from "@/lib/portal-data";

export default function PengumumanPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Mode Tinjauan Pengurus"
        title="Contoh kanal pengumuman yang siap direview."
        text="Halaman ini menunjukkan contoh format pengumuman publik yang rapi sebelum isi resmi dipilih dan disetujui untuk publikasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Mode Tinjauan Pengurus: semua kartu di bawah adalah contoh
          pengumuman dan simulasi konten, bukan informasi resmi yang sudah
          dipublikasikan.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {announcements.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary/30 sm:p-6"
            >
              <p className="mb-4 inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                Contoh pengumuman
              </p>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-foreground">
                <Icon name={item.icon} />
              </div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
