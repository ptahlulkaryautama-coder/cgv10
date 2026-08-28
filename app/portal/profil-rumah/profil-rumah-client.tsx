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
};

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

      const [{ data: prof }, { data: roleRows }, { data: regRequest }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url, phone, status")
          .eq("id", activeUser.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", activeUser.id),
        supabase
          .from("resident_registration_requests")
          .select("cluster, block_or_unit")
          .eq("requested_user_id", activeUser.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!mounted) return;

      const roles = ((roleRows ?? []) as { role: string }[]).map((r) => r.role);
      const isSA = roles.includes("super_admin");

      setProfile({
        id: activeUser.id,
        displayName: prof?.display_name || userEmail.split("@")[0] || "Warga CGV10",
        email: userEmail,
        avatarUrl: prof?.avatar_url || undefined,
        phone: prof?.phone || "-",
        cluster: regRequest?.cluster || "Cipta Greenville",
        blockOrUnit: regRequest?.block_or_unit || "RT 010 / RW 021",
        isSuperAdmin: isSA,
        status: prof?.status || "active",
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
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = profile.id + "/avatar-" + Date.now() + "." + fileExt;

      const { error: uploadErr } = await supabase.storage
        .from("resident-avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("resident-avatars")
        .getPublicUrl(fileName);

      const newAvatarUrl = publicUrlData.publicUrl;

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", profile.id);

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      setProfile((prev) => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto profil.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }

  const initial = profile ? profile.displayName.charAt(0).toUpperCase() : "W";
  const displayVal = profile ? profile.displayName : "Warga CGV10";
  const emailVal = profile ? profile.email : "-";
  const addressVal = profile ? (profile.cluster + " - " + profile.blockOrUnit) : "Cipta Greenville - RT 010 / RW 021";

  return (
    <main className="min-h-screen bg-[#f3efe6] text-foreground pb-16">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleAvatarSelect}
      />

      <header className="relative overflow-hidden bg-gradient-to-br from-[#002b23] via-[#00382e] to-[#00241b] text-white pb-12 pt-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
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

                {profile?.isSuperAdmin ? (
                  <Link
                    href="/admin/pengaturan/"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-black text-white shadow-sm transition-all hover:bg-white/20"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit Nama Tampilan</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
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
    </main>
  );
}
