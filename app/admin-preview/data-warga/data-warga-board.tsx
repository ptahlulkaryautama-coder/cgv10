"use client";

import { useMemo, useState } from "react";
import { ActionButton, Panel, PanelHeader, StatusPill, cx } from "../components";

type ResidentRecord = {
  id: string;
  family: string;
  cluster: string;
  contact: string;
  vehicles: string;
  status: "Terverifikasi" | "Perlu update" | "Baru";
  owner: string;
  lastUpdate: string;
};

const records: ResidentRecord[] = [
  {
    id: "WRG-0101",
    family: "Keluarga Dharma",
    cluster: "Colloseum",
    contact: "Aktif",
    vehicles: "2 mobil",
    status: "Terverifikasi",
    owner: "Sekretariat",
    lastUpdate: "28 Jun 2026",
  },
  {
    id: "WRG-0102",
    family: "Keluarga Hartono",
    cluster: "Pinnata",
    contact: "Perlu cek",
    vehicles: "1 mobil, 1 motor",
    status: "Perlu update",
    owner: "Keamanan",
    lastUpdate: "24 Jun 2026",
  },
  {
    id: "WRG-0103",
    family: "Keluarga Santoso",
    cluster: "Aurora",
    contact: "Aktif",
    vehicles: "1 mobil",
    status: "Baru",
    owner: "Ketua RT",
    lastUpdate: "01 Jul 2026",
  },
  {
    id: "WRG-0104",
    family: "Keluarga Widjaja",
    cluster: "Greenwich",
    contact: "Aktif",
    vehicles: "2 mobil, 2 motor",
    status: "Terverifikasi",
    owner: "Sekretariat",
    lastUpdate: "26 Jun 2026",
  },
];

const clusters = ["Semua", "Colloseum", "Pinnata", "Aurora", "Greenwich"];
const statuses = ["Semua", "Terverifikasi", "Perlu update", "Baru"];

export function DataWargaBoard() {
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [selectedId, setSelectedId] = useState(records[0].id);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesQuery = normalizedQuery
        ? [record.id, record.family, record.cluster, record.owner]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesCluster = cluster === "Semua" || record.cluster === cluster;
      const matchesStatus = status === "Semua" || record.status === status;

      return matchesQuery && matchesCluster && matchesStatus;
    });
  }, [cluster, query, status]);

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedId) ??
    filteredRecords[0] ??
    records[0];

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Data Warga"
          subtitle="Cari KK, cluster, status kontak, dan catatan update."
          action={<ActionButton>Export</ActionButton>}
        />
        <div className="grid gap-3 border-y border-border bg-[#f8f6f0] px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Cari nama keluarga, ID, cluster..."
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={cluster}
            onChange={(event) => setCluster(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {clusters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Keluarga</th>
                <th className="px-5 py-3">Cluster</th>
                <th className="px-5 py-3">Kontak</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className={cx(
                    "border-b border-border last:border-b-0",
                    record.id === selectedRecord.id
                      ? "bg-primary-soft/40"
                      : "hover:bg-primary-soft/20",
                  )}
                >
                  <td className="px-5 py-4 font-bold text-primary">{record.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground">{record.family}</p>
                    <p className="mt-1 text-xs text-muted">{record.vehicles}</p>
                    <a
                      href={`#resident-${record.id}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(record.id);
                      }}
                      className="mt-3 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Buka detail
                    </a>
                  </td>
                  <td className="px-5 py-4 text-muted">{record.cluster}</td>
                  <td className="px-5 py-4 text-muted">{record.contact}</td>
                  <td className="px-5 py-4">
                    <StatusPill>{record.status}</StatusPill>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`#resident-${record.id}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(record.id);
                      }}
                      className="min-h-8 cursor-pointer rounded-full border border-border bg-white px-3 text-xs font-bold text-muted transition-colors duration-200 hover:border-primary/30 hover:text-primary"
                    >
                      Review
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {filteredRecords.map((record) => (
        <div
          key={record.id}
          id={`resident-${record.id}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {record.id}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {record.family}
                </h3>
                <p className="mt-1 text-sm text-muted">Cluster {record.cluster}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{record.status}</StatusPill>
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
                  ["Kontak", record.contact],
                  ["Kendaraan", record.vehicles],
                  ["PIC", record.owner],
                  ["Update terakhir", record.lastUpdate],
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
          title="Resident Detail"
          subtitle="Ringkasan data internal untuk tindak lanjut pengurus."
        />
        <div className="space-y-4 px-5 pb-5">
          <div className="rounded-[16px] border border-black/8 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  {selectedRecord.id}
                </p>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {selectedRecord.family}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Cluster {selectedRecord.cluster}
                </p>
              </div>
              <StatusPill>{selectedRecord.status}</StatusPill>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              {[
                ["Kontak", selectedRecord.contact],
                ["Kendaraan", selectedRecord.vehicles],
                ["PIC", selectedRecord.owner],
                ["Update terakhir", selectedRecord.lastUpdate],
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
          <div className="rounded-[16px] border border-accent/40 bg-accent-soft p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              Privasi
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Data ini diposisikan sebagai informasi internal. Untuk publik,
              tampilkan hanya agregat dan kontak resmi pengurus.
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}
