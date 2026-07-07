"use client";

import { useMemo, useState } from "react";
import { ActionButton, Panel, PanelHeader, StatusPill, cx } from "../components";

type ConfirmationStatus = "Perlu cocokkan" | "Valid" | "Butuh klarifikasi";
type ConfirmationChannel = "Layanan" | "Kontak" | "WhatsApp";

type IuranConfirmation = {
  id: string;
  resident: string;
  cluster: string;
  period: string;
  amount: string;
  paidAt: string;
  channel: ConfirmationChannel;
  status: ConfirmationStatus;
  owner: string;
  note: string;
};

const initialConfirmations: IuranConfirmation[] = [
  {
    id: "IUR-001",
    resident: "Pak Ardi",
    cluster: "Cluster Aurora",
    period: "Juni 2026",
    amount: "Rp350.000",
    paidAt: "01 Jul 2026, 08.15",
    channel: "Layanan",
    status: "Perlu cocokkan",
    owner: "Bendahara",
    note: "Warga mengirim draft konfirmasi dari form layanan. Perlu cocokkan mutasi dan nama rekening.",
  },
  {
    id: "IUR-002",
    resident: "Bu Rani",
    cluster: "Cluster Colloseum",
    period: "Juni 2026",
    amount: "Rp350.000",
    paidAt: "30 Jun 2026, 19.40",
    channel: "Kontak",
    status: "Butuh klarifikasi",
    owner: "Bendahara",
    note: "Nominal sesuai, tetapi periode pembayaran belum disebutkan di pesan kontak.",
  },
  {
    id: "IUR-003",
    resident: "Pak Bima",
    cluster: "Cluster Greenwich",
    period: "Mei 2026",
    amount: "Rp350.000",
    paidAt: "29 Jun 2026, 12.04",
    channel: "WhatsApp",
    status: "Valid",
    owner: "Bendahara",
    note: "Sudah cocok dengan ledger iuran dan siap masuk ringkasan publik.",
  },
  {
    id: "IUR-004",
    resident: "Bu Maya",
    cluster: "Cluster Meteora",
    period: "Juni 2026",
    amount: "Rp700.000",
    paidAt: "01 Jul 2026, 10.22",
    channel: "Layanan",
    status: "Perlu cocokkan",
    owner: "Bendahara",
    note: "Kemungkinan pembayaran dua bulan. Perlu pisahkan periode sebelum ditandai valid.",
  },
];

const statuses = ["Semua", "Perlu cocokkan", "Valid", "Butuh klarifikasi"] as const;
const channels = ["Semua", "Layanan", "Kontak", "WhatsApp"] as const;

function statusTone(status: ConfirmationStatus) {
  return status === "Valid"
    ? "border-emerald-200 bg-emerald-50 text-primary"
    : status === "Butuh klarifikasi"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-accent/35 bg-accent-soft text-foreground";
}

export function IuranConfirmationBoard() {
  const [items, setItems] = useState<IuranConfirmation[]>(initialConfirmations);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Semua");
  const [channel, setChannel] = useState<(typeof channels)[number]>("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<IuranConfirmation | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const content = [
        item.id,
        item.resident,
        item.cluster,
        item.period,
        item.amount,
        item.channel,
        item.status,
        item.note,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || content.includes(normalizedQuery)) &&
        (status === "Semua" || item.status === status) &&
        (channel === "Semua" || item.channel === channel)
      );
    });
  }, [channel, items, query, status]);

  const countByStatus = (target: ConfirmationStatus) =>
    items.filter((item) => item.status === target).length;

  function updateSelected(updates: Partial<IuranConfirmation>) {
    if (!draftItem) return;

    const nextItem = { ...draftItem, ...updates };
    setItems((current) =>
      current.map((item) =>
        item.id === nextItem.id ? nextItem : item,
      ),
    );
    setDraftItem(nextItem);
    setSelectedId(nextItem.id);
  }

  function updateItemById(id: string, updates: Partial<IuranConfirmation>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function openItem(item: IuranConfirmation) {
    setSelectedId(item.id);
    setDraftItem({ ...item });
  }

  function closeItem() {
    setDraftItem(null);
  }

  function updateDraft<K extends keyof IuranConfirmation>(
    field: K,
    value: IuranConfirmation[K],
  ) {
    setDraftItem((current) => (current ? { ...current, [field]: value } : current));
  }

  function saveDraft() {
    if (!draftItem) return;

    setItems((current) =>
      current.map((item) => (item.id === draftItem.id ? draftItem : item)),
    );
    setSelectedId(draftItem.id);
  }

  return (
    <section className="mb-5">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Konfirmasi Iuran Masuk"
          subtitle="Antrian bukti iuran. Buka item untuk cocokkan, edit data, validasi, atau minta klarifikasi."
          action={<ActionButton href="/layanan/#form-layanan">Buka form warga</ActionButton>}
        />

        <div className="border-y border-border bg-[#f8f6f0] p-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Perlu cocokkan", countByStatus("Perlu cocokkan"), "bg-accent-soft text-foreground"],
              ["Valid", countByStatus("Valid"), "bg-primary text-accent"],
              ["Klarifikasi", countByStatus("Butuh klarifikasi"), "bg-red-50 text-red-700"],
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

          <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px]">
            <label className="sr-only" htmlFor="iuran-search">
              Cari konfirmasi iuran
            </label>
            <input
              id="iuran-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Cari nama, cluster, periode, nominal..."
              className="min-h-10 rounded-[10px] border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as (typeof statuses)[number])
              }
              aria-label="Filter status iuran"
              className="min-h-10 cursor-pointer rounded-[10px] border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value as (typeof channels)[number])
              }
              aria-label="Filter kanal iuran"
              className="min-h-10 cursor-pointer rounded-[10px] border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {channels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Warga</th>
                <th className="px-5 py-3">Periode</th>
                <th className="px-5 py-3 text-right">Nominal</th>
                <th className="px-5 py-3">Kanal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isSelected = selectedId === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => openItem(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openItem(item);
                        }
                      }}
                      tabIndex={0}
                      className={cx(
                        "cursor-pointer border-b border-border last:border-b-0 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        isSelected && "bg-primary-soft/45",
                      )}
                    >
                      <td className="px-5 py-4 font-semibold text-muted">{item.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">{item.resident}</p>
                        <p className="mt-1 text-xs text-muted">{item.cluster}</p>
                        <a
                          href={`#iuran-confirmation-${item.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-3 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Buka detail
                        </a>
                      </td>
                      <td className="px-5 py-4 text-muted">{item.period}</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-700">
                        {item.amount}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-foreground">
                          {item.channel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cx("inline-flex rounded-full border px-3 py-1 text-xs font-bold", statusTone(item.status))}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`#iuran-confirmation-${item.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Buka
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-muted">
                    Tidak ada konfirmasi iuran yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {filteredItems.map((item) => (
        <div
          key={item.id}
          id={`iuran-confirmation-${item.id}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {item.id} - {item.channel}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {item.resident}
                </h3>
                <p className="mt-1 text-sm text-muted">{item.cluster}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{item.status}</StatusPill>
                <a
                  href="#"
                  className="min-h-9 rounded-[10px] border border-black/10 bg-white px-4 py-2 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Tutup
                </a>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4">
                <div className="rounded-[16px] border border-black/8 bg-white p-4">
                  <dl className="grid gap-3 text-sm">
                    {[
                      ["Periode", item.period],
                      ["Nominal", item.amount],
                      ["Dibayar", item.paidAt],
                      ["PIC", item.owner],
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
                    Catatan bendahara
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{item.note}</p>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      updateItemById(item.id, {
                        status: "Valid",
                        note: "Sudah cocok dengan mutasi dan siap dimasukkan ke ledger iuran.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold text-primary transition-colors hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Tandai valid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateItemById(item.id, {
                        status: "Butuh klarifikasi",
                        note: "Minta warga melengkapi periode, nama rekening, atau bukti transfer.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 transition-colors hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Minta klarifikasi
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateItemById(item.id, {
                        status: "Perlu cocokkan",
                        note: "Masukkan kembali ke antrian cocokkan mutasi bendahara.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Kembalikan ke cocokkan
                  </button>
                </div>
              </div>

              <aside className="rounded-[16px] border border-black/8 bg-white p-4 self-start">
                <p className="text-sm leading-6 text-muted">
                  Detail ini bisa terbuka tanpa JavaScript. Perubahan status
                  tetap membutuhkan mode interaktif aktif.
                </p>
              </aside>
            </div>
          </div>
        </div>
      ))}

      {draftItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="iuran-confirmation-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
          onClick={closeItem}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {draftItem.id} - {draftItem.channel}
                </p>
                <h3
                  id="iuran-confirmation-modal-title"
                  className="mt-2 text-2xl font-bold tracking-tight text-foreground"
                >
                  {draftItem.resident}
                </h3>
                <p className="mt-1 text-sm text-muted">{draftItem.cluster}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{draftItem.status}</StatusPill>
                <button
                  type="button"
                  onClick={closeItem}
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
                    Nama warga
                    <input
                      value={draftItem.resident}
                      onChange={(event) => updateDraft("resident", event.target.value)}
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Cluster
                    <input
                      value={draftItem.cluster}
                      onChange={(event) => updateDraft("cluster", event.target.value)}
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Periode
                    <input
                      value={draftItem.period}
                      onChange={(event) => updateDraft("period", event.target.value)}
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Nominal
                    <input
                      value={draftItem.amount}
                      onChange={(event) => updateDraft("amount", event.target.value)}
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Kanal
                    <select
                      value={draftItem.channel}
                      onChange={(event) =>
                        updateDraft("channel", event.target.value as ConfirmationChannel)
                      }
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {channels.filter((item) => item !== "Semua").map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Status
                    <select
                      value={draftItem.status}
                      onChange={(event) =>
                        updateDraft("status", event.target.value as ConfirmationStatus)
                      }
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {statuses.filter((item) => item !== "Semua").map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Catatan bendahara
                  <textarea
                    value={draftItem.note}
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
                        status: "Valid",
                        note: "Sudah cocok dengan mutasi dan siap dimasukkan ke ledger iuran.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold text-primary transition-colors hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Tandai valid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected({
                        status: "Butuh klarifikasi",
                        note: "Minta warga melengkapi periode, nama rekening, atau bukti transfer.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 transition-colors hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Minta klarifikasi
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected({
                        status: "Perlu cocokkan",
                        note: "Masukkan kembali ke antrian cocokkan mutasi bendahara.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Kembalikan ke cocokkan
                  </button>
                </div>
              </div>

              <aside className="grid gap-4 self-start">
                <div className="rounded-[16px] border border-black/8 bg-white p-4">
                  <dl className="grid gap-3 text-sm">
                    {[
                      ["Dibayar", draftItem.paidAt],
                      ["PIC", draftItem.owner],
                      ["Kanal", draftItem.channel],
                      ["Periode", draftItem.period],
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
                    Finance workflow
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Validasi di modal ini masih state sesi. Langkah berikutnya
                    adalah menghubungkan item valid ke ledger transaksi.
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
