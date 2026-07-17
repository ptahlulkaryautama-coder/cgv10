"use client";

import { useMemo, useRef, useState } from "react";
import {
  FileCaptureField,
  type CaptureAttachment,
} from "../components/file-capture-field";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DuesForm = {
  name: string;
  cluster: string;
  blockOrUnit: string;
  phone: string;
  periodMonth: string;
  periodYear: string;
  amount: string;
  paidAt: string;
  method: "transfer" | "cash" | "qris" | "other";
  referenceNo: string;
  note: string;
};

type PaymentUploadSession = {
  payment_id: string;
  upload_token: string;
};

const paymentProofBucket = "payment-proofs";
const maxProofSize = 10 * 1024 * 1024;
const initialForm: DuesForm = {
  name: "",
  cluster: "",
  blockOrUnit: "",
  phone: "",
  periodMonth: String(new Date().getMonth() + 1),
  periodYear: String(new Date().getFullYear()),
  amount: "",
  paidAt: new Date().toISOString().slice(0, 10),
  method: "transfer",
  referenceNo: "",
  note: "",
};

const monthOptions = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function parseAmount(value: string) {
  const numeric = value.replace(/[^\d]/g, "");
  return numeric ? Number(numeric) : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getSafeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "bukti-iuran";
  return `${baseName}.${extension}`;
}

function getUploadContentType(file: File) {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "pdf" ? "application/pdf" : "image/jpeg";
}

function isAcceptedProof(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}

function buildSummary(form: DuesForm, attachments: CaptureAttachment[], reference: string) {
  const amount = parseAmount(form.amount);

  return [
    "Konfirmasi iuran warga CGV10.",
    "",
    `Nama warga: ${form.name || "-"}`,
    `Cluster/blok: ${form.cluster || "-"} / ${form.blockOrUnit || "-"}`,
    `WhatsApp: ${form.phone || "-"}`,
    `Periode: ${monthOptions[Number(form.periodMonth) - 1] ?? "-"} ${form.periodYear || "-"}`,
    `Nominal: ${amount > 0 ? formatCurrency(amount) : "-"}`,
    `Tanggal bayar: ${form.paidAt || "-"}`,
    `Metode: ${form.method}`,
    `Referensi: ${form.referenceNo || "-"}`,
    `Bukti: ${attachments.length > 0 ? `${attachments.length} file tersimpan` : "-"}`,
    reference ? `Nomor konfirmasi: ${reference}` : "",
    form.note ? `Catatan: ${form.note}` : "",
  ].join("\n");
}

export function DuesConfirmationForm() {
  const [form, setForm] = useState<DuesForm>(initialForm);
  const [attachments, setAttachments] = useState<CaptureAttachment[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [submissionReference, setSubmissionReference] = useState("");
  const uploadSessionRef = useRef<PaymentUploadSession | null>(null);
  const uploadedPathsRef = useRef<Record<string, string>>({});
  const registeredAttachmentIdsRef = useRef(new Set<string>());

  const amount = parseAmount(form.amount);
  const isReady = Boolean(
    form.name.trim() &&
      form.cluster.trim() &&
      form.blockOrUnit.trim() &&
      form.phone.trim() &&
      form.paidAt &&
      amount > 0,
  );
  const summary = useMemo(
    () => buildSummary(form, attachments, submissionReference),
    [attachments, form, submissionReference],
  );

  function resetSubmissionState() {
    setSaveState("idle");
    setSaveMessage("");
    setSubmissionReference("");
    uploadSessionRef.current = null;
    uploadedPathsRef.current = {};
    registeredAttachmentIdsRef.current.clear();
  }

  function updateField<Key extends keyof DuesForm>(field: Key, value: DuesForm[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
    resetSubmissionState();
  }

  async function submitConfirmation() {
    if (!isReady) {
      setSaveState("error");
      setSaveMessage("Lengkapi nama, cluster/blok, WhatsApp, periode, nominal, dan tanggal bayar.");
      return;
    }

    const oversizedFile = attachments.find((attachment) => attachment.file.size > maxProofSize);
    if (oversizedFile) {
      setSaveState("error");
      setSaveMessage(`${oversizedFile.file.name} melebihi batas 10 MB.`);
      return;
    }

    const unsupportedFile = attachments.find((attachment) => !isAcceptedProof(attachment.file));
    if (unsupportedFile) {
      setSaveState("error");
      setSaveMessage(`${unsupportedFile.file.name} bukan format bukti yang didukung.`);
      return;
    }

    setSaveState("saving");
    setSaveMessage("Mengirim konfirmasi iuran...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userError || !userId) {
        throw new Error("Masuk sebagai warga terlebih dahulu sebelum konfirmasi iuran.");
      }

      let uploadSession = uploadSessionRef.current;

      if (!uploadSession) {
        const { data, error } = await supabase.rpc("submit_dues_confirmation", {
          p_name: form.name.trim(),
          p_cluster: form.cluster.trim(),
          p_block_or_unit: form.blockOrUnit.trim(),
          p_phone: form.phone.trim(),
          p_period_month: Number(form.periodMonth),
          p_period_year: Number(form.periodYear),
          p_amount: amount,
          p_paid_at: form.paidAt,
          p_method: form.method,
          p_reference_no: form.referenceNo.trim(),
          p_note: form.note.trim(),
        });

        if (error) throw error;
        uploadSession = ((data ?? []) as PaymentUploadSession[])[0] ?? null;
        if (!uploadSession) throw new Error("Nomor konfirmasi belum berhasil dibuat.");
        uploadSessionRef.current = uploadSession;
      }

      for (const [index, attachment] of attachments.entries()) {
        setSaveMessage(`Mengunggah bukti ${index + 1} dari ${attachments.length}...`);
        let storagePath = uploadedPathsRef.current[attachment.id];

        if (!storagePath) {
          storagePath = `${uploadSession.payment_id}/${uploadSession.upload_token}/${crypto.randomUUID()}-${getSafeFileName(attachment.file.name)}`;
          const { error: uploadError } = await supabase.storage
            .from(paymentProofBucket)
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
            linked_type: "finance_confirmation",
            linked_id: uploadSession.payment_id,
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

      const reference = `IUR-${uploadSession.payment_id.slice(0, 8).toUpperCase()}`;
      setSubmissionReference(reference);
      setSaveState("saved");
      setSaveMessage(`Konfirmasi iuran diterima. Nomor konfirmasi ${reference}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konfirmasi iuran belum berhasil dikirim.";
      setSaveState("error");
      setSaveMessage(message);
    }
  }

  return (
    <section id="konfirmasi-iuran" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 xl:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Konfirmasi Iuran
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Kirim nominal dan bukti bayar ke bendahara.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Form ini khusus untuk pembayaran iuran. Pertanyaan atau klarifikasi tetap bisa dikirim melalui Layanan Warga.
          </p>
          <pre className="mt-5 whitespace-pre-wrap rounded-2xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
            {summary}
          </pre>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Nama warga</span>
              <input value={form.name} autoComplete="name" maxLength={120} onChange={(event) => updateField("name", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" placeholder="Nama penyetor" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Nomor WhatsApp</span>
              <input value={form.phone} type="tel" inputMode="tel" autoComplete="tel" maxLength={40} onChange={(event) => updateField("phone", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" placeholder="08xxxxxxxxxx" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Cluster</span>
              <input value={form.cluster} autoComplete="address-level3" maxLength={120} onChange={(event) => updateField("cluster", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" placeholder="Contoh: Cluster Aurora" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Blok / nomor rumah</span>
              <input value={form.blockOrUnit} maxLength={80} onChange={(event) => updateField("blockOrUnit", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" placeholder="Contoh: A1/12" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Bulan iuran</span>
              <select value={form.periodMonth} onChange={(event) => updateField("periodMonth", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary">
                {monthOptions.map((month, index) => (
                  <option key={month} value={String(index + 1)}>{month}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Tahun</span>
              <input value={form.periodYear} inputMode="numeric" maxLength={4} onChange={(event) => updateField("periodYear", event.target.value.replace(/[^\d]/g, "").slice(0, 4))} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Nominal bayar</span>
              <input value={form.amount} inputMode="numeric" onChange={(event) => updateField("amount", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" placeholder="Contoh: 150000" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Tanggal bayar</span>
              <input value={form.paidAt} type="date" onChange={(event) => updateField("paidAt", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Metode bayar</span>
              <select value={form.method} onChange={(event) => updateField("method", event.target.value as DuesForm["method"])} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary">
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
                <option value="cash">Cash</option>
                <option value="other">Lainnya</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Referensi transfer</span>
              <input value={form.referenceNo} maxLength={120} onChange={(event) => updateField("referenceNo", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" placeholder="Opsional" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Catatan</span>
              <textarea value={form.note} maxLength={1000} onChange={(event) => updateField("note", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none focus:border-primary" placeholder="Contoh: Bayar untuk 2 bulan / atas nama keluarga..." />
            </label>
            <div className="sm:col-span-2">
              <FileCaptureField
                id="bukti-iuran"
                label="Bukti pembayaran"
                description="Maksimal 4 foto, masing-masing 10 MB. Bukti tersimpan private untuk bendahara."
                attachments={attachments}
                onChange={(nextAttachments) => {
                  setAttachments(nextAttachments);
                  resetSubmissionState();
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={submitConfirmation}
            disabled={!isReady || saveState === "saving" || saveState === "saved"}
            className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {saveState === "saving" ? "Mengirim..." : saveState === "saved" ? "Konfirmasi terkirim" : "Kirim konfirmasi iuran"}
          </button>
          {saveMessage ? (
            <div role={saveState === "error" ? "alert" : "status"} aria-live="polite" className={`mt-4 rounded-xl border p-4 text-sm font-semibold ${saveState === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-primary/20 bg-primary-soft text-primary"}`}>
              {saveMessage}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
