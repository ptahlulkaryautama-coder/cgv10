"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Icon } from "../../components/portal";

type DuesRecapRow = {
  household_id: string;
  cluster: string;
  block_or_unit: string;
  unit_number: string | null;
  primary_contact_name: string | null;
  payment_id: string;
  paid_at: string;
  amount: number;
  method: "transfer" | "cash" | "qris" | "other";
  reference_no: string | null;
  payer_name: string | null;
  verification_status: "pending" | "verified" | "rejected" | "void";
  due_period_month: number | null;
  due_period_year: number | null;
  period_count: number;
  period_label: string;
};

type LoadState = "checking" | "ready" | "empty" | "guest" | "error";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getCoverageEnd(row: DuesRecapRow) {
  if (!row.due_period_month || !row.due_period_year) return null;
  return new Date(row.due_period_year, row.due_period_month - 1 + row.period_count, 0);
}

function formatCoverageEnd(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function getStatusLabel(status: DuesRecapRow["verification_status"]) {
  return {
    pending: "Menunggu verifikasi",
    verified: "Terverifikasi",
    rejected: "Ditolak",
    void: "Dibatalkan",
  }[status];
}

function getStatusClass(status: DuesRecapRow["verification_status"]) {
  return {
    pending: "border-accent/35 bg-accent-soft text-foreground",
    verified: "border-primary/20 bg-primary-soft text-primary",
    rejected: "border-red-200 bg-red-50 text-red-700",
    void: "border-border bg-surface text-muted",
  }[status];
}

export function PersonalDuesRecap() {
  const [state, setState] = useState<LoadState>("checking");
  const [message, setMessage] = useState("Memuat rekap iuran...");
  const [rows, setRows] = useState<DuesRecapRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadRecap() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!sessionData.session) {
          setState("guest");
          setMessage("Masuk warga untuk melihat rekap iuran rumah.");
          return;
        }

        const { data, error } = await supabase.rpc("get_my_dues_recap");
        if (!mounted) return;

        if (error) {
          setState("error");
          setMessage(error.message);
          return;
        }

        const nextRows = (data ?? []) as DuesRecapRow[];
        setRows(nextRows);
        setState(nextRows.length > 0 ? "ready" : "empty");
        setMessage(
          nextRows.length > 0
            ? `${nextRows.length} pembayaran iuran terbaca.`
            : "Belum ada pembayaran iuran yang terhubung ke profil rumah ini.",
        );
      } catch {
        if (!mounted) return;
        setState("error");
        setMessage("Supabase belum terkonfigurasi untuk rekap iuran.");
      }
    }

    void loadRecap();

    return () => {
      mounted = false;
    };
  }, []);

  const verifiedRows = rows.filter((row) => row.verification_status === "verified");
  const pendingRows = rows.filter((row) => row.verification_status === "pending");
  const totalVerified = verifiedRows.reduce((sum, row) => sum + Number(row.amount), 0);
  const latestCoverage =
    verifiedRows
      .map(getCoverageEnd)
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const household = rows[0];

  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.7fr_0.3fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Rekap iuran pribadi
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Riwayat pembayaran rumah yang sudah terhubung ke akun.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Rekap ini hanya tampil untuk warga yang login dan terhubung dengan
              data rumah. Pembayaran beberapa bulan atau tahun diringkas sebagai
              cakupan periode.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Status data
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {message}
            </p>
          </div>
        </div>

        {state === "guest" ? (
          <div className="mt-6 grid gap-4 rounded-xl border border-accent/35 bg-accent-soft/65 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="text-sm font-semibold leading-6 text-foreground">
              Masuk sebagai warga untuk membuka rekap iuran pribadi.
            </p>
            <Link
              href="/masuk/?next=/portal/profil-rumah/"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Masuk warga
            </Link>
          </div>
        ) : null}

        {state === "ready" ? (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name="building" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Rumah
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {household.cluster} / {household.unit_number || household.block_or_unit}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name="wallet" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Terverifikasi
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatCurrency(totalVerified)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name="calendar" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Lunas sampai
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatCoverageEnd(latestCoverage)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name="shield" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Pending
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {pendingRows.length} pembayaran
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-[1fr_auto] gap-3 bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                <span>Riwayat pembayaran</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-border">
                {rows.slice(0, 8).map((row) => (
                  <article
                    key={row.payment_id}
                    className="grid gap-3 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {row.period_label} - {formatCurrency(row.amount)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {formatDate(row.paid_at)} via {row.method}
                        {row.period_count > 1 ? `, ${row.period_count} bulan` : ""}
                        {row.reference_no ? `, ref ${row.reference_no}` : ""}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(row.verification_status)}`}
                    >
                      {getStatusLabel(row.verification_status)}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {state === "empty" ? (
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">
              Belum ada rekap pembayaran.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Setelah rumah terhubung dan pembayaran diverifikasi bendahara,
              riwayat iuran akan tampil di sini.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
