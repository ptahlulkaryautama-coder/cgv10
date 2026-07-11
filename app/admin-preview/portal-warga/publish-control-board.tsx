"use client";

import { useMemo, useState } from "react";
import { ActionButton, Panel, PanelHeader, StatusPill, cx } from "../components";
import {
  portalContentItems,
  type PortalContentItem,
  type PublishStatus,
} from "@/lib/portal-publish-data";

const statuses: Array<PublishStatus | "Semua"> = [
  "Semua",
  "Published",
  "Review",
  "Draft",
  "Tahan",
];

const channels = [
  "Semua",
  "Artikel",
  "Pengumuman",
  "Agenda",
  "Keuangan",
  "PALUGADA",
  "Kontak",
];

export function PublishControlBoard() {
  const [items, setItems] = useState(portalContentItems);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Semua");
  const [channel, setChannel] = useState("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<PortalContentItem | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = normalizedQuery
        ? [item.id, item.title, item.channel, item.owner]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesStatus = status === "Semua" || item.status === status;
      const matchesChannel = channel === "Semua" || item.channel === channel;

      return matchesQuery && matchesStatus && matchesChannel;
    });
  }, [channel, items, query, status]);

  function updateSelectedStatus(nextStatus: PublishStatus) {
    if (!draftItem) return;

    const nextItem = { ...draftItem, status: nextStatus };
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === nextItem.id ? nextItem : item,
      ),
    );
    setDraftItem(nextItem);
    setSelectedId(nextItem.id);
  }

  function updateItemById(id: string, updates: Partial<PortalContentItem>) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function openItem(item: PortalContentItem) {
    setSelectedId(item.id);
    setDraftItem({ ...item });
  }

  function closeItem() {
    setDraftItem(null);
  }

  function updateDraft<K extends keyof PortalContentItem>(
    field: K,
    value: PortalContentItem[K],
  ) {
    setDraftItem((current) => (current ? { ...current, [field]: value } : current));
  }

  function saveDraft() {
    if (!draftItem) return;

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === draftItem.id ? draftItem : item)),
    );
    setSelectedId(draftItem.id);
  }

  return (
    <section>
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Demo Publish Control"
          subtitle="Filter konten publik statis, lalu buka item untuk simulasi edit, publish, review, atau tahan di browser."
          action={<ActionButton href="#public-preview">Preview Demo</ActionButton>}
        />
        <div className="grid gap-3 border-y border-border bg-[#f8f6f0] px-5 py-4 md:grid-cols-[minmax(0,1fr)_170px_170px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Cari judul, channel, PIC..."
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as (typeof statuses)[number])
            }
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {channels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <table className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">Konten</th>
                <th className="hidden px-5 py-3 sm:table-cell">Channel</th>
                <th className="hidden px-5 py-3 md:table-cell">Visibility</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Readiness</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
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
                    "cursor-pointer border-b border-border last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                    item.id === selectedId
                      ? "bg-primary-soft/40"
                      : "hover:bg-primary-soft/20",
                  )}
                >
                  <td className="px-3 py-4 sm:px-5">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
                      {item.id}
                    </p>
                    <p className="mt-1 break-words font-bold text-foreground">{item.title}</p>
                    <a
                      href={`#portal-content-${item.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-3 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Buka detail
                    </a>
                  </td>
                  <td className="hidden px-5 py-4 text-muted sm:table-cell">{item.channel}</td>
                  <td className="hidden px-5 py-4 text-muted md:table-cell">{item.visibility}</td>
                  <td className="px-5 py-4">
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex min-w-28 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7e0d5]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.readiness}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {item.readiness}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`#portal-content-${item.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="min-h-8 cursor-pointer rounded-full border border-border bg-white px-3 text-xs font-bold text-muted transition-colors duration-200 hover:border-primary/30 hover:text-primary"
                    >
                      Preview
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {filteredItems.map((item) => (
        <div
          key={item.id}
          id={`portal-content-${item.id}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {item.channel} - {item.id}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
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
                  <p className="text-sm leading-6 text-muted">{item.summary}</p>
                  <dl className="mt-5 grid gap-3 text-sm">
                    {[
                      ["PIC", item.owner],
                      ["Visibility", item.visibility],
                      ["Update", item.updated],
                      ["Readiness", `${item.readiness}%`],
                      ["Portal path", item.portalPath],
                      ["Sumber", item.source],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-t border-border pt-3"
                      >
                        <dt className="text-muted">{label}</dt>
                        <dd className="break-words text-right font-bold text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {item.channel === "Artikel" ? (
                  <div className="rounded-[16px] border border-black/8 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
                      Field artikel
                    </p>
                    <div className="mt-4 grid gap-3">
                      <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                        Kutipan artikel
                        <input
                          defaultValue={item.excerpt ?? item.summary}
                          className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                        Isi artikel
                        <textarea
                          defaultValue={item.body ?? ""}
                          rows={7}
                          className="resize-y rounded-[10px] border border-black/10 bg-white px-4 py-3 text-sm normal-case leading-6 tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                        />
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                          Cover image path
                          <input
                            defaultValue={item.coverImageSrc ?? ""}
                            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                          Cover alt text
                          <input
                            defaultValue={item.coverImageAlt ?? ""}
                            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => updateItemById(item.id, { status: "Published" })}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold text-primary transition-colors hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Demo: set Published
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItemById(item.id, { status: "Review" })}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Demo: kirim Review
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItemById(item.id, { status: "Tahan" })}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 transition-colors hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Demo: tahan publikasi
                  </button>
                </div>
              </div>

              <aside className="rounded-[16px] border border-black/8 bg-white p-4 self-start">
                <p className="text-sm leading-6 text-muted">
                  Detail ini bisa terbuka tanpa JavaScript. Perubahan status
                  hanya simulasi di browser dan tidak tersimpan ke database.
                </p>
              </aside>
            </div>
          </div>
        </div>
      ))}

      {draftItem ? (
        <div
          id="public-preview"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portal-publish-modal-title"
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
                  {draftItem.channel} - {draftItem.id}
                </p>
                <h3
                  id="portal-publish-modal-title"
                  className="mt-2 text-2xl font-bold tracking-tight text-foreground"
                >
                  {draftItem.title}
                </h3>
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
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Judul konten
                  <input
                    value={draftItem.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Channel
                    <select
                      value={draftItem.channel}
                      onChange={(event) =>
                        updateDraft("channel", event.target.value as PortalContentItem["channel"])
                      }
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      {channels.filter((item) => item !== "Semua").map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Visibility
                    <select
                      value={draftItem.visibility}
                      onChange={(event) =>
                        updateDraft("visibility", event.target.value as PortalContentItem["visibility"])
                      }
                      className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    >
                      <option>Publik</option>
                      <option>Internal</option>
                      <option>Terbatas</option>
                    </select>
                  </label>
                </div>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Ringkasan publik
                  <textarea
                    value={draftItem.summary}
                    onChange={(event) => updateDraft("summary", event.target.value)}
                    rows={5}
                    className="resize-y rounded-[10px] border border-black/10 bg-white px-4 py-3 text-sm normal-case leading-6 tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Kutipan artikel
                  <input
                    value={draftItem.excerpt ?? ""}
                    onChange={(event) => updateDraft("excerpt", event.target.value)}
                    placeholder="Ringkasan pendek untuk kartu artikel"
                    className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Isi artikel
                  <textarea
                    value={draftItem.body ?? ""}
                    onChange={(event) => updateDraft("body", event.target.value)}
                    rows={8}
                    placeholder="Tulis naskah artikel atau pengumuman panjang untuk Kabar Warga."
                    className="resize-y rounded-[10px] border border-black/10 bg-white px-4 py-3 text-sm normal-case leading-6 tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Cover image path
                    <input
                      value={draftItem.coverImageSrc ?? ""}
                      onChange={(event) => updateDraft("coverImageSrc", event.target.value)}
                      placeholder="/assets/kegiatan/..."
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Cover alt text
                    <input
                      value={draftItem.coverImageAlt ?? ""}
                      onChange={(event) => updateDraft("coverImageAlt", event.target.value)}
                      placeholder="Deskripsi gambar untuk aksesibilitas"
                      className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-[13px] font-bold text-accent transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Simpan preview browser
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedStatus("Published")}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold text-primary transition-colors hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Demo: set Published
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedStatus("Review")}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Demo: kirim Review
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedStatus("Tahan")}
                    className="min-h-10 cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 transition-colors hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Demo: tahan publikasi
                  </button>
                </div>
              </div>

              <aside className="rounded-[16px] border border-black/8 bg-white p-4 self-start">
                <dl className="grid gap-3 text-sm">
                  {[
                    ["PIC", draftItem.owner],
                    ["Update", draftItem.updated],
                    ["Readiness", `${draftItem.readiness}%`],
                    ["Status", draftItem.status],
                    ["Portal path", draftItem.portalPath],
                    ["Sumber", draftItem.source],
                    ["Penyimpanan", "Browser state demo"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 border-t border-border pt-3 first:border-t-0 first:pt-0"
                    >
                      <dt className="text-muted">{label}</dt>
                      <dd className="break-words text-right font-bold text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
