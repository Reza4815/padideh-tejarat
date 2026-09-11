"use client";

import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import type { ProductCard } from "@/lib/data";
import { useCart } from "@/components/site/cart-provider";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function ProductCardView({ product }: { product: ProductCard }) {
  const { add } = useCart();
  const off = discountPercent(product.price, product.compareAtPrice);
  const out = product.stock <= 0;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-zinc-100 bg-white p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_26px_55px_-28px_rgba(120,84,39,0.4)] sm:p-3.5">
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden rounded-xl bg-gold-50/60"
        tabIndex={-1}
      >
        <div className="aspect-square w-full">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={cn(
                "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
                out && "opacity-50 grayscale",
              )}
            />
          ) : (
            <div className="grid h-full place-items-center text-gold-300">
              <Package className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {product.featured && (
            <span className="rounded-full bg-ink-950/90 px-2.5 py-1 text-[9px] font-extrabold text-gold-300 backdrop-blur">
              پیشنهاد ویژه
            </span>
          )}
          {off > 0 && (
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[9px] font-extrabold text-zinc-950 tnum">
              {formatPrice(off)}٪ تخفیف
            </span>
          )}
        </div>

        {out && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-extrabold text-zinc-500 shadow">
              ناموجود
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-extrabold tracking-wide text-gold-600 sm:text-[11px]">
            {product.brand}
          </span>
          {product.categoryName && (
            <Link
              href={`/products?cat=${product.categorySlug}`}
              className="text-[9px] font-bold text-zinc-400 transition hover:text-gold-700 sm:text-[10px]"
            >
              {product.categoryName}
            </Link>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 min-h-10 text-[12.5px] font-extrabold leading-6 text-ink-950 transition group-hover:text-gold-700 sm:min-h-11 sm:text-sm md:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {product.partNumber ? (
          <p className="mt-1 truncate text-[9px] font-medium text-zinc-400 sm:text-[10px]" dir="ltr">
            OEM: {product.partNumber}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-[15px] font-black text-ink-950 tnum sm:text-lg">
            {formatPrice(product.price)}
            <span className="mr-1 text-[9px] font-bold text-zinc-400 sm:text-[10px]">تومان</span>
          </span>
          {product.compareAtPrice ? (
            <span className="text-[10px] font-bold text-zinc-400 line-through tnum sm:text-[11px]">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <button
          disabled={out}
          onClick={() =>
            add({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
              partNumber: product.partNumber,
            })
          }
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-extrabold transition active:scale-[0.98] sm:rounded-full sm:py-2.5 sm:text-xs",
            out
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
              : "bg-gold-500 text-zinc-950 shadow-[0_10px_22px_-10px_rgba(207,163,56,0.8)] hover:bg-gold-400",
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {out ? "ناموجود" : "افزودن به سبد"}
        </button>
      </div>
    </article>
  );
}
