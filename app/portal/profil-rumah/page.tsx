import type { Metadata } from "next";
import { ProfilRumahClient } from "./profil-rumah-client";

export const metadata: Metadata = {
  title: "Profil Warga & Rumah | CGV10",
  description:
    "Profil resmi rumah dan warga RT 010 / RW 021 Cipta Greenville.",
};

export default function ProfilRumahPage() {
  return <ProfilRumahClient />;
}
