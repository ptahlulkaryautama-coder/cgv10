"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/components/portal";
import {
  palugadaCategories,
  palugadaDraftItems,
  type PalugadaDraftItem,
} from "@/lib/portal-data";
import {
  ActionButton,
  Panel,
  PanelHeader,
  ProgressBar,
  StatusPill,
  cx,
} from "../components";

const statusFilters = [
  "Semua",
  "Draft diterima",
  "Perlu verifikasi",
  "Siap tayang",
] as const;
const categoryFilters = ["Semua", ...palugadaCategories.map((item) => item.title)];
const priorityFilters = ["Semua", "Normal", "Tinggi"] as const;

type StatusFilter = (typeof statusFilters)[number];
type PriorityFilter = (typeof priorityFilters)[number];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function PriorityPill({ value }: { value: PalugadaDraftItem["priority"] }) {
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

function completenessNumber(value: string) {
  return Number(value.replace("%", "")) || 0;
}

export function PalugadaReviewBoard() {
  const [drafts, setDrafts] = useState<PalugadaDraftItem[]>(palugadaDraftItems);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Semua");
  const [category, setCategory] = useState("Semua");
  const [priority, setPriority] = useState<PriorityFilter>("Semua");
  const [selectedId, setSelectedId] = useState(palugadaDraftItems[0]?.id ?? "");

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalize(query);

    return drafts.filter((item) => {
      const content = [
        item.id,
        item.name,
        item.owner,
        item.category,
        item.cluster,
        item.status,
        item.contactStatus,
        item.nextAction,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || content.includes(normalizedQuery)) &&
        (status === "Semua" || item.status === status) &&
        (category === "Semua" || item.category === category) &&
        (priority === "Semua" || item.priority === priority)
      );
    });
  }, [category, drafts, priority, query, status]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ??
    filteredItems[0] ??
    drafts[0];

  const averageCompleteness = Math.round(
    filteredItems.reduce(
      (sum, item) => sum + completenessNumber(item.completeness),
      0,
    ) / Math.max(filteredItems.length, 1),
  );

  function resetFilters() {
    setQuery("");
    setStatus("Semua");
    setCategory("Semua");
    setPriority("Semua");
    setSelectedId(drafts[0]?.id ?? "");
  }

  function updateSelectedDraft(
    updates: Partial<
      Pick<
        PalugadaDraftItem,
        "status" | "priority" | "completeness" | "nextAction" | "contactStatus"
      >
    >,
  ) {
    if (!selectedItem) {
      return;
    }

    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === selectedItem.id ? { ...draft, ...updates } : draft,
      ),
    );
    setSelectedId(selectedItem.id);
  }

  function updateDraftById(
    id: string,
    updates: Partial<
      Pick<
        PalugadaDraftItem,
        "status" | "priority" | "completeness" | "nextAction" | "contactStatus"
      >
    >,
  ) {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === id ? { ...draft, ...updates } : draft,
      ),
    );
  }

  function markReady() {
    updateSelectedDraft({
      status: "Siap tayang",
      priority: "Normal",
      completeness: "100%",
      contactStatus: "Siap ditampilkan",
      nextAction: "Listing siap dipindahkan ke katalog aktif.",
    });
  }

  function requestCompletion() {
    updateSelectedDraft({
      status: "Perlu verifikasi",
      priority: "Tinggi",
      completeness: "60%",
      nextAction: "Minta kelengkapan foto, kontak, harga/status, dan area layanan.",
    });
  }

  function returnToDraft() {
    updateSelectedDraft({
      status: "Draft diterima",
      priority: "Normal",
      completeness: "45%",
      contactStatus: "Belum diverifikasi",
      nextAction: "Simpan sebagai pendaftaran awal sampai data utama dilengkapi.",
    });
  }

  const sessionReadyCount = drafts.filter((item) => item.status === "Siap tayang").length;
  const sessionReviewCount = drafts.filter((item) => item.status === "Perlu verifikasi").length;
  const sessionDraftCount = drafts.filter((item) => item.status === "Draft diterima").length;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.72fr)]">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Draft & Review Queue"
          subtitle="Filter status, kategori, prioritas, lalu pilih draft untuk melihat action detail."
          action={<ActionButton href="/palugada/daftar/">Buka form warga</ActionButton>}
        />

        <div className="border-y border-border bg-[#f8f6f0] p-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Draft", sessionDraftCount, "bg-blue-50 text-blue-700"],
              ["Review", sessionReviewCount, "bg-accent-soft text-foreground"],
              ["Siap", sessionReadyCount, "bg-primary text-accent"],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="rounded-[14px] border border-black/8 bg-white p-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  {label}
                </p>
                <p
                  className={cx(
                    "mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold",
                    String(tone),
                  )}
                >
                  {value} item
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="sr-only" htmlFor="palugada-admin-search">
              Cari draft PALUGADA
            </label>
            <input
              id="palugada-admin-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari lapak, cluster, status, kontak..."
              className="min-h-10 rounded-[10px] border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatus(filter)}
                className={cx(
                  "min-h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  status === filter
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Kategori
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-9 cursor-pointer rounded-[10px] border border-border bg-white px-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
              >
                {categoryFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Prioritas
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as PriorityFilter)
                }
                className="min-h-9 cursor-pointer rounded-[10px] border border-border bg-white px-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
              >
                {priorityFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Lapak</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Cluster</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Prioritas</th>
                <th className="px-5 py-3 text-right">Kelengkapan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(item.id);
                        }
                      }}
                      tabIndex={0}
                      className={cx(
                        "cursor-pointer border-b border-border last:border-b-0 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        isSelected && "bg-primary-soft/45",
                      )}
                    >
                      <td className="px-5 py-4 font-semibold text-muted">
                        {item.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">{item.name}</p>
                        <p className="mt-1 text-xs text-muted">{item.owner}</p>
                        <a
                          href={`#palugada-draft-${item.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-3 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Buka detail
                        </a>
                      </td>
                      <td className="px-5 py-4 text-muted">{item.category}</td>
                      <td className="px-5 py-4 text-muted">{item.cluster}</td>
                      <td className="px-5 py-4">
                        <StatusPill>{item.status}</StatusPill>
                      </td>
                      <td className="px-5 py-4">
                        <PriorityPill value={item.priority} />
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-primary">
                        {item.completeness}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`#palugada-draft-${item.id}`}
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
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm font-semibold text-muted"
                  >
                    Tidak ada draft yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-[#f8f6f0] px-5 py-3 text-xs font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{filteredItems.length} draft ditampilkan</span>
          <span className="text-primary">
            Rata-rata kelengkapan: {averageCompleteness}%
          </span>
        </div>
      </Panel>

      {filteredItems.map((item) => (
        <div
          key={item.id}
          id={`palugada-draft-${item.id}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {item.id} - {item.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{item.owner}</p>
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
                      ["Cluster", item.cluster],
                      ["Kontak", item.contactStatus],
                      ["Prioritas", item.priority],
                      ["Kelengkapan", item.completeness],
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
                    Next action
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {item.nextAction}
                  </p>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftById(item.id, {
                        status: "Siap tayang",
                        priority: "Normal",
                        completeness: "100%",
                        contactStatus: "Siap ditampilkan",
                        nextAction: "Listing siap dipindahkan ke katalog aktif.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-[13px] font-bold text-accent transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Tandai siap tayang
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftById(item.id, {
                        status: "Perlu verifikasi",
                        priority: "Tinggi",
                        completeness: "60%",
                        nextAction: "Minta kelengkapan foto, kontak, harga/status, dan area layanan.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Minta kelengkapan
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftById(item.id, {
                        status: "Draft diterima",
                        priority: "Normal",
                        completeness: "45%",
                        contactStatus: "Belum diverifikasi",
                        nextAction: "Simpan sebagai pendaftaran awal sampai data utama dilengkapi.",
                      })
                    }
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Kembalikan ke draft
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

      <div className="space-y-5">
        <Panel>
          <PanelHeader
            title="Selected Draft"
            subtitle="Ringkasan keputusan untuk draft yang dipilih."
          />
          {selectedItem ? (
            <div className="px-5 pb-5">
              <div className="rounded-[16px] border border-black/8 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                    <Icon
                      name={
                        selectedItem.status === "Siap tayang"
                          ? "store"
                          : selectedItem.status === "Perlu verifikasi"
                            ? "shield"
                            : "file"
                      }
                    />
                  </span>
                  <StatusPill>{selectedItem.status}</StatusPill>
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {selectedItem.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{selectedItem.owner}</p>
                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                    <span className="text-muted">Kategori</span>
                    <span className="font-bold text-foreground">
                      {selectedItem.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                    <span className="text-muted">Cluster</span>
                    <span className="font-bold text-foreground">
                      {selectedItem.cluster}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                    <span className="text-muted">Kontak</span>
                    <span className="text-right font-bold text-foreground">
                      {selectedItem.contactStatus}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-muted">Kelengkapan</span>
                      <span className="font-bold text-primary">
                        {selectedItem.completeness}
                      </span>
                    </div>
                    <ProgressBar value={selectedItem.completeness} />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] border border-accent/35 bg-accent-soft p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  Next action
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {selectedItem.nextAction}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={markReady}
                  className="min-h-10 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-[13px] font-bold text-accent transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Tandai siap tayang
                </button>
                <button
                  type="button"
                  onClick={requestCompletion}
                  className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Minta kelengkapan
                </button>
                <button
                  type="button"
                  onClick={returnToDraft}
                  className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Kembalikan ke draft
                </button>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel>
          <PanelHeader
            title="Review Notes"
            subtitle="Checklist kurasi sebelum publish."
          />
          <div className="space-y-3 px-5 pb-5">
            {[
              "Foto produk atau layanan cukup jelas.",
              "Kontak WhatsApp sudah bisa dihubungi.",
              "Kategori dan cluster tidak membingungkan.",
              "Harga atau status tidak menjanjikan transaksi otomatis.",
            ].map((note, index) => (
              <div
                key={note}
                className="flex gap-3 rounded-[14px] border border-black/8 bg-white p-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted">{note}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
