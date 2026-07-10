"use client";

import { useState } from "react";
import { Panel, PanelHeader, StatusPill, cx } from "../components";

type SettingItem = {
  title: string;
  text: string;
  status: "Aktif" | "Manual" | "Draft" | "Review";
  enabled: boolean;
};

const initialSettings: SettingItem[] = [
  {
    title: "Approval publikasi manual",
    text: "Konten publik harus direview sebelum tampil di portal.",
    status: "Aktif",
    enabled: true,
  },
  {
    title: "PALUGADA review queue",
    text: "Lapak warga masuk pipeline kurasi sebelum published.",
    status: "Aktif",
    enabled: true,
  },
  {
    title: "Role akses bendahara",
    text: "Bendahara fokus pada keuangan dan ringkasan kas publik.",
    status: "Draft",
    enabled: false,
  },
  {
    title: "Integrasi database",
    text: "Disiapkan setelah alur manual stabil dan kebutuhan data final.",
    status: "Review",
    enabled: false,
  },
];

export function SettingsMatrix() {
  const [settings, setSettings] = useState(initialSettings);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  return (
    <section
      id="settings-matrix"
      className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]"
    >
      <Panel>
        <PanelHeader
          title="Settings Matrix"
          subtitle="Konfigurasi prototype yang bisa ditinjau sebelum backend dibuat."
        />
        <div className="space-y-3 px-5 pb-5">
          {settings.map((setting, index) => (
            <div
              key={setting.title}
              className="flex flex-col gap-4 rounded-[16px] border border-black/8 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{setting.title}</h3>
                  <StatusPill>{setting.status}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{setting.text}</p>
              </div>
              <button
                type="button"
                aria-pressed={setting.enabled}
                onClick={() =>
                  setSettings((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, enabled: !item.enabled }
                        : item,
                    ),
                  )
                }
                className={cx(
                  "relative h-9 w-16 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  setting.enabled
                    ? "border-primary bg-primary"
                    : "border-black/15 bg-[#ece5d8]",
                )}
              >
                <span
                  className={cx(
                    "absolute top-1 grid h-7 w-7 place-items-center rounded-full bg-white text-[10px] font-bold shadow-sm transition-all duration-200",
                    setting.enabled ? "left-8 text-primary" : "left-1 text-muted",
                  )}
                >
                  {setting.enabled ? "On" : "Off"}
                </span>
              </button>
            </div>
          ))}
          <div className="flex flex-col gap-3 rounded-[16px] border border-accent/35 bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">
                Update setting preview
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Perubahan toggle disimpan di sesi browser untuk kebutuhan demo.
              </p>
              {lastSaved ? (
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  Terakhir disimpan: {lastSaved}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() =>
                setLastSaved(
                  new Intl.DateTimeFormat("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(new Date()),
                )
              }
              className="min-h-10 cursor-pointer rounded-[10px] border border-primary bg-primary px-4 text-[13px] font-bold text-accent transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Update Setting
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Release Guard"
          subtitle="Batas aman sebelum fitur dibuat otomatis."
        />
        <div className="space-y-3 px-5 pb-5">
          {[
            ["Konten publik", "Manual approval tetap aktif."],
            ["Data warga", "Tidak tampil ke portal publik."],
            ["PALUGADA", "Listing baru masuk kurasi dulu."],
            ["Backend", "Dipilih setelah struktur data final."],
          ].map(([title, text], index) => (
            <div
              key={title}
              className="flex gap-3 rounded-[16px] border border-black/8 bg-white p-4"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-accent">
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}
