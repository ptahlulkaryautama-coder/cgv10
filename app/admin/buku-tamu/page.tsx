import type { Metadata } from "next";
import { AdminAuthGate } from "../admin-auth-gate";
import { VisitorLogAdminClient } from "./visitor-log-admin-client";

export const metadata: Metadata = {
  title: "Buku Tamu Security | Admin CGV10",
  description: "Riwayat dan monitoring kunjungan pos security RT 010 / RW 021 Cipta Greenville.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VisitorLogAdminPage() {
  return (
    <AdminAuthGate>
      <VisitorLogAdminClient />
    </AdminAuthGate>
  );
}
