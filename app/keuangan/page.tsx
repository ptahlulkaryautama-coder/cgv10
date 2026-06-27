import {
  PageHero,
  PageShell,
  PlaceholderNotice,
} from "../components/portal";
import { financeRows } from "@/lib/portal-data";

export default function KeuanganPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Keuangan"
        title="Ringkasan transparansi kas tanpa angka yang belum resmi."
        text="Format ini membantu warga memahami struktur laporan kas RT ketika data resmi sudah tersedia dari pengurus."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Tidak ada nilai keuangan yang ditampilkan sebelum saldo, pemasukan,
          dan pengeluaran dikonfirmasi sebagai data resmi.
        </PlaceholderNotice>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {financeRows.map((row, index) => (
            <div
              key={row.label}
              className={`grid gap-2 px-4 py-5 sm:grid-cols-[0.7fr_1fr] sm:px-5 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <p className="font-semibold text-foreground">{row.label}</p>
              <p className="text-sm leading-6 text-muted sm:text-right">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
