"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileCaptureField,
  type CaptureAttachment,
} from "@/app/components/file-capture-field";
import { palugadaCategories } from "@/lib/portal-data";

type SubmissionState = {
  businessName: string;
  ownerName: string;
  category: string;
  cluster: string;
  whatsapp: string;
  price: string;
  description: string;
  availability: string;
  photoNote: string;
};

const initialState: SubmissionState = {
  businessName: "",
  ownerName: "",
  category: palugadaCategories[0]?.title ?? "Barang",
  cluster: "",
  whatsapp: "",
  price: "",
  description: "",
  availability: "",
  photoNote: "",
};

function buildMessage(form: SubmissionState, attachments: CaptureAttachment[]) {
  return [
    "Halo Pengurus CGV10, saya ingin mendaftarkan lapak PALUGADA.",
    "",
    `Nama lapak: ${form.businessName || "-"}`,
    `Nama pemilik: ${form.ownerName || "-"}`,
    `Kategori: ${form.category || "-"}`,
    `Cluster/blok: ${form.cluster || "-"}`,
    `WhatsApp: ${form.whatsapp || "-"}`,
    `Harga/status: ${form.price || "-"}`,
    `Deskripsi: ${form.description || "-"}`,
    `Ketersediaan: ${form.availability || "-"}`,
    `Catatan foto: ${form.photoNote || "-"}`,
    `Lampiran foto: ${
      attachments.length > 0
        ? `${attachments.length} file dipilih, akan dikirim manual via WhatsApp`
        : "-"
    }`,
    "",
    "Mohon dibantu kurasi untuk katalog PALUGADA CGV.",
  ].join("\n");
}

function isReady(form: SubmissionState) {
  return Boolean(
    form.businessName.trim() &&
      form.ownerName.trim() &&
      form.cluster.trim() &&
      form.whatsapp.trim() &&
      form.description.trim(),
  );
}

export function PalugadaSubmissionForm() {
  const [form, setForm] = useState<SubmissionState>(initialState);
  const [attachments, setAttachments] = useState<CaptureAttachment[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const message = useMemo(() => buildMessage(form, attachments), [attachments, form]);
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message,
  )}`;
  const ready = isReady(form);
  const completedFields = [
    form.businessName.trim(),
    form.ownerName.trim(),
    form.cluster.trim(),
    form.whatsapp.trim(),
    form.description.trim(),
  ].filter(Boolean).length;

  function updateField<Key extends keyof SubmissionState>(
    key: Key,
    value: SubmissionState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr] lg:items-start">
      <form className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Nama lapak
            <input
              value={form.businessName}
              onChange={(event) =>
                updateField("businessName", event.target.value)
              }
              onInput={(event) =>
                updateField("businessName", event.currentTarget.value)
              }
              placeholder="Contoh: Ma'niez Donut"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Nama pemilik
            <input
              value={form.ownerName}
              onChange={(event) => updateField("ownerName", event.target.value)}
              onInput={(event) =>
                updateField("ownerName", event.currentTarget.value)
              }
              placeholder="Nama warga / penanggung jawab"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Kategori
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="min-h-12 cursor-pointer rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/18"
            >
              {palugadaCategories.map((category) => (
                <option key={category.title} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Cluster / blok
            <input
              value={form.cluster}
              onChange={(event) => updateField("cluster", event.target.value)}
              onInput={(event) => updateField("cluster", event.currentTarget.value)}
              placeholder="Contoh: Cluster Colloseum"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Nomor WhatsApp
            <input
              value={form.whatsapp}
              onChange={(event) => updateField("whatsapp", event.target.value)}
              onInput={(event) =>
                updateField("whatsapp", event.currentTarget.value)
              }
              placeholder="Contoh: 0812xxxx"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Harga / status
            <input
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              onInput={(event) => updateField("price", event.currentTarget.value)}
              placeholder="Contoh: Mulai Rp 20.000"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground sm:col-span-2">
            Deskripsi singkat
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              onInput={(event) =>
                updateField("description", event.currentTarget.value)
              }
              placeholder="Ceritakan produk, jasa, area layanan, atau format pesanan."
              rows={5}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium leading-6 text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Ketersediaan
            <input
              value={form.availability}
              onChange={(event) =>
                updateField("availability", event.target.value)
              }
              onInput={(event) =>
                updateField("availability", event.currentTarget.value)
              }
              placeholder="Contoh: PO H-1, Sabtu-Minggu"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Catatan foto
            <input
              value={form.photoNote}
              onChange={(event) => updateField("photoNote", event.target.value)}
              onInput={(event) =>
                updateField("photoNote", event.currentTarget.value)
              }
              placeholder="Contoh: 3 foto produk tersedia"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/18"
            />
          </label>

          <div className="sm:col-span-2">
            <FileCaptureField
              id="palugada-foto"
              label="Foto produk atau lapak"
              description="Ambil foto produk, menu, atau contoh hasil kerja. Lampiran belum dikirim otomatis."
              attachments={attachments}
              onChange={(nextAttachments) => {
                setAttachments(nextAttachments);
                setSubmitted(false);
              }}
            />
          </div>
        </div>
      </form>

      <aside className="space-y-5 lg:sticky lg:top-32">
        <div className="rounded-2xl border border-accent/45 bg-accent-soft/65 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Preview WhatsApp
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
              {completedFields}/5 wajib
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-foreground">
              Review katalog
            </span>
          </div>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-accent/35 bg-surface/82 p-4 text-sm leading-6 text-foreground">
            {message}
          </pre>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!ready}
            onClick={() => {
              if (ready) {
                setSubmitted(true);
              }
            }}
            className={`mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft ${
              ready
                ? "bg-primary text-white hover:bg-primary-hover"
                : "pointer-events-none bg-primary-soft text-primary/60"
            }`}
          >
            Kirim draft via WhatsApp
          </a>
          <p className="mt-3 text-xs leading-5 text-foreground/70">
            Tombol aktif setelah nama lapak, pemilik, cluster, WhatsApp, dan
            deskripsi terisi.
          </p>
          {submitted ? (
            <div className="mt-4 rounded-xl border border-primary/20 bg-surface p-4">
              <p className="text-sm font-semibold text-primary">
                Draft lapak siap masuk review PALUGADA.
              </p>
              <p className="mt-2 text-xs leading-5 text-foreground/70">
                Pengurus bisa menandai draft sebagai Perlu verifikasi atau Siap
                tayang sebelum tampil di katalog warga.
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Setelah dikirim
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <p>Pengurus dapat meminta foto tambahan atau klarifikasi kontak.</p>
            <p>
              Listing akan masuk katalog setelah informasi cukup jelas untuk
              warga.
            </p>
          </div>
          <Link
            href="/palugada/"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Kembali ke katalog
          </Link>
        </div>
      </aside>
    </div>
  );
}
