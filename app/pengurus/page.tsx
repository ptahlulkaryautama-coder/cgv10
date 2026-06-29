import Image from "next/image";
import {
  Icon,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "../components/portal";
import { ImagePreview } from "../components/image-preview";
import { contacts, pengurusRoles } from "@/lib/portal-data";

export default function PengurusPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-primary text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#002d27_0%,#003d34_50%,#006d5b_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-20 xl:px-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Struktur Pengurus
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Wajah pengurus dibuat jelas, terhormat, dan mudah dikenali.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/84 sm:text-lg sm:leading-8">
              Halaman ini menampilkan struktur peran pengurus dengan data Ketua
              RT yang sudah diberikan. Peran lain tetap ditata rapi sebagai
              struktur resmi yang mudah dipahami warga.
            </p>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)]">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["1", "Ketua RT terpublikasi"],
                ["4", "Peran pengurus lain"],
                ["1", "Direktori kontak terpadu"],
              ].map(([value, label]) => (
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
            </div>
            <div className="mt-3 rounded-xl border border-white/14 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                Prinsip publikasi
              </p>
              <p className="mt-2 text-sm leading-6 text-white/76">
                Struktur pengurus membantu warga memahami jalur koordinasi
                lingkungan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <PlaceholderNotice>
          Struktur pengurus memudahkan warga mengenali peran, tanggung jawab,
          dan jalur komunikasi lingkungan.
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
                    className="group/photo w-auto rounded-2xl border border-border bg-background shadow-sm"
                  >
                    <Image
                      src={role.imageSrc}
                      alt={role.imageAlt ?? ""}
                      width="96"
                      height="96"
                      className="h-20 w-20 object-cover transition-opacity duration-200 group-hover/photo:opacity-95 sm:h-24 sm:w-24"
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
                  : "Struktur pengurus"}
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
                text="Kontak resmi digabung di halaman Pengurus agar struktur peran dan jalur komunikasi berada dalam satu konteks yang jelas."
              />
              <div className="mt-8 rounded-2xl border border-accent/35 bg-accent-soft/55 p-5 text-sm leading-6 text-foreground">
                Nomor telepon dan QR dikelola melalui kanal resmi pengurus.
                Halaman ini tidak memuat formulir atau pengiriman data.
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
                    Kontak pengurus
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
