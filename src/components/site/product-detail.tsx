"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { Reveal } from "@/components/site/reveal";
import { cn, discountPercent, formatPrice, toFaDigits } from "@/lib/utils";

export type ProductDetailDto = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  partNumber: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  shortDesc: string;
  description: string;
  benefits: string[];
  specs: { label: string; value: string }[];
  compatibility: string[];
  images: string[];
  categoryName: string | null;
  categorySlug: string | null;
};

export function ProductDetailView({ product }: { product: ProductDetailDto }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  const out = product.stock <= 0;
  const off = discountPercent(product.price, product.compareAtPrice);
  const images = product.images.length ? product.images : [""];

  async function copyOem() {
    try {
      await navigator.clipboard.writeText(product.partNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* gallery */}
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-zinc-100 bg-gold-50/50">
            <div className="aspect-square w-full">
              {images[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              ) : (
                <div className="grid h-full place-items-center text-gold-300">
                  <Package className="h-16 w-16" />
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
              {off > 0 && (
                <span className="rounded-full bg-gold-500 px-3 py-1.5 text-[11px] font-black text-zinc-950 tnum">
                  {formatPrice(off)}٪ تخفیف
                </span>
              )}
              {out ? (
                <span className="rounded-full bg-ink-950/90 px-3 py-1.5 text-[11px] font-black text-white">
                  ناموجود
                </span>
              ) : null}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 bg-gold-50/50 transition",
                    activeImg === i ? "border-gold-500" : "border-transparent opacity-60 hover:opacity-100",
                  )}
                  style={{ height: 72, width: 72 }}
                  aria-label={`تصویر ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {/* info */}
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-gold-200 bg-gold-50 text-gold-700">{product.brand}</span>
              {product.categoryName && (
                <span className="chip">{product.categoryName}</span>
              )}
            </div>
            <h1 className="mt-4 text-xl font-black leading-9 tracking-tight text-ink-950 sm:text-2xl lg:text-3xl lg:leading-11">
              {product.name}
            </h1>
            {product.shortDesc ? (
              <p className="mt-3 text-sm leading-7 text-zinc-500">{product.shortDesc}</p>
            ) : null}
          </Reveal>

          {product.partNumber ? (
            <Reveal delay={80}>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gold-300 bg-gold-50/70 px-4 py-3">
                <div>
                  <p className="text-[10px] font-extrabold text-gold-700">کد فنی / شماره OEM</p>
                  <p className="mt-0.5 text-sm font-black text-ink-950" dir="ltr">
                    {product.partNumber}
                  </p>
                </div>
                <button
                  onClick={copyOem}
                  className="flex items-center gap-1.5 rounded-full border border-gold-300 bg-white px-3.5 py-2 text-[11px] font-extrabold text-gold-700 transition hover:bg-gold-100"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "کپی شد" : "کپی کد"}
                </button>
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={140}>
            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-black text-ink-950 tnum sm:text-4xl">
                {formatPrice(product.price)}
              </span>
              <span className="pb-1 text-xs font-bold text-zinc-400">تومان</span>
              {product.compareAtPrice ? (
                <span className="pb-1 text-sm font-bold text-zinc-400 line-through tnum">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <p className={cn("mt-2 text-xs font-extrabold tnum", out ? "text-red-500" : "text-emerald-600")}>
              {out
                ? "این کالا در حال حاضر ناموجود است"
                : `موجود در انبار — ${toFaDigits(product.stock)} عدد`}
            </p>
          </Reveal>

          {!out && (
            <Reveal delay={200}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-1.5">
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    className="grid h-9 w-9 place-items-center rounded-full text-zinc-700 transition hover:bg-gold-100"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center text-base font-black tnum">{toFaDigits(qty)}</span>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() =>
                    add(
                      {
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.images[0] ?? "",
                        partNumber: product.partNumber,
                      },
                      qty,
                    )
                  }
                  className="btn-gold flex-1 py-4 text-sm sm:flex-none sm:px-10"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  افزودن به سبد خرید
                </button>
              </div>
            </Reveal>
          )}

          <Reveal delay={260}>
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-6">
              {[
                { icon: ShieldCheck, label: "ضمانت اصالت کالا" },
                { icon: Truck, label: "ارسال سراسری" },
                { icon: RotateCcw, label: "۷ روز مهلت مرجوعی" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-gold-50/70 px-2 py-3.5 text-center"
                >
                  <b.icon className="h-5 w-5 text-gold-600" />
                  <span className="text-[10px] font-extrabold text-zinc-600 sm:text-[11px]">{b.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {product.benefits.length > 0 && (
            <Reveal delay={320}>
              <div className="mt-8 rounded-2xl border border-zinc-100 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-black text-ink-950">
                  <Zap className="h-4 w-4 text-gold-500" />
                  مزایای کلیدی
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {product.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[13px] font-bold text-zinc-600">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* description / specs / compatibility */}
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {product.description ? (
          <Reveal className="lg:col-span-2">
            <div className="rounded-3xl border border-zinc-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-black text-ink-950">توضیحات محصول</h2>
              <div className="mt-4 space-y-4">
                {product.description
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="text-sm leading-8 text-zinc-500">
                      {p}
                    </p>
                  ))}
              </div>
            </div>
          </Reveal>
        ) : null}

        {product.specs.length > 0 && (
          <Reveal delay={100}>
            <div className="rounded-3xl border border-zinc-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-black text-ink-950">مشخصات فنی</h2>
              <dl className="mt-4 divide-y divide-zinc-100">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
                    <dt className="font-bold text-zinc-400">{s.label}</dt>
                    <dd className="font-extrabold text-zinc-800">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        )}

        {product.compatibility.length > 0 && (
          <Reveal delay={160}>
            <div className="rounded-3xl border border-gold-200 bg-gold-50/60 p-6 sm:p-8 lg:col-span-3">
              <h2 className="text-lg font-black text-ink-950">سازگار با خودروهای</h2>
              <p className="mt-1.5 text-xs text-zinc-500">
                در صورت عدم وجود خودروی شما در لیست، با کارشناسان ما تماس بگیرید.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.compatibility.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-gold-300 bg-white px-4 py-2 text-xs font-extrabold text-gold-800"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
