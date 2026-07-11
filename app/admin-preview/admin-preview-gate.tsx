"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TrialAdminRole = {
  label: string;
  shortLabel: string;
  hash: string;
  scope: string;
};

const ACCESS_STORAGE_KEY = "cgv10-admin-preview-access";

const trialAdminRoles: TrialAdminRole[] = [
  {
    label: "Super Admin",
    shortLabel: "Super",
    hash: "e63d07777ad1c3d0862172bc4d866c731becb441316a44d38d8b7e0b49f0e7b1",
    scope: "Full preview access untuk seluruh modul admin.",
  },
  {
    label: "Ketua RT",
    shortLabel: "Ketua",
    hash: "714360542fbd8d80f88febe2f2c9e66c8ba8bb1c5bb587d054093dae313fcef2",
    scope: "Review dashboard, layanan, publikasi, dan ringkasan pengurus.",
  },
  {
    label: "Sekretaris",
    shortLabel: "Sekretaris",
    hash: "806a8dd494f87b16007857ac6346b1d466e28d6a022a40f10a96ee9e2aa18697",
    scope: "Review data warga, dokumen, layanan, dan konten portal.",
  },
  {
    label: "Bendahara",
    shortLabel: "Bendahara",
    hash: "60eea3dd25dc3c536675a8e378ca4fcb49b115fd079bfa3be1f71d2d988b70e2",
    scope: "Review keuangan, iuran, dan ringkasan kas publik.",
  },
];

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function findRoleByHash(hash: string) {
  return trialAdminRoles.find((role) => role.hash === hash) ?? null;
}

export function AdminPreviewGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<TrialAdminRole | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const storedHash = window.sessionStorage.getItem(ACCESS_STORAGE_KEY);
      if (storedHash) {
        setRole(findRoleByHash(storedHash));
      }
      setReady(true);
    });
  }, []);

  const roleCards = useMemo(
    () =>
      trialAdminRoles.map((item) => (
        <div
          key={item.label}
          className="rounded-[14px] border border-white/12 bg-white/7 p-4"
        >
          <p className="text-sm font-bold text-white">{item.label}</p>
          <p className="mt-2 text-xs leading-5 text-white/62">{item.scope}</p>
        </div>
      )),
    [],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const hash = await sha256(code);
    const matchedRole = findRoleByHash(hash);

    if (!matchedRole) {
      setError("Kode akses tidak cocok. Periksa kembali kode trial pengurus.");
      return;
    }

    window.sessionStorage.setItem(ACCESS_STORAGE_KEY, hash);
    setRole(matchedRole);
    setCode("");
  }

  function logout() {
    window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
    setRole(null);
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-primary px-4 text-white">
        <p className="text-sm font-semibold text-white/70">
          Memeriksa akses admin preview...
        </p>
      </main>
    );
  }

  if (role) {
    return (
      <>
        <div className="sticky top-0 z-[60] border-b border-accent/20 bg-primary px-4 py-2 text-white shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 font-bold text-foreground">
                {role.shortLabel}
              </span>
              <span className="font-semibold text-white/82">
                Admin Preview Trial
              </span>
              <span className="text-white/48">Session only</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="min-h-8 cursor-pointer rounded-[10px] border border-white/16 bg-white/8 px-3 font-bold text-white transition-colors duration-200 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Keluar preview
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-primary text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 xl:px-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
            Admin Preview Access
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
            Kode trial khusus untuk pengurus CGV10.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/74">
            Masukkan kode sesuai role untuk membuka dashboard preview. Ini
            adalah pagar akses sementara untuk trial, bukan sistem keamanan
            produksi.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 max-w-xl rounded-[18px] border border-white/14 bg-white/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
          >
            <label
              htmlFor="admin-preview-code"
              className="text-xs font-bold uppercase tracking-[0.16em] text-accent"
            >
              Kode akses
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                id="admin-preview-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
                placeholder="Masukkan kode pengurus"
                className="min-h-12 rounded-[12px] border border-white/16 bg-white px-4 text-base font-semibold text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/35"
              />
              <button
                type="submit"
                className="min-h-12 cursor-pointer rounded-[12px] border border-accent bg-accent px-5 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Buka Admin
              </button>
            </div>
            {error ? (
              <p className="mt-3 rounded-[12px] border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-white/58">
              Jangan isi data pribadi warga di admin preview. Sistem produksi
              tetap membutuhkan auth, database rules, dan audit log.
            </p>
          </form>

          <Link
            href="/"
            className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-white/16 bg-white/8 px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Kembali ke portal publik
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">{roleCards}</div>
      </section>
    </main>
  );
}
