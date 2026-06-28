import {
  Icon,
  PageShell,
  PlaceholderNotice,
  SectionHeading,
} from "../components/portal";

const transactions = [
  {
    description: "Dana kas RT",
    quantity: 1,
    unitAmount: 2000000,
    subtotal: 2000000,
    shortLabel: "Dana kas RT",
    color: "#145a3a",
  },
  {
    description: "Pendaftaran Calon Doddy",
    quantity: 1,
    unitAmount: 500000,
    subtotal: 500000,
    shortLabel: "Calon Doddy",
    color: "#c89b3c",
  },
  {
    description: "Pendaftaran Calon Fikri",
    quantity: 1,
    unitAmount: 500000,
    subtotal: 500000,
    shortLabel: "Calon Fikri",
    color: "#8bb89a",
  },
  {
    description: "Pendaftaran Calon Meyer",
    quantity: 1,
    unitAmount: 500000,
    subtotal: 500000,
    shortLabel: "Calon Meyer",
    color: "#d8bf7a",
  },
  {
    description: "Dari KPU Sebelumnya",
    quantity: 1,
    unitAmount: 1000000,
    subtotal: 1000000,
    shortLabel: "KPU Sebelumnya",
    color: "#0f472e",
  },
  {
    description: "Dari Sumbangan Warga - Mandeville 09",
    quantity: 1,
    unitAmount: 1000000,
    subtotal: 1000000,
    shortLabel: "Mandeville 09",
    color: "#b88a2e",
  },
] as const;

const totalIncome = transactions.reduce((sum, item) => sum + item.subtotal, 0);
const totalExpense = 0;
const endingBalance = totalIncome - totalExpense;
const maxContribution = Math.max(...transactions.map((item) => item.subtotal));

const summaryCards = [
  {
    title: "Kas Masuk",
    value: totalIncome,
    detail: "Total pemasukan simulasi",
    icon: "wallet",
  },
  {
    title: "Kas Keluar",
    value: totalExpense,
    detail: "Tidak ada kas keluar pada dummy data",
    icon: "file",
  },
  {
    title: "Saldo Akhir",
    value: endingBalance,
    detail: "Saldo akhir simulasi",
    icon: "shield",
  },
  {
    title: "Jumlah Transaksi",
    value: transactions.length,
    detail: "Sumber dana aktif: 6",
    icon: "message",
  },
] as const;

const donutGradient =
  "conic-gradient(#145a3a 0deg 130.9deg, #c89b3c 130.9deg 163.6deg, #8bb89a 163.6deg 196.4deg, #d8bf7a 196.4deg 229.1deg, #0f472e 229.1deg 294.5deg, #b88a2e 294.5deg 360deg)";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function KeuanganPage() {
  return (
    <PageShell>
      <section className="relative">
        <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-80 max-w-6xl rounded-full bg-primary-soft/70 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Mode Tinjauan Pengurus
              </p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Dashboard demo transparansi kas.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Halaman ini memperlihatkan format publik untuk membaca sumber
                dana, ringkasan saldo, dan rincian transaksi dengan dummy data
                yang disetujui untuk review.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm font-semibold text-foreground">
                  Data simulasi untuk review - bukan data resmi
                </span>
                <span className="inline-flex rounded-full border border-primary/20 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                  Kas keluar: Rp 0
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-surface p-4 shadow-[0_24px_70px_rgba(20,90,58,0.14)]">
              <div className="rounded-[1.35rem] bg-primary p-5 text-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                      Saldo akhir simulasi
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight">
                      {formatCurrency(endingBalance)}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                    Simulasi format
                  </span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                      Kas masuk
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                      Kas keluar
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-soft">
                      Transaksi
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {transactions.length} sumber
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                    Simulasi
                  </span>
                </div>
                <h2 className="mt-5 text-sm font-semibold text-muted">
                  {item.title}
                </h2>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                  {typeof item.value === "number" && item.title !== "Jumlah Transaksi"
                    ? formatCurrency(item.value)
                    : item.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
          <SectionHeading
            eyebrow="Grafik Simulasi"
            title="Distribusi sumber dana dibuat visual tanpa terasa seperti ERP."
            text="Grafik berikut hanya membaca dummy data yang disetujui untuk review, sehingga pengurus dapat menilai struktur tampilan sebelum angka resmi dipublikasikan."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Distribusi sumber dana
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Donut chart berdasarkan subtotal pemasukan simulasi.
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                  Total {formatCurrency(totalIncome)}
                </span>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
                <div
                  aria-label="Donut chart distribusi sumber dana simulasi"
                  className="relative mx-auto grid aspect-square w-full max-w-56 place-items-center rounded-full shadow-[0_18px_45px_rgba(20,90,58,0.14)]"
                  style={{ background: donutGradient }}
                >
                  <div className="grid h-32 w-32 place-items-center rounded-full border border-border bg-surface text-center shadow-inner">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Total
                      </p>
                      <p className="mt-1 text-lg font-semibold text-primary">
                        Rp 5,5 jt
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {transactions.map((item) => (
                    <div
                      key={item.description}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.shortLabel}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-primary">
                        {Math.round((item.subtotal / totalIncome) * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Nominal kontribusi per sumber
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Bar chart horizontal untuk menjaga halaman tetap ringan dan
                    mudah dibaca di layar kecil.
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  6 transaksi
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                {transactions.map((item) => (
                  <div key={item.description}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.shortLabel}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-primary">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-primary-soft">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.subtotal / maxContribution) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 xl:px-10">
          <article className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Aktivitas terbaru
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Enam transaksi dummy.
                </h2>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-foreground">
                Review
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {transactions.map((item, index) => (
                <div
                  key={item.description}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">
                        {item.description}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        Jumlah {item.quantity} x{" "}
                        {formatCurrency(item.unitAmount)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-primary">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
            <PlaceholderNotice>
              Data simulasi untuk review - bukan data resmi. Angka pada tabel
              ini hanya dummy data untuk menilai format transparansi kas publik.
            </PlaceholderNotice>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th scope="col" className="px-4 py-4 font-semibold">
                        No
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold">
                        Deskripsi
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold">
                        Jumlah
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold">
                        Satuan
                      </th>
                      <th scope="col" className="px-4 py-4 font-semibold">
                        Sub Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((item, index) => (
                      <tr
                        key={item.description}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-4 font-semibold text-primary">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 font-semibold text-foreground">
                          {item.description}
                        </td>
                        <td className="px-4 py-4 text-muted">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="px-4 py-4 text-muted">
                          {formatCurrency(item.unitAmount)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-primary">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary-soft">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-right font-semibold text-foreground"
                      >
                        Total pemasukan simulasi
                      </td>
                      <td className="px-4 py-4 font-semibold text-primary">
                        {formatCurrency(totalIncome)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
