import type { Metadata } from "next";
import { SecurityAuthGate } from "./security-auth-gate";
import { SecurityDashboardClient } from "./security-dashboard-client";

export const metadata: Metadata = {
  title: "Buku Tamu Security | Portal Warga CGV10",
  description: "Pencatatan kedatangan pengunjung dan buku tamu pos keamanan RT 010 / RW 021 Cipta Greenville.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SecurityDashboardPage() {
  return (
    <SecurityAuthGate>
      <SecurityDashboardClient />
    </SecurityAuthGate>
  );
}
