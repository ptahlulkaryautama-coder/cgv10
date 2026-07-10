"use client";

import { useMemo, useState } from "react";
import { ActionButton, Panel, PanelHeader, StatusPill, cx } from "../components";
import { programItems, type ProgramStatus } from "@/lib/program-data";

const pillars = [
  "Semua",
  ...Array.from(new Set(programItems.map((program) => program.pillar))),
];

const statuses: Array<ProgramStatus | "Semua"> = [
  "Semua",
  "Aktif",
  "Draft",
  "Review",
];

function PillarBadge({ value }: { value: string }) {
  const tone =
    value === "Lingkungan"
      ? "bg-emerald-50 text-primary"
      : value === "Keluarga"
        ? "bg-purple-50 text-purple-700"
        : value === "Amanah"
          ? "bg-accent-soft text-foreground"
          : value === "Data"
            ? "bg-blue-50 text-blue-700"
            : "bg-stone-100 text-stone-700";

  return (
    <span
      className={cx(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
        tone,
      )}
    >
      {value}
    </span>
  );
}

function CheckMark({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cx(
        "mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
        enabled ? "bg-emerald-50 text-primary" : "bg-stone-100 text-stone-400",
      )}
    >
      {enabled ? "Y" : "-"}
    </span>
  );
}

export function ProgramBoard() {
  const [programs, setPrograms] = useState(programItems);
  const [query, setQuery] = useState("");
  const [pillar, setPillar] = useState("Semua");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Semua");
  const [selectedId, setSelectedId] = useState(programItems[0].id);
  const [draft, setDraft] = useState({
    name: "",
    category: "Kegiatan",
    pillar: "Lingkungan",
    schedule: "",
  });

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesQuery = normalizedQuery
        ? [program.id, program.name, program.category, program.owner]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesPillar = pillar === "Semua" || program.pillar === pillar;
      const matchesStatus = status === "Semua" || program.status === status;

      return matchesQuery && matchesPillar && matchesStatus;
    });
  }, [pillar, programs, query, status]);

  const selectedProgram =
    filteredPrograms.find((program) => program.id === selectedId) ??
    filteredPrograms[0] ??
    programs[0] ??
    programItems[0];

  function addProgram() {
    if (!draft.name.trim()) return;

    const program = {
      id: `PRG-${String(programs.length + 1).padStart(3, "0")}`,
      name: draft.name.trim(),
      category: draft.category,
      pillar: draft.pillar,
      schedule: draft.schedule.trim() || "Jadwal menyusul",
      owner: "Pengurus",
      status: "Draft" as ProgramStatus,
      web: false,
      portal: true,
      portalPath: "/kegiatan/",
      source: "Input preview admin",
    };

    setPrograms((current) => [program, ...current]);
    setSelectedId(program.id);
    setDraft({
      name: "",
      category: "Kegiatan",
      pillar: "Lingkungan",
      schedule: "",
    });
  }

  return (
    <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Program Control"
          subtitle="Filter agenda, cek channel publikasi, dan pilih program untuk review."
          action={<ActionButton>Export Agenda</ActionButton>}
        />
        <div
          id="tambah-kegiatan"
          className="grid gap-3 border-t border-border bg-white px-5 py-4 md:grid-cols-[minmax(0,1fr)_150px_150px_minmax(0,0.8fr)_auto]"
        >
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Nama kegiatan"
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={draft.category}
            onChange={(event) =>
              setDraft((current) => ({ ...current, category: event.target.value }))
            }
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            <option>Kegiatan</option>
            <option>Program</option>
            <option>Agenda</option>
            <option>Publikasi</option>
          </select>
          <select
            value={draft.pillar}
            onChange={(event) =>
              setDraft((current) => ({ ...current, pillar: event.target.value }))
            }
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {pillars.filter((item) => item !== "Semua").map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input
            value={draft.schedule}
            onChange={(event) =>
              setDraft((current) => ({ ...current, schedule: event.target.value }))
            }
            placeholder="Jadwal"
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <button
            type="button"
            onClick={addProgram}
            className="min-h-11 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-sm font-bold text-accent transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Tambah
          </button>
        </div>
        <div className="grid gap-3 border-y border-border bg-[#f8f6f0] px-5 py-4 md:grid-cols-[minmax(0,1fr)_170px_150px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Cari nama program..."
            className="min-h-11 rounded-[10px] border border-black/10 bg-white px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
          />
          <select
            value={pillar}
            onChange={(event) => setPillar(event.target.value)}
            className="min-h-11 cursor-pointer rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-muted outline-none focus:border-primary"
          >
            {pillars.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Nama Program</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Pilar</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Web</th>
                <th className="px-5 py-3 text-center">Portal</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((program) => (
                <tr
                  key={program.id}
                  onClick={() => setSelectedId(program.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(program.id);
                    }
                  }}
                  tabIndex={0}
                  className={cx(
                    "cursor-pointer border-b border-border last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                    program.id === selectedProgram.id
                      ? "bg-primary-soft/40"
                      : "hover:bg-primary-soft/20",
                  )}
                >
                  <td className="px-5 py-4 font-bold text-primary">{program.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground">{program.name}</p>
                    <p className="mt-1 text-xs text-muted">{program.schedule}</p>
                    <a
                      href={`#program-${program.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-3 inline-flex min-h-8 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-xs font-bold text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Buka detail
                    </a>
                  </td>
                  <td className="px-5 py-4 text-muted">{program.category}</td>
                  <td className="px-5 py-4">
                    <PillarBadge value={program.pillar} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill>{program.status}</StatusPill>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <CheckMark enabled={program.web} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <CheckMark enabled={program.portal} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`#program-${program.id}`}
                      onClick={(event) => event.stopPropagation()}
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

      {filteredPrograms.map((program) => (
        <div
          key={program.id}
          id={`program-${program.id}`}
          className="target-modal fixed inset-0 z-50 items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:items-center"
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[20px] border border-black/10 bg-[#fdfcf9] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                  {program.id} - {program.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {program.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{program.schedule}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusPill>{program.status}</StatusPill>
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
                  ["Pilar", program.pillar],
                  ["PIC", program.owner],
                  ["Website", program.web ? "Tampil" : "Tidak tampil"],
                  ["Portal", program.portal ? "Tampil" : "Tidak tampil"],
                  ["Sumber", program.source],
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
          title="Program Detail"
          subtitle="Ringkasan channel dan kesiapan konten."
        />
        <div className="space-y-4 px-5 pb-5">
          <div className="rounded-[16px] border border-black/8 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                  {selectedProgram.id} - {selectedProgram.category}
                </p>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {selectedProgram.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{selectedProgram.schedule}</p>
              </div>
              <StatusPill>{selectedProgram.status}</StatusPill>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              {[
                ["Pilar", selectedProgram.pillar],
                ["PIC", selectedProgram.owner],
                ["Website", selectedProgram.web ? "Tampil" : "Tidak tampil"],
                ["Portal", selectedProgram.portal ? "Tampil" : "Tidak tampil"],
                ["Sumber", selectedProgram.source],
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
              Output
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Program yang aktif dapat tampil sebagai kartu website dan agenda
              portal. Draft tetap terlihat di admin untuk persiapan konten.
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}
