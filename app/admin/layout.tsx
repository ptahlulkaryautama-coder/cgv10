import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CGV10",
  description: "Production admin shell CGV10 dengan autentikasi Supabase.",
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
  return children;
}
