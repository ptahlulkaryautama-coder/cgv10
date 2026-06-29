"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroImage = {
  src: string;
  alt: string;
};

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
  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);

  useEffect(() => {
    if (safeSlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setPreviousIndex(activeIndex);
      setActiveIndex((currentIndex) => (currentIndex + 1) % safeSlides.length);
      window.setTimeout(() => setPreviousIndex(null), 700);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [activeIndex, intervalMs, safeSlides.length]);

  if (safeSlides.length === 0) {
    return null;
  }

  const activeSlide = safeSlides[activeIndex];
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
        priority={activeIndex === 0}
        sizes={sizes}
        className={`${className} hero-fade-in`}
      />
    </>
  );
}
