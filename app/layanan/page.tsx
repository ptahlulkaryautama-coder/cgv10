import { Icon, PageHero, PageShell, PlaceholderNotice } from "../components/portal";

const serviceModules = [
  {
    title: "Pengaduan warga",
    text: "Contoh struktur kanal laporan warga untuk ditinjau sebelum ada sistem penerimaan laporan aktif.",
    icon: "message",
  },
  {
    title: "Pendaftaran warga",
    text: "Preview format pendataan warga baru tanpa formulir, unggahan, atau penyimpanan data.",
    icon: "users",
  },
  {
    title: "Iuran bulanan",
    text: "Simulasi tampilan informasi iuran yang tidak terhubung ke pembayaran atau tagihan aktif.",
    icon: "wallet",
  },
  {
    title: "Donasi / kontribusi warga",
    text: "Ruang tinjauan untuk format kontribusi sukarela tanpa transaksi, checkout, atau payment gateway.",
    icon: "file",
  },
  {
    title: "Administrasi / permohonan surat",
    text: "Contoh alur informasi administrasi warga tanpa pengajuan resmi atau backend layanan.",
    icon: "briefcase",
  },
  {
    title: "Keamanan lingkungan",
    text: "Preview kategori koordinasi keamanan yang tetap menunggu persetujuan format publikasi.",
    icon: "shield",
  },
  {
    title: "Usulan / aspirasi warga",
    text: "Simulasi kanal aspirasi untuk menilai bahasa, kategori, dan prioritas sebelum sistem aktif.",
    icon: "megaphone",
  },
] as const;

export default function LayananPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Mode Tinjauan Pengurus"
        title="Preview hub layanan warga."
        text="Halaman ini menyiapkan arah layanan digital CGV10 sebagai demo statis. Modul di bawah belum menerima data, belum memiliki formulir aktif, dan hanya digunakan untuk meninjau struktur informasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24 xl:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <PlaceholderNotice>
              Simulasi layanan - bukan sistem aktif. Tidak ada backend,
              database, login, CMS, formulir pengiriman, admin dashboard,
              pembayaran, atau layanan resmi yang berjalan dari halaman ini.
            </PlaceholderNotice>
            <div className="mt-6 rounded-2xl border border-border bg-primary p-5 text-white shadow-[0_20px_60px_rgba(20,90,58,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Status hub
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Format layanan siap ditinjau.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Setiap kartu memakai label review agar warga dan pengurus tidak
                membacanya sebagai kanal layanan aktif.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {serviceModules.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors duration-200 hover:border-primary/30"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={service.icon} />
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                    Simulasi layanan
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {service.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {service.text}
                </p>
                <span className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary">
                  Tinjau format
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
