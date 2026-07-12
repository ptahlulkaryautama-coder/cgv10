"use client";

import { useMemo, useState } from "react";
import { Panel, PanelHeader, StatusPill, cx } from "../components";

type DocumentItem = {
  code: string;
  title: string;
  category: "Template" | "Arsip" | "Kegiatan" | "Keuangan";
  visibility: "Publik" | "Internal" | "Terbatas";
  status: "Aktif" | "Review" | "Draft";
  owner: string;
  updated: string;
};

const documents: DocumentItem[] = [
  {
    code: "DOC-001",
    title: "Template surat domisili",
    category: "Template",
    visibility: "Internal",
    status: "Aktif",
    owner: "Sekretariat",
    updated: "30 Jun 2026",
  },
  {
    code: "DOC-002",
    title: "Ringkasan kas publik Juni",
    category: "Keuangan",
    visibility: "Publik",
    status: "Review",
    owner: "Bendahara",
    updated: "29 Jun 2026",
  },
  {
    code: "DOC-003",
    title: "Dokumentasi Primatama FC CGV U12",
    category: "Kegiatan",
    visibility: "Publik",
    status: "Aktif",
    owner: "Program & Kegiatan",
    updated: "10 Jul 2026",
  },
  {
    code: "DOC-004",
    title: "Catatan validasi warga",
    category: "Arsip",
    visibility: "Terbatas",
    status: "Draft",
    owner: "Ketua RT",
    updated: "20 Jun 2026",
  },
];

const categories = ["Semua", "Template", "Arsip", "Kegiatan", "Keuangan"];
const visibilityOptions = ["Semua", "Publik", "Internal", "Terbatas"];

export function DocumentLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [visibility, setVisibility] = useState("Semua");
  const [items, setItems] = useState(documents);
  const [selectedCode, setSelectedCode] = useState(documents[0].code);
  const [reviewed, setReviewed] = useState(false);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((document) => {
      const matchesQuery = normalizedQuery
        ? [document.code, document.title, document.owner]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesCategory =
        category === "Semua" || document.category === category;
      const matchesVisibility =
        visibility === "Semua" || document.visibility === visibility;

      return matchesQuery && matchesCategory && matchesVisibility;
    });
  }, [category, items, query, visibility]);

  const selectedDocument =
    filteredDocuments.find((document) => document.code === selectedCode) ??
    filteredDocuments[0] ??
    items[0];

  function uploadDocument(file?: File) {
    if (!file) return;

    const document: DocumentItem = {
      code: `DOC-${String(items.length + 1).padStart(3, "0")}`,
      title: file.name.replace(/\.[^.]+$/, ""),
      category: "Arsip",
      visibility: "Internal",
      status: "Review",
      owner: "Sekretariat",
      updated: "01 Jul 2026",
    };

    setItems((current) => [document, ...current]);
    setSelectedCode(document.code);
    setReviewed(false);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Document Library"
          subtitle="Kelola template, arsip, status review, dan visibility dokumen."
          action={
            <label className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors duration-200 hover:border-accent/35 hover:text-primary">
              Upload
              <input
                type="file"
                className="sr-only"
                onChange={(event) => uploadDocument(event.target.files?.[0])}
              />
            </label>
          }
        />
        <div id="upload-dokumen" className="grid gap-3 border-y border-border bg-[#f8f6f0] px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Cari dokumen, kode, PIC..."
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {visibilityOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          {filteredDocuments.map((document) => (
            <article
              key={document.code}
              className={cx(
                "rounded-[16px] border p-4 text-left transition-colors duration-200",
                document.code === selectedDocument.code
                  ? "border-primary/35 bg-primary-soft/45"
                  : "border-black/8 bg-white hover:border-primary/25",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                    {document.code} - {document.category}
                  </p>
                  <h3 className="mt-2 font-bold text-foreground">
                    {document.title}
                  </h3>
                </div>
                <StatusPill>{document.status}</StatusPill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted">
                  {document.visibility}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted">
                  {document.owner}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCode(document.code)}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Pilih
                </button>
                <a
                  href={`#document-${document.code}`}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft"
                >
                  Buka detail
                </a>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      {filteredDocuments.map((document) => (
        <div
          key={document.code}
          id={`document-${document.code}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {document.code} - {document.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {document.title}
                </h3>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{document.status}</StatusPill>
                <a
                  href="#"
                  className="min-h-9 rounded-[10px] border border-black/10 bg-white px-4 py-2 text-[13px] font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Tutup
                </a>
              </div>
            </div>
            <div className="p-5">
              <dl className="grid gap-3 rounded-[16px] border border-black/8 bg-white p-4 text-sm">
                {[
                  ["Visibility", document.visibility],
                  ["PIC", document.owner],
                  ["Update", document.updated],
                  ["Status", document.status],
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
          </div>
        </div>
      ))}

      <Panel>
        <PanelHeader
          title="Document Detail"
          subtitle="Ringkasan status dokumen sebelum dipakai atau dipublish."
        />
        <div className="space-y-4 px-5 pb-5">
          <div className="rounded-[16px] border border-black/8 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
              {selectedDocument.code}
            </p>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              {selectedDocument.title}
            </h3>
            <dl className="mt-5 grid gap-3 text-sm">
              {[
                ["Kategori", selectedDocument.category],
                ["Visibility", selectedDocument.visibility],
                ["PIC", selectedDocument.owner],
                ["Update", selectedDocument.updated],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-t border-border pt-3"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button
            type="button"
            onClick={() => setReviewed(true)}
            className="min-h-11 w-full cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-sm font-bold text-accent transition-colors duration-200 hover:bg-primary-hover"
          >
            Review dokumen
          </button>
          {reviewed ? (
            <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-primary">
              Review aktif untuk {selectedDocument.code}.
            </p>
          ) : null}
        </div>
      </Panel>
    </section>
  );
}
