import type { Metadata } from "next";
import Link from "next/link";
import { Icon, PageShell } from "../components/portal";
import { ContactRoutingForm } from "./contact-routing-form";
import { PrivatePengurusContacts } from "./private-pengurus-contacts";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Kanal kontak resmi CGV10 untuk pesan layanan, keamanan, iuran, PALUGADA, dan koordinasi pengurus.",
};

export default function KontakPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto flex max-w-5xl items-start gap-4 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-accent-soft">
            <Icon name="phone" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
              Jalur Kontak Resmi
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Hubungi pengurus melalui kanal yang tepat.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
              Pilih kebutuhan Anda; pesan akan diarahkan ke PIC yang sesuai.
            </p>
            <Link
              href="#kontak-cepat"
              className="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Pilih kanal kontak
            </Link>
          </div>
        </div>
      </section>

      <ContactRoutingForm />

      <PrivatePengurusContacts />

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><Icon name="users" /></span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Direktori Pengurus</h2>
              <p className="mt-0.5 text-xs text-muted">Lihat peran dan tanggung jawab pengurus RT.</p>
            </div>
          </div>
          <Link
            href="#kontak-pengurus-privat"
            className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Kontak privat →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
