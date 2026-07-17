import { Suspense } from "react";
import { PageShell } from "@/app/components/portal";
import { LivePalugadaDetailRoute } from "./live-palugada-detail-route";

export default function PalugadaLiveDetailPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <section className="mx-auto max-w-3xl px-4 py-20 text-center text-sm font-semibold text-muted">
            Memuat detail lapak PALUGADA...
          </section>
        </PageShell>
      }
    >
      <LivePalugadaDetailRoute />
    </Suspense>
  );
}
