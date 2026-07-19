"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionPageIntro,
  ProductionPanel,
  ProductionStatusPill,
  cx,
} from "../production-admin-components";

type PublishStatus = "draft" | "review" | "published" | "archived";
type StatusFilter = "all" | PublishStatus;
type PostCategory = "artikel" | "pengumuman" | "agenda";
type LoadState =
  | "checking"
  | "not_logged_in"
  | "loading_access"
  | "access_denied"
  | "loading_posts"
  | "loaded"
  | "empty"
  | "saving"
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
  slug: string;
  category: PostCategory;
  excerpt: string;
  body: string;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  attachment_url?: string | null;
  attachment_label?: string | null;
  status: PublishStatus;
  author_id: string | null;
  approved_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthorRow = {
  id: string;
  display_name: string;
  email: string | null;
};

type EditorForm = {
  id: string | null;
  title: string;
  slug: string;
  category: PostCategory;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  coverImageAlt: string;
  attachmentUrl: string;
  attachmentLabel: string;
  status: PublishStatus;
};

type DbErrorDetail = {
  title: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  context?: string;
};

const emptyForm: EditorForm = {
  id: null,
  title: "",
  slug: "",
  category: "artikel",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  coverImageAlt: "",
  attachmentUrl: "",
  attachmentLabel: "",
  status: "draft",
};

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const categoryOptions: { value: PostCategory; label: string }[] = [
  { value: "artikel", label: "Artikel" },
  { value: "pengumuman", label: "Pengumuman" },
  { value: "agenda", label: "Agenda" },
];

const categoryLabels: Record<PostCategory, string> = {
  artikel: "Artikel",
  pengumuman: "Pengumuman",
  agenda: "Agenda",
};

const statusLabels: Record<PublishStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Published",
  archived: "Archived",
};

const statusTone: Record<PublishStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  review: "border-accent/35 bg-accent-soft text-foreground",
  published: "border-primary/20 bg-primary-soft text-primary",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-700",
};

const portalPostSelectBase =
  "id, title, slug, category, excerpt, body, status, author_id, approved_by, published_at, created_at, updated_at";
const portalPostSelectWithMedia = `${portalPostSelectBase}, cover_image_url, cover_image_alt, attachment_url, attachment_label`;
const portalPostMediaBucket = "portal-post-media";
const portalPostAttachmentBucket = "portal-post-attachments";

const fieldClass =
  "min-h-11 w-full rounded-[10px] border border-black/10 bg-white px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15";

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

function toForm(post: PortalPostRow): EditorForm {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    coverImageUrl: post.cover_image_url ?? "",
    coverImageAlt: post.cover_image_alt ?? "",
    attachmentUrl: post.attachment_url ?? "",
    attachmentLabel: post.attachment_label ?? "",
    status: post.status,
  };
}

function getReadTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} menit`;
}

function getSafeStorageName(fileName: string) {
  const normalized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${Date.now()}-${normalized || "portal-post-file"}`;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAcceptedCoverImage(file: File) {
  const extension = getFileExtension(file.name);
  return (
    file.type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"].includes(extension)
  );
}

function getUploadContentType(file: File) {
  if (file.type) {
    return file.type;
  }

  const extension = getFileExtension(file.name);
  const fallbackTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    pdf: "application/pdf",
    txt: "text/plain",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return fallbackTypes[extension] ?? "application/octet-stream";
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
  const [message, setMessage] = useState(supabaseState.error || "Memeriksa session admin...");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [posts, setPosts] = useState<PortalPostRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorRow>>({});
  const [dbError, setDbError] = useState<DbErrorDetail | null>(null);
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [formNotice, setFormNotice] = useState("");
  const [mediaColumnsReady, setMediaColumnsReady] = useState(true);
  const [uploadingTarget, setUploadingTarget] = useState<"cover" | "attachment" | null>(null);

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
    setMessage("Memeriksa akses akun...");

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
      setMessage("Akun aktif, tetapi data profil belum dapat dibaca.");
      return;
    }

    if (roleError) {
      setState("db_error");
      setDbError(getErrorDetail(roleError, "Gagal membaca role", "user_roles select"));
      setMessage("Akun aktif, tetapi peran belum dapat dibaca.");
      return;
    }

    const loadedRoles = (roleData ?? []) as RoleRow[];
    const roleNames = loadedRoles.map((row) => row.role);
    const { data: permissionData, error: permissionError } = roleNames.length
      ? await supabase.from("role_permissions").select("role, permission").in("role", roleNames)
      : { data: [], error: null };

    if (permissionError) {
      setState("db_error");
      setDbError(
        getErrorDetail(permissionError, "Gagal membaca izin akses", "role_permissions select"),
      );
      setMessage("Akun aktif, tetapi izin akses belum dapat dibaca.");
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
      setMessage("Akun aktif, tetapi belum punya akses membaca kabar.");
      return;
    }

    setState("loading_posts");
    setMessage("Memuat kabar warga...");

    let postsQuery = supabase
      .from("portal_posts")
      .select(portalPostSelectWithMedia)
      .order("updated_at", { ascending: false });

    if (filter !== "all") {
      postsQuery = postsQuery.eq("status", filter);
    }

    const initialPostResult = await postsQuery;
    let postData: unknown = initialPostResult.data;
    let postError = initialPostResult.error;

    if (postError?.code === "42703") {
      setMediaColumnsReady(false);
      let fallbackQuery = supabase
        .from("portal_posts")
        .select(portalPostSelectBase)
        .order("updated_at", { ascending: false });

      if (filter !== "all") {
        fallbackQuery = fallbackQuery.eq("status", filter);
      }

      const fallbackResult = await fallbackQuery;
      postData = fallbackResult.data;
      postError = fallbackResult.error;
    } else {
      setMediaColumnsReady(true);
    }

    if (postError) {
      setState("db_error");
      setDbError(getErrorDetail(postError, "Gagal membaca portal_posts", "portal_posts select"));
      setMessage("Query portal_posts gagal. Detail database tersedia di panel error.");
      return;
    }

    const loadedPosts = (postData ?? []) as PortalPostRow[];
    const authorIds = Array.from(
      new Set(
        loadedPosts
          .flatMap((post) => [post.author_id, post.approved_by])
          .filter(Boolean) as string[],
      ),
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
  const canWriteContent = permissions.some((row) => row.permission === "content:write");
  const canApproveContent = permissions.some((row) => row.permission === "content:approve");
  const isSuperAdmin = roles.some((row) => row.role === "super_admin");
  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const isLoading =
    state === "checking" ||
    state === "loading_access" ||
    state === "loading_posts" ||
    state === "saving";
  const isBusy = isLoading || uploadingTarget !== null;
  const selectedPost = form.id ? posts.find((post) => post.id === form.id) ?? null : null;
  const publishedCount = posts.filter((post) => post.status === "published").length;

  function updateForm<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormNotice("");
  }

  function startNewPost() {
    setForm(emptyForm);
    setFormNotice(
      canWriteContent
        ? "Draft baru siap diisi."
        : "Draft dapat disiapkan, tetapi menyimpan membutuhkan permission content:write.",
    );
    setDbError(null);
  }

  async function savePost(targetStatus: PublishStatus) {
    if (!supabase || !user) {
      setFormNotice("Login admin diperlukan sebelum menyimpan.");
      return;
    }

    if (!canWriteContent) {
      setFormNotice("Menyimpan kabar membutuhkan permission content:write.");
      return;
    }

    if ((targetStatus === "published" || targetStatus === "archived") && !canApproveContent) {
      setFormNotice("Publish dan archive membutuhkan permission content:approve.");
      return;
    }

    const title = form.title.trim();
    const excerpt = form.excerpt.trim();
    const body = form.body.trim();
    const slug = form.slug.trim();
    const coverImageUrl = form.coverImageUrl.trim();
    const coverImageAlt = form.coverImageAlt.trim();
    const attachmentUrl = form.attachmentUrl.trim();
    const attachmentLabel = form.attachmentLabel.trim();

    if (!title) {
      setFormNotice("Judul wajib diisi.");
      return;
    }

    if (!excerpt) {
      setFormNotice("Ringkasan wajib diisi agar kartu portal tidak kosong.");
      return;
    }

    if (!body) {
      setFormNotice("Isi kabar wajib diisi sebelum disimpan.");
      return;
    }

    setState("saving");
    setMessage("Menyimpan portal_posts...");
    setDbError(null);

    const nextPublishedAt =
      targetStatus === "published" ? selectedPost?.published_at ?? new Date().toISOString() : null;

    const payload = {
      title,
      slug: slug || null,
      category: form.category,
      excerpt,
      body,
      status: targetStatus,
      published_at: nextPublishedAt,
      approved_by: targetStatus === "published" ? user.id : null,
    };

    const mediaPayload = mediaColumnsReady
      ? {
          cover_image_url: coverImageUrl || null,
          cover_image_alt: coverImageAlt || null,
          attachment_url: attachmentUrl || null,
          attachment_label: attachmentLabel || null,
        }
      : {};

    const savedSelect = mediaColumnsReady ? portalPostSelectWithMedia : portalPostSelectBase;

    const result = form.id
      ? await supabase
          .from("portal_posts")
          .update({ ...payload, ...mediaPayload })
          .eq("id", form.id)
          .select(savedSelect)
          .single<PortalPostRow>()
      : await supabase
          .from("portal_posts")
          .insert({ ...payload, ...mediaPayload, author_id: user.id })
          .select(savedSelect)
          .single<PortalPostRow>();

    if (result.error) {
      setState("db_error");
      setDbError(
        getErrorDetail(
          result.error,
          form.id ? "Gagal update portal_posts" : "Gagal insert portal_posts",
          form.id ? "portal_posts update" : "portal_posts insert",
        ),
      );
      setMessage("Perubahan gagal disimpan. Detail database tersedia di panel error.");
      return;
    }

    const savedPost = result.data as PortalPostRow;
    setForm(toForm(savedPost));
    setFormNotice(
      targetStatus === "published"
        ? "Kabar berhasil dipublish. Public Kabar Warga dapat membaca status published."
        : targetStatus === "archived"
          ? "Kabar berhasil diarsipkan dan tidak tampil sebagai published."
          : targetStatus === "review"
            ? "Kabar berhasil disimpan untuk review."
            : "Draft berhasil disimpan.",
    );
    await loadPortalPosts();
  }

  async function uploadPortalMedia(file: File | null, target: "cover" | "attachment") {
    if (!file) {
      return;
    }

    if (!supabase || !user) {
      setFormNotice("Login admin diperlukan sebelum upload media.");
      return;
    }

    if (!canWriteContent) {
      setFormNotice("Upload media membutuhkan permission content:write.");
      return;
    }

    if (!form.id) {
      setFormNotice("Simpan sebagai draft dulu, lalu upload media untuk post tersebut.");
      return;
    }

    if (!mediaColumnsReady) {
      setFormNotice("Jalankan migration C1.6 sebelum menyimpan URL media.");
      return;
    }

    if (target === "cover" && !isAcceptedCoverImage(file)) {
      setFormNotice("Gambar utama harus berupa file image.");
      return;
    }

    setUploadingTarget(target);
    setFormNotice(target === "cover" ? "Mengupload gambar utama..." : "Mengupload lampiran...");
    setDbError(null);

    const bucket = target === "cover" ? portalPostMediaBucket : portalPostAttachmentBucket;
    const folder = target === "cover" ? "cover" : "attachments";
    const path = `${form.id}/${folder}/${getSafeStorageName(file.name)}`;
    const contentType = getUploadContentType(file);
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType,
    });

    if (uploadError) {
      setUploadingTarget(null);
      setState("db_error");
      setDbError(getErrorDetail(uploadError, "Gagal upload media", `${bucket} upload`));
      setMessage(
        `Upload media gagal untuk ${file.name} (${contentType}, ${Math.round(file.size / 1024)} KB). Pastikan storage C1.7/C1.8 sudah dijalankan.`,
      );
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicUrlData.publicUrl;
    const updatePayload =
      target === "cover"
        ? {
            cover_image_url: publicUrl,
            cover_image_alt: form.coverImageAlt.trim() || form.title.trim() || file.name,
          }
        : {
            attachment_url: publicUrl,
            attachment_label: form.attachmentLabel.trim() || file.name,
          };

    const { data: updatedPost, error: updateError } = await supabase
      .from("portal_posts")
      .update(updatePayload)
      .eq("id", form.id)
      .select(portalPostSelectWithMedia)
      .single<PortalPostRow>();

    setUploadingTarget(null);

    if (updateError) {
      setState("db_error");
      setDbError(
        getErrorDetail(updateError, "Gagal menyimpan URL media", "portal_posts media update"),
      );
      setMessage("Upload berhasil, tetapi URL media gagal disimpan ke portal_posts.");
      return;
    }

    setForm(toForm(updatedPost as PortalPostRow));
    setFormNotice(
      target === "cover"
        ? "Gambar utama berhasil diupload dan tersimpan."
        : "Lampiran berhasil diupload dan tersimpan.",
    );
    await loadPortalPosts();
  }

  return (
    <ProductionAdminShell
      active="portal-posts"
      title="Kabar Portal"
      subtitle="Kelola informasi warga"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleSummary}
      isSuperAdmin={isSuperAdmin}
      action={
        <div className="flex items-center gap-2">
          <ProductionActionButton onClick={startNewPost} disabled={isBusy || !canWriteContent}>
            New
          </ProductionActionButton>
          <ProductionActionButton onClick={loadPortalPosts} disabled={isBusy} primary>
            {isBusy ? "Memuat..." : "Refresh"}
          </ProductionActionButton>
        </div>
      }
    >
      <ProductionPageIntro
        eyebrow="Content management - Portal Warga"
        title={
          <>
            Portal Posts <br />
            <span className="italic">Portal Warga CGV10</span>
          </>
        }
        text="Tulis, periksa, tayangkan, atau arsipkan kabar yang akan dibaca warga di portal."
        side={
          <ProductionStatusPill>
            {canApproveContent
              ? "Editor + publish"
              : canWriteContent
                ? "Editor draft"
                : canReadContent
                  ? "Read-only"
                  : "Access check"}
          </ProductionStatusPill>
        }
      />

      <div className="grid w-full gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-5">
          <ProductionPanel>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Data kabar
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">{message}</h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
                    Kabar terbit tampil di portal warga. Draft, review, dan arsip tetap hanya
                    terlihat di admin.
                  </p>
                  {!canWriteContent ? (
                    <p className="mt-3 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-red-700">
                      Permission content:write belum terbaca untuk akun ini. Jika baru diberi role,
                      logout lalu login lagi dan pastikan migrasi permission sudah dijalankan.
                    </p>
                  ) : !canApproveContent ? (
                    <p className="mt-3 max-w-2xl rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-sm font-bold leading-6 text-foreground">
                      Editor draft aktif. Publish dan archive tetap membutuhkan permission
                      content:approve.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StateBadge state={state} canReadContent={canReadContent} />
                  <ProductionStatusPill>{publishedCount} published</ProductionStatusPill>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter status portal_posts">
                {statusFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    disabled={isBusy}
                    className={cx(
                      "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border px-4 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60",
                      filter === item.value
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-primary hover:border-primary/30",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {isLoading ? <LoadingPanel message={message} /> : null}

              {state === "not_logged_in" ? (
                <ProtectedMessage
                  title="Login diperlukan"
                  text="Login admin diperlukan sebelum kabar warga dapat dikelola."
                  actionHref="/admin/login/"
                  actionText="Masuk admin"
                />
              ) : null}

              {state === "access_denied" ? (
                <ProtectedMessage
                  title="Akses belum tersedia"
                  text="Akun ini belum memiliki izin membaca kabar warga."
                />
              ) : null}

              {state === "empty" ? (
                <ProtectedMessage
                  title="Tidak ada data"
                  text="Belum ada kabar untuk filter yang sedang dipilih."
                />
              ) : null}

              {state === "db_error" && dbError ? <DatabaseErrorPanel error={dbError} /> : null}

              {state === "loaded" || state === "saving" ? (
                <div className="mt-5 grid gap-3">
                  {posts.map((post) => {
                    const author = post.author_id ? authors[post.author_id] : null;
                    const isSelected = post.id === form.id;

                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          setForm(toForm(post));
                          setFormNotice("");
                          setDbError(null);
                        }}
                        aria-pressed={isSelected}
                        className={cx(
                          "w-full cursor-pointer rounded-[14px] border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isSelected
                            ? "border-primary bg-primary-soft/45"
                            : "border-black/8 bg-white hover:border-primary/25 hover:bg-primary-soft/20",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-muted">
                                {categoryLabels[post.category]}
                              </span>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone[post.status]}`}
                              >
                                {statusLabels[post.status]}
                              </span>
                            </div>
                            <h3 className="mt-3 text-base font-bold leading-snug text-foreground">
                              {post.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                              {post.excerpt}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                            {isSelected ? "Sedang diedit" : "Pilih"}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 border-t border-border pt-3 text-xs font-semibold text-muted sm:grid-cols-3">
                          <span className="truncate">
                            Author: {author?.display_name || author?.email || "Tanpa author"}
                          </span>
                          <span className="truncate font-mono text-primary">{post.slug}</span>
                          <span className="truncate sm:text-right">
                            Update {formatDate(post.updated_at)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </ProductionPanel>
        </div>

        <aside className="grid gap-5">
          <ProductionPanel>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">Detail kabar</h2>
              {selectedPost ? (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone[selectedPost.status]}`}>
                      {statusLabels[selectedPost.status]}
                    </span>
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-muted">
                      {categoryLabels[selectedPost.category]}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold leading-snug text-foreground">
                    {selectedPost.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-muted">
                    {selectedPost.excerpt}
                  </p>
                  {selectedPost.cover_image_url ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
                      {/* Admin-entered public URLs are not constrained to Next image domains yet. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPost.cover_image_url}
                        alt={selectedPost.cover_image_alt || selectedPost.title}
                        className="aspect-[4/3] w-full bg-cream object-cover"
                      />
                    </div>
                  ) : null}
                  <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-cream p-4 font-sans text-sm leading-6 text-foreground">
                    {selectedPost.body}
                  </pre>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <InfoRow label="Slug" value={selectedPost.slug} />
                    <InfoRow label="Published" value={formatDate(selectedPost.published_at)} />
                    <InfoRow label="Durasi baca" value={getReadTime(selectedPost.body)} />
                  </dl>
                  {selectedPost.attachment_url ? (
                    <a
                      href={selectedPost.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-[10px] border border-primary/20 bg-primary-soft px-3 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {selectedPost.attachment_label || "Buka lampiran"}
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted">
                  Pilih kabar dari daftar untuk melihat detail.
                </p>
              )}
            </div>
          </ProductionPanel>

          <ProductionPanel>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Editor
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-foreground">
                    {form.id ? "Edit kabar" : "Draft baru"}
                  </h2>
                </div>
                <ProductionStatusPill>{form.status}</ProductionStatusPill>
              </div>

              <div className="mt-5 grid gap-4">
                <FieldLabel label="Judul">
                  <input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    disabled={isBusy || !canWriteContent}
                    className={fieldClass}
                    placeholder="Judul kabar warga"
                  />
                </FieldLabel>

                <FieldLabel label="Slug">
                  <input
                    value={form.slug}
                    onChange={(event) => updateForm("slug", event.target.value)}
                    disabled={isBusy || !canWriteContent}
                    className={fieldClass}
                    placeholder="otomatis-jika-dikosongkan"
                  />
                </FieldLabel>

                <FieldLabel label="Kategori">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value as PostCategory)
                    }
                    disabled={isBusy || !canWriteContent}
                    className={`${fieldClass} cursor-pointer`}
                  >
                    {categoryOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FieldLabel>

                <FieldLabel label="Ringkasan">
                  <textarea
                    value={form.excerpt}
                    onChange={(event) => updateForm("excerpt", event.target.value)}
                    disabled={isBusy || !canWriteContent}
                    className={`${fieldClass} min-h-24 resize-y py-3 leading-6`}
                    placeholder="Ringkasan pendek untuk kartu portal"
                  />
                </FieldLabel>

                <FieldLabel label="Isi kabar">
                  <textarea
                    value={form.body}
                    onChange={(event) => updateForm("body", event.target.value)}
                    disabled={isBusy || !canWriteContent}
                    className={`${fieldClass} min-h-56 resize-y py-3 leading-6`}
                    placeholder="Tulis isi kabar. Paragraf dapat dipisahkan dengan baris kosong."
                  />
                </FieldLabel>

                <div className="rounded-[14px] border border-border bg-cream p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                        Media dan lampiran
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                        {mediaColumnsReady
                          ? "Upload file akan menyimpan URL publik ke post ini. Untuk post baru, save draft dulu sebelum upload."
                          : "Jalankan migration C1.6 agar field media dapat disimpan ke Supabase."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <FieldLabel label="URL gambar utama">
                      <input
                        value={form.coverImageUrl}
                        onChange={(event) => updateForm("coverImageUrl", event.target.value)}
                        disabled={isBusy || !mediaColumnsReady || !canWriteContent}
                        className={fieldClass}
                        placeholder="https://..."
                      />
                    </FieldLabel>
                    <FieldLabel label="Upload gambar utama">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/pjpeg,image/webp,image/gif,image/heic,image/heif"
                        onChange={(event) => {
                          uploadPortalMedia(event.currentTarget.files?.[0] ?? null, "cover");
                          event.currentTarget.value = "";
                        }}
                        disabled={isBusy || !mediaColumnsReady || !form.id || !canWriteContent}
                        className="block w-full cursor-pointer rounded-[10px] border border-dashed border-primary/25 bg-white px-3 py-3 text-sm font-semibold text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-bold file:text-accent hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </FieldLabel>
                    <FieldLabel label="Alt text gambar">
                      <input
                        value={form.coverImageAlt}
                        onChange={(event) => updateForm("coverImageAlt", event.target.value)}
                        disabled={isBusy || !mediaColumnsReady || !canWriteContent}
                        className={fieldClass}
                        placeholder="Deskripsi singkat gambar"
                      />
                    </FieldLabel>
                    <FieldLabel label="URL lampiran">
                      <input
                        value={form.attachmentUrl}
                        onChange={(event) => updateForm("attachmentUrl", event.target.value)}
                        disabled={isBusy || !mediaColumnsReady || !canWriteContent}
                        className={fieldClass}
                        placeholder="https://.../dokumen.pdf"
                      />
                    </FieldLabel>
                    <FieldLabel label="Upload lampiran">
                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/jpg,image/pjpeg,image/webp,image/heic,image/heif,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => {
                          uploadPortalMedia(event.currentTarget.files?.[0] ?? null, "attachment");
                          event.currentTarget.value = "";
                        }}
                        disabled={isBusy || !mediaColumnsReady || !form.id || !canWriteContent}
                        className="block w-full cursor-pointer rounded-[10px] border border-dashed border-primary/25 bg-white px-3 py-3 text-sm font-semibold text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-bold file:text-accent hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </FieldLabel>
                    <FieldLabel label="Label lampiran">
                      <input
                        value={form.attachmentLabel}
                        onChange={(event) => updateForm("attachmentLabel", event.target.value)}
                        disabled={isBusy || !mediaColumnsReady || !canWriteContent}
                        className={fieldClass}
                        placeholder="Contoh: Lampiran Tata Tertib"
                      />
                    </FieldLabel>
                  </div>
                </div>
              </div>

              {formNotice ? (
                <p className="mt-4 rounded-[12px] border border-accent/25 bg-accent-soft px-3 py-2 text-sm font-semibold leading-6 text-foreground">
                  {formNotice}
                </p>
              ) : null}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => savePost("draft")}
                  disabled={isBusy || !canWriteContent}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Simpan draft
                </button>
                <button
                  type="button"
                  onClick={() => savePost("review")}
                  disabled={isBusy || !canWriteContent}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-accent/40 bg-accent-soft px-3 text-sm font-bold text-foreground transition-colors duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Kirim untuk diperiksa
                </button>
                <button
                  type="button"
                  onClick={() => savePost("published")}
                  disabled={isBusy || !canApproveContent}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-primary bg-primary px-3 text-sm font-bold text-accent transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Terbitkan
                </button>
                <button
                  type="button"
                  onClick={() => savePost("archived")}
                  disabled={!form.id || isBusy || !canApproveContent}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition-colors duration-200 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Arsipkan
                </button>
              </div>
            </div>
          </ProductionPanel>

          <ProductionPanel>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">Akses akun</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <InfoRow label="Email" value={visibleEmail} />
                <InfoRow label="Roles" value={roleSummary} />
                <InfoRow label="Baca" value={canReadContent ? "Aktif" : "Tidak ada"} />
                <InfoRow label="Tulis" value={canWriteContent ? "Aktif" : "Dicek saat simpan"} />
                <InfoRow label="Tayang" value={canApproveContent ? "Aktif" : "Dicek saat terbit"} />
                <InfoRow label="Media" value={mediaColumnsReady ? "Aktif" : "Perlu pembaruan database"} />
              </dl>
            </div>
          </ProductionPanel>

          <ProductionPanel>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">Koneksi portal</h2>
              <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-muted">
                <li className="rounded-xl bg-cream px-3 py-2">
                  Portal warga hanya menampilkan kabar yang sudah terbit.
                </li>
                <li className="rounded-xl bg-cream px-3 py-2">
                  Alamat artikel dibuat otomatis saat kabar disimpan.
                </li>
                <li className="rounded-xl bg-cream px-3 py-2">
                  Kabar bawaan tetap tersedia sebagai cadangan.
                </li>
              </ul>
            </div>
          </ProductionPanel>
        </aside>
      </div>
    </ProductionAdminShell>
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
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone}`}
    >
      {label}
    </span>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-[16px] border border-border bg-cream p-5">
      <p className="text-sm font-bold text-foreground">{message}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted">
        Menunggu data dari server.
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
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{text}</p>
      {actionHref && actionText ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
      <h3 className="text-lg font-bold text-red-700">{error.title}</h3>
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

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="mt-1 break-words font-bold text-foreground">{value}</dd>
    </div>
  );
}
