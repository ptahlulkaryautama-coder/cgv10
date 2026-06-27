import {
  PageHero,
  PageShell,
  PlaceholderNotice,
} from "../components/portal";
import { financeRows } from "@/lib/portal-data";

const demoColumns = ["Pos", "Format demo", "Status validasi"] as const;

export default function KeuanganPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Keuangan"
        title="Format transparansi kas untuk divalidasi pengurus."
        text="Struktur ini membantu warga memahami ringkasan kas setelah format dan angka resmi disetujui untuk publikasi."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:pb-24 xl:px-10">
        <PlaceholderNotice>
          Simulasi format - bukan data kas resmi. Nilai saldo, pemasukan, dan
          pengeluaran belum ditampilkan sebelum divalidasi pengurus.
        </PlaceholderNotice>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="grid gap-2 border-b border-border bg-primary-soft px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:grid-cols-[0.7fr_0.8fr_1fr] sm:px-5">
            {demoColumns.map((column) => (
              <p key={column}>{column}</p>
            ))}
          </div>
          {financeRows.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 border-b border-border px-4 py-5 last:border-b-0 sm:grid-cols-[0.7fr_0.8fr_1fr] sm:px-5"
            >
              <p className="font-semibold text-foreground">{row.label}</p>
              <p className="text-sm leading-6 text-muted">
                Belum diisi angka resmi
              </p>
              <p className="text-sm leading-6 text-muted">{row.value}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
