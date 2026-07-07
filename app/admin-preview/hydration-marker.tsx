"use client";

import { useEffect } from "react";

export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.cgv10Hydrated = "true";

    return () => {
      delete document.documentElement.dataset.cgv10Hydrated;
    };
  }, []);

  return null;
}
