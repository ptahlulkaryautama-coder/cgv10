"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type StorefrontSeller = {
  slug: string;
  name: string;
  category: string;
  cluster: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  galleryImages: Array<{ src: string; alt: string }>;
  whatsappHref?: string;
  whatsappLabel?: string;
  whatsappDisplayNumber?: string;
  sellerStatus: "online" | "offline";
  sellerStatusLabel: string;
  sellerStatusNote: string;
  availabilityNote?: string;
  priceNote?: string;
  highlights?: string[];
};

type Product = {
  id: string;
  name: string;
  variant: string;
  description: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  availability: string;
};

type CartLine = Product & { quantity: number };

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function pilotProducts(seller: StorefrontSeller): Product[] {
  if (seller.slug !== "donat-kentang-warga" && seller.slug !== "maniez-donut") return [];

  return [
    {
      id: "maniez-coklat",
      name: "Donat Kentang Coklat",
      variant: "Box 6 pcs",
      description: "Donat lembut dengan taburan meses coklat.",
      price: 20000,
      imageSrc: seller.galleryImages[0]?.src ?? seller.imageSrc,
      imageAlt: "Donat kentang coklat Ma'niez Donut",
      availability: "Tersedia hari ini",
    },
    {
      id: "maniez-keju",
      name: "Donat Kentang Keju",
      variant: "Box 6 pcs",
      description: "Donat lembut dengan taburan keju pilihan.",
      price: 22000,
      imageSrc: seller.galleryImages[1]?.src ?? seller.imageSrc,
      imageAlt: "Donat kentang keju Ma'niez Donut",
      availability: "Tersedia hari ini",
    },
    {
      id: "maniez-red-velvet",
      name: "Donat Red Velvet",
      variant: "Box 6 pcs",
      description: "Pilihan red velvet untuk teman berkumpul.",
      price: 24000,
      imageSrc: seller.galleryImages[2]?.src ?? seller.imageSrc,
      imageAlt: "Donat red velvet Ma'niez Donut",
      availability: "Pre-order H+1",
    },
    {
      id: "maniez-keluarga",
      name: "Box Keluarga Mix",
      variant: "12 pcs, pilih 2 varian",
      description: "Pilihan box untuk kumpul keluarga atau tetangga.",
      price: 42000,
      imageSrc: seller.imageSrc,
      imageAlt: "Box keluarga Ma'niez Donut",
      availability: "Tersedia hari ini",
    },
  ];
}

function Icon({ name, className = "h-5 w-5" }: { name: "cart" | "plus" | "minus" | "close" | "check" | "whatsapp"; className?: string }) {
  const paths = {
    cart: <path d="M3 3h2l2.3 10.1a2 2 0 0 0 2 1.56h7.9a2 2 0 0 0 1.93-1.48L20.5 7H6.1M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4 4L19 6" />,
    whatsapp: <path d="M20.5 11.8a8.2 8.2 0 0 1-12.1 7.2L4 20l1-4.1a8.2 8.2 0 1 1 15.5-4.1Zm-11.6-3c.2-.4.4-.4.7-.4h.5c.2 0 .3 0 .4.4l.7 1.7c.1.2.1.4 0 .5l-.4.6c-.1.1-.2.3-.1.4.4.8 1.1 1.5 1.9 2 .2.1.3.1.5 0l.6-.7c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4 0 .5-.3 1.2-.7 1.4-.4.2-.9.3-1.5.1-1-.3-2.3-1-3.7-2.4-1.1-1.1-1.8-2.3-2.1-3.2-.3-.9 0-1.7.3-2.1Z" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

function StoreImage({ src, alt, sizes, priority = false, className }: { src: string; alt: string; sizes: string; priority?: boolean; className: string }) {
  if (src.startsWith("http")) {
    // Signed Supabase URLs are temporary and are intentionally not routed through Next's static optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}

export function SellerStorefront({ seller }: { seller: StorefrontSeller }) {
  const products = useMemo(() => pilotProducts(seller), [seller]);
  const storageKey = `cgv10:palugada-cart:${seller.slug}`;
  const [cart, setCart] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.sessionStorage.getItem(`cgv10:palugada-cart:${seller.slug}`);
      return saved ? (JSON.parse(saved) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", cluster: seller.cluster, unit: "", whatsapp: "", notes: "" });

  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* no-op */ }
  }, [cart, storageKey]);

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const updateQuantity = (product: Product, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) return current.filter((line) => line.id !== product.id);
      const existing = current.find((line) => line.id === product.id);
      return existing ? current.map((line) => line.id === product.id ? { ...line, quantity } : line) : [...current, { ...product, quantity }];
    });
  };
  const getQuantity = (id: string) => cart.find((line) => line.id === id)?.quantity ?? 0;

  function sendOrder() {
    if (!seller.whatsappHref || cart.length === 0) return;
    const lines = cart.map((line) => `• ${line.name} (${line.variant}) x${line.quantity} — ${rupiah.format(line.price * line.quantity)}`);
    const message = [
      "*PALUGADA CGV — Pesanan Warga*",
      `Penjual: ${seller.name}`,
      "",
      "*Pesanan*",
      ...lines,
      "",
      `*Total: ${rupiah.format(total)}*`,
      "",
      "*Data pemesan*",
      `Nama: ${customer.name || "-"}`,
      `Cluster: ${customer.cluster || "-"}`,
      `Blok / nomor rumah: ${customer.unit || "-"}`,
      `WhatsApp: ${customer.whatsapp || "-"}`,
      `Catatan: ${customer.notes || "-"}`,
      "",
      "Mohon konfirmasi ketersediaan dan langkah berikutnya. Terima kasih.",
    ].join("\n");
    window.open(`${seller.whatsappHref}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="pb-24 lg:pb-12">
      <section className="border-b border-primary/15 bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-5 sm:px-6 lg:px-8 xl:px-10">
          <Link href="/palugada/" className="inline-flex min-h-10 items-center text-sm font-semibold text-white/78 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft">← Kembali ke PALUGADA</Link>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-cream shadow-lg sm:h-[5.5rem] sm:w-[5.5rem]">
                <StoreImage src={seller.imageSrc} alt={seller.imageAlt} sizes="88px" className="object-cover" priority />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary">{seller.category}</span><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/85"><span className={`h-2 w-2 rounded-full ${seller.sellerStatus === "online" ? "bg-emerald-400" : "bg-stone-300"}`} />{seller.sellerStatusLabel}</span></div>
                <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{seller.name}</h1>
                <p className="mt-1 text-sm text-white/75">{seller.cluster} <span className="mx-1.5 text-white/35">•</span> Lapak warga terverifikasi</p>
              </div>
            </div>
            {seller.whatsappHref ? <a href={seller.whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-foreground transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"><Icon name="whatsapp" className="h-5 w-5" />{seller.whatsappLabel ?? "Hubungi penjual"}</a> : null}
          </div>
        </div>
      </section>

      <nav aria-label="Navigasi toko" className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6 lg:px-8 xl:px-10"><a href="#katalog" className="border-b-2 border-primary py-4 text-sm font-bold text-primary">Katalog</a><a href="#tentang" className="border-b-2 border-transparent py-4 text-sm font-semibold text-muted transition-colors hover:text-primary">Tentang</a><a href="#kontak" className="border-b-2 border-transparent py-4 text-sm font-semibold text-muted transition-colors hover:text-primary">Kontak</a></div>
      </nav>

      <section id="katalog" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-7 sm:px-6 lg:px-8 lg:py-10 xl:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{products.length ? "Katalog pilihan" : "Ringkasan lapak"}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{products.length ? "Pesan untuk dinikmati di rumah." : "Informasi jelas sebelum menghubungi penjual."}</h2>
          </div>
          <p className="hidden text-sm text-muted sm:block">{products.length ? `${products.length} pilihan tersedia` : seller.sellerStatusLabel}</p>
        </div>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div>{products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} quantity={getQuantity(product.id)} onChange={updateQuantity} />)}</div> : <ListingSummary seller={seller} />}</div>
          <aside className="hidden lg:block">{products.length ? <CartSummary cart={cart} total={total} customer={customer} setCustomer={setCustomer} onSend={sendOrder} seller={seller} /> : <StorefrontContactCard seller={seller} />}</aside>
        </div>
      </section>

      <section id="tentang" className="scroll-mt-24 border-y border-border bg-cream/55"><div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.25fr_.75fr] lg:px-8 xl:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tentang {seller.name}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Usaha lokal, lebih dekat dengan warga.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">{seller.description}</p></div><div className="rounded-2xl border border-accent/45 bg-surface p-5"><p className="text-sm font-bold text-foreground">Status operasional</p><p className="mt-2 inline-flex items-center gap-2 text-sm text-primary"><span className={`h-2.5 w-2.5 rounded-full ${seller.sellerStatus === "online" ? "bg-emerald-600" : "bg-stone-400"}`} />{seller.sellerStatusNote}</p><p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-muted">{seller.availabilityNote ?? "Ketersediaan dapat dikonfirmasi langsung kepada penjual."}</p></div></div></section>

      <section id="kontak" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8 xl:px-10"><div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Kontak penjual</p><h2 className="mt-2 text-xl font-semibold text-foreground">Perlu tanya sebelum memesan?</h2><p className="mt-1 text-sm text-muted">{seller.whatsappDisplayNumber ?? "Gunakan kanal kontak yang tersedia."}</p></div>{seller.whatsappHref ? <a href={seller.whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon name="whatsapp" />WhatsApp {seller.name}</a> : null}</div></section>

      {itemCount > 0 ? <button type="button" onClick={() => setIsCartOpen(true)} className="fixed bottom-3 left-3 right-3 z-30 flex min-h-14 items-center justify-between rounded-2xl bg-primary px-4 text-left text-white shadow-[0_12px_32px_rgba(0,61,52,.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"><span className="inline-flex items-center gap-2 text-sm font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs text-foreground">{itemCount}</span><Icon name="cart" />Lihat pesanan</span><span className="text-sm font-bold">{rupiah.format(total)}</span></button> : null}
      {isCartOpen ? <div role="dialog" aria-modal="true" aria-label="Ringkasan pesanan" className="fixed inset-0 z-40 flex items-end bg-foreground/45 lg:hidden"><div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-background p-4 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-foreground">Ringkasan pesanan</h2><button type="button" onClick={() => setIsCartOpen(false)} aria-label="Tutup ringkasan pesanan" className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon name="close" /></button></div><CartSummary cart={cart} total={total} customer={customer} setCustomer={setCustomer} onSend={sendOrder} seller={seller} /></div></div> : null}
    </main>
  );
}

function ProductCard({ product, quantity, onChange }: { product: Product; quantity: number; onChange: (product: Product, quantity: number) => void }) {
  return <article className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:border-primary/35"><div className="relative aspect-square overflow-hidden bg-cream"><StoreImage src={product.imageSrc} alt={product.imageAlt} sizes="(min-width: 1280px) 220px, (min-width: 640px) 30vw, 48vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /><span className="absolute bottom-2 left-2 rounded-full bg-surface/94 px-2 py-1 text-[.63rem] font-bold text-primary shadow-sm">{product.availability}</span></div><div className="p-3 sm:p-4"><h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground sm:text-base">{product.name}</h3><p className="mt-1 text-xs text-muted">{product.variant}</p><p className="mt-3 text-sm font-bold text-primary">{rupiah.format(product.price)}</p>{quantity ? <div className="mt-3 flex min-h-10 items-center justify-between rounded-xl border border-primary/20 bg-primary-soft px-1"><button type="button" onClick={() => onChange(product, quantity - 1)} aria-label={`Kurangi ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon name="minus" className="h-4 w-4" /></button><span aria-live="polite" className="text-sm font-bold text-primary">{quantity}</span><button type="button" onClick={() => onChange(product, quantity + 1)} aria-label={`Tambah ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon name="plus" className="h-4 w-4" /></button></div> : <button type="button" onClick={() => onChange(product, 1)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon name="plus" className="h-4 w-4" />Tambah</button>}</div></article>;
}

function ListingSummary({ seller }: { seller: StorefrontSeller }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Harga / ketentuan</p>
        <p className="mt-3 text-lg font-semibold text-foreground">{seller.priceNote ?? "Sesuai konfirmasi penjual"}</p>
        <p className="mt-2 text-sm leading-6 text-muted">Harga akhir, jadwal, dan cara pemenuhan mengikuti informasi terbaru dari penyedia.</p>
      </article>
      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Ketersediaan</p>
        <p className="mt-3 text-lg font-semibold text-foreground">{seller.sellerStatusLabel}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{seller.availabilityNote ?? "Konfirmasi langsung diperlukan sebelum membuat pesanan."}</p>
      </article>
      {seller.highlights?.length ? <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Cakupan layanan</p><ul className="mt-3 space-y-2 text-sm leading-6 text-muted">{seller.highlights.map((highlight) => <li key={highlight} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{highlight}</li>)}</ul></article> : null}
    </div>
  );
}

function StorefrontContactCard({ seller }: { seller: StorefrontSeller }) {
  return <div className="rounded-2xl border border-accent/45 bg-surface p-5 shadow-sm"><p className="text-sm font-bold text-foreground">Status operasional</p><p className="mt-2 inline-flex items-center gap-2 text-sm text-primary"><span className={`h-2.5 w-2.5 rounded-full ${seller.sellerStatus === "online" ? "bg-emerald-600" : "bg-stone-400"}`} />{seller.sellerStatusNote}</p><p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-muted">{seller.whatsappDisplayNumber ?? "Kontak akan aktif setelah informasi penjual dikonfirmasi."}</p>{seller.whatsappHref ? <a href={seller.whatsappHref} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Icon name="whatsapp" />Hubungi penjual</a> : null}</div>;
}

function CartSummary({ cart, total, customer, setCustomer, onSend, seller }: { cart: CartLine[]; total: number; customer: { name: string; cluster: string; unit: string; whatsapp: string; notes: string }; setCustomer: React.Dispatch<React.SetStateAction<{ name: string; cluster: string; unit: string; whatsapp: string; notes: string }>>; onSend: () => void; seller: StorefrontSeller }) {
  const update = (key: keyof typeof customer, value: string) => setCustomer((current) => ({ ...current, [key]: value }));
  return <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:sticky lg:top-20"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-foreground">Pesanan Anda</h2><span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">{cart.reduce((sum, line) => sum + line.quantity, 0)} item</span></div>{cart.length ? <><ul className="mt-4 divide-y divide-border border-y border-border">{cart.map((line) => <li key={line.id} className="flex justify-between gap-3 py-3 text-sm"><div><p className="font-semibold text-foreground">{line.name}</p><p className="mt-0.5 text-xs text-muted">{line.variant} × {line.quantity}</p></div><span className="shrink-0 font-semibold text-foreground">{rupiah.format(line.price * line.quantity)}</span></li>)}</ul><div className="mt-4 flex items-center justify-between text-base font-bold text-foreground"><span>Total</span><span>{rupiah.format(total)}</span></div><fieldset className="mt-5 space-y-3 border-t border-border pt-5"><legend className="text-sm font-bold text-foreground">Data pengantaran</legend><Field label="Nama" value={customer.name} onChange={(value) => update("name", value)} autoComplete="name" /><Field label="Cluster" value={customer.cluster} onChange={(value) => update("cluster", value)} /><Field label="Blok / nomor rumah" value={customer.unit} onChange={(value) => update("unit", value)} /><Field label="WhatsApp" value={customer.whatsapp} onChange={(value) => update("whatsapp", value)} type="tel" autoComplete="tel" /><label className="block text-sm font-semibold text-foreground">Catatan pesanan<textarea value={customer.notes} onChange={(event) => update("notes", event.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Contoh: titip di pos satpam" /></label></fieldset><button type="button" onClick={onSend} disabled={!seller.whatsappHref} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-foreground transition-colors hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon name="whatsapp" />Kirim Pesanan</button><p className="mt-2 text-center text-xs leading-5 text-muted">Pesanan akan dikirim ke WhatsApp penjual untuk dikonfirmasi.</p></> : <p className="mt-4 rounded-xl bg-cream px-3 py-4 text-sm leading-6 text-muted">Belum ada produk di pesanan. Tambahkan pilihan dari katalog.</p>}</div>;
}

function Field({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return <label className="block text-sm font-semibold text-foreground">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className="mt-1.5 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>;
}
