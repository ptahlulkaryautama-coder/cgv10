"use client";

import { FormEvent, useEffect, useState } from "react";
import { palugadaCategories } from "@/lib/portal-data";

const categories = ["Semua", ...palugadaCategories.map((item) => item.title)];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function applyPalugadaFilter(query: string, category: string, scrollToResults = true) {
  window.dispatchEvent(
    new CustomEvent("palugada-filter", {
      detail: {
        query,
        category,
      },
    }),
  );

  if (scrollToResults) {
    document.getElementById("hasil-palugada")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

export function PalugadaHeroControls() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");

  useEffect(() => {
    function resetControls() {
      setQuery("");
      setSelectedCategory("semua");
    }

    window.addEventListener("palugada-reset", resetControls);
    return () => window.removeEventListener("palugada-reset", resetControls);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyPalugadaFilter(query, selectedCategory);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl border border-white/16 bg-white/10 p-2 shadow-[0_16px_45px_rgba(7,35,23,0.18)] backdrop-blur sm:mt-6 sm:gap-3 sm:rounded-2xl sm:p-3"
      >
        <label htmlFor="palugada-hero-search" className="sr-only">
          Cari katalog PALUGADA
        </label>
        <input
          id="palugada-hero-search"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            applyPalugadaFilter(nextQuery, selectedCategory, false);
          }}
          placeholder="Cari donat, laundry, servis AC..."
          className="min-h-11 min-w-0 rounded-lg border border-white/18 bg-white px-3 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/45 sm:min-h-12 sm:rounded-xl sm:px-4"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-12 sm:rounded-xl sm:px-5"
        >
          Cari
        </button>
      </form>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-5 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
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
              className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
