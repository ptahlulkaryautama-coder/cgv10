"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "../components/portal";
import type { IconName } from "@/lib/portal-data";

type KabarItem = {
  title: string;
  text: string;
  category: "Pengumuman" | "Agenda" | "Dokumentasi";
  status: "Published" | "Review";
  href: string;
  icon: IconName;
};

const kabarItems: KabarItem[] = [
  {
    title: "Jadwal kerja bakti lingkungan",
    text: "Agenda kebersihan bersama warga untuk menjaga lingkungan tetap rapi.",
    category: "Agenda",
    status: "Published",
    href: "/kabar-warga/#dokumentasi",
    icon: "calendar",
  },
  {
    title: "Pendataan warga dan kendaraan",
    text: "Informasi pendataan lingkungan agar data warga dan kendaraan tertata.",
    category: "Pengumuman",
    status: "Published",
    href: "/kabar-warga/#pengumuman",
    icon: "file",
  },
  {
    title: "Informasi keamanan lingkungan",
    text: "Informasi keamanan lingkungan untuk meningkatkan kewaspadaan warga.",
    category: "Pengumuman",
    status: "Published",
    href: "/kabar-warga/#pengumuman",
    icon: "shield",
  },
  {
    title: "Dokumentasi kerja bakti",
    text: "Arsip visual kegiatan kebersihan bersama warga lingkungan.",
    category: "Dokumentasi",
    status: "Review",
    href: "/kegiatan/kerja-bakti-lingkungan/",
    icon: "users",
  },
];

const categories = [
  "Semua",
  "Pengumuman",
  "Agenda",
  "Dokumentasi",
];

export function KabarFilter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return kabarItems.filter((item) => {
      const matchesQuery = normalizedQuery
        ? [item.title, item.text, item.category].join(" ").toLowerCase().includes(normalizedQuery)
        : true;
      const matchesCategory = category === "Semua" || item.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [category, query]);

  return (
    <section id="aksi-warga" className="scroll-mt-28 border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Kabar Terarah
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Temukan kabar resmi, agenda, dan dokumentasi warga.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted">
              Area ini fokus pada informasi yang perlu dibaca warga. Kebutuhan
              aksi tetap diarahkan ke halaman khusus masing-masing.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px] lg:w-[520px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Cari kabar warga..."
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
            />
            <select
              value={category}
              aria-label="Filter kategori"
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-12 cursor-pointer rounded-xl border border-border bg-background px-4 text-sm font-semibold text-muted outline-none transition-colors duration-200 focus:border-primary"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-border bg-background p-5 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={item.icon} />
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                  {item.category}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-snug text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
              <p className="mt-5 text-sm font-semibold text-primary group-hover:text-primary-hover">
                Buka aksi
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
