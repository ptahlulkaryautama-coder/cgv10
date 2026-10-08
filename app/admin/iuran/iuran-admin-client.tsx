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
import {
  financeTotals,
  financeTransactions,
} from "@/lib/portal-data";

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

const liveFinanceSummary = [
  {
    title: "Saldo Awal",
    value: financeTotals.openingBalance,
    tone: "bg-[#dce8f1] text-[#2f6f9f]",
  },
  {
    title: "Pemasukan",
    value: financeTotals.income,
    tone: "bg-[#dcefe4] text-[#25775f]",
  },
  {
    title: "Total tersedia",
    value: financeTotals.openingBalance + financeTotals.income,
    tone: "bg-[#e5ebef] text-[#24465e]",
  },
  {
    title: "Pengeluaran",
    value: financeTotals.expense,
    tone: "bg-[#fae8d8] text-[#bd6a1d]",
  },
  {
    title: "Saldo akhir",
    value: financeTotals.endingBalance,
    tone: "bg-[#f4dfdf] text-[#b34848]",
  },
] as const;

const liveExpenseCategories = [
  { label: "Kegiatan & konsumsi", value: 4750000, color: "#2f6f9f" },
  { label: "Panitia & kas RW", value: 3800000, color: "#4d87c2" },
  { label: "Apresiasi", value: 2000000, color: "#61ae78" },
  { label: "Administrasi & perlengkapan", value: 150000, color: "#d78f21" },
  { label: "Sumbangan & transportasi", value: 300000, color: "#c75550" },
] as const;

const liveExpenseDonutBackground = (() => {
  let start = 0;
  const segments = liveExpenseCategories.map((category) => {
    const end = start + (category.value / financeTotals.expense) * 100;
    const segment = `${category.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
})();

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

  const [activeTab, setActiveTab] = useState<"visual" | "periods" | "payments">("visual");
  const [hoveredPeriodIndex, setHoveredPeriodIndex] = useState<number | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedType, setCopiedType] = useState<"message" | "link" | null>(null);

  // Official real monthly periods derived from the 16 verified ledger transactions (Total Rp 11.000.000)
  const displaySummaries: BillingSummaryRow[] = useMemo(() => {
    if (summaries.length > 0) return summaries;
    return [
      {
        billing_period_id: "official-6",
        period_month: 6,
        period_year: 2026,
        period_status: "closed",
        charge_count: 8,
        billed_total: 4070000,
        paid_charge_total: 4070000,
        outstanding_count: 0,
      },
      {
        billing_period_id: "official-5",
        period_month: 5,
        period_year: 2026,
        period_status: "closed",
        charge_count: 3,
        billed_total: 4050000,
        paid_charge_total: 4050000,
        outstanding_count: 0,
      },
      {
        billing_period_id: "official-4",
        period_month: 4,
        period_year: 2026,
        period_status: "closed",
        charge_count: 2,
        billed_total: 850000,
        paid_charge_total: 850000,
        outstanding_count: 0,
      },
      {
        billing_period_id: "official-3",
        period_month: 3,
        period_year: 2026,
        period_status: "closed",
        charge_count: 1,
        billed_total: 30000,
        paid_charge_total: 30000,
        outstanding_count: 0,
      },
      {
        billing_period_id: "official-2",
        period_month: 2,
        period_year: 2026,
        period_status: "closed",
        charge_count: 1,
        billed_total: 200000,
        paid_charge_total: 200000,
        outstanding_count: 0,
      },
      {
        billing_period_id: "official-1",
        period_month: 1,
        period_year: 2026,
        period_status: "closed",
        charge_count: 1,
        billed_total: 1800000,
        paid_charge_total: 1800000,
        outstanding_count: 0,
      },
    ];
  }, [summaries]);

  const billedTotal = financeTotals.expense;
  const paidTotal = financeTotals.expense;
  const totalAvailable = financeTotals.openingBalance + financeTotals.income;
  const totalChargesCount = financeTransactions.length;
  const collectionRate = 100;
  const pendingPayments = payments.filter((p) => p.verification_status === "pending");

  // Real 5 categories breakdown of the 16 transactions
  const categoryStats = useMemo(() => {
    return [
      { key: "kegiatan", label: "Kegiatan & Konsumsi Warga (4 tx)", count: 4, total: 4750000, pct: 43.2, tone: "bg-[#2f6f9f]" },
      { key: "rw", label: "Panitia & Kas RW 021 (2 tx)", count: 2, total: 3800000, pct: 34.5, tone: "bg-[#4d87c2]" },
      { key: "apresiasi", label: "Apresiasi Tokoh Warga (2 tx)", count: 2, total: 2000000, pct: 18.2, tone: "bg-[#61ae78]" },
      { key: "sumbangan", label: "Sumbangan & Transportasi (2 tx)", count: 2, total: 300000, pct: 2.7, tone: "bg-[#c75550]" },
      { key: "administrasi", label: "Administrasi & Perlengkapan (6 tx)", count: 6, total: 150000, pct: 1.4, tone: "bg-[#d78f21]" },
    ];
  }, []);

  const totalMethodAmount = financeTotals.expense;

  // Real Status Composition (Rp 11.000.000 pengeluaran resmi vs Rp 10.000 saldo kas)
  const statusComposition = useMemo(() => {
    const verifiedValue = financeTotals.expense;
    const pendingValue = 0;
    const unpaidValue = financeTotals.endingBalance;
    const grandTotal = financeTotals.openingBalance + financeTotals.income;

    const verifiedPct = 99.9;
    const pendingPct = 0;
    const unpaidPct = 0.1;

    const gradient = `conic-gradient(
      #059669 0% 99.9%,
      #d4af37 99.9% 100%
    )`;

    return {
      verifiedValue,
      pendingValue,
      unpaidValue,
      verifiedPct,
      pendingPct,
      unpaidPct,
      grandTotal,
      gradient,
    };
  }, []);

  // Real Program Allocation Stats
  const programStats = useMemo(() => {
    return [
      { name: "Bidang Sosial & Konsumsi Warga", total: 4750000, paid: 4750000, rate: 100 },
      { name: "Bidang Kepengurusan & Kas RW 021", total: 3800000, paid: 3800000, rate: 100 },
      { name: "Bidang Apresiasi Tokoh Warga", total: 2000000, paid: 2000000, rate: 100 },
      { name: "Bidang Keagamaan (MTQ) & Transport", total: 300000, paid: 300000, rate: 100 },
      { name: "Bidang Administrasi & Perlengkapan", total: 150000, paid: 150000, rate: 100 },
    ];
  }, []);

  // Chronological order for trend bar chart (earliest to latest)
  const chartSummaries = useMemo(() => {
    return [...displaySummaries].reverse();
  }, [displaySummaries]);

  const maxChartBilled = Math.max(...chartSummaries.map((s) => Math.max(Number(s.billed_total), Number(s.paid_charge_total))), 5000000);

  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) ?? null;
  const selectedProofs = selectedPayment ? proofUrls[selectedPayment.id] ?? [] : [];
  const selectedHousehold = households.find((household) => household.id === manualForm.householdId) ?? null;

  return (
    <ProductionAdminShell
      active="iuran"
      title="Iuran"
      subtitle="Buku kas, realisasi pengeluaran, pos anggaran RT 010"
      userLabel={user?.email ?? "Admin"}
      roleLabel={roleLabel}
      isSuperAdmin={roleLabel === "super_admin"}
    >
      <ProductionPageIntro
        eyebrow="Keuangan & Kas RT 010"
        title="Laporan Keuangan & Kas Resmi Warga RT 010 RW 021."
        text="Data menyajikan rekonsiliasi kas resmi periode Januari-Juni 2026 yang bersumber langsung dari buku kas RT 010 dengan total realisasi Rp11.000.000 dan saldo akhir Rp10.000."
        side={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-sm hover:bg-primary-soft hover:border-primary/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>🖨️ Cetak / Unduh PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>📢 Bagikan ke Warga</span>
            </button>
            <ProductionStatusPill>{canVerify ? "Bisa verifikasi" : canRead ? "Akses baca" : "Cek akses"}</ProductionStatusPill>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProductionMetricCard
          label="Periode Buku Kas"
          value="Jan - Jun 2026"
          helper="Laporan Resmi Kas RT 010"
          icon="calendar"
        />
        <ProductionMetricCard
          label="Total Kas Tersedia"
          value={formatCurrency(totalAvailable)}
          helper="Saldo Awal Rp8,51 jt + Masuk Rp2,5 jt"
          icon="file"
        />
        <ProductionMetricCard
          label="Realisasi Pengeluaran"
          value={formatCurrency(paidTotal)}
          helper="16 pos transaksi terverifikasi"
          icon="wallet"
          tone="green"
        />
        <ProductionMetricCard
          label="Saldo Kas Saat Ini"
          value={formatCurrency(financeTotals.endingBalance)}
          helper="Pemanfaatan kas 99,9%"
          icon="shield"
          tone="gold"
        />
      </div>

      {/* Interactive Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "visual"
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-white text-muted hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span>📊 Visualisasi & Tren Grafik</span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-black text-accent-soft">
              Live Web
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("periods")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "periods"
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-white text-muted hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span>📋 Tabel Periode ({displaySummaries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "payments"
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-white text-muted hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span>💳 Mutasi & Catat Transfer</span>
            {pendingPayments.length > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white animate-pulse">
                {pendingPayments.length} pending
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sinkronisasi Data Kas Aktif</span>
        </div>
      </div>

      {/* TAB 1: VISUALISASI KEUANGAN & GRAFIK (LIVE WEB STYLE) */}
      {activeTab === "visual" && (
        <div className="mt-5 space-y-8">
          {/* A. LIVE WEB BUKU KAS RT 010 (SESUAI PORTALWARGACGV.ID/KEUANGAN) */}
          <section className="rounded-2xl border border-border bg-[#faf8f5] p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Laporan Kas Resmi RT 010</span>
                  <span>•</span>
                  <span>Januari-Juni 2026</span>
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Ringkasan Buku Kas & Komposisi Pengeluaran
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Sinkron 100% dengan tampilan publik Portal Warga (<code className="rounded bg-surface px-1.5 py-0.5 font-mono text-primary">portalwargacgv.id/keuangan/</code>).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm hover:bg-primary-soft transition-all cursor-pointer"
                >
                  <span>🖨️ Cetak PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  <span>📢 Share WA</span>
                </button>
              </div>
            </div>

            {/* 1. 5 TOP CARDS IN 1 ROW */}
            <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-white sm:grid-cols-3 lg:grid-cols-5 shadow-sm">
              {liveFinanceSummary.map((item) => (
                <div
                  key={item.title}
                  className={`min-h-24 border-b border-border p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:min-h-28 lg:border-b-0 lg:border-r lg:last:border-r-0 ${item.tone}`}
                >
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em]">{item.title}</dt>
                  <dd className="mt-3 text-lg font-black tracking-tight sm:text-xl xl:text-2xl">
                    {formatCurrency(item.value)}
                  </dd>
                </div>
              ))}
            </dl>

            {/* 2. RINCIAN PENGELUARAN (DONUT & 5 CATEGORIES) */}
            <article className="mt-6 rounded-2xl border border-border bg-white p-5 sm:p-7 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-foreground">Rincian pengeluaran</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Dikelompokkan dalam lima kategori agar lebih mudah dibaca.
                </p>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(14rem,0.65fr)_minmax(0,1.35fr)] lg:items-center">
                {/* Donut Chart Ring */}
                <div
                  className="mx-auto grid h-52 w-52 place-items-center rounded-full p-6 sm:h-60 sm:w-60 shadow-md transition-transform hover:scale-105 duration-300"
                  style={{ backgroundImage: liveExpenseDonutBackground }}
                  role="img"
                  aria-label={`Komposisi total pengeluaran ${formatCurrency(financeTotals.expense)} dalam lima kategori.`}
                >
                  <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Total</p>
                      <p className="mt-1 text-lg font-black tracking-tight text-primary sm:text-2xl">
                        {formatCurrency(financeTotals.expense)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5 Categories List */}
                <dl className="divide-y divide-border">
                  {liveExpenseCategories.map((category) => {
                    const pct = new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 1,
                    }).format((category.value / financeTotals.expense) * 100);

                    return (
                      <div
                        key={category.label}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-3.5 first:pt-0 last:pb-0"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: category.color }}
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="font-bold text-xs sm:text-sm text-foreground">{category.label}</dt>
                          <dd className="mt-0.5 text-xs text-muted font-medium">{formatCurrency(category.value)}</dd>
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold text-primary">{pct}%</span>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </article>

            {/* 3. DAFTAR TRANSAKSI RESMI (16 ROWS) */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div className="bg-primary px-5 py-3.5 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Daftar Transaksi Kas Resmi</h4>
                  <p className="text-[11px] text-white/80">16 rincian pos pengeluaran RT 010 (Januari - Juni 2026)</p>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-black">
                  Total: {formatCurrency(financeTotals.expense)}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-surface text-muted font-bold border-b border-border">
                    <tr>
                      <th className="w-12 px-4 py-2.5">No</th>
                      <th className="px-4 py-2.5">Uraian</th>
                      <th className="px-4 py-2.5 text-right">Jumlah</th>
                      <th className="px-4 py-2.5 text-right">Satuan</th>
                      <th className="px-4 py-2.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {financeTransactions.map((item, index) => (
                      <tr key={item.description} className="hover:bg-primary-soft/30 transition-colors">
                        <td className="px-4 py-2 text-primary font-bold">{index + 1}</td>
                        <td className="px-4 py-2 text-foreground">{item.description}</td>
                        <td className="px-4 py-2 text-right text-muted">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-muted">{formatCurrency(item.unitAmount)}</td>
                        <td className="px-4 py-2 text-right font-bold text-primary">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* B. ANALITIK PENYERAPAN KAS & PROGRAM KERJA RT 010 (100% DATA RESMI) */}
          <div className="pt-2">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">Analitik Penyerapan Kas & Program Kerja RT 010</h3>
              <p className="text-xs text-muted">
                Statistik akuntabilitas penyerapan dana per bulan, komposisi kategori resmi, dan alokasi program kerja RT 010 (Total kas keluar Rp11.000.000).
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              {/* 1. Interactive Bar Chart */}
              <ProductionPanel>
                <ProductionPanelHeader
                  title="Tren Realisasi Pengeluaran Kas per Bulan"
                  subtitle="Pergerakan realisasi kas keluar Januari - Juni 2026 sesuai 16 pos transaksi resmi."
                />
                <div className="p-5">
                  {/* Chart Header Badges */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <span className="h-3 w-3 rounded-sm bg-emerald-600 shadow-sm" />
                        Realisasi Pengeluaran
                      </span>
                    </div>
                    <div className="rounded-lg border border-border bg-surface px-3 py-1 font-semibold text-primary">
                      Penyerapan Kas: <strong className="text-emerald-700">99,9% (Rp11.000.000)</strong>
                    </div>
                  </div>

                  {/* Bar Chart Area */}
                  <div className="relative flex h-64 items-end gap-3 sm:gap-4 border-b border-border pb-4 pt-6">
                    {chartSummaries.map((item, index) => {
                      const billedHeight = Math.round((Number(item.billed_total) / maxChartBilled) * 100);
                      const isHovered = hoveredPeriodIndex === index;

                      return (
                        <div
                          key={item.billing_period_id}
                          className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
                          onMouseEnter={() => setHoveredPeriodIndex(index)}
                          onMouseLeave={() => setHoveredPeriodIndex(null)}
                        >
                          {/* Nominal Badge on Top */}
                          <span
                            className={`mb-2 text-[10px] sm:text-xs font-bold text-emerald-700 transition-transform ${
                              isHovered ? "scale-110 font-extrabold" : ""
                            }`}
                          >
                            {item.billed_total >= 1000000
                              ? `Rp${(item.billed_total / 1000000).toFixed(1)}jt`
                              : `Rp${(item.billed_total / 1000).toFixed(0)}rb`}
                          </span>

                          {/* Bar Group */}
                          <div className="flex w-full max-w-[40px] items-end justify-center h-full">
                            <div
                              className="w-full rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-sm transition-all duration-300 group-hover:brightness-110"
                              style={{ height: `${Math.max(billedHeight, 6)}%` }}
                              title={`Realisasi: ${formatCurrency(item.paid_charge_total)}`}
                            />
                          </div>

                          {/* Month Label */}
                          <span className="mt-3 text-[11px] font-bold text-muted group-hover:text-foreground">
                            {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(item.period_year, item.period_month - 1, 1))}
                          </span>

                          {/* Hover Tooltip Box */}
                          {isHovered && (
                            <div className="absolute -top-24 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-xl border border-primary/20 bg-background/95 p-3 shadow-xl backdrop-blur-sm pointer-events-none text-left min-w-[170px]">
                              <p className="text-xs font-bold text-foreground">
                                {formatPeriod(item.period_month, item.period_year)}
                              </p>
                              <div className="mt-1 space-y-0.5 text-[11px]">
                                <p className="text-emerald-700 font-semibold">
                                  Realisasi: {formatCurrency(item.paid_charge_total)}
                                </p>
                                <p className="text-muted font-medium">
                                  Rincian: {item.charge_count} pos transaksi
                                </p>
                                <p className="text-primary font-bold">
                                  Status: Terverifikasi Buku Kas
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Chart Footer Explanation */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <p>💡 Arahkan kursor ke grafik untuk melihat rincian per bulan.</p>
                    <span className="font-semibold text-primary">Status: Selaras dengan Kas RW & RT (Rp11.000.000)</span>
                  </div>
                </div>
              </ProductionPanel>

              {/* 2. Donut Chart */}
              <ProductionPanel>
                <ProductionPanelHeader
                  title="Komposisi Kas & Akuntabilitas"
                  subtitle="Distribusi realisasi pengeluaran terhadap total kas tersedia."
                />
                <div className="p-5 flex flex-col items-center">
                  <div
                    className="relative grid h-44 w-44 sm:h-48 sm:w-48 place-items-center rounded-full p-6 shadow-inner transition-transform hover:scale-105 duration-300"
                    style={{ backgroundImage: statusComposition.gradient }}
                    role="img"
                    aria-label="Komposisi realisasi kas RT 010"
                  >
                    <div className="grid h-full w-full place-items-center rounded-full bg-background text-center shadow-md p-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Penyerapan</p>
                        <p className="mt-0.5 text-2xl font-black tracking-tight text-primary">
                          {statusComposition.verifiedPct}%
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-700">Terserap</p>
                      </div>
                    </div>
                  </div>

                  {/* Legend List */}
                  <dl className="mt-6 w-full divide-y divide-border text-xs">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="flex items-center gap-2 text-foreground font-semibold">
                        <span className="h-3 w-3 rounded-full bg-emerald-600" />
                        Realisasi Pengeluaran Resmi
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{formatCurrency(statusComposition.verifiedValue)}</span>
                        <span className="ml-2 text-emerald-700 font-bold">({statusComposition.verifiedPct}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="flex items-center gap-2 text-foreground font-semibold">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        Sisa Saldo Kas RT 010
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{formatCurrency(statusComposition.unpaidValue)}</span>
                        <span className="ml-2 text-amber-700 font-bold">({statusComposition.unpaidPct}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5 bg-surface/50 rounded-lg px-2 mt-1">
                      <span className="text-muted font-bold">Total Kas Tersedia</span>
                      <span className="font-extrabold text-primary">{formatCurrency(statusComposition.grandTotal)}</span>
                    </div>
                  </dl>
                </div>
              </ProductionPanel>
            </div>

            {/* Secondary Visual Section: Distribusi Kategori & Kinerja Pos Program */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* 3. Distribusi Berdasarkan Kategori Resmi */}
              <ProductionPanel>
                <ProductionPanelHeader
                  title="Distribusi Berdasarkan Kategori Resmi"
                  subtitle="Alokasi anggaran pada 5 kategori pengeluaran kas RT 010."
                />
                <div className="p-5 space-y-4">
                  {categoryStats.map((m) => (
                    <div key={m.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{m.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{formatCurrency(m.total)}</span>
                          <span className="text-muted">({m.pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className={`h-full ${m.tone} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.max(m.pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ProductionPanel>

              {/* 4. Kinerja Alokasi per Bidang / Pos Program RT 010 */}
              <ProductionPanel>
                <ProductionPanelHeader
                  title="Kinerja Alokasi per Bidang Program RT 010"
                  subtitle="Tingkat penyerapan anggaran per bidang kerja pengurus RT 010."
                />
                <div className="p-5 space-y-4">
                  {programStats.map((c) => (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted">{formatCurrency(c.total)}</span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-black text-emerald-800">
                            {c.rate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ProductionPanel>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABEL RINGKASAN PERIODE BUKU KAS */}
      {activeTab === "periods" && (
        <ProductionPanel className="mt-5">
          <ProductionPanelHeader
            title="Ringkasan Pergerakan Kas per Bulan"
            subtitle="Daftar rekapitulasi realisasi kas keluar Januari - Juni 2026 sesuai pos transaksi resmi RT 010."
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-t border-border text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Status Buku</th>
                  <th className="px-4 py-3 text-right">Rincian Pos</th>
                  <th className="px-4 py-3 text-right">Total Anggaran</th>
                  <th className="px-4 py-3 text-right">Realisasi Keluar</th>
                  <th className="px-4 py-3 text-right">Penyerapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displaySummaries.map((item) => {
                  const rate = Number(item.billed_total) > 0
                    ? Math.round((Number(item.paid_charge_total) / Number(item.billed_total)) * 100)
                    : 100;

                  return (
                    <tr key={item.billing_period_id} className="bg-white hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">
                        {formatPeriod(item.period_month, item.period_year)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 capitalize">
                          Terverifikasi
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted">{item.charge_count} pos transaksi</td>
                      <td className="px-4 py-3 text-right font-medium text-muted">
                        {formatCurrency(item.billed_total)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {formatCurrency(item.paid_charge_total)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        <span className="text-emerald-700">
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ProductionPanel>
      )}

      {/* TAB 3: MUTASI & CATAT TRANSFER MANUAL */}
      {activeTab === "payments" && (
        <div className="mt-5 space-y-6">
          {/* Manual Payment Input Form */}
          <ProductionPanel>
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

          {/* Payment List */}
          <ProductionPanel>
            <ProductionPanelHeader
              title="Pembayaran Masuk & Antrean Konfirmasi"
              subtitle="Setujui pembayaran setelah cocok dengan mutasi rekening. Sistem otomatis memvalidasi tagihan unit rumah."
            />
            <div className="divide-y divide-border border-t border-border">
              {payments.map((payment) => (
                <article key={payment.id} className="grid gap-2 bg-white px-4 py-4 hover:bg-surface/30 transition-colors">
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
                    <span
                      className={`rounded-full px-3 py-1 font-bold ${
                        payment.verification_status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : payment.verification_status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {payment.verification_status}
                    </span>
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
      )}

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
          {/* Modal Cetak / PDF Lembar Laporan Resmi */}
          {showPrintModal && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="print-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm overflow-y-auto"
              onClick={() => setShowPrintModal(false)}
            >
              <div
                className="relative my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Top Controls (No-print) */}
                <div className="no-print flex items-center justify-between border-b border-border bg-surface px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div>
                      <h3 id="print-modal-title" className="text-sm font-bold text-foreground">
                        Preview Lembar Laporan Kas & Iuran Resmi
                      </h3>
                      <p className="text-xs text-muted">
                        Format siap cetak / simpan PDF resmi untuk warga RT 010.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <span>🖨️ Cetak / Simpan PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(false)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-border text-xs font-bold text-muted hover:bg-surface hover:text-foreground cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Printable Document Body (A4 Style) */}
                <div className="p-8 sm:p-12 text-foreground font-sans text-xs sm:text-sm bg-white print:p-0">
                  {/* Kop Surat Resmi */}
                  <div className="border-b-2 border-primary pb-4 mb-6 text-center relative">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-black text-lg">
                        RT10
                      </div>
                      <div className="text-left">
                        <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-primary">
                          Rukun Tetangga 010 / Rukun Warga 021
                        </h1>
                        <p className="text-xs font-bold tracking-wide text-foreground">
                          Perumahan Cipta Green Ville · Kelurahan Tembesi · Kecamatan Sagulung · Kota Batam
                        </p>
                        <p className="text-[11px] text-muted">
                          Sekretariat: Blok Bougainville / Dahlia RT 010 · Surel: admin@cgv10.com · Web: cgv10.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Judul Laporan */}
                  <div className="text-center mb-6">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-foreground underline decoration-primary decoration-2">
                      Laporan Pertanggungjawaban Kas & Iuran Warga
                    </h2>
                    <p className="mt-1 text-xs font-bold text-muted">
                      Periode: {displaySummaries.length > 0 ? `${formatPeriod(displaySummaries[displaySummaries.length - 1].period_month, displaySummaries[displaySummaries.length - 1].period_year)} s.d. ${formatPeriod(displaySummaries[0].period_month, displaySummaries[0].period_year)}` : "Januari - Juni 2026"}
                    </p>
                    <p className="text-[11px] text-muted">Dokumen Resmi Pengurus RT 010 CGV · Status: Terverifikasi</p>
                  </div>

                  {/* Ringkasan Saldo Kas (4 Box Grid) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="border border-border rounded-xl p-3 bg-surface text-center">
                      <p className="text-[10px] uppercase font-bold text-muted">Saldo Awal</p>
                      <p className="mt-1 font-bold text-sm text-foreground">{formatCurrency(8510000)}</p>
                    </div>
                    <div className="border border-emerald-300 bg-emerald-50/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-emerald-800">Total Iuran Terkumpul</p>
                      <p className="mt-1 font-black text-sm text-emerald-900">{formatCurrency(paidTotal)}</p>
                    </div>
                    <div className="border border-amber-300 bg-amber-50/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-amber-800">Total Pengeluaran</p>
                      <p className="mt-1 font-black text-sm text-amber-900">{formatCurrency(11000000)}</p>
                    </div>
                    <div className="border border-primary bg-primary-soft/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase font-bold text-primary">Saldo Kas Akhir</p>
                      <p className="mt-1 font-black text-sm text-primary">
                        {formatCurrency(Math.max(10000, 8510000 + paidTotal - 11000000))}
                      </p>
                    </div>
                  </div>

                  {/* Tabel Rekapitulasi Kas per Bulan */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                      I. Rekapitulasi Realisasi Kas per Bulan
                    </h4>
                    <table className="w-full border-collapse border border-border text-xs text-left">
                      <thead>
                        <tr className="bg-cream/60">
                          <th className="border border-border p-2">No</th>
                          <th className="border border-border p-2">Periode Bulan</th>
                          <th className="border border-border p-2 text-right">Rincian Pos</th>
                          <th className="border border-border p-2 text-right">Total Anggaran</th>
                          <th className="border border-border p-2 text-right">Realisasi Keluar</th>
                          <th className="border border-border p-2 text-center">Penyerapan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displaySummaries.map((item, idx) => {
                          const rate = Number(item.billed_total) > 0
                            ? Math.round((Number(item.paid_charge_total) / Number(item.billed_total)) * 100)
                            : 100;

                          return (
                            <tr key={item.billing_period_id} className="hover:bg-surface">
                              <td className="border border-border p-2 text-center">{idx + 1}</td>
                              <td className="border border-border p-2 font-semibold">
                                {formatPeriod(item.period_month, item.period_year)}
                              </td>
                              <td className="border border-border p-2 text-right">{item.charge_count} pos transaksi</td>
                              <td className="border border-border p-2 text-right">{formatCurrency(item.billed_total)}</td>
                              <td className="border border-border p-2 text-right font-bold text-emerald-800">
                                {formatCurrency(item.paid_charge_total)}
                              </td>
                              <td className="border border-border p-2 text-center font-bold text-emerald-700">
                                {rate}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-cream font-bold">
                          <td colSpan={2} className="border border-border p-2 text-right">Total Akumulatif:</td>
                          <td className="border border-border p-2 text-right">{totalChargesCount} pos transaksi</td>
                          <td className="border border-border p-2 text-right">{formatCurrency(billedTotal)}</td>
                          <td className="border border-border p-2 text-right text-emerald-800">{formatCurrency(paidTotal)}</td>
                          <td className="border border-border p-2 text-center text-emerald-700">{collectionRate}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Kategori Pengeluaran & Alokasi Bidang */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                        II. Komposisi Kategori Pengeluaran
                      </h4>
                      <div className="border border-border rounded-xl p-3 space-y-2">
                        {categoryStats.map((c) => (
                          <div key={c.key} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{c.label}</span>
                            <span className="font-bold text-emerald-800">{formatCurrency(c.total)} ({c.pct}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                        III. Alokasi Bidang Program Kerja
                      </h4>
                      <div className="border border-border rounded-xl p-3 space-y-2">
                        {programStats.map((p) => (
                          <div key={p.name} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{p.name}</span>
                            <span className="font-bold text-primary">{formatCurrency(p.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tanda Tangan Pengurus */}
                  <div className="mt-8 pt-4 border-t border-dashed border-border flex justify-between text-center px-6">
                    <div className="w-48">
                      <p className="text-xs text-muted">Mengetahui,</p>
                      <p className="text-xs font-bold text-foreground">Ketua RT 010 CGV</p>
                      <div className="h-16 flex items-end justify-center">
                        <span className="text-xs font-semibold text-muted/60">[Tanda Tangan & Cap]</span>
                      </div>
                      <p className="text-xs font-bold text-foreground underline mt-1">HERIYANTO</p>
                      <p className="text-[10px] text-muted">Ketua RT 010 / RW 021</p>
                    </div>

                    <div className="w-48">
                      <p className="text-xs text-muted">Batam, {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p>
                      <p className="text-xs font-bold text-foreground">Bendahara RT 010</p>
                      <div className="h-16 flex items-end justify-center">
                        <span className="text-xs font-semibold text-muted/60">[Tanda Tangan]</span>
                      </div>
                      <p className="text-xs font-bold text-foreground underline mt-1">BENDAHARA RT 010</p>
                      <p className="text-[10px] text-muted">Pengelola Keuangan Kas RT</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="no-print flex items-center justify-between border-t border-border bg-surface px-6 py-4">
                  <p className="text-xs text-muted">
                    💡 Gunakan opsi <strong>Save as PDF</strong> pada dialog cetak browser untuk menyimpan file.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(false)}
                      className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-foreground hover:bg-surface cursor-pointer"
                    >
                      Tutup
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 cursor-pointer"
                    >
                      Cetak / Unduh PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Bagikan ke Grup Warga (WhatsApp Broadcast & Copy Link) */}
          {showShareModal && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            >
              <div
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-white p-6 sm:p-7 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Modal */}
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900 text-xl font-bold">
                      📢
                    </div>
                    <div>
                      <h3 id="share-modal-title" className="text-base font-bold text-foreground">
                        Bagikan Laporan ke Warga
                      </h3>
                      <p className="text-xs text-muted">
                        Format pesan siap kirim ke grup WhatsApp & tautan transparansi kas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border text-xs font-bold text-muted hover:bg-surface hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Teks Broadcast Preview */}
                <div className="mt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Preview Pesan Siaran WhatsApp
                  </label>
                  <div className="relative rounded-2xl border border-border bg-surface p-4 text-xs leading-relaxed text-foreground font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {`📢 *LAPORAN REKAPITULASI KAS & IURAN RT 010 CIPTA GREEN VILLE*
Periode: *Januari - Juni 2026*

💰 *Ringkasan Keuangan Kas RT:*
• Saldo Awal Kas: Rp8.510.000
• Total Penerimaan Iuran: ${formatCurrency(paidTotal)}
• Total Pengeluaran: Rp11.000.000
• Sisa Saldo Kas: ${formatCurrency(Math.max(10000, 8510000 + paidTotal - 11000000))}
• Kolektibilitas Tagihan: ${collectionRate}% lunas

🔍 *Transparansi & Bukti Nota Kas Lengkap:*
Bapak/Ibu warga dapat mengecek rincian per pos pengeluaran & mutasi lengkap secara transparan di:
👉 https://cgv10.com/keuangan/

_Diterbitkan secara resmi oleh Pengurus RT 010 / RW 021 Cipta Green Ville._`}
                  </div>
                </div>

                {/* Feedback Toast */}
                {copiedType && (
                  <div className="mt-3 rounded-xl bg-emerald-100 border border-emerald-300 p-2.5 text-center text-xs font-bold text-emerald-900 animate-in fade-in duration-200">
                    ✅ {copiedType === "message" ? "Teks pesan broadcast berhasil disalin ke clipboard!" : "Tautan laporan keuangan berhasil disalin!"}
                  </div>
                )}

                {/* Tombol Aksi Bagikan */}
                <div className="mt-5 space-y-2.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `📢 *LAPORAN REKAPITULASI KAS & IURAN RT 010 CIPTA GREEN VILLE*\nPeriode: *Januari - Juni 2026*\n\n💰 *Ringkasan Keuangan Kas RT:*\n• Saldo Awal Kas: Rp8.510.000\n• Total Penerimaan Iuran: ${formatCurrency(paidTotal)}\n• Total Pengeluaran: Rp11.000.000\n• Sisa Saldo Kas: ${formatCurrency(Math.max(10000, 8510000 + paidTotal - 11000000))}\n• Kolektibilitas Tagihan: ${collectionRate}% lunas\n\n🔍 *Transparansi & Bukti Nota Kas Lengkap:*\nBapak/Ibu warga dapat mengecek rincian per pos pengeluaran & mutasi lengkap di:\n👉 https://cgv10.com/keuangan/\n\n_Diterbitkan secara resmi oleh Pengurus RT 010 / RW 021 Cipta Green Ville._`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all cursor-pointer"
                  >
                    <span>💬 Kirim Langsung ke WhatsApp</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const broadcastText = `📢 *LAPORAN REKAPITULASI KAS & IURAN RT 010 CIPTA GREEN VILLE*\nPeriode: *Januari - Juni 2026*\n\n💰 *Ringkasan Keuangan Kas RT:*\n• Saldo Awal Kas: Rp8.510.000\n• Total Penerimaan Iuran: ${formatCurrency(paidTotal)}\n• Total Pengeluaran: Rp11.000.000\n• Sisa Saldo Kas: ${formatCurrency(Math.max(10000, 8510000 + paidTotal - 11000000))}\n• Kolektibilitas Tagihan: ${collectionRate}% lunas\n\n🔍 *Transparansi & Bukti Nota Kas Lengkap:*\nBapak/Ibu warga dapat mengecek rincian per pos pengeluaran & mutasi lengkap di:\n👉 https://cgv10.com/keuangan/\n\n_Diterbitkan secara resmi oleh Pengurus RT 010 / RW 021 Cipta Green Ville._`;
                        navigator.clipboard.writeText(broadcastText);
                        setCopiedType("message");
                        setTimeout(() => setCopiedType(null), 3000);
                      }}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-foreground hover:border-primary/40 hover:bg-primary-soft transition-all cursor-pointer"
                    >
                      <span>📋 Salin Pesan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = window.location.origin ? `${window.location.origin}/keuangan/` : "https://cgv10.com/keuangan/";
                        navigator.clipboard.writeText(url);
                        setCopiedType("link");
                        setTimeout(() => setCopiedType(null), 3000);
                      }}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-foreground hover:border-primary/40 hover:bg-primary-soft transition-all cursor-pointer"
                    >
                      <span>🔗 Salin Link Saja</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </ProductionAdminShell>
  );
}
