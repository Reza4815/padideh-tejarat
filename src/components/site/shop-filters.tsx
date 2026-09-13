"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Initial = {
  q: string;
  cat: string;
  brand: string;
  sort: string;
  inStock: boolean;
};

export function ShopFilters({
  initial,
  categories,
  brands,
}: {
  initial: Initial;
  categories: { slug: string; name: string; count: number }[];
  brands: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setQ(initial.q), [initial.q]);

  function push(patch: Partial<Initial>) {
    const next = { ...initial, ...patch };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.cat) params.set("cat", next.cat);
    if (next.brand) params.set("brand", next.brand);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
    if (next.inStock) params.set("stock", "1");
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function onSearchInput(v: string) {
    setQ(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push({ q: v.trim() }), 450);
  }

  const hasFilter =
    initial.q ||
    initial.cat ||
    initial.brand ||
    initial.inStock ||
    initial.sort !== "newest";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_20px_45px_-30px_rgba(120,84,39,0.35)] backdrop-blur sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/95">
      {/* search */}
      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gold-500" />
        <input
          value={q}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder="جستجو بر اساس نام قطعه، برند یا کد OEM ..."
          className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-4 pr-12 text-sm font-bold text-zinc-900 outline-none transition placeholder:font-medium placeholder:text-zinc-500 focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:border-gold-500"
        />
      </div>

      {/* category chips */}
      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => push({ cat: "" })}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-[13px] font-extrabold transition",
            !initial.cat
              ? "border-gold-500 bg-gold-500 text-zinc-950 shadow-[0_8px_18px_-8px_rgba(207,163,56,0.8)]"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-gold-400 hover:text-gold-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-gold-500 dark:hover:text-gold-300",
          )}
        >
          همه
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => push({ cat: initial.cat === c.slug ? "" : c.slug })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[13px] font-extrabold transition tnum",
              initial.cat === c.slug
                ? "border-gold-500 bg-gold-500 text-zinc-950 shadow-[0_8px_18px_-8px_rgba(207,163,56,0.8)]"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-gold-400 hover:text-gold-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-gold-500 dark:hover:text-gold-300",
            )}
          >
            {c.name}
            <span className="mr-1.5 text-[10px] opacity-70">({c.count})</span>
          </button>
        ))}
      </div>

      {/* selects */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <select
          value={initial.brand}
          onChange={(e) => push({ brand: e.target.value })}
          className="cursor-pointer rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-[13px] font-bold text-zinc-700 outline-none transition focus:border-gold-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="برند"
        >
          <option value="">همه برندها</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
          <select
            value={initial.sort}
            onChange={(e) => push({ sort: e.target.value })}
            className="cursor-pointer rounded-xl border border-zinc-300 bg-white py-2.5 pl-3.5 pr-9 text-[13px] font-bold text-zinc-700 outline-none transition focus:border-gold-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="مرتب‌سازی"
          >
            <option value="newest">جدیدترین</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
          </select>
        </div>

        <button
          onClick={() => push({ inStock: !initial.inStock })}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-extrabold transition",
            initial.inStock
              ? "border-gold-400 bg-gold-50 text-gold-700 dark:border-gold-500 dark:bg-gold-950/40 dark:text-gold-300"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-gold-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-gold-500",
          )}
        >
          <span
            className={cn(
              "grid h-4 w-4 place-items-center rounded-full border",
              initial.inStock
                ? "border-gold-500 bg-gold-500 text-zinc-950"
                : "border-zinc-400 bg-white dark:border-zinc-500 dark:bg-zinc-700",
            )}
          >
            {initial.inStock && <Check className="h-3 w-3" />}
          </span>
          فقط کالای موجود
        </button>

        {hasFilter && (
          <button
            onClick={() => {
              setQ("");
              router.push("/products", { scroll: false });
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-extrabold text-zinc-500 transition hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            حذف فیلترها
          </button>
        )}
      </div>
    </div>
  );
}
