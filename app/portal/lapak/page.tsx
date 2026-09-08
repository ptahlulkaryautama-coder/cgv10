import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalLapakClient } from "./portal-lapak-client";

export const metadata: Metadata = {
  title: "Lapak Saya · Portal Warga CGV",
  description:
    "Kelola lapak PALUGADA Anda — ubah status buka/tutup, edit deskripsi, harga, foto cover, atau hapus lapak Anda sendiri.",
  robots: { index: false },
};

export default function PortalLapakPage() {
  return (
    <Suspense>
      <PortalLapakClient />
    </Suspense>
  );
}
