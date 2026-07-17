import { AdminAuthGate } from "../admin-auth-gate";
import { IuranAdminClient } from "./iuran-admin-client";

export const metadata = {
  title: "Iuran | Admin CGV10",
};

export default function IuranAdminPage() {
  return (
    <AdminAuthGate>
      <IuranAdminClient />
    </AdminAuthGate>
  );
}
