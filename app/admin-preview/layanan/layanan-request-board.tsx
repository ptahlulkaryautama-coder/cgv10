"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/portal";
import {
  ActionButton,
  Panel,
  PanelHeader,
  StatusPill,
  cx,
} from "../components";

type RequestStatus = "Baru" | "Diproses" | "Validasi" | "Ditahan" | "Selesai";
type RequestPriority = "Normal" | "Tinggi";

type ServiceRequest = {
  id: string;
  title: string;
  category: string;
  channel: "Layanan" | "Kontak" | "Keuangan" | "PALUGADA";
  source: string;
  status: RequestStatus;
  priority: RequestPriority;
  owner: string;
  submittedAt: string;
  sla: string;
  note: string;
};

const initialRequests: ServiceRequest[] = [
  {
    id: "LYN-001",
    title: "Surat domisili",
    category: "Administrasi",
    channel: "Layanan",
    source: "Warga Cluster Aurora",
    status: "Baru",
    priority: "Normal",
    owner: "Sekretariat",
    submittedAt: "01 Jul 2026",
    sla: "2 hari",
    note: "Butuh template surat dan validasi data pemohon.",
  },
  {
    id: "LYN-002",
    title: "Lampu jalan padam",
    category: "Fasilitas",
    channel: "Layanan",
    source: "Blok Greenwich",
    status: "Diproses",
    priority: "Tinggi",
    owner: "Keamanan",
    submittedAt: "30 Jun 2026",
    sla: "Hari ini",
    note: "Perlu cek titik lampu dan koordinasi teknisi.",
  },
  {
    id: "LYN-003",
    title: "Pendaftaran lapak PALUGADA",
    category: "PALUGADA",
    channel: "PALUGADA",
    source: "Cluster Meteora",
    status: "Validasi",
    priority: "Normal",
    owner: "Pengurus",
    submittedAt: "30 Jun 2026",
    sla: "3 hari",
    note: "Menunggu foto produk dan nomor WhatsApp yang aktif.",
  },
  {
    id: "LYN-004",
    title: "Aspirasi keamanan malam",
    category: "Aspirasi",
    channel: "Layanan",
    source: "Warga Cluster Pinnata",
    status: "Diproses",
    priority: "Normal",
    owner: "Keamanan",
    submittedAt: "29 Jun 2026",
    sla: "5 hari",
    note: "Masuk agenda koordinasi keamanan pekan ini.",
  },
  {
    id: "LYN-005",
    title: "Konfirmasi iuran warga",
    category: "Keuangan",
    channel: "Keuangan",
    source: "Cluster Colloseum",
    status: "Selesai",
    priority: "Normal",
    owner: "Bendahara",
    submittedAt: "28 Jun 2026",
    sla: "1 hari",
    note: "Sudah dicocokkan dengan buku kas bendahara.",
  },
  {
    id: "LYN-006",
    title: "Kontak bendahara dari halaman Kontak",
    category: "Keuangan",
    channel: "Kontak",
    source: "Cluster Aurora",
    status: "Baru",
    priority: "Normal",
    owner: "Bendahara",
    submittedAt: "01 Jul 2026",
    sla: "1 hari",
    note: "Warga meminta arahan PIC untuk pertanyaan iuran dan bukti pembayaran.",
  },
  {
    id: "LYN-007",
    title: "Update data warga baru",
    category: "Administrasi",
    channel: "Layanan",
    source: "Cluster Pinnata",
    status: "Baru",
    priority: "Normal",
    owner: "Data Warga",
    submittedAt: "01 Jul 2026",
    sla: "2 hari",
    note: "Perlu cek kontak keluarga, kendaraan, dan status domisili.",
  },
  {
    id: "LYN-008",
    title: "Keluhan akses tamu malam",
    category: "Keamanan",
    channel: "Kontak",
    source: "Blok Utama",
    status: "Validasi",
    priority: "Tinggi",
    owner: "Keamanan",
    submittedAt: "01 Jul 2026",
    sla: "Hari ini",
    note: "Butuh validasi kronologi sebelum diteruskan ke jadwal patroli.",
  },
];

const statuses = ["Semua", "Baru", "Diproses", "Validasi", "Ditahan", "Selesai"] as const;
const categories = [
  "Semua",
  "Administrasi",
  "Fasilitas",
  "PALUGADA",
  "Aspirasi",
  "Keuangan",
  "Keamanan",
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function PriorityPill({ value }: { value: RequestPriority }) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold",
        value === "Tinggi"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-border bg-white text-muted",
      )}
    >
      {value}
    </span>
  );
}

export function LayananRequestBoard() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Semua");
  const [category, setCategory] = useState<(typeof categories)[number]>("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftRequest, setDraftRequest] = useState<ServiceRequest | null>(null);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = normalize(query);

    return requests.filter((request) => {
      const content = [
        request.id,
        request.title,
        request.category,
        request.channel,
        request.source,
        request.owner,
        request.status,
        request.note,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || content.includes(normalizedQuery)) &&
        (status === "Semua" || request.status === status) &&
        (category === "Semua" || request.category === category)
      );
    });
  }, [category, query, requests, status]);

  function openRequest(request: ServiceRequest) {
    setSelectedId(request.id);
    setDraftRequest({ ...request });
  }

  function closeRequest() {
    setDraftRequest(null);
  }

  function updateSelected(updates: Partial<ServiceRequest>) {
    if (!draftRequest) return;

    const nextRequest = { ...draftRequest, ...updates };
    setRequests((current) =>
      current.map((request) =>
        request.id === nextRequest.id ? nextRequest : request,
      ),
    );
    setDraftRequest(nextRequest);
    setSelectedId(nextRequest.id);
  }

  function updateRequestById(id: string, updates: Partial<ServiceRequest>) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, ...updates } : request,
      ),
    );
  }

  function updateDraft<K extends keyof ServiceRequest>(
    field: K,
    value: ServiceRequest[K],
  ) {
    setDraftRequest((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  function saveDraft() {
    if (!draftRequest) return;

    setRequests((current) =>
      current.map((request) =>
        request.id === draftRequest.id ? draftRequest : request,
      ),
    );
    setSelectedId(draftRequest.id);
  }

  const countByStatus = (target: RequestStatus) =>
    requests.filter((request) => request.status === target).length;

  return (
    <section id="request-queue" className="scroll-mt-24">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Request Queue"
          subtitle="Filter request warga, lalu buka item untuk edit, assign PIC, dan ubah status."
          action={<ActionButton href="/layanan/#form-layanan">Buka form publik</ActionButton>}
        />

        <div className="border-y border-border bg-[#f8f6f0] p-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-5">
            {[
              ["Baru", countByStatus("Baru"), "bg-blue-50 text-blue-700"],
              ["Diproses", countByStatus("Diproses"), "bg-accent-soft text-foreground"],
              ["Validasi", countByStatus("Validasi"), "bg-purple-50 text-purple-700"],
              ["Ditahan", countByStatus("Ditahan"), "bg-red-50 text-red-700"],
              ["Selesai", countByStatus("Selesai"), "bg-primary text-accent"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-[14px] border border-black/8 bg-white p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  {label}
                </p>
                <p className={cx("mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold", String(tone))}>
                  {value} item
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <label htmlFor="layanan-search" className="sr-only">
              Cari request layanan
            </label>
            <input
              id="layanan-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari request, cluster, PIC, status..."
              className="min-h-10 rounded-[10px] border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof categories)[number])
              }
              className="min-h-10 cursor-pointer rounded-[10px] border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary"
              aria-label="Filter kategori layanan"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("Semua");
                setCategory("Semua");
              }}
              className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={cx(
                  "min-h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  status === item
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Kanal</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">PIC</th>
                <th className="px-5 py-3">Prioritas</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const isSelected = selectedId === request.id;

                return (
                  <tr
                    key={request.id}
                    onClick={() => openRequest(request)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openRequest(request);
                      }
                    }}
                    tabIndex={0}
                    className={cx(
                      "cursor-pointer border-b border-border last:border-b-0 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                      isSelected && "bg-primary-soft/45",
                    )}
                  >
                    <td className="px-5 py-4 font-semibold text-muted">{request.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">{request.title}</p>
                      <p className="mt-1 text-xs text-muted">{request.source}</p>
                      <Link
                        href={`#layanan-request-${request.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-3 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Buka detail
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-foreground">
                        {request.channel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{request.category}</td>
                    <td className="px-5 py-4"><StatusPill>{request.status}</StatusPill></td>
                    <td className="px-5 py-4 text-muted">{request.owner}</td>
                    <td className="px-5 py-4"><PriorityPill value={request.priority} /></td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`#layanan-request-${request.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Buka
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm font-semibold text-muted"
                  >
                    Tidak ada request yang cocok dengan filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      {filteredRequests.map((request) => (
        <div
          key={request.id}
          id={`layanan-request-${request.id}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {request.id} - {request.channel}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {request.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{request.source}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{request.status}</StatusPill>
                <Link
                  href="#request-queue"
                  className="min-h-9 rounded-[10px] border border-black/10 bg-white px-4 py-2 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Tutup
                </Link>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4">
                <div className="rounded-[16px] border border-black/8 bg-white p-4">
                  <dl className="grid gap-3 text-sm">
                    {[
                      ["PIC", request.owner],
                      ["Masuk", request.submittedAt],
                      ["Kategori", request.category],
                      ["Target respon", request.sla],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-t border-border pt-3 first:border-t-0 first:pt-0"
                      >
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-right font-bold text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-[16px] border border-accent/35 bg-accent-soft p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Catatan tindak lanjut
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{request.note}</p>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      updateRequestById(request.id, {
                        status: "Diproses",
                        owner: request.owner === "Pengurus" ? "PIC terkait" : request.owner,
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Mark on progress
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateRequestById(request.id, {
                        status: "Ditahan",
                        priority: "Tinggi",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 transition-colors hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    On hold
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateRequestById(request.id, {
                        status: "Validasi",
                        priority: "Tinggi",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Minta validasi
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateRequestById(request.id, {
                        status: "Selesai",
                        priority: "Normal",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold text-primary transition-colors hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Finished
                  </button>
                </div>
              </div>

              <aside className="grid gap-4 self-start">
                <div className="rounded-[16px] border border-black/8 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                      <Icon name="message" />
                    </span>
                    <PriorityPill value={request.priority} />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted">
                    Modal ini bisa terbuka tanpa JavaScript. Tombol status tetap
                    membutuhkan mode interaktif aktif.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ))}

      {draftRequest ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="layanan-request-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
          onClick={closeRequest}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {draftRequest.id} - {draftRequest.channel}
                </p>
                <h3
                  id="layanan-request-modal-title"
                  className="mt-2 text-2xl font-bold tracking-tight text-foreground"
                >
                  {draftRequest.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{draftRequest.source}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{draftRequest.status}</StatusPill>
                <button
                  type="button"
                  onClick={closeRequest}
                  className="min-h-9 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Judul request
                    <input
                      value={draftRequest.title}
                      onChange={(event) => updateDraft("title", event.target.value)}
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Sumber
                    <input
                      value={draftRequest.source}
                      onChange={(event) => updateDraft("source", event.target.value)}
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Kategori
                    <select
                      value={draftRequest.category}
                      onChange={(event) => updateDraft("category", event.target.value)}
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {categories.filter((item) => item !== "Semua").map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    PIC
                    <select
                      value={draftRequest.owner}
                      onChange={(event) => updateDraft("owner", event.target.value)}
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {[
                        "Sekretariat",
                        "Keamanan",
                        "Bendahara",
                        "Data Warga",
                        "Pengurus",
                        "PIC terkait",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Status
                    <select
                      value={draftRequest.status}
                      onChange={(event) =>
                        updateDraft("status", event.target.value as RequestStatus)
                      }
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {statuses.filter((item) => item !== "Semua").map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Prioritas
                    <select
                      value={draftRequest.priority}
                      onChange={(event) =>
                        updateDraft("priority", event.target.value as RequestPriority)
                      }
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      <option>Normal</option>
                      <option>Tinggi</option>
                    </select>
                  </label>
                </div>

                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Catatan tindak lanjut
                  <textarea
                    value={draftRequest.note}
                    onChange={(event) => updateDraft("note", event.target.value)}
                    rows={5}
                    className="resize-y rounded-[10px] border border-black/10 bg-white px-4 py-3 text-sm normal-case leading-6 tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>

                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-[13px] font-bold text-accent transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Simpan perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected({
                        status: "Diproses",
                        owner: draftRequest.owner === "Pengurus" ? "PIC terkait" : draftRequest.owner,
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Mark on progress
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelected({ status: "Ditahan", priority: "Tinggi" })}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 transition-colors hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    On hold
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelected({ status: "Validasi", priority: "Tinggi" })}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Minta validasi
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelected({ status: "Selesai", priority: "Normal" })}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold text-primary transition-colors hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Finished
                  </button>
                </div>
              </div>

              <aside className="grid gap-4 self-start">
                <div className="rounded-[16px] border border-black/8 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                      <Icon name="message" />
                    </span>
                    <PriorityPill value={draftRequest.priority} />
                  </div>
                  <dl className="mt-5 grid gap-3 text-sm">
                    {[
                      ["Masuk", draftRequest.submittedAt],
                      ["Kanal", draftRequest.channel],
                      ["Target respon", draftRequest.sla],
                      ["Kategori", draftRequest.category],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-t border-border pt-3"
                      >
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-right font-bold text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-[16px] border border-accent/35 bg-accent-soft p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Action model
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Perubahan disimpan ke state sesi admin. Pola modal ini bisa
                    dipakai ulang untuk iuran, publikasi, PALUGADA, dan dokumen.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
