import type { Metadata } from "next";
import { AdminAuthGate } from "./admin-auth-gate";

export const metadata: Metadata = {
  title: "Admin CGV10",
  description: "Production admin shell CGV10 dengan autentikasi Supabase.",
  manifest: "/admin-manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
