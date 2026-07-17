import Link from "next/link";
import { PageShell } from "./components/portal";

export default function NotFound() {
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Alamat yang dibuka belum tersedia.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted">
          Cek kembali tautan yang digunakan, atau kembali ke portal utama untuk
          mencari informasi warga.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Kembali ke beranda
        </Link>
      </main>
    </PageShell>
  );
}
