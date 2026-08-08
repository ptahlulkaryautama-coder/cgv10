"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type HeroImage = {
  src: string;
  alt: string;
};

type HeroSettings = {
  enabled: boolean;
  interval_ms: number;
  slides: HeroImage[];
};

function isHeroSettings(value: unknown): value is HeroSettings {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HeroSettings>;
  return (
    typeof candidate.enabled === "boolean" &&
    typeof candidate.interval_ms === "number" &&
    Array.isArray(candidate.slides) &&
    candidate.slides.every(
      (slide) =>
        slide &&
        typeof slide === "object" &&
        typeof slide.src === "string" &&
        typeof slide.alt === "string",
    )
  );
}

type HeroImageRotatorProps = {
  slides: HeroImage[];
  sizes: string;
  intervalMs?: number;
  className?: string;
};

export function HeroImageRotator({
  slides,
  sizes,
  intervalMs = 6500,
  className = "",
}: HeroImageRotatorProps) {
  const [remoteSettings, setRemoteSettings] = useState<HeroSettings | null>(null);
  const configuredSlides =
    remoteSettings?.enabled && remoteSettings.slides.length > 0
      ? remoteSettings.slides
      : slides;
  const activeInterval = remoteSettings?.enabled
    ? remoteSettings.interval_ms
    : intervalMs;
  const safeSlides = useMemo(
    () => configuredSlides.filter((slide) => slide.src.trim() && slide.alt.trim()),
    [configuredSlides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const safeActiveIndex = safeSlides.length > 0 ? activeIndex % safeSlides.length : 0;

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.rpc("get_home_hero_settings");
        if (!mounted || error || !isHeroSettings(data)) return;
        setRemoteSettings(data);
      } catch {
        // The local slides remain available when the data service is offline.
      }
    }

    void loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (safeSlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setPreviousIndex(safeActiveIndex);
      setActiveIndex((currentIndex) => (currentIndex + 1) % safeSlides.length);
      window.setTimeout(() => setPreviousIndex(null), 700);
    }, activeInterval);

    return () => window.clearInterval(interval);
  }, [activeInterval, safeActiveIndex, safeSlides.length]);

  if (safeSlides.length === 0) {
    return null;
  }

  const activeSlide = safeSlides[safeActiveIndex];
  const previousSlide =
    previousIndex === null ? null : safeSlides[previousIndex] ?? null;

  return (
    <>
      {previousSlide ? (
        <Image
          key={`previous-${previousSlide.src}`}
          src={previousSlide.src}
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          className={`${className} opacity-100`}
        />
      ) : null}
      <Image
        key={`active-${activeSlide.src}`}
        src={activeSlide.src}
        alt={activeSlide.alt}
        fill
        priority={safeActiveIndex === 0}
        sizes={sizes}
        className={`${className} hero-fade-in`}
      />
    </>
  );
}
