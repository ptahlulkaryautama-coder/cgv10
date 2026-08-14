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
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex gap-3 border-b border-border pb-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <Icon name="shield" />
            </div>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
                Kontak privat warga
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Nomor pengurus hanya untuk warga terverifikasi.
              </h2>
              <p className="mt-1.5 text-sm leading-5 text-muted">
                Nomor pribadi terlindungi dan hanya tersedia bagi warga yang
                sudah terverifikasi.
              </p>
            </div>
          </div>

          {state === "allowed" ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {contacts.map((member) => (
                <article
                  key={member.id}
                  className="flex flex-col gap-3 border-b border-border bg-background p-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      {member.nama}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted">{member.jabatan}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={getWhatsAppHref(member.privatePhone ?? "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 cursor-pointer items-center text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      WhatsApp <span aria-hidden="true">→</span>
                    </a>
                    <a
                      href={`tel:${member.privatePhone?.replace(/\s/g, "")}`}
                      className="inline-flex cursor-pointer items-center text-sm text-muted underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Telepon
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-primary/15 bg-background p-3">
              <p className="text-sm font-semibold text-foreground">
                {state === "checking" ? "Memeriksa akses..." : message}
              </p>
              {state === "guest" ? (
                <Link
                  href="/masuk/?next=/kontak/%23kontak-pengurus-privat"
                  className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Masuk untuk lihat kontak
                </Link>
              ) : null}
              {state === "blocked" ? (
                <p className="mt-2 text-sm leading-5 text-muted">
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
