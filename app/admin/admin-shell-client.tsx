"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { kabarArticles, marketplaceItems } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "./production-admin-components";

type AdminRole = "super_admin" | "ketua_rt" | "sekretaris" | "bendahara" | "palugada_reviewer";
type LoadState = "checking" | "not_logged_in" | "loading_profile" | "no_admin_role" | "authorized" | "error";

type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  status: "invited" | "active" | "suspended";
};

type UserRoleRow = {
  role: string;
  assigned_at: string;
};

type PermissionRow = {
  permission: string;
};

type PortalPostStatus = "draft" | "review" | "published" | "archived";
type UnifiedPortalPostStatus = PortalPostStatus | "local_archive";
type PortalPostDashboardFilter = "all" | PortalPostStatus;

type DashboardPortalPost = {
  id: string;
  title: string;
  slug: string;
  category: "artikel" | "pengumuman" | "agenda";
  status: PortalPostStatus;
  published_at: string | null;
  updated_at: string;
};

type UnifiedDashboardPortalPost = {
  id: string;
  title: string;
  categoryLabel: string;
  status: UnifiedPortalPostStatus;
  published_at: string | null;
  updated_at: string | null;
  dateLabel: string;
  source: "supabase" | "local";
  href: string;
};

type PalugadaStatus = "draft" | "submitted" | "review" | "approved" | "hidden" | "rejected";
type DashboardPalugadaStatus = PalugadaStatus | "local";
type PalugadaDashboardFilter = "all" | "submitted" | "review" | "approved" | "hidden" | "rejected" | "local";
type DashboardPalugadaCategory = "barang" | "kuliner" | "jasa" | "properti" | "lainnya";

type DashboardPalugadaListing = {
  id: string;
  name: string;
  category: DashboardPalugadaCategory;
  cluster: string;
  status: PalugadaStatus;
  created_at: string;
};

type UnifiedDashboardPalugadaListing = Omit<DashboardPalugadaListing, "status" | "created_at"> & {
  status: DashboardPalugadaStatus;
  created_at: string | null;
  source: "supabase" | "local";
  href: string;
};

const adminRoles: AdminRole[] = ["super_admin", "ketua_rt", "sekretaris", "bendahara", "palugada_reviewer"];

const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  ketua_rt: "Ketua RT",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  palugada_reviewer: "Reviewer PALUGADA",
};

const roleDescriptions: Record<AdminRole, string> = {
  super_admin: "Akses penuh untuk aktivasi admin, role, konfigurasi, dan audit.",
  ketua_rt: "Akses pengawasan lintas modul untuk operasional RT.",
  sekretaris: "Akses data warga, layanan, konten, dan administrasi portal.",
  bendahara: "Akses keuangan dan konfirmasi iuran.",
  palugada_reviewer: "Akses khusus untuk review dan moderasi submission PALUGADA.",
};

const palugadaStatusLabels: Record<DashboardPalugadaStatus, string> = {
  draft: "Draft",
  submitted: "Baru masuk",
  review: "Review",
  approved: "Disetujui",
  hidden: "Disembunyikan",
  rejected: "Ditolak",
  local: "Belum masuk Supabase",
};

const palugadaStatusTones: Record<DashboardPalugadaStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  submitted: "border-accent/35 bg-accent-soft text-foreground",
  review: "border-blue-200 bg-blue-50 text-blue-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  hidden: "border-zinc-200 bg-zinc-100 text-zinc-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  local: "border-amber-200 bg-amber-50 text-amber-800",
};

const palugadaCategoryLabels: Record<DashboardPalugadaCategory, string> = {
  barang: "Barang",
  kuliner: "Kuliner",
  jasa: "Jasa",
  properti: "Properti",
  lainnya: "Lainnya",
};

const palugadaDashboardFilters: Array<{ value: PalugadaDashboardFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "submitted", label: "Baru" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Disetujui" },
  { value: "hidden", label: "Disembunyikan" },
  { value: "rejected", label: "Ditolak" },
  { value: "local", label: "Belum di Supabase" },
];

const portalPostStatusLabels: Record<UnifiedPortalPostStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Terbit",
  archived: "Arsip",
  local_archive: "Arsip lokal",
};

const portalPostStatusTones: Record<UnifiedPortalPostStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  review: "border-accent/35 bg-accent-soft text-foreground",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-700",
  local_archive: "border-amber-200 bg-amber-50 text-amber-800",
};

const portalPostCategoryLabels: Record<DashboardPortalPost["category"], string> = {
  artikel: "Artikel",
  pengumuman: "Pengumuman",
  agenda: "Agenda",
};

const portalPostDashboardFilters: Array<{ value: PortalPostDashboardFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "published", label: "Terbit" },
  { value: "archived", label: "Arsip" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
];

const marketplaceCategoryMap: Record<string, DashboardPalugadaCategory> = {
  barang: "barang",
  kuliner: "kuliner",
  jasa: "jasa",
  properti: "properti",
};

function normalizePalugadaName(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const localPalugadaListings: UnifiedDashboardPalugadaListing[] = marketplaceItems.map((item) => ({
  id: `local:${item.detailSlug ?? normalizePalugadaName(item.name).replace(/[^a-z0-9]+/g, "-")}`,
  name: item.name,
  category: marketplaceCategoryMap[item.category.toLocaleLowerCase("id-ID")] ?? "lainnya",
  cluster: item.cluster,
  status: "local",
  created_at: null,
  source: "local",
  href: item.detailHref ?? "/palugada/#hasil-palugada",
}));

const localKabarArchivePosts: UnifiedDashboardPortalPost[] = kabarArticles.map((item) => ({
  id: `local:${item.slug ?? item.title.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`,
  title: item.title,
  categoryLabel: item.category,
  status: "local_archive",
  published_at: null,
  updated_at: null,
  dateLabel: item.publishedAt,
  source: "local",
  href: item.slug ? `/kabar-warga/${item.slug}/` : "/kabar-warga/",
}));

function getPrimaryRole(rows: UserRoleRow[]): AdminRole | null {
  const roles = rows.map((row) => row.role);
  return adminRoles.find((role) => roles.includes(role)) ?? null;
}

function formatRole(role: AdminRole) {
  return roleLabels[role];
}

export function AdminShellClient() {
  const supabaseState = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: "" };
    } catch (error) {
      console.error(error);
      return { client: null, error: "Konfigurasi Supabase belum siap." };
    }
  }, []);
  const supabase = supabaseState.client;
  const [state, setState] = useState<LoadState>(supabaseState.error ? "error" : "checking");
  const [message, setMessage] = useState(
    supabaseState.error || "Memeriksa sesi Supabase...",
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [primaryRole, setPrimaryRole] = useState<AdminRole | null>(null);
  const [palugadaListings, setPalugadaListings] = useState<DashboardPalugadaListing[]>([]);
  const [palugadaTotal, setPalugadaTotal] = useState(0);
  const [canReadPalugada, setCanReadPalugada] = useState(false);
  const [palugadaMessage, setPalugadaMessage] = useState("Menunggu akses admin...");
  const [palugadaFilter, setPalugadaFilter] = useState<PalugadaDashboardFilter>("all");
  const [portalPosts, setPortalPosts] = useState<DashboardPortalPost[]>([]);
  const [portalPostsMessage, setPortalPostsMessage] = useState("Menunggu akses admin...");
  const [portalPostFilter, setPortalPostFilter] = useState<PortalPostDashboardFilter>("all");

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    let mounted = true;

    async function loadSessionAndRole() {
      setState("checking");
      setMessage("Memeriksa sesi Supabase...");

      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (!mounted) {
        return;
      }

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
        setPrimaryRole(null);
        setPalugadaListings([]);
        setPalugadaTotal(0);
        setCanReadPalugada(false);
        setPalugadaMessage("Login diperlukan untuk membaca daftar PALUGADA.");
        setPortalPosts([]);
        setPortalPostsMessage("Login diperlukan untuk membaca arsip kabar.");
        setState("not_logged_in");
        setMessage("Belum ada session login aktif.");
        return;
      }

      setState("loading_profile");
      setMessage("Memuat profile dan role dari Supabase...");

      const [{ data: profileData, error: profileError }, { data: roleData, error: roleError }] =
        await Promise.all([
          client
            .from("profiles")
            .select("id, display_name, email, status")
            .eq("id", activeUser.id)
            .maybeSingle<Profile>(),
          client
            .from("user_roles")
            .select("role, assigned_at")
            .eq("user_id", activeUser.id)
            .order("assigned_at", { ascending: true }),
        ]);

      if (!mounted) {
        return;
      }

      if (profileError) {
        setState("error");
        setMessage(`Gagal memuat profile: ${profileError.message}`);
        return;
      }

      if (roleError) {
        setState("error");
        setMessage(`Gagal memuat role: ${roleError.message}`);
        return;
      }

      const loadedRoles = (roleData ?? []) as UserRoleRow[];
      const adminRole = getPrimaryRole(loadedRoles);

      setProfile(profileData ?? null);
      setRoles(loadedRoles);
      setPrimaryRole(adminRole);

      if (!adminRole) {
        setPalugadaListings([]);
        setPalugadaTotal(0);
        setCanReadPalugada(false);
        setPalugadaMessage("Role aktif tidak memiliki akses admin production.");
        setPortalPosts([]);
        setPortalPostsMessage("Role aktif tidak memiliki akses admin production.");
        setState("no_admin_role");
        setMessage("Akun aktif, tetapi belum punya role admin production.");
        return;
      }

      const roleNames = loadedRoles.map((row) => row.role);
      const { data: permissionData, error: permissionError } = roleNames.length
        ? await client.from("role_permissions").select("permission").in("role", roleNames)
        : { data: [], error: null };

      if (!mounted) return;

      if (permissionError) {
        setPalugadaListings([]);
        setPalugadaTotal(0);
        setCanReadPalugada(false);
        setPalugadaMessage(`Permission PALUGADA gagal dimuat: ${permissionError.message}`);
        setPortalPosts([]);
        setPortalPostsMessage(`Permission kabar gagal dimuat: ${permissionError.message}`);
      } else {
        const loadedPermissions = (permissionData ?? []) as PermissionRow[];
        const hasPalugadaRead = loadedPermissions.some((row) => row.permission === "palugada:read");
        const hasContentRead = loadedPermissions.some((row) => row.permission === "content:read");
        setCanReadPalugada(hasPalugadaRead);

        if (hasPalugadaRead) {
          setPalugadaMessage("Memuat listing PALUGADA terbaru...");
          const { data: listingData, error: listingError, count } = await client
            .from("palugada_listings")
            .select("id, name, category, cluster, status, created_at", { count: "exact" })
            .order("created_at", { ascending: false });

          if (!mounted) return;

          if (listingError) {
            setPalugadaListings([]);
            setPalugadaTotal(0);
            setPalugadaMessage(`Daftar PALUGADA gagal dimuat: ${listingError.message}`);
          } else {
            const latestListings = (listingData ?? []) as DashboardPalugadaListing[];
            setPalugadaListings(latestListings);
            setPalugadaTotal(count ?? latestListings.length);
            setPalugadaMessage(
              latestListings.length > 0
                ? `${count ?? latestListings.length} listing tersedia di seluruh lifecycle PALUGADA.`
                : "Belum ada listing PALUGADA.",
            );
          }
        } else {
          setPalugadaListings([]);
          setPalugadaTotal(0);
          setPalugadaMessage("Permission palugada:read diperlukan untuk melihat daftar ini.");
        }

        if (hasContentRead) {
          setPortalPostsMessage("Memuat arsip kabar portal...");
          const { data: postData, error: postError, count } = await client
            .from("portal_posts")
            .select("id, title, slug, category, status, published_at, updated_at", { count: "exact" })
            .order("updated_at", { ascending: false });

          if (!mounted) return;

          if (postError) {
            setPortalPosts([]);
            setPortalPostsMessage(`Arsip kabar gagal dimuat: ${postError.message}`);
          } else {
            const latestPosts = (postData ?? []) as DashboardPortalPost[];
            setPortalPosts(latestPosts);
            setPortalPostsMessage(
              latestPosts.length > 0
                ? `${count ?? latestPosts.length} kabar tersedia di arsip portal.`
                : "Belum ada kabar di portal_posts.",
            );
          }
        } else {
          setPortalPosts([]);
          setPortalPostsMessage("Permission content:read diperlukan untuk melihat arsip kabar.");
        }
      }

      setState("authorized");
      setMessage(`Logged in as ${adminRole}`);
    }

    loadSessionAndRole();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        loadSessionAndRole();
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    setMessage("Logout diproses...");
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRoles([]);
    setPrimaryRole(null);
    setPalugadaListings([]);
    setPalugadaTotal(0);
    setCanReadPalugada(false);
    setPalugadaMessage("Login diperlukan untuk membaca daftar PALUGADA.");
    setPalugadaFilter("all");
    setPortalPosts([]);
    setPortalPostsMessage("Login diperlukan untuk membaca arsip kabar.");
    setPortalPostFilter("all");
    setState("not_logged_in");
    setMessage("Belum ada session login aktif.");
  }

  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const roleNames = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "Belum ada role";
  const roleLabel = primaryRole ? formatRole(primaryRole) : roleNames;
  const isSuperAdmin = primaryRole === "super_admin";
  const isLoading = state === "checking" || state === "loading_profile";
  const allPalugadaListings = useMemo<UnifiedDashboardPalugadaListing[]>(() => {
    const supabaseNames = new Set(
      palugadaListings.map((listing) => normalizePalugadaName(listing.name)),
    );
    const supabaseListings = palugadaListings.map((listing) => ({
      ...listing,
      source: "supabase" as const,
      href: `/admin/palugada/?listing=${encodeURIComponent(listing.id)}`,
    }));
    const localOnlyListings = localPalugadaListings.filter(
      (listing) => !supabaseNames.has(normalizePalugadaName(listing.name)),
    );

    return [...supabaseListings, ...localOnlyListings];
  }, [palugadaListings]);
  const allPortalPosts = useMemo<UnifiedDashboardPortalPost[]>(() => {
    const supabaseTitles = new Set(
      portalPosts.map((post) => post.title.toLocaleLowerCase("id-ID").trim()),
    );
    const supabasePosts = portalPosts.map<UnifiedDashboardPortalPost>((post) => ({
      id: post.id,
      title: post.title,
      categoryLabel: portalPostCategoryLabels[post.category],
      status: post.status,
      published_at: post.published_at,
      updated_at: post.updated_at,
      dateLabel: post.published_at
        ? `Terbit ${formatDashboardDate(post.published_at)}`
        : `Update ${formatDashboardDate(post.updated_at)}`,
      source: "supabase",
      href: `/admin/portal-posts/`,
    }));
    const localOnlyPosts = localKabarArchivePosts.filter(
      (post) => !supabaseTitles.has(post.title.toLocaleLowerCase("id-ID").trim()),
    );

    return [...supabasePosts, ...localOnlyPosts];
  }, [portalPosts]);
  const localOnlyCount = allPalugadaListings.filter((listing) => listing.source === "local").length;
  const localArchivePostCount = allPortalPosts.filter((post) => post.source === "local").length;
  const publishedPostCount = allPortalPosts.filter((post) => post.status === "published").length;
  const archivedPostCount = allPortalPosts.filter(
    (post) => post.status === "archived" || post.status === "local_archive",
  ).length;
  const filteredPortalPosts = portalPostFilter === "all"
    ? allPortalPosts
    : allPortalPosts.filter((post) =>
        portalPostFilter === "archived"
          ? post.status === "archived" || post.status === "local_archive"
          : post.status === portalPostFilter,
      );
  const activePortalPostFilterLabel = portalPostDashboardFilters.find(
    (item) => item.value === portalPostFilter,
  )?.label ?? "Semua";
  const filteredPalugadaListings = palugadaFilter === "all"
    ? allPalugadaListings
    : allPalugadaListings.filter((listing) => listing.status === palugadaFilter);
  const activePalugadaFilterLabel = palugadaDashboardFilters.find(
    (item) => item.value === palugadaFilter,
  )?.label ?? "Semua";

  function getPalugadaFilterCount(filter: PalugadaDashboardFilter) {
    if (filter === "all") return allPalugadaListings.length;
    return allPalugadaListings.filter((listing) => listing.status === filter).length;
  }

  function getPortalPostFilterCount(filter: PortalPostDashboardFilter) {
    if (filter === "all") return allPortalPosts.length;
    return allPortalPosts.filter((post) =>
      filter === "archived"
        ? post.status === "archived" || post.status === "local_archive"
        : post.status === filter,
    ).length;
  }

  return (
    <ProductionAdminShell
      active="dashboard"
      title="Dashboard"
      subtitle="Ringkasan hari ini"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleLabel}
      isSuperAdmin={isSuperAdmin}
      action={
        user ? (
          <ProductionActionButton onClick={handleLogout} primary>
            Logout
          </ProductionActionButton>
        ) : (
          <ProductionActionButton href="/admin/login/" primary>
            Masuk
          </ProductionActionButton>
        )
      }
    >
      <ProductionPageIntro
        eyebrow="Cipta Greenville - RT 010 / RW 021"
        title={
          <>
            Pusat Pengelolaan <br />
            <span className="italic">Portal Warga CGV10</span>
          </>
        }
        text="Lihat permintaan warga, pendaftaran PALUGADA, kabar, dan akses pengelola dari satu halaman."
        side={<ProductionStatusPill>{state === "authorized" ? "Akses aktif" : "Memeriksa akses"}</ProductionStatusPill>}
      />

      <section aria-label="Ringkasan admin" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <ProductionMetricCard label="Akun" value={user ? "Aktif" : "Perlu masuk"} helper={visibleEmail} icon="users" />
        <ProductionMetricCard label="Peran" value={primaryRole ? formatRole(primaryRole) : "-"} helper={roleDescriptions[primaryRole ?? "sekretaris"] ?? "Peran pengelola."} icon="shield" tone="gold" />
        <ProductionMetricCard label="Permintaan" value="Aktif" helper="Layanan dan pesan warga" icon="message" tone="green" />
        <ProductionMetricCard
          label="Kabar"
          value={String(allPortalPosts.length)}
          helper={`${publishedPostCount} terbit - ${archivedPostCount} arsip`}
          icon="file"
          tone="gold"
        />
        <ProductionMetricCard
          label="PALUGADA"
          value={canReadPalugada ? String(allPalugadaListings.length) : "Tanpa akses"}
          helper={canReadPalugada ? `${palugadaTotal} Supabase · ${localOnlyCount} katalog lokal` : "Hak akses diperlukan"}
          icon="store"
          tone="blue"
        />
        <ProductionMetricCard label="Tampilan uji" value="Tersedia" helper="Untuk pengecekan desain" icon="building" tone="dark" />
      </section>

      <ProductionPanel className="mb-5">
        <ProductionPanelHeader
          title="Arsip Kabar Portal"
          subtitle={`${portalPostsMessage} ${localArchivePostCount} arsip lokal dari folder project. Filter: ${activePortalPostFilterLabel}.`}
          action={<ProductionActionButton href="/admin/portal-posts/">Kelola kabar</ProductionActionButton>}
        />
        {state === "authorized" ? (
          <div className="flex gap-2 overflow-x-auto border-y border-border bg-[#f8f6f0] px-5 py-3 [scrollbar-width:thin]" aria-label="Filter status Kabar Portal">
            {portalPostDashboardFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setPortalPostFilter(filter.value)}
                aria-pressed={portalPostFilter === filter.value}
                className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  portalPostFilter === filter.value
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary"
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${portalPostFilter === filter.value ? "bg-white/12 text-white" : "bg-primary-soft text-primary"}`}>
                  {getPortalPostFilterCount(filter.value)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {state === "authorized" && filteredPortalPosts.length > 0 ? (
          <div className="grid gap-3 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
            {filteredPortalPosts.map((post) => (
              <a
                key={post.id}
                href={post.href}
                className="group cursor-pointer rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/30 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
                    {post.categoryLabel}
                  </p>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${portalPostStatusTones[post.status]}`}>
                    {portalPostStatusLabels[post.status]}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-foreground group-hover:text-primary">
                  {post.title}
                </h3>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs font-semibold">
                  <span className="text-muted">
                    {post.dateLabel}
                  </span>
                  <span className="text-primary">
                    {post.source === "local" ? "Lihat portal" : "Buka"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="px-5 pb-5">
            <p className="rounded-[14px] border border-dashed border-black/10 bg-white p-5 text-center text-sm font-semibold leading-6 text-muted">
              {state === "authorized"
                ? `Belum ada kabar dengan status ${activePortalPostFilterLabel}.`
                : portalPostsMessage}
            </p>
          </div>
        )}
      </ProductionPanel>

      <ProductionPanel className="mb-5">
        <ProductionPanelHeader
          title="Daftar PALUGADA"
          subtitle={canReadPalugada ? `${allPalugadaListings.length} lapak: ${palugadaTotal} dari Supabase dan ${localOnlyCount} masih di katalog lokal. Filter: ${activePalugadaFilterLabel}.` : palugadaMessage}
          action={canReadPalugada ? <ProductionActionButton href="/admin/palugada/">Kelola semua</ProductionActionButton> : undefined}
        />
        {canReadPalugada ? (
          <div className="flex gap-2 overflow-x-auto border-y border-border bg-[#f8f6f0] px-5 py-3 [scrollbar-width:thin]" aria-label="Filter status PALUGADA">
            {palugadaDashboardFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setPalugadaFilter(filter.value)}
                aria-pressed={palugadaFilter === filter.value}
                className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  palugadaFilter === filter.value
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-white text-muted hover:border-primary/30 hover:text-primary"
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${palugadaFilter === filter.value ? "bg-white/12 text-white" : "bg-primary-soft text-primary"}`}>
                  {getPalugadaFilterCount(filter.value)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {canReadPalugada && filteredPalugadaListings.length > 0 ? (
          <div className="grid gap-3 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPalugadaListings.map((listing) => (
              <a
                key={listing.id}
                href={listing.href}
                className="group cursor-pointer rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/30 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
                    {palugadaCategoryLabels[listing.category]} · {listing.cluster}
                  </p>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${palugadaStatusTones[listing.status]}`}>
                    {palugadaStatusLabels[listing.status]}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-primary">
                  {listing.name}
                </h3>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs font-semibold">
                  <span className="text-muted">
                    {listing.source === "supabase" && listing.created_at
                      ? `Masuk ${formatDashboardDate(listing.created_at)}`
                      : "Sumber: katalog portal"}
                  </span>
                  <span className="text-primary">
                    {listing.source === "supabase" ? "Buka detail" : "Lihat di portal"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="rounded-[14px] border border-dashed border-black/10 bg-white p-5 text-center text-sm font-semibold leading-6 text-muted">
              {canReadPalugada
                ? `Belum ada lapak dengan status ${activePalugadaFilterLabel}.`
                : palugadaMessage}
            </p>
          </div>
        )}
      </ProductionPanel>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <ProductionPanel>
          <ProductionPanelHeader
            title="Fitur yang aktif"
            subtitle="Kelola data yang sudah terhubung ke portal warga."
          />
          <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
            <a
              href="/admin/intake/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <ProductionStatusPill>Data aktif</ProductionStatusPill>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Permintaan Warga</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Lihat permintaan dari formulir layanan dan halaman kontak.
              </p>
              <div className="mt-4 grid gap-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Status</span>
                  <span className="font-bold text-primary">Terhubung</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Hak akses</span>
                  <span className="font-bold text-primary">services:read</span>
                </div>
                <span className="pt-2 font-bold text-primary group-hover:text-primary-hover">
                  Buka Permintaan
                </span>
              </div>
            </a>

            <a
              href="/admin/palugada/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <ProductionStatusPill>Perlu diperiksa</ProductionStatusPill>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">PALUGADA</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Periksa, setujui, tolak, atau sembunyikan pendaftaran lapak.
              </p>
              <div className="mt-4 grid gap-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Status</span>
                  <span className="font-bold text-primary">Terhubung</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Hak akses</span>
                  <span className="font-bold text-primary">palugada:read/write</span>
                </div>
                <span className="pt-2 font-bold text-primary group-hover:text-primary-hover">
                  Buka PALUGADA
                </span>
              </div>
            </a>

            <a
              href="/admin/portal-posts/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <ProductionStatusPill>Editor aktif</ProductionStatusPill>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Kabar Portal</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Tulis, periksa, tayangkan, atau arsipkan kabar warga.
              </p>
              <div className="mt-4 grid gap-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Status</span>
                  <span className="font-bold text-primary">Super Admin editor</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-muted">Hak akses</span>
                  <span className="font-bold text-primary">content:write</span>
                </div>
                <span className="pt-2 font-bold text-primary group-hover:text-primary-hover">
                  Buka Kabar Portal
                </span>
              </div>
            </a>

            <a
              href="/admin-preview/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-accent-soft text-foreground [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPreviewIcon />
                </span>
                <ProductionStatusPill>Tampilan uji</ProductionStatusPill>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Tampilan Uji Admin</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Gunakan untuk mengecek rancangan halaman dan alur kerja.
              </p>
              <div className="mt-4 border-t border-border pt-3">
                <span className="text-sm font-bold text-primary group-hover:text-primary-hover">
                  Buka tampilan uji
                </span>
              </div>
            </a>
          </div>
        </ProductionPanel>

        <ProductionPanel>
          <ProductionPanelHeader
            title="Akses akun"
            subtitle="Status akun dan peran pengelola saat ini."
          />
          <div className="space-y-3 px-5 pb-5">
            <InfoRow label="Status" value={isLoading ? "Memuat akses..." : message} />
            <InfoRow label="Email" value={visibleEmail} />
            <InfoRow label="Peran" value={roleNames} />
            <InfoRow label="Menu pemeriksaan" value={isSuperAdmin ? "Tersedia" : "Disembunyikan"} />
          </div>
        </ProductionPanel>
      </section>

      {state === "not_logged_in" ? (
        <ProtectedMessage
          title="Login diperlukan"
          text="Belum ada session Supabase aktif. Login admin diperlukan sebelum dashboard production dapat membaca data RLS."
          actionHref="/admin/login/"
          actionText="Masuk admin"
        />
      ) : null}

      {state === "no_admin_role" ? (
        <ProtectedMessage
          title="Access denied"
          text="Akun Supabase aktif, tetapi tidak memiliki role super_admin, ketua_rt, sekretaris, atau bendahara di user_roles."
        />
      ) : null}

      {state === "error" ? (
        <ProtectedMessage
          title="Admin shell error"
          text={message}
          actionHref="/admin/login/"
          actionText="Kembali ke login"
        />
      ) : null}
    </ProductionAdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
    <ProductionPanel className="mt-5">
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{text}</p>
        {actionHref && actionText ? (
          <ProductionActionButton href={actionHref} primary>
            {actionText}
          </ProductionActionButton>
        ) : null}
      </div>
    </ProductionPanel>
  );
}

function ProductionPortalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d="M12 3.5 19 6v5.2c0 4.1-2.8 7.9-7 9.3-4.2-1.4-7-5.2-7-9.3V6l7-2.5Z" />
      <path d="M8.5 10.5h7M8.5 14h5" />
    </svg>
  );
}

function ProductionPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d="M4.5 5.5h15v11h-15z" />
      <path d="M8 20h8M10 16.5 9.5 20M14 16.5l.5 3.5M8 9h8M8 12.5h5" />
    </svg>
  );
}
