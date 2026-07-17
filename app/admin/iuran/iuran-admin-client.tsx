"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "../production-admin-components";

type BillingSummaryRow = {
  billing_period_id: string;
  period_month: number;
  period_year: number;
  period_status: "draft" | "issued" | "closed";
  charge_count: number;
  billed_total: number;
  paid_charge_total: number;
  outstanding_count: number;
};

type PaymentRow = {
  id: string;
  household_id: string;
  paid_at: string;
  amount: number;
  method: "transfer" | "cash" | "qris" | "other";
  reference_no: string | null;
  payer_name: string | null;
  due_period_month: number | null;
  due_period_year: number | null;
  verification_status: "pending" | "verified" | "rejected" | "void";
};

type UserRoleRow = { role: string };
type PermissionRow = { permission: string };
type AttachmentRow = {
  id: string;
  linked_id: string;
  file_name: string;
  storage_path: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPeriod(month: number, year: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function IuranAdminClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [roleLabel, setRoleLabel] = useState("Admin");
  const [message, setMessage] = useState("Memuat data iuran...");
  const [canRead, setCanRead] = useState(false);
  const [canVerify, setCanVerify] = useState(false);
  const [summaries, setSummaries] = useState<BillingSummaryRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [proofUrls, setProofUrls] = useState<Record<string, Array<{ name: string; url: string }>>>({});
  const [actionPaymentId, setActionPaymentId] = useState<string | null>(null);

  const loadData = useCallback(
    async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.user) {
        setMessage(sessionError?.message || "Login admin diperlukan.");
        return;
      }

      const activeUser = sessionData.session.user;
      setUser(activeUser);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", activeUser.id);

      if (roleError) {
        setMessage(roleError.message);
        return;
      }

      const roles = ((roleData ?? []) as UserRoleRow[]).map((row) => row.role);
      setRoleLabel(roles[0] ?? "Admin");

      const { data: permissionData, error: permissionError } = roles.length
        ? await supabase.from("role_permissions").select("permission").in("role", roles)
        : { data: [], error: null };

      if (permissionError) {
        setMessage(permissionError.message);
        return;
      }

      const permissions = (permissionData ?? []) as PermissionRow[];
      const hasRead = permissions.some((row) => row.permission === "billing:read" || row.permission === "finance:read");
      const hasVerify = permissions.some((row) => row.permission === "billing:verify");
      setCanRead(hasRead);
      setCanVerify(hasVerify);

      if (!hasRead) {
        setMessage("Akun ini belum punya akses membaca iuran.");
        return;
      }

      const [{ data: summaryData, error: summaryError }, { data: paymentData, error: paymentError }] =
        await Promise.all([
          supabase
            .from("billing_dashboard_summary")
            .select("billing_period_id, period_month, period_year, period_status, charge_count, billed_total, paid_charge_total, outstanding_count")
            .order("period_year", { ascending: false })
            .order("period_month", { ascending: false })
            .limit(12),
          supabase
            .from("payments")
            .select("id, household_id, paid_at, amount, method, reference_no, payer_name, due_period_month, due_period_year, verification_status")
            .order("paid_at", { ascending: false })
            .limit(20),
        ]);

      if (summaryError) {
        setMessage(summaryError.message);
        return;
      }

      if (paymentError) {
        setMessage(paymentError.message);
        return;
      }

      setSummaries((summaryData ?? []) as BillingSummaryRow[]);
      const loadedPayments = (paymentData ?? []) as PaymentRow[];
      setPayments(loadedPayments);

      const paymentIds = loadedPayments.map((payment) => payment.id);
      if (paymentIds.length > 0) {
        const { data: attachmentData } = await supabase
          .from("attachments")
          .select("id, linked_id, file_name, storage_path")
          .eq("linked_type", "finance_confirmation")
          .in("linked_id", paymentIds);

        const signedEntries = await Promise.all(
          ((attachmentData ?? []) as AttachmentRow[]).map(async (attachment) => {
            const { data: signedData } = await supabase.storage
              .from("payment-proofs")
              .createSignedUrl(attachment.storage_path, 600);

            if (!signedData?.signedUrl) return null;
            return {
              linkedId: attachment.linked_id,
              name: attachment.file_name,
              url: signedData.signedUrl,
            };
          }),
        );

        const nextProofUrls: Record<string, Array<{ name: string; url: string }>> = {};
        signedEntries.forEach((entry) => {
          if (!entry) return;
          nextProofUrls[entry.linkedId] = [...(nextProofUrls[entry.linkedId] ?? []), { name: entry.name, url: entry.url }];
        });
        setProofUrls(nextProofUrls);
      } else {
        setProofUrls({});
      }

      setMessage(`${summaryData?.length ?? 0} periode iuran terbaca.`);
    },
    [supabase],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  async function approvePayment(paymentId: string) {
    setActionPaymentId(paymentId);
    setMessage("Menyetujui iuran dan membuat transaksi kas...");

    const { error } = await supabase.rpc("approve_dues_payment", {
      p_payment_id: paymentId,
      p_publish_to_public_summary: true,
    });

    if (error) {
      setMessage(error.message);
      setActionPaymentId(null);
      return;
    }

    await loadData();
    setMessage("Iuran disetujui dan transaksi kas masuk dibuat.");
    setActionPaymentId(null);
  }

  async function rejectPayment(paymentId: string) {
    const reason = window.prompt("Alasan penolakan iuran ini?");
    if (reason === null) return;

    setActionPaymentId(paymentId);
    setMessage("Menolak konfirmasi iuran...");

    const { error } = await supabase.rpc("reject_dues_payment", {
      p_payment_id: paymentId,
      p_reason: reason,
    });

    if (error) {
      setMessage(error.message);
      setActionPaymentId(null);
      return;
    }

    await loadData();
    setMessage("Konfirmasi iuran ditolak.");
    setActionPaymentId(null);
  }

  const currentPeriod = summaries[0];
  const billedTotal = summaries.reduce((sum, item) => sum + Number(item.billed_total), 0);
  const paidTotal = summaries.reduce((sum, item) => sum + Number(item.paid_charge_total), 0);
  const outstandingCount = summaries.reduce((sum, item) => sum + Number(item.outstanding_count), 0);

  return (
    <ProductionAdminShell
      active="iuran"
      title="Iuran"
      subtitle="Tagihan, pembayaran, tunggakan"
      userLabel={user?.email ?? "Admin"}
      roleLabel={roleLabel}
      isSuperAdmin={roleLabel === "super_admin"}
    >
      <ProductionPageIntro
        eyebrow="Iuran warga"
        title="Pantau tagihan dan pembayaran tanpa mengubah data terverifikasi."
        text="Modul ini memakai struktur billing period, tagihan rumah, pembayaran, dan alokasi pembayaran agar pembayaran dobel atau sebagian tetap tercatat rapi."
        side={<ProductionStatusPill>{canVerify ? "Bisa verifikasi" : canRead ? "Akses baca" : "Cek akses"}</ProductionStatusPill>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <ProductionMetricCard label="Periode" value={currentPeriod ? formatPeriod(currentPeriod.period_month, currentPeriod.period_year) : "-"} helper={message} icon="calendar" />
        <ProductionMetricCard label="Tagihan" value={formatCurrency(billedTotal)} helper="Total 12 periode terakhir" icon="file" />
        <ProductionMetricCard label="Terbayar" value={formatCurrency(paidTotal)} helper="Berdasarkan tagihan lunas" icon="wallet" />
        <ProductionMetricCard label="Belum lunas" value={String(outstandingCount)} helper="Rumah/periode outstanding" icon="shield" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <ProductionPanel>
          <ProductionPanelHeader
            title="Ringkasan bulanan"
            subtitle="Angka ini akan aktif setelah billing period dan household charges dibuat."
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-t border-border text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Tagihan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaries.map((item) => (
                  <tr key={item.billing_period_id} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-foreground">{formatPeriod(item.period_month, item.period_year)}</td>
                    <td className="px-4 py-3 capitalize">{item.period_status}</td>
                    <td className="px-4 py-3 text-right">{item.charge_count}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(item.billed_total)}</td>
                    <td className="px-4 py-3 text-right">{item.outstanding_count}</td>
                  </tr>
                ))}
                {summaries.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                      {message}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </ProductionPanel>

        <ProductionPanel>
          <ProductionPanelHeader
            title="Pembayaran masuk"
            subtitle="Setujui pembayaran setelah cocok dengan mutasi. Sistem akan membuat alokasi tagihan dan transaksi kas masuk."
          />
          <div className="divide-y divide-border border-t border-border">
            {payments.map((payment) => (
              <article key={payment.id} className="grid gap-2 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{payment.payer_name || "Pembayar belum diisi"}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(payment.paid_at)} - {payment.method}
                      {payment.due_period_month && payment.due_period_year ? ` - ${formatPeriod(payment.due_period_month, payment.due_period_year)}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatCurrency(payment.amount)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary">{payment.verification_status}</span>
                  <span className="text-muted">{payment.reference_no || "Tanpa referensi"}</span>
                </div>
                {proofUrls[payment.id]?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {proofUrls[payment.id].map((proof) => (
                      <a
                        key={proof.url}
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary hover:bg-accent-soft"
                      >
                        Bukti: {proof.name}
                      </a>
                    ))}
                  </div>
                ) : null}
                {canVerify && payment.verification_status === "pending" ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => void approvePayment(payment.id)}
                      disabled={actionPaymentId === payment.id}
                      className="cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionPaymentId === payment.id ? "Memproses..." : "Setujui & posting kas"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void rejectPayment(payment.id)}
                      disabled={actionPaymentId === payment.id}
                      className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Tolak
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
            {payments.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">{message}</p>
            ) : null}
          </div>
        </ProductionPanel>
      </div>
    </ProductionAdminShell>
  );
}
