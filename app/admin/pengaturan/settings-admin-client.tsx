"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "../production-admin-components";

type AdminRole = "super_admin" | "ketua_rt" | "sekretaris" | "bendahara" | "palugada_reviewer";
type ManagedRole = Exclude<AdminRole, "super_admin">;
type PermissionRow = { role: AdminRole; permission: string };
type UserRoleRow = { role: AdminRole };
type HeroSlide = { src: string; alt: string };
type HeroSettings = { enabled: boolean; interval_ms: number; slides: HeroSlide[] };
type AdminAccessRow = {
  profile_id: string;
  display_name: string;
  email: string | null;
  status: "invited" | "active" | "suspended";
  roles: AdminRole[];
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
};

const managedRoles: Array<{ role: ManagedRole; label: string }> = [
  { role: "ketua_rt", label: "Ketua RT" },
  { role: "sekretaris", label: "Sekretaris" },
  { role: "bendahara", label: "Bendahara" },
  { role: "palugada_reviewer", label: "Reviewer PALUGADA" },
];

const defaultHeroSettings: HeroSettings = {
  enabled: true,
  interval_ms: 6500,
  slides: [],
};

function parseHeroSettings(value: unknown): HeroSettings {
  if (!value || typeof value !== "object") return defaultHeroSettings;
  const candidate = value as Partial<HeroSettings>;
  if (!Array.isArray(candidate.slides)) return defaultHeroSettings;
  return {
    enabled: candidate.enabled !== false,
    interval_ms:
      typeof candidate.interval_ms === "number" ? candidate.interval_ms : 6500,
    slides: candidate.slides
      .filter(
        (slide): slide is HeroSlide =>
          Boolean(
            slide &&
              typeof slide === "object" &&
              typeof slide.src === "string" &&
              typeof slide.alt === "string",
          ),
      )
      .slice(0, 6),
  };
}

const featureGroups = [
  {
    title: "Data Warga",
    helper: "Baca dan update data rumah, kontak, serta antrean verifikasi warga.",
    permissions: [
      { key: "resident:read", label: "Lihat warga" },
      { key: "resident:write", label: "Ubah warga" },
    ],
  },
  {
    title: "Layanan",
    helper: "Permintaan warga, kontak masuk, dan tindak lanjut operasional.",
    permissions: [
      { key: "services:read", label: "Lihat layanan" },
      { key: "services:write", label: "Update layanan" },
    ],
  },
  {
    title: "Keuangan & Iuran",
    helper: "Akses kas, catat transfer manual, dan verifikasi pembayaran.",
    permissions: [
      { key: "finance:read", label: "Lihat kas" },
      { key: "finance:write", label: "Ubah kas" },
      { key: "billing:read", label: "Lihat iuran" },
      { key: "billing:write", label: "Catat manual" },
      { key: "billing:verify", label: "Verifikasi" },
    ],
  },
  {
    title: "Konten Portal",
    helper: "Kabar warga, agenda, pengumuman, dan approval tayang.",
    permissions: [
      { key: "content:read", label: "Lihat konten" },
      { key: "content:write", label: "Tulis konten" },
      { key: "content:approve", label: "Approve konten" },
    ],
  },
  {
    title: "PALUGADA",
    helper: "Review, publish, sembunyikan, dan moderasi listing warga.",
    permissions: [
      { key: "palugada:read", label: "Lihat lapak" },
      { key: "palugada:write", label: "Moderasi lapak" },
    ],
  },
];

function formatDateTime(value: string | null) {
  if (!value) return "Belum pernah";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function roleLabel(role: string) {
  return managedRoles.find((item) => item.role === role)?.label ?? (role === "super_admin" ? "Super Admin" : role);
}

function permissionKey(role: string, permission: string) {
  return `${role}:${permission}`;
}

export function AdminSettingsClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [admins, setAdmins] = useState<AdminAccessRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [message, setMessage] = useState("Memuat pengaturan akses...");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [heroMessage, setHeroMessage] = useState("Memuat pengaturan slideshow...");
  const [isSavingHero, setIsSavingHero] = useState(false);

  const loadData = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user) {
      setUser(null);
      setRoles([]);
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

    const loadedRoles = ((roleData ?? []) as UserRoleRow[]).map((row) => row.role);
    setRoles(loadedRoles);

    const isLoadedSuperAdmin = loadedRoles.includes("super_admin");
    const [{ data: overviewData, error: overviewError }, permissionResult, heroResult] = await Promise.all([
      supabase.rpc("get_admin_access_overview"),
      isLoadedSuperAdmin
        ? supabase
            .from("role_permissions")
            .select("role, permission")
            .in("role", managedRoles.map((item) => item.role))
        : Promise.resolve({ data: [], error: null }),
      supabase.rpc("get_home_hero_settings"),
    ]);

    if (overviewError) {
      setMessage(overviewError.message);
      return;
    }

    if (permissionResult.error) {
      setMessage(permissionResult.error.message);
      return;
    }

    setAdmins((overviewData ?? []) as AdminAccessRow[]);
    setPermissions((permissionResult.data ?? []) as PermissionRow[]);
    if (heroResult.error) {
      setHeroMessage("Pengaturan slideshow belum tersedia. Jalankan migration terbaru terlebih dahulu.");
    } else {
      setHeroSettings(parseHeroSettings(heroResult.data));
      setHeroMessage("Slideshow beranda siap diatur.");
    }
    setMessage(
      isLoadedSuperAdmin
        ? "Pengaturan akses berhasil dimuat."
        : "Daftar login admin berhasil dimuat. Matrix fitur hanya untuk super admin.",
    );
  }, [supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const isSuperAdmin = roles.includes("super_admin");
  const signedInAdmins = admins.filter((admin) => Boolean(admin.last_sign_in_at)).length;
  const permissionSet = useMemo(() => {
    return new Set(permissions.map((item) => permissionKey(item.role, item.permission)));
  }, [permissions]);

  async function togglePermission(role: ManagedRole, permission: string, enabled: boolean) {
    const key = permissionKey(role, permission);
    setSavingKey(key);
    setMessage(`${enabled ? "Mengaktifkan" : "Menonaktifkan"} ${permission} untuk ${roleLabel(role)}...`);

    const { error } = await supabase.rpc("set_role_feature_access", {
      target_role: role,
      target_permission: permission,
      enabled,
    });

    if (error) {
      setMessage(error.message);
      setSavingKey(null);
      return;
    }

    await loadData();
    setMessage(`${permission} untuk ${roleLabel(role)} sudah diperbarui.`);
    setSavingKey(null);
  }

  function updateHeroSlide(index: number, field: keyof HeroSlide, value: string) {
    setHeroSettings((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, [field]: value } : slide,
      ),
    }));
  }

  function addHeroSlide() {
    setHeroSettings((current) => ({
      ...current,
      slides: [...current.slides, { src: "", alt: "" }].slice(0, 6),
    }));
  }

  function removeHeroSlide(index: number) {
    setHeroSettings((current) => ({
      ...current,
      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
    }));
  }

  async function saveHeroSettings() {
    const cleanedSettings = {
      ...heroSettings,
      slides: heroSettings.slides.map((slide) => ({
        src: slide.src.trim(),
        alt: slide.alt.trim(),
      })),
    };

    if (cleanedSettings.slides.some((slide) => !slide.src || !slide.alt)) {
      setHeroMessage("Lengkapi alamat gambar dan deskripsinya sebelum menyimpan.");
      return;
    }

    setIsSavingHero(true);
    setHeroMessage("Menyimpan slideshow beranda...");
    const { error } = await supabase.rpc("set_home_hero_settings", {
      settings: cleanedSettings,
    });
    setIsSavingHero(false);

    if (error) {
      setHeroMessage(error.message);
      return;
    }

    setHeroSettings(cleanedSettings);
    setHeroMessage("Slideshow beranda sudah diperbarui.");
  }

  return (
    <ProductionAdminShell
      active="pengaturan"
      title="Pengaturan"
      subtitle="Tampilan dan akses portal"
      userLabel={user?.email ?? "Admin"}
      roleLabel={roles.join(", ") || "Admin"}
      isSuperAdmin={isSuperAdmin}
      action={<ProductionActionButton onClick={loadData} primary>Muat ulang</ProductionActionButton>}
    >
      <ProductionPageIntro
        eyebrow="Pengaturan portal"
        title="Kelola tampilan portal dan hak akses pengurus."
        text="Atur slideshow beranda, lihat aktivitas akun pengurus, dan tentukan fitur yang dapat digunakan oleh setiap peran."
        side={<ProductionStatusPill>{isSuperAdmin ? "Akses penuh" : "Akses terbatas"}</ProductionStatusPill>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ProductionMetricCard label="Admin" value={String(admins.length)} helper={message} icon="users" />
        <ProductionMetricCard label="Pernah Masuk" value={String(signedInAdmins)} helper="Berdasarkan riwayat masuk akun" icon="shield" tone="green" />
        <ProductionMetricCard label="Role Diatur" value={String(managedRoles.length)} helper="Ketua RT, sekretaris, bendahara, reviewer" icon="file" tone="gold" />
      </div>

      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Slideshow beranda"
          subtitle="Atur gambar utama yang berganti otomatis di halaman depan. Jika layanan data tidak tersedia, beranda tetap memakai gambar bawaan."
          action={
            isSuperAdmin ? (
              <ProductionActionButton
                onClick={() => void saveHeroSettings()}
                disabled={isSavingHero}
                primary
              >
                {isSavingHero ? "Menyimpan..." : "Simpan slideshow"}
              </ProductionActionButton>
            ) : undefined
          }
        />
        <div className="grid gap-5 border-t border-border p-4 sm:p-5">
          <div className="grid gap-4 rounded-[16px] border border-border bg-white p-4 md:grid-cols-[1fr_220px]">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold text-foreground">
              <input
                type="checkbox"
                checked={heroSettings.enabled}
                onChange={(event) =>
                  setHeroSettings((current) => ({ ...current, enabled: event.target.checked }))
                }
                disabled={!isSuperAdmin || isSavingHero}
                className="h-5 w-5 accent-primary"
              />
              Gunakan slideshow dari dashboard
            </label>
            <label className="grid gap-2 text-sm font-bold text-foreground">
              Jeda pergantian
              <select
                value={heroSettings.interval_ms}
                onChange={(event) =>
                  setHeroSettings((current) => ({
                    ...current,
                    interval_ms: Number(event.target.value),
                  }))
                }
                disabled={!isSuperAdmin || isSavingHero}
                className="min-h-11 cursor-pointer rounded-xl border border-border bg-white px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value={4000}>4 detik</option>
                <option value={6500}>6,5 detik</option>
                <option value={9000}>9 detik</option>
                <option value={12000}>12 detik</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {heroSettings.slides.map((slide, index) => (
              <section key={index} className="overflow-hidden rounded-[16px] border border-border bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-cream px-4 py-3">
                  <h3 className="text-sm font-bold text-foreground">Gambar {index + 1}</h3>
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() => removeHeroSlide(index)}
                      disabled={isSavingHero}
                      className="cursor-pointer rounded-lg px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
                {slide.src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL is managed by an authorized admin and previewed before save.
                  <img src={slide.src} alt="" className="aspect-[16/7] w-full bg-cream object-cover" />
                ) : (
                  <div className="grid aspect-[16/7] place-items-center bg-cream px-4 text-center text-sm font-semibold text-muted">
                    Preview gambar akan tampil di sini
                  </div>
                )}
                <div className="grid gap-4 p-4">
                  <label className="grid gap-2 text-sm font-bold text-foreground">
                    Alamat gambar
                    <input
                      type="text"
                      value={slide.src}
                      onChange={(event) => updateHeroSlide(index, "src", event.target.value)}
                      placeholder="/assets/kegiatan/gambar.jpg atau https://..."
                      disabled={!isSuperAdmin || isSavingHero}
                      className="min-h-11 rounded-xl border border-border bg-white px-3 font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-foreground">
                    Deskripsi gambar
                    <input
                      type="text"
                      value={slide.alt}
                      onChange={(event) => updateHeroSlide(index, "alt", event.target.value)}
                      placeholder="Contoh: Warga berkumpul saat kerja bakti"
                      disabled={!isSuperAdmin || isSavingHero}
                      className="min-h-11 rounded-xl border border-border bg-white px-3 font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
              </section>
            ))}
          </div>

          {heroSettings.slides.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-primary/30 bg-primary-soft/40 p-5 text-sm font-semibold leading-6 text-muted">
              Belum ada gambar khusus. Beranda masih menggunakan pilihan gambar bawaan.
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted" aria-live="polite">{heroMessage}</p>
            {isSuperAdmin && heroSettings.slides.length < 6 ? (
              <button
                type="button"
                onClick={addHeroSlide}
                disabled={isSavingHero}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-white px-4 text-sm font-bold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Tambah gambar
              </button>
            ) : null}
          </div>
        </div>
      </ProductionPanel>

      <ProductionPanel className="mt-5">
        <ProductionPanelHeader
          title="Pengingat layanan data"
          subtitle="Tambahkan pengingat mingguan ke kalender agar muncul sebagai notifikasi di laptop atau HP."
          action={
            <ProductionActionButton href="/pengingat-supabase-selasa.ics" primary>
              Tambahkan ke kalender
            </ProductionActionButton>
          }
        />
        <p className="border-t border-border p-4 text-sm font-semibold leading-6 text-muted sm:p-5">
          Jadwal: setiap Selasa pukul 20.00 WIB, dengan notifikasi 30 menit sebelumnya. Setelah file dibuka, pilih kalender yang tersinkron ke perangkat Anda.
        </p>
      </ProductionPanel>

      <ProductionPanel className="mt-5">
            <ProductionPanelHeader
              title="Admin yang sudah login"
              subtitle="Diurutkan berdasarkan aktivitas masuk terbaru."
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-t border-border text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Email Confirmed</th>
                    <th className="px-4 py-3">Login Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admins.map((admin) => (
                    <tr key={admin.profile_id} className="bg-white">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{admin.display_name || admin.email || "-"}</p>
                        <p className="mt-1 text-xs text-muted">{admin.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {admin.roles.map((role) => (
                            <span key={role} className="rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                              {roleLabel(role)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold capitalize text-foreground">{admin.status}</td>
                      <td className="px-4 py-3 text-muted">{formatDateTime(admin.email_confirmed_at)}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{formatDateTime(admin.last_sign_in_at)}</td>
                    </tr>
                  ))}
                  {admins.length === 0 ? (
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

      {isSuperAdmin ? (
        <>
          <ProductionPanel className="mt-5">
            <ProductionPanelHeader
              title="Hak akses setiap peran"
              subtitle="Pilih fitur yang boleh digunakan oleh setiap pengurus. Akses Super Admin tetap dilindungi."
            />
            <div className="grid gap-5 border-t border-border p-4">
              {featureGroups.map((group) => (
                <section key={group.title} className="rounded-[16px] border border-border bg-white">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-muted">{group.helper}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
                        <tr>
                          <th className="px-4 py-3">Fitur</th>
                          {managedRoles.map((item) => (
                            <th key={item.role} className="px-4 py-3 text-center">{item.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {group.permissions.map((permission) => (
                          <tr key={permission.key}>
                            <td className="bg-white px-4 py-3">
                              <p className="font-semibold text-foreground">{permission.label}</p>
                              <p className="mt-1 text-xs text-muted">{permission.key}</p>
                            </td>
                            {managedRoles.map((item) => {
                              const key = permissionKey(item.role, permission.key);
                              const checked = permissionSet.has(key);
                              const isSaving = savingKey === key;

                              return (
                                <td key={key} className="bg-white px-4 py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => void togglePermission(item.role, permission.key, !checked)}
                                    disabled={Boolean(savingKey)}
                                    aria-pressed={checked}
                                    className={`inline-flex min-h-9 min-w-24 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                      checked
                                        ? "border-primary bg-primary text-white"
                                        : "border-border bg-surface text-muted hover:border-primary/30 hover:text-primary"
                                    }`}
                                  >
                                    {isSaving ? "Simpan..." : checked ? "Aktif" : "Nonaktif"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          </ProductionPanel>
        </>
      ) : (
        <ProductionPanel className="mt-5">
          <div className="p-5">
            <h2 className="text-lg font-bold text-foreground">Kontrol fitur dikunci</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">
              Daftar login admin bisa dilihat di atas. Perubahan akses fitur hanya tersedia untuk super admin.
            </p>
          </div>
        </ProductionPanel>
      )}
    </ProductionAdminShell>
  );
}
