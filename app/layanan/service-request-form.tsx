"use client";

import { useMemo, useState } from "react";
import {
  FileCaptureField,
  type CaptureAttachment,
} from "../components/file-capture-field";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";

type RequestType = {
  id: string;
  title: string;
  label: string;
  icon: IconName;
  priority: "Normal" | "Tinggi" | "Administrasi";
  helper: string;
};

const requestTypes: RequestType[] = [
  {
    id: "keluhan",
    title: "Ajukan Keluhan",
    label: "Laporan lingkungan",
    icon: "message",
    priority: "Tinggi",
    helper: "Fasilitas umum, kebersihan, lampu, keamanan, atau kondisi area.",
  },
  {
    id: "pendaftaran",
    title: "Pendaftaran / Update Data",
    label: "Data warga",
    icon: "users",
    priority: "Administrasi",
    helper: "Warga baru, perubahan kontak, kendaraan, atau data keluarga.",
  },
  {
    id: "iuran",
    title: "Konfirmasi Iuran",
    label: "Keuangan",
    icon: "wallet",
    priority: "Normal",
    helper: "Konfirmasi pembayaran, pertanyaan iuran, atau bukti transfer.",
  },
  {
    id: "administrasi",
    title: "Administrasi Surat",
    label: "Dokumen",
    icon: "briefcase",
    priority: "Administrasi",
    helper: "Surat domisili, pengantar, atau kebutuhan dokumen lingkungan.",
  },
  {
    id: "keamanan",
    title: "Keamanan Lingkungan",
    label: "Keamanan",
    icon: "shield",
    priority: "Tinggi",
    helper: "Kondisi keamanan, akses tamu, kendaraan, dan area bersama.",
  },
  {
    id: "aspirasi",
    title: "Usulan Warga",
    label: "Aspirasi",
    icon: "megaphone",
    priority: "Normal",
    helper: "Ide, masukan, prioritas kegiatan, atau perbaikan portal.",
  },
];

const initialForm = {
  name: "",
  cluster: "",
  phone: "",
  subject: "",
  detail: "",
  availability: "",
};

function buildMessage(
  type: RequestType,
  form: typeof initialForm,
  attachments: CaptureAttachment[],
) {
  return [
    "Halo Pengurus CGV10, saya ingin mengajukan layanan warga.",
    "",
    `Jenis layanan: ${type.title}`,
    `Prioritas: ${type.priority}`,
    `Nama warga: ${form.name || "-"}`,
    `Cluster/blok: ${form.cluster || "-"}`,
    `Kontak WhatsApp: ${form.phone || "-"}`,
    `Judul kebutuhan: ${form.subject || "-"}`,
    `Detail: ${form.detail || "-"}`,
    `Waktu yang bisa dihubungi: ${form.availability || "-"}`,
    `Lampiran foto: ${
      attachments.length > 0
        ? `${attachments.length} file dipilih, akan dikirim manual via WhatsApp`
        : "-"
    }`,
    "",
    "Mohon dibantu tindak lanjut melalui kanal pengurus CGV10.",
  ].join("\n");
}

export function ServiceRequestForm() {
  const [selectedTypeId, setSelectedTypeId] = useState(requestTypes[0].id);
  const [form, setForm] = useState(initialForm);
  const [attachments, setAttachments] = useState<CaptureAttachment[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const selectedType =
    requestTypes.find((type) => type.id === selectedTypeId) ?? requestTypes[0];

  const message = useMemo(
    () => buildMessage(selectedType, form, attachments),
    [attachments, form, selectedType],
  );
  const isReady = Boolean(
    form.name.trim() && form.cluster.trim() && form.phone.trim() && form.detail.trim(),
  );
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  const completedFields = [
    form.name.trim(),
    form.cluster.trim(),
    form.phone.trim(),
    form.detail.trim(),
  ].filter(Boolean).length;

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
  }

  return (
    <section id="form-layanan" className="scroll-mt-28 border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Form Layanan Warga
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pilih kebutuhan, isi data, lalu kirim draft ke pengurus.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted">
              Form ini belum menyimpan data ke database. Untuk fase awal, data
              dirapikan menjadi pesan WhatsApp agar bisa langsung dipakai warga
              dan mudah diproses pengurus.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {requestTypes.map((type) => {
                const selected = type.id === selectedType.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedTypeId(type.id)}
                    className={[
                      "cursor-pointer rounded-2xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-foreground hover:border-primary/35 hover:bg-primary-soft/35",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={[
                          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                          selected ? "bg-white/12 text-accent-soft" : "bg-primary-soft text-primary",
                        ].join(" ")}
                      >
                        <Icon name={type.icon} />
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
                          selected ? "bg-accent-soft text-foreground" : "bg-accent-soft text-foreground",
                        ].join(" ")}
                      >
                        {type.label}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold">{type.title}</h3>
                    <p className={["mt-2 text-sm leading-6", selected ? "text-white/78" : "text-muted"].join(" ")}>
                      {type.helper}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Nama warga</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  onInput={(event) => updateField("name", event.currentTarget.value)}
                  placeholder="Nama lengkap"
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Cluster / blok</span>
                <input
                  value={form.cluster}
                  onChange={(event) => updateField("cluster", event.target.value)}
                  onInput={(event) => updateField("cluster", event.currentTarget.value)}
                  placeholder="Contoh: Cluster Pinnata"
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Nomor WhatsApp</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  onInput={(event) => updateField("phone", event.currentTarget.value)}
                  placeholder="08xxxxxxxxxx"
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Judul kebutuhan</span>
                <input
                  value={form.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  onInput={(event) => updateField("subject", event.currentTarget.value)}
                  placeholder="Contoh: Lampu jalan padam"
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-foreground">Detail kebutuhan</span>
                <textarea
                  value={form.detail}
                  onChange={(event) => updateField("detail", event.target.value)}
                  onInput={(event) => updateField("detail", event.currentTarget.value)}
                  placeholder="Tulis lokasi, kronologi, nominal iuran, atau informasi yang perlu diketahui pengurus."
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-foreground">Waktu yang bisa dihubungi</span>
                <input
                  value={form.availability}
                  onChange={(event) => updateField("availability", event.target.value)}
                  onInput={(event) => updateField("availability", event.currentTarget.value)}
                  placeholder="Contoh: Malam setelah 19.00"
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <div className="sm:col-span-2">
                <FileCaptureField
                  id="layanan-foto"
                  label="Foto pendukung"
                  description="Ambil foto kondisi lokasi atau pilih dari galeri. Lampiran belum dikirim otomatis."
                  attachments={attachments}
                  onChange={(nextAttachments) => {
                    setAttachments(nextAttachments);
                    setSubmitted(false);
                  }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-accent/35 bg-accent-soft/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Preview WhatsApp
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                    {selectedType.priority}
                  </span>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
                    {completedFields}/4 wajib
                  </span>
                </div>
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
                {message}
              </pre>
              <a
                href={isReady ? whatsappHref : undefined}
                target={isReady ? "_blank" : undefined}
                rel={isReady ? "noopener noreferrer" : undefined}
                aria-disabled={!isReady}
                onClick={() => {
                  if (isReady) {
                    setSubmitted(true);
                  }
                }}
                className={[
                  "mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isReady
                    ? "cursor-pointer bg-primary text-white hover:bg-primary-hover"
                    : "cursor-not-allowed bg-muted/20 text-muted",
                ].join(" ")}
              >
                Kirim draft ke WhatsApp
              </a>
              <p className="mt-3 text-xs leading-5 text-muted">
                Tombol aktif setelah nama, cluster, WhatsApp, dan detail
                kebutuhan terisi.
              </p>
              {submitted ? (
                <div className="mt-4 rounded-xl border border-primary/20 bg-background p-4">
                  <p className="text-sm font-semibold text-primary">
                    Draft siap masuk antrian layanan.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Di admin preview, request seperti ini dikelola di modul
                    Layanan dengan status Baru, Diproses, Validasi, dan Selesai.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
