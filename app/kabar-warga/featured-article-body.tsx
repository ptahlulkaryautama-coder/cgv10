"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePreview } from "../components/image-preview";
import { kabarArticles } from "@/lib/portal-data";

const featuredArticle = kabarArticles[0];

export function FeaturedArticleBody() {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!featuredArticle.bodySections) {
    return (
      <p className="text-base leading-8 text-foreground/78">
        {featuredArticle.body}
      </p>
    );
  }

  const shouldCollapse = featuredArticle.bodySections.length > 2;
  const visibleSections =
    shouldCollapse && !isExpanded
      ? featuredArticle.bodySections.slice(0, 2)
      : featuredArticle.bodySections;

  return (
    <>
      <div className="space-y-6 text-base leading-8 text-foreground/80">
        {visibleSections.map((section, sectionIndex) => (
          <div
            key={`${featuredArticle.title}-${sectionIndex}`}
            className="space-y-5"
          >
            {section.heading ? (
              <h2 className="pt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {section.heading}
              </h2>
            ) : null}

            {section.paragraphs?.map((paragraph, paragraphIndex) => (
              <p
                key={paragraph}
                className={
                  paragraphIndex === 0 && sectionIndex === 0
                    ? "font-semibold text-foreground"
                    : undefined
                }
              >
                {paragraph}
              </p>
            ))}

            {section.image ? (
              <figure className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                <ImagePreview
                  src={section.image.src}
                  alt={section.image.alt}
                  title={section.image.caption}
                  caption="Dokumentasi artikel"
                  className="aspect-[4/3] bg-cream sm:aspect-[3/2]"
                >
                  <Image
                    src={section.image.src}
                    alt={section.image.alt}
                    fill
                    sizes="(min-width: 1024px) 640px, 92vw"
                    className="object-cover"
                  />
                </ImagePreview>
                <figcaption className="border-t border-border px-4 py-3 text-sm leading-6 text-muted sm:px-5">
                  {section.image.caption}
                </figcaption>
              </figure>
            ) : null}

            {section.list ? (
              <ul className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.signature ? (
              <div className="rounded-2xl border-l-4 border-primary bg-primary-soft px-5 py-4 text-primary">
                {section.signature.map((line, index) => (
                  <p key={line} className={index === 1 ? "font-semibold" : undefined}>
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {shouldCollapse ? (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        ) : null}

        {featuredArticle.tags && isExpanded ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-5">
            {featuredArticle.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
