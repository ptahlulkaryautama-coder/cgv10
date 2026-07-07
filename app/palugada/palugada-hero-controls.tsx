"use client";

import { FormEvent, useState } from "react";
import { palugadaCategories } from "@/lib/portal-data";

const categories = ["Semua", ...palugadaCategories.map((item) => item.title)];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function applyPalugadaFilter(query: string, category: string) {
  window.dispatchEvent(
    new CustomEvent("palugada-filter", {
      detail: {
        query,
        category,
      },
    }),
  );

  document.getElementById("katalog")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function PalugadaHeroControls() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyPalugadaFilter(query, selectedCategory);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-7 grid gap-3 rounded-2xl border border-white/16 bg-white/10 p-3 shadow-[0_22px_70px_rgba(7,35,23,0.2)] backdrop-blur sm:grid-cols-[1fr_auto]"
      >
        <label htmlFor="palugada-hero-search" className="sr-only">
          Cari katalog PALUGADA
        </label>
        <input
          id="palugada-hero-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Cari donat, laundry, catering, servis AC..."
          className="min-h-12 rounded-xl border border-white/18 bg-white px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/45"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Cari katalog
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((category) => {
          const normalizedCategory = normalize(category);
          const isActive = selectedCategory === normalizedCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategory(normalizedCategory);
                applyPalugadaFilter(query, normalizedCategory);
              }}
              className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? "border-accent-soft bg-accent-soft text-foreground"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/16"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </>
  );
}
