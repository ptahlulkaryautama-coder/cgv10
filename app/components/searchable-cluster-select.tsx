"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export const CGV_CLUSTERS = [
  "Acacia",
  "Anthurium",
  "Aurora",
  "Canyon",
  "Caribbean",
  "Chiswick",
  "Colosseum",
  "Gardenia",
  "Greenwich",
  "Mandeville",
  "Meteora",
  "Pinnata",
  "Plumeria",
  "Ruko",
  "Victoria",
] as const;

export type CGVClusterName = (typeof CGV_CLUSTERS)[number];

const CLUSTER_ALIASES: Record<string, CGVClusterName> = {
  acacia: "Acacia",
  akasia: "Acacia",
  anthurium: "Anthurium",
  anturium: "Anthurium",
  antorium: "Anthurium",
  aurora: "Aurora",
  canyon: "Canyon",
  kenyon: "Canyon",
  caribbean: "Caribbean",
  caribean: "Caribbean",
  carebian: "Caribbean",
  carribean: "Caribbean",
  karibia: "Caribbean",
  chiswick: "Chiswick",
  "chis wick": "Chiswick",
  chiswik: "Chiswick",
  ciswik: "Chiswick",
  colosseum: "Colosseum",
  coloseum: "Colosseum",
  colloseum: "Colosseum",
  colosium: "Colosseum",
  koloseum: "Colosseum",
  gardenia: "Gardenia",
  greenwich: "Greenwich",
  "green wich": "Greenwich",
  grinwich: "Greenwich",
  mandeville: "Mandeville",
  mandevil: "Mandeville",
  mandevill: "Mandeville",
  mendevil: "Mandeville",
  mendeville: "Mandeville",
  meteora: "Meteora",
  pinnata: "Pinnata",
  pinata: "Pinnata",
  plumeria: "Plumeria",
  ruko: "Ruko",
  victoria: "Victoria",
  viktoria: "Victoria",
};

interface SearchableClusterSelectProps {
  value: string;
  onChange: (cluster: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function SearchableClusterSelect({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Ketik huruf awal (mis: C)",
  className = "",
  id,
}: SearchableClusterSelectProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [prevValue, setPrevValue] = useState(value);
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when value prop changes during render
  if (prevValue !== value) {
    setPrevValue(value);
    setQuery(value);
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered clusters based on query input
  const filteredClusters = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [...CGV_CLUSTERS];

    // Priority 1: Prefix match (starts with)
    const prefixMatches = CGV_CLUSTERS.filter((c) =>
      c.toLowerCase().startsWith(cleanQuery),
    );

    // Priority 2: Substring match (contains)
    const substringMatches = CGV_CLUSTERS.filter(
      (c) =>
        !c.toLowerCase().startsWith(cleanQuery) &&
        c.toLowerCase().includes(cleanQuery),
    );

    return [...prefixMatches, ...substringMatches];
  }, [query]);

  // Check for smart alias match (typo correction)
  const suggestedCorrection = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return null;
    const directAlias = CLUSTER_ALIASES[cleanQuery];
    if (directAlias && directAlias.toLowerCase() !== cleanQuery) {
      return directAlias;
    }
    return null;
  }, [query]);

  function handleSelect(cluster: string) {
    onChange(cluster);
    setQuery(cluster);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleInputChange(text: string) {
    setQuery(text);
    onChange(text);
    setIsOpen(true);
    setActiveIndex(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setIsOpen(true);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredClusters.length - 1 ? prev + 1 : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredClusters.length - 1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredClusters.length) {
        handleSelect(filteredClusters[activeIndex]);
      } else if (suggestedCorrection) {
        handleSelect(suggestedCorrection);
      } else if (filteredClusters.length > 0) {
        handleSelect(filteredClusters[0]);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-listbox`}
          aria-autocomplete="list"
          className={
            className ||
            "min-h-12 w-full rounded-xl border border-white/16 bg-white px-4 pr-10 text-base font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-70"
          }
        />

        {/* Dropdown indicator or clear button */}
        <div className="absolute right-3 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                inputRef.current?.focus();
                setIsOpen(true);
              }}
              aria-label="Hapus pilihan"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all">
          {/* Typo Correction Banner if applicable */}
          {suggestedCorrection && (
            <button
              type="button"
              onClick={() => handleSelect(suggestedCorrection)}
              className="mb-1 flex w-full items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                  ✓
                </span>
                <span>Maksud Anda: <strong>{suggestedCorrection}</strong>?</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Pilih</span>
            </button>
          )}

          {filteredClusters.length > 0 ? (
            <ul id={`${inputId}-listbox`} role="listbox" className="space-y-0.5">
              {filteredClusters.map((cluster, index) => {
                const isSelected = value.toLowerCase() === cluster.toLowerCase();
                const isItemActive = index === activeIndex;

                return (
                  <li key={cluster}>
                    <button
                      type="button"
                      onClick={() => handleSelect(cluster)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white font-semibold shadow-sm"
                          : isItemActive
                            ? "bg-emerald-50 text-emerald-900"
                            : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {cluster.charAt(0)}
                        </span>
                        <span>{cluster}</span>
                      </div>
                      {isSelected && (
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Cluster &ldquo;{query}&rdquo; tidak ditemukan</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Pilih salah satu dari 15 cluster resmi CGV10 di atas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
