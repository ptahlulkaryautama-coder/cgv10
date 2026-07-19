"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  FileCaptureField,
  type CaptureAttachment,
} from "../components/file-capture-field";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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
    title: "Laporkan Kendala",
    label: "Laporan lingkungan",
    icon: "message",
    priority: "Tinggi",
    helper: "Lampu padam, fasilitas umum, kebersihan, keamanan, atau kondisi area.",
  },
  {
    id: "pendaftaran",
    title: "Update Data Warga",
    label: "Data warga",
    icon: "users",
    priority: "Administrasi",
    helper: "Warga baru, perubahan kontak, kendaraan, atau data keluarga.",
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
    helper: "Ide, masukan, prioritas kegiatan, atau hal yang bisa dibuat lebih enak untuk warga.",
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

const serviceCategoryByType: Record<string, string> = {
  keluhan: "pengaduan",
  pendaftaran: "administrasi",
  administrasi: "administrasi",
  keamanan: "keamanan",
  aspirasi: "aspirasi",
};

const servicePriorityByType: Record<RequestType["priority"], "normal" | "high" | "urgent"> = {
  Normal: "normal",
  Tinggi: "high",
  Administrasi: "normal",
};

const serviceAttachmentBucket = "service-request-attachments";
const maxAttachmentSize = 10 * 1024 * 1024;

type ServiceUploadSession = {
  request_id: string;
  upload_token: string;
};

function getSafeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const baseName = fileName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "foto-layanan";
  return `${baseName}.${extension}`;
}

function getUploadContentType(file: File) {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "heic" ? "image/heic" : extension === "heif" ? "image/heif" : "image/jpeg";
}

function isAcceptedAttachment(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}

function subscribeToUrlChanges(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("hashchange", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function getClientRequestTypeId() {
  return new URLSearchParams(window.location.search).get("jenis");
}

function getServerRequestTypeId() {
  return null;
}

function buildMessage(
  type: RequestType,
  form: typeof initialForm,
  attachments: CaptureAttachment[],
  reference: string,
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
        ? `${attachments.length} foto tersimpan bersama laporan`
        : "-"
    }`,
    reference ? `Nomor laporan: ${reference}` : "",
    "",
    "Mohon dibantu tindak lanjutnya. Terima kasih.",
  ].join("\n");
}

export function ServiceRequestForm() {
  const requestedTypeId = useSyncExternalStore(
    subscribeToUrlChanges,
    getClientRequestTypeId,
    getServerRequestTypeId,
  );
  const routeSelectedTypeId =
    requestedTypeId &&
    requestTypes.some((type) => type.id === requestedTypeId)
      ? requestedTypeId
      : requestTypes[0].id;
  const [manualSelectedTypeId, setManualSelectedTypeId] = useState<
    string | null
  >(null);
  const [form, setForm] = useState(initialForm);
  const [attachments, setAttachments] = useState<CaptureAttachment[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [submissionReference, setSubmissionReference] = useState("");
  const uploadSessionRef = useRef<ServiceUploadSession | null>(null);
  const uploadedPathsRef = useRef<Record<string, string>>({});
  const registeredAttachmentIdsRef = useRef(new Set<string>());

  const selectedTypeId = manualSelectedTypeId ?? routeSelectedTypeId;
  const selectedType =
    requestTypes.find((type) => type.id === selectedTypeId) ?? requestTypes[0];

  const message = useMemo(
    () => buildMessage(selectedType, form, attachments, submissionReference),
    [attachments, form, selectedType, submissionReference],
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
    setSaveState("idle");
    setSaveMessage("");
    setSubmissionReference("");
    uploadSessionRef.current = null;
    uploadedPathsRef.current = {};
    registeredAttachmentIdsRef.current.clear();
  }

  async function submitToSupabase() {
    if (!isReady) {
      setSaveState("error");
      setSaveMessage("Ada bagian wajib yang belum diisi. Cek nama, cluster, WhatsApp, dan detail kebutuhan.");
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
    setSaveMessage("Mengirim permintaan ke pengurus...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userError || !userId) {
        throw new Error("Masuk dulu supaya laporan nyambung ke akun warga.");
      }

      let uploadSession = uploadSessionRef.current;

      if (!uploadSession) {
        const { data, error } = await supabase.rpc("submit_service_request", {
          p_category: serviceCategoryByType[selectedType.id] ?? "lainnya",
          p_title: form.subject.trim() || selectedType.title,
          p_description: [
            `Jenis layanan: ${selectedType.title}`,
            `Nama warga: ${form.name.trim()}`,
            `Cluster/blok: ${form.cluster.trim()}`,
            `Kontak WhatsApp: ${form.phone.trim()}`,
            `Waktu dihubungi: ${form.availability.trim() || "-"}`,
            "",
            form.detail.trim(),
          ].join("\n"),
          p_priority: servicePriorityByType[selectedType.priority],
        });

        if (error) throw error;
        uploadSession = ((data ?? []) as ServiceUploadSession[])[0] ?? null;
        if (!uploadSession) throw new Error("Nomor laporan belum berhasil dibuat.");
        uploadSessionRef.current = uploadSession;
      }

      for (const [index, attachment] of attachments.entries()) {
        setSaveMessage(`Mengunggah foto ${index + 1} dari ${attachments.length}...`);
        let storagePath = uploadedPathsRef.current[attachment.id];

        if (!storagePath) {
          storagePath = `${uploadSession.request_id}/${uploadSession.upload_token}/${crypto.randomUUID()}-${getSafeFileName(attachment.file.name)}`;
          const { error: uploadError } = await supabase.storage
            .from(serviceAttachmentBucket)
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
            linked_type: "service_request",
            linked_id: uploadSession.request_id,
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

      const reference = `LYN-${uploadSession.request_id.slice(0, 8).toUpperCase()}`;
      setSubmissionReference(reference);
      setSaveState("saved");
      setSaveMessage(
        attachments.length > 0
          ? `Laporan masuk bersama ${attachments.length} foto. Simpan nomor ${reference} kalau nanti perlu tanya progres.`
          : `Laporan masuk. Simpan nomor ${reference} kalau nanti perlu tanya progres.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Permintaan belum berhasil dikirim. Coba ulangi sebentar lagi.";
      setSaveState("error");
      setSaveMessage(message);
    }
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
              Pilih kebutuhan, tulis ceritanya singkat, lalu kirim ke pengurus.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted">
              Permintaan akan masuk ke catatan pengurus. WhatsApp hanya untuk
              konfirmasi tambahan kalau memang diperlukan.
            </p>
            <div className="mt-6 rounded-2xl border border-accent/35 bg-accent-soft/55 p-5">
              <p className="text-sm font-semibold text-foreground">
                Perlu arahan pengurus?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Kalau belum yakin masuk kategori mana, cek kontak cepat dulu.
                Lebih baik tanya sebentar daripada laporan masuk ke jalur yang
                salah.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/kontak/#kontak-cepat"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
                >
                  Buka kontak cepat
                </Link>
                <Link
                  href="/keuangan/#konfirmasi-iuran"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent-soft"
                >
                  Konfirmasi iuran
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {requestTypes.map((type) => {
                const selected = type.id === selectedType.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setManualSelectedTypeId(type.id)}
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
                  autoComplete="name"
                  maxLength={100}
                  onChange={(event) => updateField("name", event.target.value)}
                  onInput={(event) => updateField("name", event.currentTarget.value)}
                  placeholder="Nama lengkap warga"
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Cluster / blok</span>
                <input
                  value={form.cluster}
                  autoComplete="address-level3"
                  maxLength={120}
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
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
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
                  maxLength={160}
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
                  maxLength={3000}
                  onChange={(event) => updateField("detail", event.target.value)}
                  onInput={(event) => updateField("detail", event.currentTarget.value)}
                  placeholder="Tulis lokasi, jam kejadian, atau detail penting. Tidak perlu panjang, yang penting jelas."
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none transition-colors duration-200 focus:border-primary"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-foreground">Waktu yang bisa dihubungi</span>
                <input
                  value={form.availability}
                  maxLength={160}
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
                  description="Maksimal 4 foto, masing-masing 10 MB. Foto membantu pengurus melihat kondisi tanpa harus menebak dari teks saja."
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

            <div className="mt-5 rounded-2xl border border-accent/35 bg-accent-soft/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Ringkasan permintaan
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
              <button
                type="button"
                onClick={submitToSupabase}
                disabled={!isReady || saveState === "saving" || saveState === "saved"}
                className={[
                  "mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
                  isReady
                    ? "cursor-pointer bg-primary text-white hover:bg-primary-hover"
                    : "cursor-not-allowed bg-muted/20 text-muted",
                ].join(" ")}
              >
                {saveState === "saving" ? "Mengirim..." : saveState === "saved" ? "Permintaan terkirim" : "Kirim permintaan"}
              </button>
              <p className="mt-3 text-xs leading-5 text-muted">
                Tombol aktif setelah nama, cluster, WhatsApp, dan detail
                kebutuhan terisi.
              </p>
              {saveMessage ? (
                <div
                  role={saveState === "error" ? "alert" : "status"}
                  aria-live="polite"
                  className={[
                    "mt-4 rounded-xl border p-4",
                    saveState === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-primary/20 bg-background text-primary",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold">{saveMessage}</p>
                </div>
              ) : null}
              {saveState === "saved" ? (
                <div className="mt-4 rounded-xl border border-primary/20 bg-background p-4">
                  <p className="text-sm font-semibold text-primary">
                    Simpan nomor laporan: {submissionReference}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Pengurus sudah menerima permintaan dan foto. WhatsApp hanya dipakai kalau Anda ingin menambahkan konfirmasi.
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
          </div>
        </div>
      </div>
    </section>
  );
}
