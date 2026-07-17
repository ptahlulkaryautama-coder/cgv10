"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthState = "checking" | "guest" | "authenticated";

type AuthAwareActionProps = {
  href: string;
  guestHref?: string;
  guestLabel: string;
  authenticatedLabel: string;
  className: string;
};

export function AuthAwareAction({
  href,
  guestHref,
  guestLabel,
  authenticatedLabel,
  className,
}: AuthAwareActionProps) {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [state, setState] = useState<AuthState>(() =>
    supabase ? "checking" : "guest",
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;

    async function checkSession() {
      const { data } = await client.auth.getSession();
      if (!mounted) return;
      setState(data.session ? "authenticated" : "guest");
    }

    void checkSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => window.setTimeout(checkSession, 0));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isAuthenticated = state === "authenticated";
  const label =
    state === "checking"
      ? "Memeriksa akses..."
      : isAuthenticated
        ? authenticatedLabel
        : guestLabel;

  return (
    <Link
      href={isAuthenticated ? href : guestHref ?? `/masuk/?next=${encodeURIComponent(href)}`}
      className={className}
    >
      {label}
    </Link>
  );
}
