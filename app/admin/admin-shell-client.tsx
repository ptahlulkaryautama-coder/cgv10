"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { kabarArticles } from "@/lib/portal-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AdminPwaInstallCard } from "./admin-pwa-install-card";
import {
  ProductionActionButton,
  ProductionAdminShell,
  ProductionMetricCard,
  ProductionPageIntro,
  ProductionPanel,
  ProductionPanelHeader,
  ProductionStatusPill,
} from "./production-admin-components";

type AdminRole =
  | "super_admin"
  | "ketua_rt"
  | "sekretaris"
  | "bendahara"
  | "palugada_reviewer"
  | "admin_support_1"
  | "admin_support_2"
  | "admin_support_3"
  | "admin_support_4"
  | "admin_support_5";
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

type DashboardResidentRegistrationRequest = {
  id: string;
  status: "pending_review" | "approved" | "rejected" | "cancelled";
};

type DashboardServiceRequest = {
  id: string;
  status: "submitted";
};

const serviceNotificationStorageKey = "cgv10:admin-seen-service-requests";

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

const adminRoles: AdminRole[] = [
  "super_admin",
  "ketua_rt",
  "sekretaris",
  "bendahara",
  "palugada_reviewer",
  "admin_support_1",
  "admin_support_2",
  "admin_support_3",
  "admin_support_4",
  "admin_support_5",
];

const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  ketua_rt: "Ketua RT",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  palugada_reviewer: "Reviewer PALUGADA",
  admin_support_1: "Admin Support 1",
  admin_support_2: "Admin Support 2",
  admin_support_3: "Admin Support 3",
  admin_support_4: "Admin Support 4",
  admin_support_5: "Admin Support 5",
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
  const [, setPalugadaTotal] = useState(0);
  const [canReadPalugada, setCanReadPalugada] = useState(false);
  const [palugadaMessage, setPalugadaMessage] = useState("Menunggu akses admin...");
  const [palugadaFilter, setPalugadaFilter] = useState<PalugadaDashboardFilter>("all");
  const [portalPosts, setPortalPosts] = useState<DashboardPortalPost[]>([]);
  const [portalPostsMessage, setPortalPostsMessage] = useState("Menunggu akses admin...");
  const [portalPostFilter, setPortalPostFilter] = useState<PortalPostDashboardFilter>("all");
  const [residentPendingCount, setResidentPendingCount] = useState(0);
  const [, setResidentMessage] = useState("Menunggu akses data warga...");
  const [servicePendingCount, setServicePendingCount] = useState(0);
  const [, setServiceMessage] = useState("Menunggu akses layanan...");
  const [serviceNotificationCount, setServiceNotificationCount] = useState(0);
  const [canReadBilling, setCanReadBilling] = useState(false);
  const [canWriteBilling, setCanWriteBilling] = useState(false);
  const [canVerifyBilling, setCanVerifyBilling] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    let mounted = true;
    let serviceRefreshTimer: number | null = null;

    function readSeenServiceRequestIds() {
      try {
        const stored = window.localStorage.getItem(serviceNotificationStorageKey);
        const parsed = stored ? JSON.parse(stored) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
      } catch {
        return new Set<string>();
      }
    }

    function saveSeenServiceRequestIds(ids: string[]) {
      try {
        window.localStorage.setItem(
          serviceNotificationStorageKey,
          JSON.stringify(ids.slice(-200)),
        );
      } catch {
        // Notifikasi tetap berjalan pada sesi ini apabila penyimpanan perangkat tidak tersedia.
      }
    }

    async function loadServiceNotifications(announceNew: boolean) {
      const { data, error, count } = await client
        .from("service_requests")
        .select("id, status", { count: "exact" })
        .eq("status", "submitted");

      if (!mounted) return;

      if (error) {
        setServicePendingCount(0);
        setServiceMessage(`Antrean layanan gagal dimuat: ${error.message}`);
        return;
      }

      const requests = (data ?? []) as DashboardServiceRequest[];
      const pendingCount = count ?? requests.length;
      setServicePendingCount(pendingCount);
      setServiceMessage(
        pendingCount > 0
          ? `${pendingCount} pengajuan layanan menunggu ditinjau.`
          : "Tidak ada pengajuan layanan baru.",
      );

      const seenIds = readSeenServiceRequestIds();
      const unseenCount = requests.filter((request) => !seenIds.has(request.id)).length;
      saveSeenServiceRequestIds([...seenIds, ...requests.map((request) => request.id)]);

      if (announceNew && unseenCount > 0) {
        setServiceNotificationCount(unseenCount);
      }
    }

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
        setResidentPendingCount(0);
        setResidentMessage("Login diperlukan untuk membaca pendaftaran warga.");
        setServicePendingCount(0);
        setServiceMessage("Login diperlukan untuk membaca antrean layanan.");
        setServiceNotificationCount(0);
        setCanReadBilling(false);
        setCanWriteBilling(false);
        setCanVerifyBilling(false);
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
        setResidentPendingCount(0);
        setResidentMessage("Role aktif tidak memiliki akses data warga.");
        setServicePendingCount(0);
        setServiceMessage("Role aktif tidak memiliki akses layanan.");
        setServiceNotificationCount(0);
        setCanReadBilling(false);
        setCanWriteBilling(false);
        setCanVerifyBilling(false);
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
        setCanReadBilling(false);
        setCanWriteBilling(false);
        setCanVerifyBilling(false);
      } else {
        const loadedPermissions = (permissionData ?? []) as PermissionRow[];
        const hasPalugadaRead = loadedPermissions.some((row) => row.permission === "palugada:read");
        const hasContentRead = loadedPermissions.some((row) => row.permission === "content:read");
        const hasResidentRead = loadedPermissions.some((row) => row.permission === "resident:read");
        const hasServiceRead = loadedPermissions.some((row) => row.permission === "services:read");
        const hasBillingRead = loadedPermissions.some((row) => row.permission === "billing:read" || row.permission === "finance:read");
        const hasBillingWrite = loadedPermissions.some((row) => row.permission === "billing:write");
        const hasBillingVerify = loadedPermissions.some((row) => row.permission === "billing:verify");
        setCanReadPalugada(hasPalugadaRead);
        setCanReadBilling(hasBillingRead);
        setCanWriteBilling(hasBillingWrite);
        setCanVerifyBilling(hasBillingVerify);

        if (hasServiceRead) {
          await loadServiceNotifications(true);
          if (!mounted) return;
          serviceRefreshTimer = window.setInterval(() => {
            void loadServiceNotifications(true);
          }, 30_000);
        } else {
          setServicePendingCount(0);
          setServiceMessage("Permission services:read diperlukan untuk melihat antrean layanan.");
          setServiceNotificationCount(0);
        }

        if (hasResidentRead) {
          setResidentMessage("Memuat notifikasi pendaftaran warga...");
          const { data: residentRequestData, error: residentRequestError, count } = await client
            .from("resident_registration_requests")
            .select("id, status", { count: "exact" })
            .eq("status", "pending_review");

          if (!mounted) return;

          if (residentRequestError) {
            setResidentPendingCount(0);
            setResidentMessage(`Pendaftaran warga gagal dimuat: ${residentRequestError.message}`);
          } else {
            const latestRequests = (residentRequestData ?? []) as DashboardResidentRegistrationRequest[];
            setResidentPendingCount(count ?? latestRequests.length);
            setResidentMessage(
              (count ?? latestRequests.length) > 0
                ? `${count ?? latestRequests.length} pendaftaran warga menunggu verifikasi.`
                : "Tidak ada pendaftaran warga yang menunggu.",
            );
          }
        } else {
          setResidentPendingCount(0);
          setResidentMessage("Permission resident:read diperlukan untuk notifikasi warga.");
        }

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
      if (serviceRefreshTimer !== null) window.clearInterval(serviceRefreshTimer);
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
    setResidentPendingCount(0);
    setResidentMessage("Login diperlukan untuk membaca pendaftaran warga.");
    setServicePendingCount(0);
    setServiceMessage("Login diperlukan untuk membaca antrean layanan.");
    setServiceNotificationCount(0);
    setCanReadBilling(false);
    setCanWriteBilling(false);
    setCanVerifyBilling(false);
    setPortalPostFilter("all");
    setState("not_logged_in");
    setMessage("Belum ada session login aktif.");
  }

  const visibleEmail = profile?.email ?? user?.email ?? "-";
  const roleNames = roles.length > 0 ? roles.map((row) => row.role).join(", ") : "Belum ada role";
  const roleLabel = primaryRole ? formatRole(primaryRole) : roleNames;
  const isSuperAdmin = primaryRole === "super_admin";
  const allPalugadaListings = useMemo<UnifiedDashboardPalugadaListing[]>(() => {
    return palugadaListings.map((listing) => ({
      ...listing,
      source: "supabase" as const,
      href: `/admin/palugada/?listing=${encodeURIComponent(listing.id)}`,
    }));
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

  const palugadaPendingCount = useMemo(() => {
    return allPalugadaListings.filter(
      (listing) => listing.status === "submitted" || listing.status === "review",
    ).length;
  }, [allPalugadaListings]);

  return (
    <ProductionAdminShell
      active="dashboard"
      title="Dashboard"
      subtitle="Ringkasan hari ini"
      userLabel={profile?.display_name || visibleEmail}
      roleLabel={roleLabel}
      isSuperAdmin={isSuperAdmin}
      action={
        <span className="hidden md:block">
          {user ? (
            <ProductionActionButton onClick={handleLogout} primary>
              Logout
            </ProductionActionButton>
          ) : (
            <ProductionActionButton href="/admin/login/" primary>
              Masuk
            </ProductionActionButton>
          )}
        </span>
      }
    >
      <ProductionPageIntro
        eyebrow="Cipta Greenville - RT 010 / RW 021"
        title="Operasional hari ini"
        text="Tinjau yang baru, lalu lanjutkan pekerjaan."
        side={<ProductionStatusPill>{state === "authorized" ? "Akses aktif" : "Memeriksa akses"}</ProductionStatusPill>}
      />

      {serviceNotificationCount > 0 ? (
        <section
          role="status"
          aria-live="polite"
          aria-label="Notifikasi pengajuan layanan baru"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {serviceNotificationCount} permintaan layanan baru
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/admin/intake/?status=submitted"
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] bg-primary px-3 text-xs font-bold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Lihat Permintaan
            </Link>
            <button
              type="button"
              onClick={() => setServiceNotificationCount(0)}
              aria-label="Tutup notifikasi permintaan layanan"
              className="inline-flex min-h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-amber-200 bg-white text-sm font-bold text-primary transition-colors duration-200 hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              ×
            </button>
          </div>
        </section>
      ) : null}

      {canReadPalugada && palugadaPendingCount > 0 ? (
        <section
          role="status"
          aria-label="Notifikasi pengajuan lapak PALUGADA baru"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 shadow-sm"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {palugadaPendingCount} pendaftaran lapak PALUGADA baru menunggu verifikasi
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/admin/palugada/?status=submitted"
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] bg-primary px-3 text-xs font-bold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Periksa Lapak
            </Link>
          </div>
        </section>
      ) : null}

      <AdminPwaInstallCard />

      <section aria-label="Ringkasan operasional admin" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <ProductionMetricCard
          label="Warga"
          value={String(residentPendingCount)}
          helper={residentPendingCount > 0 ? "Perlu ditinjau" : "Tidak ada baru"}
          icon="users"
          tone={residentPendingCount > 0 ? "gold" : "green"}
        />
        <ProductionMetricCard
          label="Permintaan"
          value={String(servicePendingCount)}
          helper={servicePendingCount > 0 ? "Perlu ditinjau" : "Tidak ada baru"}
          icon="message"
          tone={servicePendingCount > 0 ? "gold" : "green"}
        />
        <ProductionMetricCard label="Iuran" value={canVerifyBilling ? "Siap" : canReadBilling ? "Lihat" : "Terkunci"} helper={canVerifyBilling ? "Verifikasi pembayaran" : canReadBilling ? "Ringkasan iuran" : "Akses diperlukan"} icon="wallet" tone={canWriteBilling ? "green" : canReadBilling ? "gold" : "red"} />
        <ProductionMetricCard
          label="PALUGADA"
          value={canReadPalugada ? String(palugadaPendingCount > 0 ? palugadaPendingCount : allPalugadaListings.length) : "Terkunci"}
          helper={
            !canReadPalugada
              ? "Akses diperlukan"
              : palugadaPendingCount > 0
                ? `${palugadaPendingCount} lapak perlu review`
                : "Semua lapak aktif"
          }
          icon="store"
          tone={!canReadPalugada ? "red" : palugadaPendingCount > 0 ? "gold" : "blue"}
        />
      </section>

      <ProductionPanel className="mb-5">
        <ProductionPanelHeader
          title="Kabar"
          subtitle={state === "authorized" ? `${filteredPortalPosts.length} kabar · ${activePortalPostFilterLabel}` : portalPostsMessage}
          action={<ProductionActionButton href="/admin/portal-posts/">Kelola</ProductionActionButton>}
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
          title="PALUGADA"
          subtitle={canReadPalugada ? `${filteredPalugadaListings.length} lapak · ${activePalugadaFilterLabel}` : palugadaMessage}
          action={canReadPalugada ? <ProductionActionButton href="/admin/palugada/">Kelola</ProductionActionButton> : undefined}
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

      <ProductionPanel className="mb-5">
        <ProductionPanelHeader title="Akses cepat" subtitle="Pilih pekerjaan yang ingin dibuka." />
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
            <a
              href="/admin/intake/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <h3 className="text-base font-bold text-foreground">Permintaan</h3>
              </div>
              <p className="mt-2 text-sm text-muted">Lihat dan tindak lanjuti.</p>
              <span className="mt-3 block text-sm font-bold text-primary">Buka →</span>
            </a>

            <a
              href="/admin/palugada/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <h3 className="text-base font-bold text-foreground">PALUGADA</h3>
              </div>
              <p className="mt-2 text-sm text-muted">Periksa lapak warga.</p>
              <span className="mt-3 block text-sm font-bold text-primary">Buka →</span>
            </a>

            <a
              href="/admin/portal-posts/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <h3 className="text-base font-bold text-foreground">Kabar</h3>
              </div>
              <p className="mt-2 text-sm text-muted">Tulis dan tayangkan.</p>
              <span className="mt-3 block text-sm font-bold text-primary">Buka →</span>
            </a>

            <a
              href="/admin/iuran/"
              className="group rounded-[16px] border border-black/8 bg-white p-4 transition-colors duration-200 hover:border-primary/25 hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">
                  <ProductionPortalIcon />
                </span>
                <h3 className="text-base font-bold text-foreground">Iuran</h3>
              </div>
              <p className="mt-2 text-sm text-muted">Cek dan verifikasi.</p>
              <span className="mt-3 block text-sm font-bold text-primary">Buka →</span>
            </a>
        </div>
      </ProductionPanel>

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
