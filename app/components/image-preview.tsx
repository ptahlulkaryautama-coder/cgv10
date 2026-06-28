"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type ImagePreviewProps = {
  src: string;
  alt: string;
  title: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
};

export function ImagePreview({
  src,
  alt,
  title,
  caption,
  children,
  className = "",
}: ImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/preview relative block w-full cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        aria-label={`Lihat besar: ${title}`}
      >
        {children}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/35 bg-primary/88 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100">
          Lihat besar
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/72 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
              <div>
                <h2 id={titleId} className="text-base font-semibold text-foreground">
                  {title}
                </h2>
                {caption ? (
                  <p className="mt-1 text-sm leading-5 text-muted">{caption}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                autoFocus
              >
                Tutup
              </button>
            </div>
            <div className="bg-background p-3 sm:p-5">
              <div className="relative mx-auto aspect-[4/3] max-h-[72vh] w-full overflow-hidden rounded-xl border border-border bg-cream">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 900px, 94vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
