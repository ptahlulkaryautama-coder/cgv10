"use client";

import { useEffect, useMemo, useState } from "react";
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

type HouseholdRow = {
  id: string;
  cluster: string;
  block_or_unit: string;
  unit_number: string | null;
  primary_contact_name: string | null;
  primary_phone: string | null;
  occupancy_status: "active" | "vacant" | "moved" | "unknown";
  verification_status: "draft" | "review" | "verified" | "rejected";
  family_count: number;
  vehicle_count: number;
  updated_at: string;
};

type UserRoleRow = { role: string };
type PermissionRow = { permission: string };

const occupancyLabels: Record<HouseholdRow["occupancy_status"], string> = {
  active: "Aktif",
  vacant: "Kosong",
  moved: "Pindah",
  unknown: "Belum jelas",
};

const verificationLabels: Record<HouseholdRow["verification_status"], string> = {
  draft: "Draft",
  review: "Review",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function maskPhone(value: string | null) {
  if (!value) return "-";
  const clean = value.replace(/\s+/g, "");
  if (clean.length <= 6) return clean;
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
}

export function WargaAdminClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [roleLabel, setRoleLabel] = useState("Admin");
  const [message, setMessage] = useState("Memuat data warga...");
  const [canRead, setCanRead] = useState(false);
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;

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
      const hasRead = permissions.some((row) => row.permission === "resident:read");
      setCanRead(hasRead);

      if (!hasRead) {
        setMessage("Akun ini belum punya akses membaca data warga.");
        return;
      }

      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .select("id, cluster, block_or_unit, unit_number, primary_contact_name, primary_phone, occupancy_status, verification_status, family_count, vehicle_count, updated_at")
        .order("cluster", { ascending: true })
        .order("block_or_unit", { ascending: true })
        .limit(200);

      if (householdError) {
        setMessage(householdError.message);
        return;
      }

      setHouseholds((householdData ?? []) as HouseholdRow[]);
      setMessage(`${householdData?.length ?? 0} rumah terbaca.`);
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const activeCount = households.filter((item) => item.occupancy_status === "active").length;
  const verifiedCount = households.filter((item) => item.verification_status === "verified").length;
  const totalResidents = households.reduce((sum, item) => sum + item.family_count, 0);

  return (
    <ProductionAdminShell
      active="warga"
      title="Data Warga"
      subtitle="Rumah, kontak, status hunian"
      userLabel={user?.email ?? "Admin"}
      roleLabel={roleLabel}
      isSuperAdmin={roleLabel === "super_admin"}
    >
      <ProductionPageIntro
        eyebrow="Database warga"
        title="Data rumah disiapkan sebagai dasar iuran dan layanan."
        text="Gunakan modul ini sebagai daftar operasional internal. Kontak warga ditampilkan terbatas dan tidak dipublikasikan."
        side={<ProductionStatusPill>{canRead ? "Akses aktif" : "Cek akses"}</ProductionStatusPill>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ProductionMetricCard label="Rumah" value={String(households.length)} helper={message} icon="home" />
        <ProductionMetricCard label="Aktif" value={String(activeCount)} helper="Status hunian aktif" icon="users" />
        <ProductionMetricCard label="Warga" value={String(totalResidents)} helper={`${verifiedCount} rumah terverifikasi`} icon="shield" />
      </div>

      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Rumah dan kontak utama"
          subtitle="Tahap awal dibatasi 200 rumah pertama. Import CSV dan editor detail bisa ditambahkan setelah struktur data disetujui."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-t border-border text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Rumah</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Hunian</th>
                <th className="px-4 py-3">Verifikasi</th>
                <th className="px-4 py-3 text-right">KK</th>
                <th className="px-4 py-3 text-right">Kendaraan</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {households.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {item.cluster} / {item.block_or_unit}
                    {item.unit_number ? <span className="ml-1 text-muted">#{item.unit_number}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{item.primary_contact_name || "-"}</p>
                    <p className="mt-1 text-xs text-muted">{maskPhone(item.primary_phone)}</p>
                  </td>
                  <td className="px-4 py-3">{occupancyLabels[item.occupancy_status]}</td>
                  <td className="px-4 py-3">{verificationLabels[item.verification_status]}</td>
                  <td className="px-4 py-3 text-right">{item.family_count}</td>
                  <td className="px-4 py-3 text-right">{item.vehicle_count}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(item.updated_at)}</td>
                </tr>
              ))}
              {households.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={7}>
                    {message}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ProductionPanel>
    </ProductionAdminShell>
  );
}
