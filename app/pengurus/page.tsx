import Image from "next/image";
import {
  Icon,
  PageHero,
  PageShell,
  PlaceholderNotice,
} from "../components/portal";
import { pengurusRoles } from "@/lib/portal-data";

export default function PengurusPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pengurus"
        title="Struktur publik pengurus yang siap dilengkapi."
        text="Halaman ini menyiapkan susunan peran pengurus tanpa menampilkan nama atau detail jabatan yang belum dikonfirmasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Nama pengurus, seksi, dan koordinator cluster akan diperbarui setelah
          data resmi tersedia dari pengurus.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {pengurusRoles.map((role) => (
            <article
              key={role.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <Image
                  src="/assets/placeholders/profile-placeholder.svg"
                  alt=""
                  width="48"
                  height="48"
                  className="h-12 w-12 rounded-xl"
                />
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={role.icon} />
                </div>
              </div>
              <h2 className="text-lg font-semibold">{role.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{role.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
