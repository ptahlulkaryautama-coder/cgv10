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
        title="Struktur pengurus untuk tinjauan publik."
        text="Halaman ini menampilkan data pengurus yang sudah disetujui untuk contoh publikasi, sementara peran lain tetap menunggu validasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Profil Ketua RT ditampilkan dengan data resmi yang tersedia. Nama
          pengurus lain, seksi, dan koordinator cluster akan diperbarui setelah
          data divalidasi dan disetujui untuk ditampilkan.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {pengurusRoles.map((role) => (
            <article
              key={role.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <Image
                  src={
                    role.imageSrc ?? "/assets/placeholders/profile-placeholder.svg"
                  }
                  alt={role.imageAlt ?? ""}
                  width="48"
                  height="48"
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={role.icon} />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {role.title}
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                {role.name ?? role.title}
              </h2>
              {role.location ? (
                <p className="mt-2 text-sm font-medium text-foreground">
                  Domisili: {role.location}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-muted">{role.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
