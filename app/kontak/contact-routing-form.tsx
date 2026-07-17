"use client";

import { useMemo, useState } from "react";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type ContactRoute = {
  id: string;
  title: string;
  label: string;
  icon: IconName;
  helper: string;
};

type ContactSubmissionResult = {
  request_id: string;
  upload_token: string;
};

const contactRoutes: ContactRoute[] = [
  {
    id: "layanan",
    title: "Layanan Warga",
    label: "Laporan & administrasi",
    icon: "message",
    helper: "Keluhan, surat, data warga, dan aspirasi lingkungan.",
  },
  {
    id: "keamanan",
    title: "Keamanan",
    label: "Prioritas lingkungan",
    icon: "shield",
    helper: "Akses tamu, kendaraan, lampu jalan, dan kondisi area bersama.",
  },
  {
    id: "iuran",
    title: "Iuran & Kas",
    label: "Bendahara",
    icon: "wallet",
    helper: "Konfirmasi iuran, pertanyaan kas, atau bukti pembayaran.",
  },
  {
    id: "palugada",
    title: "PALUGADA",
    label: "Katalog warga",
    icon: "store",
    helper: "Kontak lapak, pendaftaran usaha, dan informasi katalog.",
  },
  {
    id: "pengurus",
    title: "Pengurus",
    label: "Koordinasi umum",
    icon: "users",
    helper: "Pertanyaan umum yang perlu diarahkan ke pengurus RT.",
  },
];

const initialForm = {
  name: "",
  cluster: "",
  phone: "",
  message: "",
};

const contactCategoryByRoute: Record<string, string> = {
  layanan: "lainnya",
  keamanan: "keamanan",
  iuran: "iuran",
  palugada: "palugada",
  pengurus: "aspirasi",
};

function buildMessage(
  route: ContactRoute,
  form: typeof initialForm,
  reference: string,
) {
  return [
    "Halo Pengurus CGV10, saya ingin menghubungi kanal resmi.",
    "",
    `Kanal: ${route.title}`,
    `Nama warga: ${form.name || "-"}`,
    `Cluster/blok: ${form.cluster || "-"}`,
    `Kontak balik: ${form.phone || "-"}`,
    `Pesan: ${form.message || "-"}`,
    reference ? `Nomor pesan: ${reference}` : "",
    "",
    "Mohon diarahkan ke PIC yang sesuai. Terima kasih.",
  ].join("\n");
}

export function ContactRoutingForm() {
  const [routeId, setRouteId] = useState(contactRoutes[0].id);
  const [form, setForm] = useState(initialForm);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [submissionReference, setSubmissionReference] = useState("");

  const selectedRoute =
    contactRoutes.find((route) => route.id === routeId) ?? contactRoutes[0];
  const message = useMemo(
    () => buildMessage(selectedRoute, form, submissionReference),
    [form, selectedRoute, submissionReference],
  );
  const ready = Boolean(
    form.name.trim() && form.cluster.trim() && form.phone.trim() && form.message.trim(),
  );
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  const completedFields = [
    form.name.trim(),
    form.cluster.trim(),
    form.phone.trim(),
    form.message.trim(),
  ].filter(Boolean).length;

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveState("idle");
    setSaveMessage("");
    setSubmissionReference("");
  }

  function selectRoute(nextRouteId: string) {
    setRouteId(nextRouteId);
    setSaveState("idle");
    setSaveMessage("");
    setSubmissionReference("");
  }

  async function submitToSupabase() {
    if (!ready) {
      setSaveState("error");
      setSaveMessage("Lengkapi nama, cluster, kontak balik, dan pesan terlebih dahulu.");
      return;
    }

    setSaveState("saving");
    setSaveMessage("Menyimpan pesan kontak...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user?.id) {
        throw new Error("Masuk sebagai warga terlebih dahulu sebelum mengirim pesan layanan.");
      }

      const { data, error } = await supabase.rpc("submit_service_request", {
        p_category: contactCategoryByRoute[selectedRoute.id] ?? "lainnya",
        p_title: `Kontak cepat - ${selectedRoute.title}`,
        p_description: [
          `Kanal: ${selectedRoute.title}`,
          `Nama warga: ${form.name.trim()}`,
          `Cluster/blok: ${form.cluster.trim()}`,
          `Kontak balik: ${form.phone.trim()}`,
          "",
          form.message.trim(),
        ].join("\n"),
        p_priority: selectedRoute.id === "keamanan" ? "high" : "normal",
      });

      if (error) throw error;
      const result = ((data ?? []) as ContactSubmissionResult[])[0] ?? null;
      if (!result) throw new Error("Nomor pesan belum berhasil dibuat.");

      const reference = `PSN-${result.request_id.slice(0, 8).toUpperCase()}`;
      setSubmissionReference(reference);
      setSaveState("saved");
      setSaveMessage(`Pesan sudah diterima. Nomor pesan ${reference}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan pesan kontak.";
      setSaveState("error");
      setSaveMessage(message);
    }
  }

  return (
    <section id="kontak-cepat" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-20 xl:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Kontak Cepat
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Pilih kanal agar pesan warga langsung punya konteks.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            Pesan akan tersimpan dan juga dapat diteruskan melalui WhatsApp
            agar warga bisa langsung menghubungi pengurus.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {contactRoutes.map((route) => {
              const selected = route.id === selectedRoute.id;

              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => selectRoute(route.id)}
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
                        "grid h-11 w-11 place-items-center rounded-xl",
                        selected ? "bg-white/12 text-accent-soft" : "bg-primary-soft text-primary",
                      ].join(" ")}
                    >
                      <Icon name={route.icon} />
                    </span>
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                      {route.label}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{route.title}</h3>
                  <p className={["mt-2 text-sm leading-6", selected ? "text-white/78" : "text-muted"].join(" ")}>
                    {route.helper}
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
                placeholder="Nama lengkap"
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
                placeholder="Contoh: Cluster Aurora"
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Kontak balik</span>
              <input
                value={form.phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                onChange={(event) => updateField("phone", event.target.value)}
                onInput={(event) => updateField("phone", event.currentTarget.value)}
                placeholder="Nomor WhatsApp"
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Pesan</span>
              <textarea
                value={form.message}
                maxLength={3000}
                onChange={(event) => updateField("message", event.target.value)}
                onInput={(event) => updateField("message", event.currentTarget.value)}
                rows={5}
                placeholder="Tulis kebutuhan singkat agar pengurus bisa mengarahkan ke PIC yang tepat."
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none transition-colors duration-200 focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-5 rounded-2xl border border-accent/35 bg-accent-soft/55 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Ringkasan pesan
              </p>
              <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
                {completedFields}/4 wajib
              </span>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
              {message}
            </pre>
            <button
              type="button"
              onClick={submitToSupabase}
              disabled={!ready || saveState === "saving" || saveState === "saved"}
              className={[
                "mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
                ready
                  ? "cursor-pointer bg-primary text-white hover:bg-primary-hover"
                  : "cursor-not-allowed bg-muted/20 text-muted",
              ].join(" ")}
            >
              {saveState === "saving" ? "Mengirim..." : saveState === "saved" ? "Pesan terkirim" : "Kirim pesan"}
            </button>
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
                  Simpan nomor pesan: {submissionReference}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Pesan sudah diarahkan ke {selectedRoute.title}. Gunakan WhatsApp hanya jika Anda ingin mengirim konfirmasi tambahan.
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
    </section>
  );
}
