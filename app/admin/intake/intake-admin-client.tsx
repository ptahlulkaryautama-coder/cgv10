"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionPageIntro,
  ProductionPanel,
  ProductionStatusPill,
  cx,
} from "../production-admin-components";

type IntakeStatus = "draft" | "submitted" | "triage" | "in_progress" | "resolved" | "rejected";
type IntakeFilter = "all" | IntakeStatus;
type LoadState =
  | "checking"
  | "not_logged_in"
  | "loading_access"
  | "access_denied"
  | "loading_intake"
  | "loaded"
  | "empty"
  | "saving"
  | "db_error"
  | "error";

type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  status: "invited" | "active" | "suspended";
};

type RoleRow = {
  role: string;
  assigned_at: string;
};

type PermissionRow = {
  role: string;
  permission: string;
};

type ServiceRequestRow = {
  id: string;
  category: "administrasi" | "pengaduan" | "keamanan" | "iuran" | "aspirasi" | "palugada" | "lainnya";
  title: string;
  description: string;
  status: IntakeStatus;
  priority: "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
};

type ServiceAttachmentRow = {
  id: string;
  linked_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  signed_url: string | null;
};

type DbErrorDetail = {
  title: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  context?: string;
};

const statusFilters: { value: IntakeFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "submitted", label: "Baru masuk" },
  { value: "triage", label: "Perlu ditinjau" },
  { value: "in_progress", label: "Diproses" },
  { value: "resolved", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
];

const nextStatusActions: { value: IntakeStatus; label: string }[] = [
  { value: "triage", label: "Tandai perlu ditinjau" },
  { value: "in_progress", label: "Mulai proses" },
  { value: "resolved", label: "Tandai selesai" },
  { value: "rejected", label: "Tolak permintaan" },
];

const statusLabels: Record<IntakeStatus, string> = {
  draft: "Draft",
  submitted: "Baru masuk",
  triage: "Perlu ditinjau",
  in_progress: "Diproses",
  resolved: "Selesai",
  rejected: "Ditolak",
};

const priorityLabels: Record<ServiceRequestRow["priority"], string> = {
  normal: "Normal",
  high: "Prioritas",
  urgent: "Mendesak",
};

const categoryLabels: Record<ServiceRequestRow["category"], string> = {
  administrasi: "Administrasi",
  pengaduan: "Pengaduan",
  keamanan: "Keamanan",
  iuran: "Iuran",
  aspirasi: "Aspirasi",
  palugada: "PALUGADA",
  lainnya: "Lainnya",
};

const loadStateLabels: Record<LoadState, string> = {
  checking: "Cek sesi",
  not_logged_in: "Belum login",
  loading_access: "Cek akses",
  access_denied: "Akses ditolak",
  loading_intake: "Memuat permintaan",
  loaded: "Siap",
  empty: "Kosong",
  saving: "Menyimpan",
  db_error: "Error database",
  error: "Error",
};

const statusTone: Record<IntakeStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  submitted: "border-accent/35 bg-accent-soft text-foreground",
  triage: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-primary/20 bg-primary-soft text-primary",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const priorityTone: Record<ServiceRequestRow["priority"], string> = {
  normal: "border-slate-200 bg-slate-50 text-slate-700",
  high: "border-accent/35 bg-accent-soft text-foreground",
  urgent: "border-red-200 bg-red-50 text-red-700",
};

function getErrorDetail(error: unknown, title: string, context: string): DbErrorDetail {
  const candidate = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };

  return {
    title,
    message: candidate.message ?? "Query database gagal.",
    code: candidate.code,
    details: candidate.details,
    hint: candidate.hint,
    context,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function IntakeAdminClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch (error) {
      console.error(error);
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);

  const supabase = supabaseState.client;
  const [filter, setFilter] = useState<IntakeFilter>("all");
  const [state, setState] = useState<LoadState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(supabaseState.error || "Memeriksa sesi admin...");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [requests, setRequests] = useState<ServiceRequestRow[]>([]);
  const [attachments, setAttachments] = useState<ServiceAttachmentRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dbError, setDbError] = useState<DbErrorDetail | null>(null);

  const loadIntake = useCallback(async () => {
    if (!supabase) {
      setState("error");
      setMessage("Konfigurasi Supabase belum siap.");
      return;
    }

    setState("checking");
    setMessage("Memeriksa sesi admin...");
    setDbError(null);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setState("error");
      setMessage(sessionError.message);
      return;
    }

    const activeUser = sessionData.session?.user ?? null;
    setUser(activeUser);

    if (!activeUser) {
      setProfile(null);
      setRoles([]);
      setPermissions([]);
      setRequests([]);
      setAttachments([]);
      setSelectedId(null);
      setState("not_logged_in");
      setMessage("Belum ada sesi login aktif.");
      return;
    }

    setState("loading_access");
    setMessage("Memvalidasi profil, role, dan izin layanan...");

    const [{ data: profileData, error: profileError }, { data: roleData, error: roleError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, email, status")
          .eq("id", activeUser.id)
          .maybeSingle<Profile>(),
        supabase
          .from("user_roles")
          .select("role, assigned_at")
          .eq("user_id", activeUser.id)
          .order("assigned_at", { ascending: true }),
      ]);

    if (profileError) {
      setState("db_error");
      setDbError(getErrorDetail(profileError, "Gagal membaca profil", "profiles select"));
      setMessage("Sesi aktif, tetapi query profil gagal.");
      return;
    }

    if (roleError) {
      setState("db_error");
      setDbError(getErrorDetail(roleError, "Gagal membaca role", "user_roles select"));
      setMessage("Sesi aktif, tetapi query role gagal.");
      return;
    }

    const loadedRoles = (roleData ?? []) as RoleRow[];
    const roleNames = loadedRoles.map((row) => row.role);
    const { data: permissionData, error: permissionError } = roleNames.length
      ? await supabase.from("role_permissions").select("role, permission").in("role", roleNames)
      : { data: [], error: null };

    if (permissionError) {
      setState("db_error");
      setDbError(
        getErrorDetail(permissionError, "Gagal membaca izin akses", "role_permissions select"),
      );
      setMessage("Sesi aktif, tetapi query izin akses gagal.");
      return;
    }

    const loadedPermissions = (permissionData ?? []) as PermissionRow[];
    const canReadServices = loadedPermissions.some((row) => row.permission === "services:read");

    setProfile(profileData ?? null);
    setRoles(loadedRoles);
    setPermissions(loadedPermissions);

    if (!canReadServices) {
      setRequests([]);
      setAttachments([]);
      setSelectedId(null);
      setState("access_denied");
      setMessage("Akun aktif, tetapi belum memiliki izin membaca layanan.");
      return;
    }

    setState("loading_intake");
    setMessage("Membaca permintaan warga melalui Supabase Auth dan RLS...");

    let intakeQuery = supabase
      .from("service_requests")
      .select("id, category, title, description, status, priority, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      intakeQuery = intakeQuery.eq("status", filter);
    }

    const { data: requestData, error: requestError } = await intakeQuery;

    if (requestError) {
      setState("db_error");
      setDbError(
        getErrorDetail(requestError, "Gagal membaca permintaan warga", "service_requests select"),
      );
      setMessage("Query permintaan warga gagal.");
      return;
    }

    const loadedRequests = (requestData ?? []) as ServiceRequestRow[];
    let loadedAttachments: ServiceAttachmentRow[] = [];

    if (loadedRequests.length > 0) {
      const { data: attachmentData, error: attachmentError } = await supabase
        .from("attachments")
        .select("id, linked_id, file_name, file_type, storage_path")
        .eq("linked_type", "service_request")
        .in("linked_id", loadedRequests.map((request) => request.id))
        .order("created_at", { ascending: true });

      if (!attachmentError) {
        loadedAttachments = await Promise.all(
          ((attachmentData ?? []) as Omit<ServiceAttachmentRow, "signed_url">[]).map(
            async (attachment) => {
              const { data } = await supabase.storage
                .from("service-request-attachments")
                .createSignedUrl(attachment.storage_path, 900);
              return { ...attachment, signed_url: data?.signedUrl ?? null };
            },
          ),
        );
      }
    }

    setRequests(loadedRequests);
    setAttachments(loadedAttachments);
    setSelectedId((current) =>
      current && loadedRequests.some((request) => request.id === current)
        ? current
        : loadedRequests[0]?.id ?? null,
    );
    setState(loadedRequests.length > 0 ? "loaded" : "empty");
    setMessage(
      loadedRequests.length > 0
        ? `Berhasil membaca ${loadedRequests.length} permintaan warga.`
        : "Tidak ada intake untuk filter ini.",
    );
  }, [filter, supabase]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadIntake();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadIntake]);

  const roleSummary = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "-";
  const canReadServices = permissions.some((row) => row.permission === "services:read");
  const canWriteServices = permissions.some((row) => row.permission === "services:write");
  const isSuperAdmin = roles.some((row) => row.role === "super_admin");
  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const isLoading =
    state === "checking" ||
    state === "loading_access" ||
    state === "loading_intake" ||
    state === "saving";
  const selectedRequest =
    requests.find((request) => request.id === selectedId) ?? requests[0] ?? null;
  const selectedAttachments = selectedRequest
    ? attachments.filter((attachment) => attachment.linked_id === selectedRequest.id)
    : [];
  const submittedCount = requests.filter((request) => request.status === "submitted").length;

  async function updateRequestStatus(requestId: string, nextStatus: IntakeStatus) {
    if (!supabase) {
      return;
    }

    if (!canWriteServices) {
      setMessage("Ubah status membutuhkan izin menulis layanan.");
      return;
    }

    setState("saving");
    setMessage("Menyimpan status permintaan...");
    setDbError(null);

    const { error } = await supabase
      .from("service_requests")
      .update({ status: nextStatus })
      .eq("id", requestId);

    if (error) {
      setState("db_error");
      setDbError(getErrorDetail(error, "Gagal mengubah status permintaan", "service_requests update"));
      setMessage("Ubah status gagal.");
      return;
    }

    await loadIntake();
  }

  return (
    <ProductionAdminShell
      active="intake"
      title="Permintaan"
      subtitle="Permintaan warga"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleSummary}
      isSuperAdmin={isSuperAdmin}
      action={
        <ProductionActionButton onClick={loadIntake} disabled={isLoading} primary>
          {isLoading ? "Memuat..." : "Muat Ulang"}
        </ProductionActionButton>
      }
    >
      <ProductionPageIntro
        eyebrow="Layanan warga"
        title={
          <>
            Permintaan Warga <br />
            <span className="italic">Permintaan Layanan</span>
          </>
        }
        text="Periksa permintaan dari formulir Layanan dan Kontak, lalu tentukan status tindak lanjutnya."
        side={
          <ProductionStatusPill>
            {canReadServices ? `${submittedCount} baru masuk` : "Cek akses"}
          </ProductionStatusPill>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.55fr)]">
        <ProductionPanel>
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  Antrean masuk
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">{message}</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
                  Pilih permintaan untuk melihat detail dan memperbarui statusnya.
                </p>
              </div>
              <StateBadge state={state} canReadServices={canReadServices} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter status intake">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  disabled={isLoading}
                  className={cx(
                    "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border px-4 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
                    filter === item.value
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-primary hover:border-primary/30",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {state === "not_logged_in" ? (
              <ProtectedMessage
                title="Login diperlukan"
                text="Silakan masuk sebagai admin untuk melihat permintaan warga."
              />
            ) : null}

            {state === "access_denied" ? (
              <ProtectedMessage
                title="Akses ditolak"
                text="Akun ini terbaca oleh Supabase Auth, tetapi role yang dimiliki belum membawa izin baca layanan."
              />
            ) : null}

            {state === "empty" ? (
              <ProtectedMessage
                title="Belum ada permintaan"
                text="Tidak ada permintaan warga untuk filter ini."
              />
            ) : null}

            {state === "db_error" && dbError ? <DatabaseErrorPanel error={dbError} /> : null}

            {state === "loaded" || state === "saving" ? (
              <div className="mt-5 grid gap-3">
                {requests.map((request) => {
                  const isSelected = request.id === selectedRequest?.id;

                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelectedId(request.id)}
                      className={cx(
                        "cursor-pointer rounded-[16px] border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "border-primary/35 bg-primary-soft/45"
                          : "border-border bg-white hover:border-primary/25 hover:bg-primary-soft/20",
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusTone[request.status]}`}
                            >
                              {statusLabels[request.status]}
                            </span>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${priorityTone[request.priority]}`}
                            >
                              {priorityLabels[request.priority]}
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-bold text-foreground">
                            {request.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                            {request.description}
                          </p>
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-muted">
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </ProductionPanel>

        <aside className="grid gap-5">
          <ProductionPanel>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">Detail permintaan</h2>
              {selectedRequest ? (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusTone[selectedRequest.status]}`}
                    >
                      {statusLabels[selectedRequest.status]}
                    </span>
                    <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                      {categoryLabels[selectedRequest.category]}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground">{selectedRequest.title}</h3>
                  <pre className="mt-4 max-h-[460px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-cream p-4 text-sm leading-6 text-foreground">
                    {selectedRequest.description}
                  </pre>
                  {selectedAttachments.length > 0 ? (
                    <section className="mt-4" aria-labelledby="service-attachments-title">
                      <div className="flex items-center justify-between gap-3">
                        <h4 id="service-attachments-title" className="text-sm font-bold text-foreground">
                          Foto pendukung
                        </h4>
                        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                          {selectedAttachments.length} foto
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {selectedAttachments.map((attachment) =>
                          attachment.signed_url ? (
                            <a
                              key={attachment.id}
                              href={attachment.signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group overflow-hidden rounded-xl border border-border bg-white transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              {/* Signed private Storage URLs cannot use the static Next image optimizer. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={attachment.signed_url}
                                alt={`Foto pendukung ${attachment.file_name}`}
                                className="aspect-[4/3] w-full bg-cream object-cover"
                              />
                              <span className="block truncate px-3 py-2 text-xs font-semibold text-muted group-hover:text-primary">
                                {attachment.file_name}
                              </span>
                            </a>
                          ) : (
                            <div key={attachment.id} className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-border bg-cream p-3 text-center text-xs font-semibold text-muted">
                              Preview tidak tersedia
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                  ) : null}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {nextStatusActions.map((action) => (
                      <button
                        key={action.value}
                        type="button"
                        onClick={() => updateRequestStatus(selectedRequest.id, action.value)}
                        disabled={isLoading || !canWriteServices}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">
                  Pilih permintaan untuk melihat detail.
                </p>
              )}
            </div>
          </ProductionPanel>

          <ProductionPanel>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">Akses akun</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <InfoRow label="Email" value={visibleEmail} />
                <InfoRow label="Peran" value={roleSummary} />
                <InfoRow label="Izin baca" value={canReadServices ? "Aktif" : "Tidak ada"} />
                <InfoRow label="Izin tulis" value={canWriteServices ? "Aktif" : "Terkunci"} />
              </dl>
            </div>
          </ProductionPanel>
        </aside>
      </div>
    </ProductionAdminShell>
  );
}

function StateBadge({
  state,
  canReadServices,
}: {
  state: LoadState;
  canReadServices: boolean;
}) {
  const tone =
    state === "loaded" || state === "empty"
      ? "border-primary/20 bg-primary-soft text-primary"
      : state === "db_error" || state === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-accent/30 bg-accent-soft text-foreground";

  const label = canReadServices ? "Izin baca aktif" : loadStateLabels[state];

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone}`}
    >
      {label}
    </span>
  );
}

function ProtectedMessage({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 rounded-[16px] border border-border bg-cream p-5">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{text}</p>
    </div>
  );
}

function DatabaseErrorPanel({ error }: { error: DbErrorDetail }) {
  const rows = [
    ["Pesan", error.message],
    ["Kode", error.code ?? "-"],
    ["Detail", error.details ?? "-"],
    ["Saran", error.hint ?? "-"],
    ["Konteks", error.context ?? "-"],
  ];

  return (
    <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 p-5">
      <h3 className="text-lg font-bold text-red-700">{error.title}</h3>
      <dl className="mt-4 grid gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-red-100 bg-white p-3">
            <dt className="font-bold text-red-700">{label}</dt>
            <dd className="mt-1 break-words font-mono text-xs text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="mt-1 break-words font-bold text-foreground">{value}</dd>
    </div>
  );
}
