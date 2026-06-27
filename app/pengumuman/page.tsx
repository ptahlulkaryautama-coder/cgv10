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
        eyebrow="Pengumuman"
        title="Kanal informasi resmi untuk ditinjau warga."
        text="Halaman ini menunjukkan format pengumuman publik yang rapi, dengan isi resmi yang tetap menunggu validasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Kartu di bawah adalah struktur informasi. Isi resmi akan diperbarui
          setelah pengurus menyetujui pengumuman yang boleh dipublikasikan.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {announcements.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
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
