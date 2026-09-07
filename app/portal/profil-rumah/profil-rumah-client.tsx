"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PersonalDuesRecap } from "./personal-dues-recap";

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  phone: string;
  cluster: string;
  blockOrUnit: string;
  isSuperAdmin: boolean;
  status: string;
  registrationStatus?: "pending_review" | "approved" | "rejected";
  adminNote?: string;
};

function fileToDataUrl(file: File, maxDimension = 500, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function ProfilRumahClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient() };
    } catch {
      return { client: null };
    }
  }, []);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [editNameSuccess, setEditNameSuccess] = useState<string | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseState.client;
    if (!supabase) {
      window.setTimeout(() => setIsLoading(false), 0);
      return;
    }
    let mounted = true;

    async function loadData() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const activeUser = sessionData.session?.user;
      if (!mounted) return;

      if (!activeUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const userEmail = activeUser.email || "";

      let prof: { display_name?: string; avatar_url?: string; phone?: string; status?: string } | null = null;
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, phone, status")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (profErr && profErr.message.includes("avatar_url")) {
        const { data: fallbackProf } = await supabase
          .from("profiles")
          .select("display_name, phone, status")
          .eq("id", activeUser.id)
          .maybeSingle();
        prof = fallbackProf;
      } else {
        prof = profData;
      }

      const [{ data: roleRows }, { data: regRequest }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", activeUser.id),
        supabase
          .from("resident_registration_requests")
          .select("status, admin_note, display_name, cluster, block_or_unit")
          .or(`requested_user_id.eq.${activeUser.id},email.ilike.${userEmail}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!mounted) return;

      const roles = ((roleRows ?? []) as { role: string }[]).map((r) => r.role);
      const isSA = roles.includes("super_admin");

      const emailPrefix = userEmail.split("@")[0] || "Warga CGV10";
      const profileName = prof?.display_name?.trim() || "";
      const regName = regRequest?.display_name?.trim() || "";
      const metaName = (
        (activeUser.user_metadata?.display_name as string | undefined) ||
        (activeUser.user_metadata?.full_name as string | undefined) ||
        ""
      ).trim();

      let finalDisplayName = emailPrefix;
      if (profileName && profileName.toLowerCase() !== emailPrefix.toLowerCase()) {
        finalDisplayName = profileName;
      } else if (regName && regName.toLowerCase() !== emailPrefix.toLowerCase()) {
        finalDisplayName = regName;
      } else if (metaName && metaName.toLowerCase() !== emailPrefix.toLowerCase()) {
        finalDisplayName = metaName;
      } else if (profileName) {
        finalDisplayName = profileName;
      }

      if ((!profileName || profileName.toLowerCase() === emailPrefix.toLowerCase()) && finalDisplayName !== emailPrefix) {
        void supabase.from("profiles").update({ display_name: finalDisplayName }).eq("id", activeUser.id);
      }

      const resolvedAvatarUrl =
        prof?.avatar_url ||
        (activeUser.user_metadata?.avatar_url as string | undefined) ||
        undefined;

      setProfile({
        id: activeUser.id,
        displayName: finalDisplayName,
        email: userEmail,
        avatarUrl: resolvedAvatarUrl,
        phone: prof?.phone || "-",
        cluster: regRequest?.cluster || "Cipta Greenville",
        blockOrUnit: regRequest?.block_or_unit || "RT 010 / RW 021",
        isSuperAdmin: isSA,
        status: prof?.status || "active",
        registrationStatus: regRequest?.status as "pending_review" | "approved" | "rejected" | undefined,
        adminNote: regRequest?.admin_note || undefined,
      });

      setIsLoading(false);
    }

    void loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (mounted) void loadData();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseState.client]);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile || !supabaseState.client) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran foto maksimal 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Format file harus berupa gambar.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = supabaseState.client;
      let newAvatarUrl = "";
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = profile.id + "/avatar-" + Date.now() + "." + fileExt;

      // Coba unggah ke Supabase Storage bucket 'resident-avatars'
      const { error: uploadErr } = await supabase.storage
        .from("resident-avatars")
        .upload(fileName, file, { upsert: true });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from("resident-avatars")
          .getPublicUrl(fileName);
        newAvatarUrl = publicUrlData.publicUrl;
      } else {
        // Fallback otomatis jika bucket storage belum terkonfigurasi di Supabase (e.g. Bucket not found)
        newAvatarUrl = await fileToDataUrl(file, 500, 0.85);
      }

      // 1. Selalu simpan ke auth user_metadata (tanpa tergantung kolom schema PostgreSQL)
      await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl },
      });

      // 2. Coba perbarui public.profiles (jika kolom avatar_url tersedia di DB, abaikan jika tidak)
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", profile.id);

      if (updateErr && !updateErr.message.includes("avatar_url")) {
        throw new Error(updateErr.message);
      }

      setProfile((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto profil.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveDisplayName(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !supabaseState.client) return;

    const trimmedName = editNameInput.trim();
    if (!trimmedName) {
      setEditNameError("Nama tampilan tidak boleh kosong.");
      return;
    }

    setIsSavingName(true);
    setEditNameError(null);
    setEditNameSuccess(null);

    try {
      const supabase = supabaseState.client;

      // 1. Update public.profiles
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ display_name: trimmedName })
        .eq("id", profile.id);

      if (profileErr) throw new Error(profileErr.message);

      // 2. Update auth.user_metadata
      await supabase.auth.updateUser({
        data: { display_name: trimmedName },
      });

      // 3. Sync resident_registration_requests
      await supabase
        .from("resident_registration_requests")
        .update({ display_name: trimmedName })
        .or(`requested_user_id.eq.${profile.id},email.ilike.${profile.email}`);

      // 4. Sync households primary_contact_name
      await supabase
        .from("households")
        .update({ primary_contact_name: trimmedName })
        .eq("head_user_id", profile.id);

      setProfile((prev) => (prev ? { ...prev, displayName: trimmedName } : null));
      setEditNameSuccess("Nama tampilan berhasil diperbarui!");
      window.setTimeout(() => {
        setIsEditNameModalOpen(false);
        setEditNameSuccess(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui nama tampilan.";
      setEditNameError(msg);
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseState.client) return;
    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak sama.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const { error } = await supabaseState.client.auth.updateUser({
        password: newPassword,
      });

      if (error) throw new Error(error.message);

      setPasswordSuccess("Password berhasil diubah! Simpan password baru ini untuk login berikutnya.");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah password.";
      setPasswordError(msg);
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f3efe6] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#002b23] border-t-[#D4AF37]" />
          <p className="text-sm font-bold text-[#002b23]">Memuat Profil Rumah & Warga...</p>
        </div>
      </main>
    );
  }

  // 1. TAMPILAN JIKA BELUM LOGIN (GUEST / ANONIM)
  if (!profile) {
    return (
      <main className="min-h-screen bg-[#f3efe6] text-foreground pb-20">
        <header className="relative overflow-hidden bg-gradient-to-br from-[#002b23] via-[#00382e] to-[#00241b] text-white pb-24 pt-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <Link
              href="/portal/"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 text-xs font-bold text-white shadow-sm backdrop-blur transition-all hover:bg-white/20"
            >
              <span>&larr;</span>
              <span>Kembali ke Portal Warga</span>
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-lg px-4 sm:px-6 -mt-12">
          <div className="rounded-3xl border border-black/8 bg-white p-6 sm:p-8 shadow-2xl text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-700 ring-8 ring-amber-500/10">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-black text-foreground">
              Akses Profil Rumah Memerlukan Login
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-muted leading-relaxed">
              Data unit rumah, alamat keluarga, dan rekap pembayaran iuran bersifat privat. Silakan masuk terlebih dahulu dengan akun warga Anda.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/masuk/?next=/portal/profil-rumah/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold text-foreground shadow-md hover:bg-accent-soft transition-all"
              >
                Masuk / Daftar Warga
              </Link>
              <Link
                href="/portal/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-bold text-foreground hover:bg-black/5 transition-all"
              >
                Buka Portal Warga
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. TAMPILAN JIKA SUDAH DAFTAR & LOGIN, TAPI MASIH DALAM ANTRIAN VERIFIKASI (PENDING)
  if (profile.registrationStatus === "pending_review" && !profile.isSuperAdmin) {
    return (
      <main className="min-h-screen bg-[#f3efe6] text-foreground pb-20">
        <header className="relative overflow-hidden bg-gradient-to-br from-[#002b23] via-[#00382e] to-[#00241b] text-white pb-24 pt-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 flex items-center justify-between gap-4">
            <Link
              href="/portal/"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 text-xs font-bold text-white shadow-sm backdrop-blur transition-all hover:bg-white/20"
            >
              <span>&larr;</span>
              <span>Kembali ke Portal Warga</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              MENUNGGU VERIFIKASI PENGURUS
            </span>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-xl px-4 sm:px-6 -mt-12">
          <div className="rounded-3xl border border-amber-300/60 bg-white p-6 sm:p-8 shadow-2xl text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 ring-8 ring-amber-500/10">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-black text-foreground">
              Pendaftaran Rumah Sedang Ditinjau
            </h1>
            <p className="mt-1 text-sm font-semibold text-primary">
              {profile.displayName} · {profile.email}
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-amber-200/60 pb-2">
                <span className="text-amber-800 font-medium">Unit yang Diajukan:</span>
                <span className="font-extrabold text-amber-950">{profile.cluster} — {profile.blockOrUnit}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-amber-200/60 pb-2">
                <span className="text-amber-800 font-medium">Status Antrean:</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Menunggu Approval Pengurus RT
                </span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900 pt-1">
                Pengurus RT sedang mencocokkan blok & nomor rumah Anda dengan data master RT 010. Setelah disetujui, rekap iuran dan data keluarga Anda akan aktif secara otomatis.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/portal/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#002b23] px-6 text-sm font-bold text-white shadow-md hover:bg-[#00382e] transition-all"
              >
                Buka Portal Warga
              </Link>
              <Link
                href="/pengurus/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-bold text-foreground hover:bg-black/5 transition-all"
              >
                Kontak Pengurus RT
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. TAMPILAN FULL UNTUK WARGA YANG SUDAH APPROVED / TERVERIFIKASI
  const initial = profile.displayName.charAt(0).toUpperCase() || "W";
  const displayVal = profile.displayName;
  const emailVal = profile.email;
  const addressVal = `${profile.cluster} - ${profile.blockOrUnit}`;

  return (
    <main className="min-h-screen bg-[#f3efe6] text-foreground pb-20">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleAvatarSelect}
      />

      <header className="relative overflow-hidden bg-gradient-to-br from-[#002b23] via-[#00382e] to-[#00241b] text-white pb-24 pt-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/portal/"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-4 text-xs font-bold text-white shadow-sm backdrop-blur transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              <span>&larr;</span>
              <span>Kembali ke Portal Warga</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AKUN WARGA AKTIF
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#D4AF37]/35 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#E8C865] to-[#B8942F] text-3xl font-black text-[#15140b] shadow-[0_10px_25px_rgba(212,175,55,0.35)] ring-4 ring-[#D4AF37]/30">
                    {profile?.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={displayVal}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Ubah foto profil"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-[2px] cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <svg className="h-5 w-5 animate-spin text-[#E8C865]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-[#E8C865]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span className="text-[9px] font-bold text-[#E8C865]">Ubah Foto</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#E8C865]">
                      Profil Rumah & Warga
                    </span>
                    {profile?.isSuperAdmin ? (
                      <span className="rounded-md border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Super Admin
                      </span>
                    ) : null}
                  </div>

                  <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {isLoading ? "Memuat..." : displayVal}
                  </h1>

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#E8C865]">
                    <svg className="h-4 w-4 shrink-0 text-[#E8C865]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>{addressVal}</span>
                  </p>

                  {uploadError ? (
                    <p className="mt-1 text-xs font-semibold text-red-300 bg-red-950/60 border border-red-500/40 px-2.5 py-1 rounded-md">
                      {uploadError}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/10 px-4 text-xs font-black text-[#E8C865] shadow-sm transition-all hover:bg-[#D4AF37]/30 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>{isUploading ? "Mengunggah..." : "Ganti Foto Profil"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditNameInput(profile?.displayName || "");
                    setEditNameError(null);
                    setEditNameSuccess(null);
                    setIsEditNameModalOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-black text-white shadow-sm transition-all hover:bg-white/20 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Nama Tampilan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    setIsPasswordModalOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-black text-white shadow-sm transition-all hover:bg-white/20 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Ganti Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 space-y-6">
        {/* Verification Status Alert Banner */}
        {profile?.registrationStatus === "pending_review" && (
          <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-50 to-amber-100/70 p-4 text-amber-950 shadow-sm flex items-start gap-3.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-400/30 text-amber-800 font-bold">
              ℹ
            </div>
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm text-amber-900">Pendaftaran Rumah Dalam Peninjauan Pengurus RT</p>
              <p className="mt-0.5 text-amber-800/90">
                Pengajuan unit rumah <strong>{profile.cluster} — {profile.blockOrUnit}</strong> sedang dalam antrean verifikasi oleh pengurus RT. Setelah diverifikasi, data rumah dan rekap pembayaran iuran pribadi Anda akan tampil aktif secara lengkap.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Detail Akun</p>
                <h2 className="mt-0.5 text-lg font-bold text-foreground">Informasi Terdaftar</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                Terverifikasi
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/60">
                <span className="font-semibold text-muted">Nama Tampilan</span>
                <span className="font-bold text-foreground">{displayVal}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/60">
                <span className="font-semibold text-muted">Email Terdaftar</span>
                <span className="font-bold text-foreground">{emailVal}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/60">
                <span className="font-semibold text-muted">Wilayah RT / RW</span>
                <span className="font-bold text-primary">RT 010 / RW 021</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5">
                <span className="font-semibold text-muted">Status Keanggotaan</span>
                <span className="font-bold text-emerald-700">Warga Aktif Cipta Greenville</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Keamanan Data</p>
                  <h2 className="mt-0.5 text-lg font-bold text-foreground">Perlindungan Privasi Warga</h2>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              </div>

              <p className="mt-4 text-xs leading-6 text-muted">
                Data rumah, alamat unit, dan catatan iuran Anda terlindungi secara aman. Akses data personal bersifat privat dan hanya digunakan untuk keperluan layanan administrasi RT 010 Cipta Greenville.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-accent/30 bg-accent-soft/40 p-3.5 text-xs font-semibold text-foreground flex items-center gap-3">
              <span className="font-bold text-primary">Proteksi:</span>
              <span>Sistem terhubung langsung ke kanal database resmi RT 010 / RW 021.</span>
            </div>
          </div>
        </section>

        <PersonalDuesRecap />
      </div>

      {/* Modal Edit Nama Tampilan */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/40 bg-[#00241b] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-[#E8C865]">Edit Nama Tampilan</h3>
              <button
                type="button"
                onClick={() => setIsEditNameModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDisplayName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Tampilan Baru
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  placeholder="Masukkan nama tampilan..."
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  disabled={isSavingName}
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Nama ini akan ditampilkan di header portal warga, dashboard, dan salam pembuka.
                </p>
              </div>

              {editNameError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-semibold text-red-200">
                  {editNameError}
                </div>
              )}

              {editNameSuccess && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-200">
                  🟢 {editNameSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  disabled={isSavingName}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8942F] px-5 py-2 text-xs font-black text-[#15140b] shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  {isSavingName ? "Menyimpan..." : "Simpan Nama"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ganti Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/40 bg-[#00241b] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-[#E8C865]">Ganti Password Akun</h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  disabled={isSavingPassword}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  disabled={isSavingPassword}
                />
              </div>

              {passwordError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-semibold text-red-200">
                  ⚠ {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-200">
                  🟢 {passwordSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isSavingPassword}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8942F] px-5 py-2 text-xs font-black text-[#15140b] shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  {isSavingPassword ? "Menyimpan..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
