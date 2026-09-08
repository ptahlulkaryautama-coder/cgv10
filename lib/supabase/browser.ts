import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase browser environment variables are not configured.",
    );
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Dedicated storage key to survive PWA reinstall & cache clears
        storageKey: "cgv10-session",
      },
    });

    // Proactively refresh session when tab regains focus or becomes visible.
    // This prevents premature logout during brief idle periods reported by sekretaris.
    if (typeof window !== "undefined") {
      const refreshIfNeeded = () => {
        browserClient?.auth.getSession().then(({ data }) => {
          if (data.session) {
            // Force a token refresh if token expires within 10 minutes
            const expiresAt = data.session.expires_at ?? 0;
            const secondsLeft = expiresAt - Math.floor(Date.now() / 1000);
            if (secondsLeft < 600) {
              void browserClient?.auth.refreshSession();
            }
          }
        });
      };

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          refreshIfNeeded();
        }
      });

      window.addEventListener("focus", refreshIfNeeded);
    }
  }

  return browserClient;
}
