"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FileCaptureField,
  type CaptureAttachment,
} from "@/app/components/file-capture-field";
import { palugadaCategories } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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

const palugadaCategoryValue: Record<string, string> = {
  Barang: "barang",
  Kuliner: "kuliner",
  Jasa: "jasa",
  Properti: "properti",
  Lainnya: "lainnya",
};

type UploadSession = {
  listing_id: string;
  upload_token: string;
};

const palugadaAttachmentBucket = "palugada-submissions";
const maxAttachmentSize = 10 * 1024 * 1024;

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAcceptedAttachment(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}

function getUploadContentType(file: File) {
  if (file.type) return file.type;
  const fallback: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
  };
  return fallback[getFileExtension(file.name)] ?? "application/octet-stream";
}

function getSafeFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "foto-palugada";
  return `${base}.${extension || "jpg"}`;
}

function buildMessage(
  form: SubmissionState,
  attachments: CaptureAttachment[],
  reference: string,
) {
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
        ? `${attachments.length} foto tersimpan bersama pendaftaran`
        : "-"
    }`,
    reference ? `Nomor pendaftaran: ${reference}` : "",
    "",
    "Mohon dibantu periksa untuk ditampilkan di katalog PALUGADA CGV.",
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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [submissionReference, setSubmissionReference] = useState("");
  const uploadSessionRef = useRef<UploadSession | null>(null);
  const uploadedPathsRef = useRef<Record<string, string>>({});
  const registeredAttachmentIdsRef = useRef(new Set<string>());
  const message = useMemo(
    () => buildMessage(form, attachments, submissionReference),
    [attachments, form, submissionReference],
  );
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
    setSaveState("idle");
    setSaveMessage("");
    setSubmissionReference("");
    uploadSessionRef.current = null;
    uploadedPathsRef.current = {};
    registeredAttachmentIdsRef.current.clear();
  }

  async function submitToSupabase() {
    if (!ready) {
      setSaveState("error");
      setSaveMessage("Lengkapi nama lapak, pemilik, cluster, WhatsApp, dan deskripsi.");
      return;
    }

    const oversizedFile = attachments.find((attachment) => attachment.file.size > maxAttachmentSize);
    if (oversizedFile) {
      setSaveState("error");
      setSaveMessage(`${oversizedFile.file.name} melebihi batas 10 MB.`);
      return;
    }

    const unsupportedFile = attachments.find((attachment) => !isAcceptedAttachment(attachment.file));
    if (unsupportedFile) {
      setSaveState("error");
      setSaveMessage(`${unsupportedFile.file.name} bukan format gambar yang didukung.`);
      return;
    }

    setSaveState("saving");
    setSaveMessage("Mengirim pendaftaran lapak...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userError || !userId) {
        throw new Error("Masuk sebagai warga terlebih dahulu sebelum mendaftarkan lapak.");
      }

      let uploadSession = uploadSessionRef.current;

      if (!uploadSession) {
        const { data, error } = await supabase.rpc("submit_palugada_listing", {
          p_name: form.businessName.trim(),
          p_category: palugadaCategoryValue[form.category] ?? "lainnya",
          p_cluster: form.cluster.trim(),
          p_price_label: form.price.trim(),
          p_description: [
            `Pemilik: ${form.ownerName.trim()}`,
            `WhatsApp: ${form.whatsapp.trim()}`,
            "",
            form.description.trim(),
            "",
            `Catatan foto: ${form.photoNote.trim() || "-"}`,
            attachments.length > 0
              ? `Lampiran private: ${attachments.length} foto.`
              : "Lampiran private: tidak ada.",
          ].join("\n"),
          p_availability_note: form.availability.trim(),
          p_contact_method: form.whatsapp.trim(),
        });

        if (error) throw error;
        uploadSession = ((data ?? []) as UploadSession[])[0] ?? null;
        if (!uploadSession) throw new Error("Supabase tidak mengembalikan sesi upload PALUGADA.");
        uploadSessionRef.current = uploadSession;
      }

      for (const [index, attachment] of attachments.entries()) {
        setSaveMessage(`Mengunggah foto ${index + 1} dari ${attachments.length}...`);
        let storagePath = uploadedPathsRef.current[attachment.id];

        if (!storagePath) {
          storagePath = `${uploadSession.listing_id}/${uploadSession.upload_token}/${crypto.randomUUID()}-${getSafeFileName(attachment.file.name)}`;
          const { error: uploadError } = await supabase.storage
            .from(palugadaAttachmentBucket)
            .upload(storagePath, attachment.file, {
              cacheControl: "3600",
              contentType: getUploadContentType(attachment.file),
              upsert: false,
            });
          if (uploadError) throw uploadError;
          uploadedPathsRef.current[attachment.id] = storagePath;
        }

        if (!registeredAttachmentIdsRef.current.has(attachment.id)) {
          const { error: metadataError } = await supabase.from("attachments").insert({
            owner_user_id: userId,
            linked_type: "palugada_listing",
            linked_id: uploadSession.listing_id,
            file_name: attachment.file.name,
            file_type: getUploadContentType(attachment.file),
            file_size: attachment.file.size,
            storage_path: storagePath,
            thumbnail_path: null,
            visibility: "admin_only",
            moderation_status: "pending",
          });
          if (metadataError) throw metadataError;
          registeredAttachmentIdsRef.current.add(attachment.id);
        }
      }

      setSaveState("saved");
      const reference = `PLG-${uploadSession.listing_id.slice(0, 8).toUpperCase()}`;
      setSubmissionReference(reference);
      setSaveMessage(
        attachments.length > 0
          ? `Pendaftaran dan ${attachments.length} foto sudah diterima. Nomor pendaftaran ${reference}.`
          : `Pendaftaran sudah diterima. Nomor pendaftaran ${reference}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pendaftaran lapak belum berhasil dikirim.";
      setSaveState("error");
      setSaveMessage(message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr] lg:items-start">
      <form className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Nama lapak
            <input
              value={form.businessName}
              autoComplete="organization"
              maxLength={120}
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
              autoComplete="name"
              maxLength={100}
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
              autoComplete="address-level3"
              maxLength={120}
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
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
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
              maxLength={120}
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
              maxLength={3000}
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
              maxLength={300}
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
              maxLength={300}
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
              description="Maksimal 4 foto, masing-masing 10 MB. Foto disimpan private dan hanya dapat dibuka admin berizin."
              attachments={attachments}
              onChange={(nextAttachments) => {
                setAttachments(nextAttachments);
                setSaveState("idle");
                setSaveMessage("");
                setSubmissionReference("");
                uploadSessionRef.current = null;
                uploadedPathsRef.current = {};
                registeredAttachmentIdsRef.current.clear();
              }}
            />
          </div>
        </div>
      </form>

      <aside className="space-y-5 lg:sticky lg:top-32">
        <div className="rounded-2xl border border-accent/45 bg-accent-soft/65 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Ringkasan pendaftaran
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
              {completedFields}/5 wajib
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-foreground">
              Siap diperiksa
            </span>
          </div>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-accent/35 bg-surface/82 p-4 text-sm leading-6 text-foreground">
            {message}
          </pre>
          <button
            type="button"
            onClick={submitToSupabase}
            disabled={!ready || saveState === "saving" || saveState === "saved"}
            className={`mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft disabled:cursor-not-allowed disabled:opacity-60 ${
              ready
                ? "cursor-pointer bg-primary text-white hover:bg-primary-hover"
                : "cursor-not-allowed bg-primary-soft text-primary/60"
            }`}
          >
            {saveState === "saving" ? "Mengirim dan mengunggah..." : saveState === "saved" ? "Pendaftaran terkirim" : "Kirim pendaftaran"}
          </button>
          {saveMessage ? (
            <div
              role={saveState === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`mt-4 rounded-xl border p-4 ${
                saveState === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-primary/20 bg-surface text-primary"
              }`}
            >
              <p className="text-sm font-semibold">{saveMessage}</p>
            </div>
          ) : null}
          <p className="mt-3 text-xs leading-5 text-foreground/70">
            Tombol aktif setelah nama lapak, pemilik, cluster, WhatsApp, dan
            deskripsi terisi.
          </p>
          {saveState === "saved" ? (
            <div className="mt-4 rounded-xl border border-primary/20 bg-surface p-4">
              <p className="text-sm font-semibold text-primary">
                Simpan nomor pendaftaran: {submissionReference}
              </p>
              <p className="mt-2 text-xs leading-5 text-foreground/70">
                Pengurus sudah menerima data dan foto lapak. WhatsApp hanya digunakan jika Anda ingin mengirim konfirmasi tambahan.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-surface px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Konfirmasi lewat WhatsApp
              </a>
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
              Lapak akan tampil setelah informasinya cukup jelas untuk warga.
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
