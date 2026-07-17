import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "../components/portal";
import { PalugadaCatalog } from "./palugada-catalog";
import { PalugadaHeroControls } from "./palugada-hero-controls";

export const metadata: Metadata = {
  title: "PALUGADA CGV | Katalog Warga",
  description:
    "Katalog usaha, jasa, barang, kuliner, dan informasi warga CGV10 dengan detail lapak dan kanal kontak.",
};

export default function PalugadaPage() {
  return (
    <PageShell>
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/18 bg-white/10 p-2 sm:h-14 sm:w-14 sm:rounded-2xl">
                <Image
                  src="/assets/brand/palugada-mark.svg"
                  alt=""
                  width="42"
                  height="42"
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
                  PALUGADA CGV
                </p>
                <p className="mt-0.5 text-sm text-white/72">Lapak dan jasa warga CGV.</p>
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Cari kebutuhan warga tanpa harus menunggu info tersebar di grup.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:mt-4 sm:text-base">
              Ketik nama produk atau jasa, lalu pilih kategori yang dibutuhkan.
            </p>

            <PalugadaHeroControls />
          </div>
        </div>
      </section>

      <PalugadaCatalog />
    </PageShell>
  );
}
