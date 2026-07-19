"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
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
  created_at: string;
  paid_at: string;
  amount: number;
  method: "transfer" | "cash" | "qris" | "other";
  reference_no: string | null;
  payer_name: string | null;
  note: string;
  due_period_month: number | null;
  due_period_year: number | null;
  period_count: number;
  verification_status: "pending" | "verified" | "rejected" | "void";
};

type UserRoleRow = { role: string };
type PermissionRow = { permission: string };
type HouseholdOption = {
  id: string;
  cluster: string;
  block_or_unit: string;
};
type AttachmentRow = {
  id: string;
  linked_id: string;
  file_name: string;
  storage_path: string;
};
type ProofLink = { name: string; url: string };

type ManualPaymentForm = {
  householdId: string;
  payerName: string;
  paidAt: string;
  amount: string;
  method: PaymentRow["method"];
  referenceNo: string;
  duePeriodMonth: string;
  duePeriodYear: string;
  periodCount: string;
  note: string;
};

const currentDate = new Date();
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: formatPeriod(index + 1, currentDate.getFullYear()).replace(` ${currentDate.getFullYear()}`, ""),
}));

function getTodayInputValue() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

function getInitialManualForm(): ManualPaymentForm {
  return {
    householdId: "",
    payerName: "",
    paidAt: getTodayInputValue(),
    amount: "150000",
    method: "transfer",
    referenceNo: "",
    duePeriodMonth: String(currentDate.getMonth() + 1),
    duePeriodYear: String(currentDate.getFullYear()),
    periodCount: "1",
    note: "",
  };
}

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

function formatPeriodRange(month: number | null, year: number | null, count: number) {
  if (!month || !year) return "";

  const safeCount = Math.max(Number(count) || 1, 1);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month - 1 + safeCount, 0);
  const formatter = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  });

  if (safeCount === 1) return formatter.format(startDate);
  return `${formatter.format(startDate)} s.d. ${formatter.format(endDate)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value || "-"}
      </p>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function isPreviewableImage(fileName: string) {
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(fileName);
}

export function IuranAdminClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [roleLabel, setRoleLabel] = useState("Admin");
  const [message, setMessage] = useState("Memuat data iuran...");
  const [canRead, setCanRead] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [canVerify, setCanVerify] = useState(false);
  const [summaries, setSummaries] = useState<BillingSummaryRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [households, setHouseholds] = useState<HouseholdOption[]>([]);
  const [manualForm, setManualForm] = useState<ManualPaymentForm>(() => getInitialManualForm());
  const [manualMessage, setManualMessage] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [proofUrls, setProofUrls] = useState<Record<string, Array<{ name: string; url: string }>>>({});
  const [actionPaymentId, setActionPaymentId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<ProofLink | null>(null);

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
      const hasWrite = permissions.some((row) => row.permission === "billing:write");
      const hasVerify = permissions.some((row) => row.permission === "billing:verify");
      setCanRead(hasRead);
      setCanWrite(hasWrite);
      setCanVerify(hasVerify);

      if (!hasRead) {
        setMessage("Akun ini belum punya akses membaca iuran.");
        return;
      }

      const [
        { data: summaryData, error: summaryError },
        { data: paymentData, error: paymentError },
        { data: householdData, error: householdError },
      ] =
        await Promise.all([
          supabase
            .from("billing_dashboard_summary")
            .select("billing_period_id, period_month, period_year, period_status, charge_count, billed_total, paid_charge_total, outstanding_count")
            .order("period_year", { ascending: false })
            .order("period_month", { ascending: false })
            .limit(12),
          supabase
            .from("payments")
            .select("id, household_id, created_at, paid_at, amount, method, reference_no, payer_name, note, due_period_month, due_period_year, period_count, verification_status")
            .order("paid_at", { ascending: false })
            .limit(20),
          supabase
            .from("households")
            .select("id, cluster, block_or_unit")
            .order("cluster", { ascending: true })
            .order("block_or_unit", { ascending: true })
            .limit(500),
        ]);

      if (summaryError) {
        setMessage(summaryError.message);
        return;
      }

      if (paymentError) {
        setMessage(paymentError.message);
        return;
      }

      if (householdError) {
        setMessage(householdError.message);
        return;
      }

      setSummaries((summaryData ?? []) as BillingSummaryRow[]);
      const loadedPayments = (paymentData ?? []) as PaymentRow[];
      setPayments(loadedPayments);
      setHouseholds((householdData ?? []) as HouseholdOption[]);

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

        const nextProofUrls: Record<string, ProofLink[]> = {};
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

  async function submitManualPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      setManualMessage("Akun ini belum punya izin input iuran.");
      return;
    }

    const selectedHousehold = households.find((household) => household.id === manualForm.householdId);
    const payerName = manualForm.payerName.trim();
    const amount = Number(manualForm.amount.replace(/[^\d]/g, ""));
    const duePeriodMonth = Number(manualForm.duePeriodMonth);
    const duePeriodYear = Number(manualForm.duePeriodYear);
    const periodCount = Number(manualForm.periodCount);
    const referenceNo = manualForm.referenceNo.trim();
    const note = manualForm.note.trim();

    if (!selectedHousehold) {
      setManualMessage("Pilih rumah dulu, biar catatannya tidak nyasar.");
      return;
    }

    if (payerName.length < 2) {
      setManualMessage("Nama pembayar perlu diisi minimal 2 karakter.");
      return;
    }

    if (!amount || amount < 1000) {
      setManualMessage("Nominal iuran belum valid.");
      return;
    }

    if (duePeriodMonth < 1 || duePeriodMonth > 12 || duePeriodYear < 2020 || duePeriodYear > 2100) {
      setManualMessage("Periode iuran belum valid.");
      return;
    }

    if (periodCount < 1 || periodCount > 120) {
      setManualMessage("Cakupan bulan harus di antara 1 sampai 120.");
      return;
    }

    setIsSavingManual(true);
    setManualMessage("Menyimpan catatan transfer...");

    const paidAt = new Date(`${manualForm.paidAt}T12:00:00+07:00`).toISOString();
    const { error } = await supabase.from("payments").insert({
      household_id: selectedHousehold.id,
      paid_at: paidAt,
      amount,
      method: manualForm.method,
      reference_no: referenceNo || null,
      payer_name: payerName,
      note: [
        "Input manual pengurus",
        `Cluster/blok: ${selectedHousehold.cluster} / ${selectedHousehold.block_or_unit}`,
        `Periode mulai: ${manualForm.duePeriodMonth.padStart(2, "0")}-${manualForm.duePeriodYear}`,
        `Jumlah periode: ${periodCount} bulan`,
        note,
      ].filter(Boolean).join("\n"),
      due_period_month: duePeriodMonth,
      due_period_year: duePeriodYear,
      period_count: periodCount,
      received_by: user?.id ?? null,
      verification_status: "pending",
    });

    if (error) {
      setManualMessage(error.message);
      setIsSavingManual(false);
      return;
    }

    setManualForm((previous) => ({
      ...getInitialManualForm(),
      duePeriodMonth: previous.duePeriodMonth,
      duePeriodYear: previous.duePeriodYear,
      periodCount: previous.periodCount,
      amount: previous.amount,
    }));
    await loadData();
    setManualMessage("Catatan transfer masuk. Tinggal setujui kalau sudah cocok dengan mutasi.");
    setIsSavingManual(false);
  }

  const currentPeriod = summaries[0];
  const billedTotal = summaries.reduce((sum, item) => sum + Number(item.billed_total), 0);
  const paidTotal = summaries.reduce((sum, item) => sum + Number(item.paid_charge_total), 0);
  const outstandingCount = summaries.reduce((sum, item) => sum + Number(item.outstanding_count), 0);
  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) ?? null;
  const selectedProofs = selectedPayment ? proofUrls[selectedPayment.id] ?? [] : [];
  const selectedHousehold = households.find((household) => household.id === manualForm.householdId) ?? null;

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

      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Catat transfer manual"
          subtitle="Untuk transfer yang sudah masuk mutasi, tapi warga belum sempat isi konfirmasi. Catatan manual tetap masuk antrean setuju/posting kas."
        />
        {canWrite ? (
          <form onSubmit={(event) => void submitManualPayment(event)} className="border-t border-border p-4">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <FieldLabel label="Rumah warga">
                <select
                  value={manualForm.householdId}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, householdId: event.target.value }))}
                  required
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="">Pilih cluster / blok rumah</option>
                  {households.map((household) => (
                    <option key={household.id} value={household.id}>
                      {household.cluster} / {household.block_or_unit}
                    </option>
                  ))}
                </select>
              </FieldLabel>

              <FieldLabel label="Nama pembayar">
                <input
                  value={manualForm.payerName}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, payerName: event.target.value }))}
                  placeholder="Nama di mutasi / warga"
                  required
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </FieldLabel>

              <FieldLabel label="Tanggal bayar">
                <input
                  type="date"
                  value={manualForm.paidAt}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, paidAt: event.target.value }))}
                  required
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </FieldLabel>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <FieldLabel label="Nominal">
                <input
                  inputMode="numeric"
                  value={manualForm.amount}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, amount: event.target.value }))}
                  placeholder="150000"
                  required
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </FieldLabel>

              <FieldLabel label="Metode">
                <select
                  value={manualForm.method}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, method: event.target.value as PaymentRow["method"] }))}
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="transfer">Transfer</option>
                  <option value="qris">QRIS</option>
                  <option value="cash">Tunai</option>
                  <option value="other">Lainnya</option>
                </select>
              </FieldLabel>

              <FieldLabel label="Mulai periode">
                <div className="grid grid-cols-[1fr_92px] gap-2">
                  <select
                    value={manualForm.duePeriodMonth}
                    onChange={(event) => setManualForm((previous) => ({ ...previous, duePeriodMonth: event.target.value }))}
                    className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <input
                    inputMode="numeric"
                    value={manualForm.duePeriodYear}
                    onChange={(event) => setManualForm((previous) => ({ ...previous, duePeriodYear: event.target.value }))}
                    className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </FieldLabel>

              <FieldLabel label="Cakupan">
                <input
                  inputMode="numeric"
                  value={manualForm.periodCount}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, periodCount: event.target.value }))}
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </FieldLabel>

              <FieldLabel label="Referensi">
                <input
                  value={manualForm.referenceNo}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, referenceNo: event.target.value }))}
                  placeholder="No ref mutasi"
                  className="min-h-11 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </FieldLabel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
              <FieldLabel label="Catatan">
                <textarea
                  value={manualForm.note}
                  onChange={(event) => setManualForm((previous) => ({ ...previous, note: event.target.value }))}
                  placeholder="Misal: masuk rekening RT, dicek dari mutasi BCA."
                  rows={3}
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </FieldLabel>

              <div className="grid content-end gap-2">
                <div className="rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted">
                  {selectedHousehold ? (
                    <>
                      Rumah: <span className="font-bold text-foreground">{selectedHousehold.cluster} / {selectedHousehold.block_or_unit}</span>
                      <br />
                      Status setelah simpan: <span className="font-bold text-primary">pending</span>
                    </>
                  ) : (
                    "Pilih rumah dulu. Data rumah dibaca dari Supabase households."
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSavingManual || households.length === 0}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {isSavingManual ? "Menyimpan..." : "Simpan catatan"}
                </button>
              </div>
            </div>

            {manualMessage ? (
              <p className="mt-3 rounded-xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
                {manualMessage}
              </p>
            ) : null}
          </form>
        ) : (
          <p className="border-t border-border px-4 py-5 text-sm text-muted">
            Akun ini bisa membaca iuran, tapi belum punya izin input manual. Bendahara atau super admin bisa mencatat transfer di sini.
          </p>
        )}
      </ProductionPanel>

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
                      {payment.due_period_month && payment.due_period_year ? ` - ${formatPeriodRange(payment.due_period_month, payment.due_period_year, payment.period_count)}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatCurrency(payment.amount)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary">{payment.verification_status}</span>
                  <span className="text-muted">{payment.reference_no || "Tanpa referensi"}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className="cursor-pointer rounded-full border border-primary/20 bg-white px-3 py-1 font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Lihat detail
                  </button>
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

      {selectedPayment ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-detail-title"
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            setSelectedPaymentId(null);
            setSelectedProof(null);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-[0_32px_90px_rgba(15,23,42,0.28)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Detail konfirmasi iuran
                </p>
                <h2
                  id="payment-detail-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-foreground"
                >
                  {selectedPayment.payer_name || "Pembayar belum diisi"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  ID {selectedPayment.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentId(null);
                  setSelectedProof(null);
                }}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-surface text-lg font-semibold text-muted transition-colors duration-200 hover:border-primary/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Tutup detail pembayaran"
              >
                x
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Nominal" value={formatCurrency(selectedPayment.amount)} />
              <DetailRow label="Tanggal bayar" value={formatDate(selectedPayment.paid_at)} />
              <DetailRow label="Status" value={selectedPayment.verification_status} />
              <DetailRow label="Metode" value={selectedPayment.method} />
              <DetailRow label="Referensi" value={selectedPayment.reference_no || "Tanpa referensi"} />
              <DetailRow label="Dikirim" value={formatDate(selectedPayment.created_at)} />
              <DetailRow
                label="Periode"
                value={formatPeriodRange(
                  selectedPayment.due_period_month,
                  selectedPayment.due_period_year,
                  selectedPayment.period_count,
                )}
              />
              <DetailRow label="Cakupan" value={`${selectedPayment.period_count} bulan`} />
              <DetailRow label="Rumah ID" value={selectedPayment.household_id} />
            </div>

            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Catatan submit
              </p>
              <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                {selectedPayment.note || "-"}
              </pre>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    Bukti transfer
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Signed URL berlaku sementara dari Supabase Storage.
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {selectedProofs.length} file
                </span>
              </div>
              {selectedProofs.length > 0 ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {selectedProofs.map((proof) =>
                    isPreviewableImage(proof.name) ? (
                      <button
                        key={proof.url}
                        type="button"
                        onClick={() => setSelectedProof(proof)}
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-primary/20 bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Preview bukti: {proof.name}
                      </button>
                    ) : (
                      <a
                        key={proof.url}
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-primary/20 bg-background px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Buka bukti: {proof.name}
                      </a>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted">
                  Belum ada bukti transfer yang terhubung ke konfirmasi ini.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {canVerify && selectedPayment.verification_status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => void approvePayment(selectedPayment.id)}
                    disabled={actionPaymentId === selectedPayment.id}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {actionPaymentId === selectedPayment.id ? "Memproses..." : "Setujui & posting kas"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void rejectPayment(selectedPayment.id)}
                    disabled={actionPaymentId === selectedPayment.id}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    Tolak
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentId(null);
                  setSelectedProof(null);
                }}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Tutup
              </button>
            </div>
          </div>

          {selectedProof ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Preview bukti transfer"
              className="fixed inset-0 z-[60] grid place-items-center bg-foreground/70 px-4 py-6 backdrop-blur-sm"
              onClick={() => setSelectedProof(null)}
            >
              <div
                className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-background shadow-[0_32px_100px_rgba(0,0,0,0.36)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Bukti transfer
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground">
                      {selectedProof.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProof(null)}
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-background text-lg font-semibold text-muted transition-colors duration-200 hover:border-primary/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Tutup preview bukti transfer"
                  >
                    x
                  </button>
                </div>
                <div className="grid max-h-[78vh] place-items-center overflow-auto bg-foreground/5 p-3">
                  <img
                    src={selectedProof.url}
                    alt={`Bukti transfer ${selectedProof.name}`}
                    className="max-h-[74vh] w-auto max-w-full rounded-xl border border-border bg-white object-contain shadow-sm"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </ProductionAdminShell>
  );
}
