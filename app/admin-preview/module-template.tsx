import type { IconName } from "@/lib/portal-data";
import {
  ActionButton,
  AdminShell,
  MetricCard,
  PageIntro,
  Panel,
  PanelHeader,
  StatusPill,
} from "./components";

type ModuleMetric = {
  label: string;
  value: string;
  helper: string;
  icon: IconName;
  tone?: "green" | "gold" | "blue" | "red" | "dark";
};

type ModuleRow = {
  title: string;
  meta: string;
  status: string;
  owner: string;
};

type ModuleAction = {
  title: string;
  text: string;
};

export function AdminModuleTemplate({
  active,
  title,
  subtitle,
  eyebrow,
  introTitle,
  introText,
  actionLabel,
  metrics,
  rows,
  checklist,
  actions = [],
}: {
  active:
    | "portal"
    | "warga"
    | "layanan"
    | "dokumen"
    | "pengaturan";
  title: string;
  subtitle: string;
  eyebrow: string;
  introTitle: React.ReactNode;
  introText: string;
  actionLabel: string;
  metrics: ModuleMetric[];
  rows: ModuleRow[];
  checklist: string[];
  actions?: ModuleAction[];
}) {
  return (
    <AdminShell
      active={active}
      title={title}
      subtitle={subtitle}
      action={<ActionButton primary>{actionLabel}</ActionButton>}
    >
      <PageIntro
        eyebrow={eyebrow}
        title={introTitle}
        text={introText}
        side={<ActionButton primary>{actionLabel}</ActionButton>}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
        <Panel className="overflow-hidden">
          <PanelHeader
            title={`${title} Queue`}
            subtitle="Preview alur kerja modul. Interaksi penuh bisa ditambahkan setelah kebutuhan data final."
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-[#f8f6f0] text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Meta</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">PIC</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.title}
                    className="border-b border-border last:border-b-0 hover:bg-primary-soft/20"
                  >
                    <td className="px-5 py-4 font-bold text-foreground">
                      {row.title}
                    </td>
                    <td className="px-5 py-4 text-muted">{row.meta}</td>
                    <td className="px-5 py-4">
                      <StatusPill>{row.status}</StatusPill>
                    </td>
                    <td className="px-5 py-4 text-muted">{row.owner}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="min-h-8 cursor-pointer rounded-full border border-border bg-white px-3 text-xs font-bold text-muted transition-colors duration-200 hover:border-primary/30 hover:text-primary"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Readiness Checklist"
            subtitle="Hal yang perlu aman sebelum modul dibuat lebih dalam."
          />
          <div className="space-y-3 px-5 pb-5">
            {checklist.map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-[14px] border border-black/8 bg-white p-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {actions.length > 0 ? (
        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <Panel key={action.title}>
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                  Quick Action
                </p>
                <h3 className="mt-3 text-base font-bold text-foreground">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {action.text}
                </p>
                <button
                  type="button"
                  className="mt-4 min-h-9 cursor-pointer rounded-[10px] border border-black/10 bg-white px-4 text-[13px] font-bold text-muted transition-colors duration-200 hover:border-primary/30 hover:text-primary"
                >
                  Buka
                </button>
              </div>
            </Panel>
          ))}
        </section>
      ) : null}
    </AdminShell>
  );
}
