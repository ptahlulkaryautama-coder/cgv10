import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/portal";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Ringkasan cara Portal Warga CGV10 mengelola data kontak, laporan layanan, foto, dan data teknis portal.",
};

const sections = [
  {
    title: "Data yang dikirim warga",
    text: "Form layanan, kontak, dan PALUGADA dapat berisi nama, cluster/blok, nomor WhatsApp, pesan, serta foto pendukung. Data ini dipakai untuk membantu pengurus menindaklanjuti kebutuhan warga.",
  },
  {
    title: "Foto dan lampiran",
    text: "Foto yang dikirim melalui form disimpan sebagai lampiran private. Aksesnya dibatasi untuk admin yang memiliki izin sesuai modul terkait.",
  },
  {
    title: "Data teknis portal",
    text: "Jika warga menyetujui banner privasi, portal dapat mengirim data teknis ringan seperti halaman yang dibuka dan metrik performa. Data ini dipakai untuk memperbaiki pengalaman akses.",
  },
  {
    title: "Batas penggunaan",
    text: "Data warga tidak ditampilkan ke publik kecuali memang dimaksudkan untuk tampil, misalnya lapak PALUGADA yang sudah diperiksa dan disetujui pengurus.",
  },
  {
    title: "Permintaan koreksi",
    text: "Warga dapat menghubungi pengurus melalui halaman Kontak untuk meminta koreksi, penghapusan, atau klarifikasi data yang pernah dikirim.",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Privasi Warga
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Data warga dipakai seperlunya untuk layanan lingkungan.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Halaman ini menjelaskan ringkas bagaimana Portal Warga CGV10 mengelola data yang dikirim melalui form, lampiran foto, dan data teknis portal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{section.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary-soft p-5">
          <h2 className="text-lg font-semibold text-primary">Kontak pengurus</h2>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            Untuk pertanyaan privasi atau koreksi data, gunakan kanal kontak resmi agar pesan masuk ke alur pengurus.
          </p>
          <Link
            href="/kontak/"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Buka kontak
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
