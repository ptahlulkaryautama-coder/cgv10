"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { pengurusLeadership } from "@/lib/cgv10-master-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Icon } from "../components/portal";

type AccessState = "checking" | "guest" | "allowed" | "blocked" | "error";
type RoleRow = { role: string };

const allowedRoles = new Set([
  "warga",
  "super_admin",
  "ketua_rt",
  "sekretaris",
  "bendahara",
  "palugada_reviewer",
]);

function getWhatsAppHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function PrivatePengurusContacts() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch {
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [state, setState] = useState<AccessState>(
    supabaseState.error ? "error" : "checking",
  );
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa akses kontak pengurus...",
  );

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let mounted = true;

    async function loadAccess() {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (!mounted) return;

      if (sessionError) {
        setState("error");
        setMessage(sessionError.message);
        return;
      }

      const user = sessionData.session?.user;
      if (!user) {
        setState("guest");
        setMessage("Nomor pengurus hanya tampil setelah warga login.");
        return;
      }

      const { data: roleData, error: roleError } = await client
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!mounted) return;

      if (roleError) {
        setState("error");
        setMessage(roleError.message);
        return;
      }

      const roles = ((roleData ?? []) as RoleRow[]).map((row) => row.role);
      const hasAccess = roles.some((role) => allowedRoles.has(role));

      if (!hasAccess) {
        setState("blocked");
        setMessage("Akun sudah login, tetapi belum tercatat sebagai warga terverifikasi.");
        return;
      }

      setState("allowed");
      setMessage("Kontak pengurus aktif untuk warga terverifikasi.");
    }

    void loadAccess();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(loadAccess, 0));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const contacts = pengurusLeadership.filter((member) => member.privatePhone);

  return (
    <section id="kontak-pengurus-privat" className="border-y border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon name="shield" />
            </div>
            <div>
              <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                Kontak privat warga
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                Nomor pengurus hanya untuk warga terverifikasi.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Informasi ini tidak dibuka untuk publik agar nomor pribadi
                pengurus tetap terlindungi.
              </p>
            </div>
          </div>

          {state === "allowed" ? (
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {contacts.map((member) => (
                <article
                  key={member.id}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    {member.jabatan}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {member.nama}
                  </h3>
                  <p className="mt-2 text-base font-semibold text-primary">
                    {member.privatePhone}
                  </p>
                  <div className="mt-4 grid gap-2">
                    <a
                      href={getWhatsAppHref(member.privatePhone ?? "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${member.privatePhone?.replace(/\s/g, "")}`}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Telepon
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-primary/15 bg-background p-4">
              <p className="text-sm font-semibold text-foreground">
                {state === "checking" ? "Memeriksa akses..." : message}
              </p>
              {state === "guest" ? (
                <Link
                  href="/masuk/?next=/kontak/%23kontak-pengurus-privat"
                  className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Masuk untuk lihat kontak
                </Link>
              ) : null}
              {state === "blocked" ? (
                <p className="mt-3 text-sm leading-6 text-muted">
                  Minta pengurus mengaktifkan status warga atau role akun Anda
                  sebelum nomor kontak ditampilkan.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
