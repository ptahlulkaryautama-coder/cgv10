"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PublishStatus = "draft" | "review" | "published" | "archived";
type StatusFilter = "all" | PublishStatus;
type LoadState =
  | "checking"
  | "not_logged_in"
  | "loading_access"
  | "access_denied"
  | "loading_posts"
  | "loaded"
  | "empty"
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

type PortalPostRow = {
  id: string;
  title: string;
  category: "artikel" | "pengumuman" | "agenda";
  status: PublishStatus;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthorRow = {
  id: string;
  display_name: string;
  email: string | null;
};

type DbErrorDetail = {
  title: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  context?: string;
};

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const statusTone: Record<PublishStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  review: "border-accent/35 bg-accent-soft text-foreground",
  published: "border-primary/20 bg-primary-soft text-primary",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-700",
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
    message: candidate.message ?? "Database query failed.",
    code: candidate.code,
    details: candidate.details,
    hint: candidate.hint,
    context,
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPublicationState(post: PortalPostRow) {
  if (post.status === "published" && post.published_at) {
    return "Published";
  }

  if (post.status === "published") {
    return "Published tanpa timestamp";
  }

  if (post.published_at) {
    return "Ada publish timestamp";
  }

  return "Belum dipublikasi";
}

export function PortalPostsAdminClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch (error) {
      console.error(error);
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);

  const supabase = supabaseState.client;
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [state, setState] = useState<LoadState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa session admin...",
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [posts, setPosts] = useState<PortalPostRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorRow>>({});
  const [dbError, setDbError] = useState<DbErrorDetail | null>(null);

  const loadPortalPosts = useCallback(async () => {
    if (!supabase) {
      setState("error");
      setMessage("Konfigurasi Supabase belum siap.");
      return;
    }

    setState("checking");
    setMessage("Memeriksa session admin...");
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
      setPosts([]);
      setAuthors({});
      setState("not_logged_in");
      setMessage("Belum ada session login aktif.");
      return;
    }

    setState("loading_access");
    setMessage("Memvalidasi profile, role, dan permission content:read...");

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
      setDbError(getErrorDetail(profileError, "Gagal membaca profile", "profiles select"));
      setMessage("Session aktif, tetapi query profile gagal.");
      return;
    }

    if (roleError) {
      setState("db_error");
      setDbError(getErrorDetail(roleError, "Gagal membaca role", "user_roles select"));
      setMessage("Session aktif, tetapi query role gagal.");
      return;
    }

    const loadedRoles = (roleData ?? []) as RoleRow[];
    const roleNames = loadedRoles.map((row) => row.role);
    const { data: permissionData, error: permissionError } = roleNames.length
      ? await supabase
          .from("role_permissions")
          .select("role, permission")
          .in("role", roleNames)
      : { data: [], error: null };

    if (permissionError) {
      setState("db_error");
      setDbError(
        getErrorDetail(permissionError, "Gagal membaca permission", "role_permissions select"),
      );
      setMessage("Session aktif, tetapi query permission gagal.");
      return;
    }

    const loadedPermissions = (permissionData ?? []) as PermissionRow[];
    const canReadContent = loadedPermissions.some((row) => row.permission === "content:read");

    setProfile(profileData ?? null);
    setRoles(loadedRoles);
    setPermissions(loadedPermissions);

    if (!canReadContent) {
      setPosts([]);
      setAuthors({});
      setState("access_denied");
      setMessage("Akun aktif, tetapi tidak memiliki permission content:read.");
      return;
    }

    setState("loading_posts");
    setMessage("Membaca portal_posts melalui Supabase Auth dan RLS...");

    let postsQuery = supabase
      .from("portal_posts")
      .select("id, title, category, status, author_id, published_at, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (filter !== "all") {
      postsQuery = postsQuery.eq("status", filter);
    }

    const { data: postData, error: postError } = await postsQuery;

    if (postError) {
      setState("db_error");
      setDbError(getErrorDetail(postError, "Gagal membaca portal_posts", "portal_posts select"));
      setMessage("Query portal_posts gagal. Detail database tersedia di panel error.");
      return;
    }

    const loadedPosts = (postData ?? []) as PortalPostRow[];
    const authorIds = Array.from(
      new Set(loadedPosts.map((post) => post.author_id).filter(Boolean) as string[]),
    );

    if (authorIds.length > 0) {
      const { data: authorData, error: authorError } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", authorIds);

      if (authorError) {
        setState("db_error");
        setDbError(getErrorDetail(authorError, "Gagal membaca author", "profiles author select"));
        setMessage("portal_posts terbaca, tetapi query author gagal.");
        return;
      }

      const authorMap = ((authorData ?? []) as AuthorRow[]).reduce<Record<string, AuthorRow>>(
        (items, author) => {
          items[author.id] = author;
          return items;
        },
        {},
      );

      setAuthors(authorMap);
    } else {
      setAuthors({});
    }

    setPosts(loadedPosts);
    setState(loadedPosts.length > 0 ? "loaded" : "empty");
    setMessage(
      loadedPosts.length > 0
        ? `Berhasil membaca ${loadedPosts.length} portal_posts.`
        : "Tidak ada portal_posts untuk filter ini.",
    );
  }, [filter, supabase]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPortalPosts();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadPortalPosts]);

  const roleSummary = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "-";
  const canReadContent = permissions.some((row) => row.permission === "content:read");
  const isLoading =
    state === "checking" || state === "loading_access" || state === "loading_posts";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
              CGV10 Production Admin
            </p>
            <h1 className="mt-2 text-2xl font-black text-primary sm:text-3xl">
              Portal Posts
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Admin
            </Link>
            <Link
              href="/admin/debug/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Debug
            </Link>
            <button
              type="button"
              onClick={loadPortalPosts}
              disabled={isLoading}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)] lg:px-8">
        <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
                Read-only content admin
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground">{message}</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
                Query memakai browser Supabase client, Auth session aktif, dan RLS
                portal_posts. Public Kabar Warga belum dihubungkan ke Supabase.
              </p>
            </div>
            <StateBadge state={state} canReadContent={canReadContent} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter status portal_posts">
            {statusFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                disabled={isLoading}
                className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  filter === item.value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-primary hover:border-primary/30"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isLoading ? <LoadingPanel message={message} /> : null}

          {state === "not_logged_in" ? (
            <ProtectedMessage
              title="Login diperlukan"
              text="Belum ada session Supabase aktif. Login admin diperlukan sebelum portal_posts dapat dibaca melalui RLS."
              actionHref="/admin/login/"
              actionText="Masuk admin"
            />
          ) : null}

          {state === "access_denied" ? (
            <ProtectedMessage
              title="Access denied"
              text="Akun ini terbaca oleh Supabase Auth, tetapi role yang dimiliki tidak membawa permission content:read."
            />
          ) : null}

          {state === "empty" ? (
            <ProtectedMessage
              title="Tidak ada data"
              text="Query portal_posts berhasil, tetapi tidak ada baris untuk filter yang sedang dipilih."
            />
          ) : null}

          {state === "db_error" && dbError ? <DatabaseErrorPanel error={dbError} /> : null}

          {state === "loaded" ? (
            <div className="mt-5 overflow-hidden rounded-[16px] border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-[860px] w-full border-collapse text-left text-sm">
                  <thead className="bg-cream text-xs font-black uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Author</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3">Publication</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((post) => {
                      const author = post.author_id ? authors[post.author_id] : null;

                      return (
                        <tr key={post.id} className="align-top transition-colors duration-200 hover:bg-primary-soft/35">
                          <td className="px-4 py-4">
                            <p className="font-black text-foreground">{post.title}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                              {post.category}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-muted">Tidak ada kolom slug</p>
                            <p className="mt-1 font-mono text-xs text-muted">{post.id.slice(0, 8)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusTone[post.status]}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-black text-foreground">
                              {author?.display_name || author?.email || "Tanpa author"}
                            </p>
                            <p className="mt-1 font-mono text-xs text-muted">
                              {post.author_id ? post.author_id.slice(0, 8) : "-"}
                            </p>
                          </td>
                          <td className="px-4 py-4 font-semibold text-muted">
                            {formatDate(post.updated_at)}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-black text-foreground">{getPublicationState(post)}</p>
                            <p className="mt-1 text-xs font-semibold text-muted">
                              published_at: {formatDate(post.published_at)}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="grid gap-5">
          <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)]">
            <h2 className="text-lg font-black text-foreground">Access context</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <InfoRow label="Email" value={profile?.email ?? user?.email ?? "-"} />
              <InfoRow label="Roles" value={roleSummary} />
              <InfoRow label="Permission" value={canReadContent ? "content:read OK" : "content:read tidak ada"} />
              <InfoRow label="Filter" value={filter} />
            </dl>
          </section>

          <section className="rounded-[18px] border border-border bg-surface p-5 shadow-[0_16px_44px_rgba(18,32,24,0.08)]">
            <h2 className="text-lg font-black text-foreground">Schema audit</h2>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-muted">
              <li className="rounded-xl bg-cream px-3 py-2">
                status memakai enum publish_status: draft, review, published, archived.
              </li>
              <li className="rounded-xl bg-cream px-3 py-2">
                slug belum ada di migration portal_posts saat ini.
              </li>
              <li className="rounded-xl bg-cream px-3 py-2">
                RLS select: published public, atau content:read untuk admin.
              </li>
              <li className="rounded-xl bg-cream px-3 py-2">
                Modul ini read-only. Tidak ada insert, update, upload, atau publish action.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

function StateBadge({
  state,
  canReadContent,
}: {
  state: LoadState;
  canReadContent: boolean;
}) {
  const tone =
    state === "loaded" || state === "empty"
      ? "border-primary/20 bg-primary-soft text-primary"
      : state === "db_error" || state === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-accent/30 bg-accent-soft text-foreground";

  const label = canReadContent ? "content:read" : state.replaceAll("_", " ");

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${tone}`}>
      {label}
    </span>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-[16px] border border-border bg-cream p-5">
      <p className="text-sm font-black text-foreground">{message}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted">
        Menunggu response Supabase dari browser client.
      </p>
    </div>
  );
}

function ProtectedMessage({
  title,
  text,
  actionHref,
  actionText,
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionText?: string;
}) {
  return (
    <div className="mt-5 rounded-[16px] border border-border bg-cream p-5">
      <h3 className="text-lg font-black text-foreground">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{text}</p>
      {actionHref && actionText ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
}

function DatabaseErrorPanel({ error }: { error: DbErrorDetail }) {
  const rows = [
    ["Message", error.message],
    ["Code", error.code ?? "-"],
    ["Details", error.details ?? "-"],
    ["Hint", error.hint ?? "-"],
    ["Context", error.context ?? "-"],
  ];

  return (
    <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 p-5">
      <h3 className="text-lg font-black text-red-700">{error.title}</h3>
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
      <dd className="mt-1 break-words font-black text-foreground">{value}</dd>
    </div>
  );
}
