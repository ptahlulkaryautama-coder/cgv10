"use client";

import { useSearchParams } from "next/navigation";
import { LivePalugadaDetail } from "../[slug]/live-palugada-detail";

export function LivePalugadaDetailRoute() {
  const searchParams = useSearchParams();
  return <LivePalugadaDetail listingId={searchParams.get("id") ?? ""} />;
}
