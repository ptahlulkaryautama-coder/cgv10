import Image from "next/image";
import {
  Icon,
  PageHero,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "../components/portal";
import { ImagePreview } from "../components/image-preview";
import { contacts, pengurusRoles } from "@/lib/portal-data";

export default function PengurusPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Mode Tinjauan Pengurus"
        title="Struktur pengurus untuk review publikasi."
        text="Halaman ini menampilkan contoh susunan pengurus dengan data Ketua RT yang sudah diberikan, sementara peran lain disiapkan sebagai kartu persetujuan publikasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Mode Tinjauan Pengurus: profil Ketua RT ditampilkan sesuai data yang
          diberikan. Nama pengurus lain, seksi, dan koordinator cluster tetap
          menunggu persetujuan publikasi.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {pengurusRoles.map((role) => (
            <article
              key={role.title}
              className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
                role.imageSrc
                  ? "border-primary/25 bg-surface"
                  : "border-border bg-surface"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                {role.imageSrc ? (
                  <ImagePreview
                    src={role.imageSrc}
                    alt={role.imageAlt ?? role.name ?? role.title}
                    title={role.name ?? role.title}
                    caption={`${role.title} - ${role.location ?? "CGV10"}`}
                    className="group/photo w-auto rounded-2xl border border-border bg-background shadow-[0_14px_35px_rgba(20,90,58,0.16)] transition-shadow duration-300 hover:shadow-[0_18px_48px_rgba(20,90,58,0.22)]"
                  >
                    <Image
                      src={role.imageSrc}
                      alt={role.imageAlt ?? ""}
                      width="96"
                      height="96"
                      className="h-20 w-20 object-cover transition-transform duration-300 ease-out group-hover/photo:scale-105 sm:h-24 sm:w-24"
                    />
                  </ImagePreview>
                ) : (
                  <Image
                    src="/assets/placeholders/profile-placeholder.svg"
                    alt=""
                    width="48"
                    height="48"
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={role.icon} />
                </div>
              </div>
              <p className="mb-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                {role.name
                  ? "Data resmi tersedia"
                  : "Menunggu persetujuan publikasi"}
              </p>
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

      <section
        id="kontak-pengurus"
        className="scroll-mt-28 border-t border-border bg-surface"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Kontak resmi pengurus"
                title="Status publikasi kontak dan QR."
                text="Kontak resmi digabung di halaman Pengurus agar struktur peran dan jalur komunikasi berada dalam satu konteks yang jelas untuk review."
              />
              <div className="mt-8 rounded-2xl border border-accent/35 bg-accent-soft/55 p-5 text-sm leading-6 text-foreground">
                Nomor telepon dan QR tidak ditampilkan sampai kontak resmi
                disetujui untuk publikasi. Halaman ini tidak memuat formulir
                atau pengiriman data.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {contacts.map((contact) => (
                <article
                  key={contact.role}
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm transition-colors duration-200 hover:border-primary/30 sm:p-6"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon name="phone" />
                    </div>
                    <Image
                      src="/assets/placeholders/qr-placeholder.svg"
                      alt=""
                      width="64"
                      height="64"
                      className="h-16 w-16 shrink-0 rounded-xl border border-dashed border-border bg-surface"
                    />
                  </div>
                  <p className="mb-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                    Persetujuan publikasi
                  </p>
                  <h2 className="text-lg font-semibold">{contact.role}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {contact.text}
                  </p>
                  <p className="mt-3 rounded-xl bg-primary-soft px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {contact.qrStatus}
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
