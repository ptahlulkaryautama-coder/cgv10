import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/app/components/portal";
import { PalugadaSubmissionGate } from "./palugada-submission-gate";

export const metadata: Metadata = {
  title: "Daftar Lapak Warga | PALUGADA CGV",
  description:
    "Formulir resmi pendaftaran lapak usaha, kuliner, produk, dan jasa warga Cipta Green Ville.",
};

export default function PalugadaDaftarPage() {
  return (
    <PageShell>
      {/* ── Hero Section ── */}
      <section className="border-b border-[#DED4C4] bg-gradient-to-br from-[#003D34] via-[#002A24] to-[#001D18] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16 xl:px-10">
          <div className="flex flex-col justify-center">
            <Link
              href="/palugada/"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20"
            >
              <span>←</span>
              <span>Kembali ke Katalog PALUGADA</span>
            </Link>

            <div className="mt-5 flex items-center gap-2">
              <span className="rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#E8C865]">
                PALUGADA CGV
              </span>
              <span className="text-xs text-white/70">Warga Bantu Warga</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Daftarkan Usaha, Kuliner, atau Jasa Anda.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              Tampilkan usaha Anda di etalase digital warga CGV. Lapak terverifikasi akan langsung tayang lengkap dengan foto cover, menu pilihan, jam layanan WIB, dan tombol chat WhatsApp langsung ke pelanggan.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#form-daftar"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] px-6 text-sm font-black text-[#15140B] shadow-lg hover:brightness-110 transition-all active:scale-95"
              >
                <span>📝 Isi Formulir Lapak</span>
              </a>
              <Link
                href="/masuk/?next=/palugada/daftar/"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                Masuk Akun Warga
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/20 p-5 space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#E8C865]">
                3 Langkah Praktis Pendaftaran
              </p>
              <div className="grid gap-3">
                {[
                  ["1. Akun Warga Terverifikasi", "Masuk dengan akun portal warga CGV agar lapak terhubung ke dashboard Anda."],
                  ["2. Lengkapi Identitas & Jam", "Tentukan nama usaha, nomor WhatsApp, kategori, area layanan, dan jadwal operasional."],
                  ["3. Unggah Foto & Produk", "Sertakan foto utama/cover, logo kecil, foto menu bacaan, dan item unggulan."],
                ].map(([title, desc], idx) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#D4AF37] text-xs font-black text-[#15140B]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-white">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/70">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form Section ── */}
      <section
        id="form-daftar"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-10 bg-[#FBF9F5]"
      >
        <div className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#003D34]">
            Formulir Registrasi Usaha
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1A1A1A] sm:text-3xl">
            Lengkapi data lapak Anda untuk katalog publik CGV.
          </h2>
        </div>

        <PalugadaSubmissionGate />
      </section>
    </PageShell>
  );
}

