import Image from "next/image";
import {
  Icon,
  PageHero,
  PageShell,
  PlaceholderNotice,
} from "../components/portal";
import { contacts } from "@/lib/portal-data";

export default function KontakPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Mode Tinjauan Pengurus"
        title="Direktori kontak penting untuk persetujuan publikasi."
        text="Nomor telepon dan QR tidak ditampilkan sampai kontak resmi disetujui untuk publikasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Mode Tinjauan Pengurus: kontak resmi menunggu persetujuan publikasi.
          Tidak ada nomor atau QR resmi yang ditampilkan tanpa persetujuan
          pengurus.
        </PlaceholderNotice>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contacts.map((contact) => (
            <article
              key={contact.role}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-primary/30"
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
                  className="h-16 w-16 shrink-0 rounded-xl border border-dashed border-border bg-background"
                />
              </div>
              <p className="mb-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                Persetujuan publikasi
              </p>
              <h2 className="text-lg font-semibold">{contact.role}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {contact.text}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {contact.qrStatus}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
