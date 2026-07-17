import { AdminAuthGate } from "../admin-auth-gate";
import { WargaAdminClient } from "./warga-admin-client";

export const metadata = {
  title: "Data Warga | Admin CGV10",
};

export default function WargaAdminPage() {
  return (
    <AdminAuthGate>
      <WargaAdminClient />
    </AdminAuthGate>
  );
}
