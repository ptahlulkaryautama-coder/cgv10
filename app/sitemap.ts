import type { MetadataRoute } from "next";

const baseUrl = "https://portalwargacgv.id";

export const dynamic = "force-static";

const routes = [
  "",
  "/kabar-warga",
  "/kegiatan",
  "/keuangan",
  "/kontak",
  "/layanan",
  "/palugada",
  "/palugada/daftar",
  "/pengumuman",
  "/pengurus",
  "/privasi",
  "/portal",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-07-16"),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
