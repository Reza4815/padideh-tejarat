"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { formatPrice, toFaDigits } from "@/lib/utils";

type SuggestedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  partNumber: string;
};

export function CartView() {
  const {
    items,
    ready,
    total,
    count,
    setQty,
    remove,
    clear,
    refreshPrices,
    add,
  } = useCart();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [suggested, setSuggested] = useState<SuggestedProduct[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // گرفتن محصولات پیشنهادی
  useEffect(() => {
    if (!ready || items.length === 0 || items.length > 2) {
      setSuggested([]);
      return;
    }

    let mounted = true;

    async function loadSuggested() {
      try {
        const res = await fetch("/api/products/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "suggested",
            excludeIds: items.map((i) => i.id),
          }),
        });
        const data = (await res.json()) as { prices?: SuggestedProduct[] };
        if (mounted) setSuggested(data.prices ?? []);
      } catch {
        /* ignore */
      }
    }

    void loadSuggested();
    return () => {
      mounted = false;
    };
  }, [ready, items]);

  // افزودن محصول پیشنهادی به سبد با انیمیشن
  function addSuggested(p: SuggestedProduct) {
    setAddedIds((prev) => new Set(prev).add(p.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }, 1200);

    add(
      {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.images?.[0] ?? "",
        partNumber: p.partNumber ?? "",
      },
      1,
      { openDrawer: false },
    );
  }
  // حذف با انیمیشن
  function removeWithAnimation(id: string) {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      remove(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 350);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await Promise.race([
        refreshPrices(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 3000),
        ),
      ]);
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(fd.get("name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          province: String(fd.get("province") ?? ""),
          city: String(fd.get("city") ?? ""),
          address: String(fd.get("address") ?? ""),
          postalCode: String(fd.get("postalCode") ?? ""),
          plateNumber: String(fd.get("plateNumber") ?? ""),
          note: String(fd.get("note") ?? ""),
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
      };
      if (res.ok && data.ok) {
        setOrderId(data.id ?? "");
        setStatus("ok");
        clear();
      } else {
        setError(data.error ?? "خطایی رخ داد");
        setStatus("err");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setStatus("err");
    }
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        <p className="text-sm font-bold text-zinc-400">در حال بارگذاری...</p>
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div className="mx-auto flex max-w-md animate-[fadeInScale_0.5s_ease-out] flex-col items-center gap-5 rounded-3xl border border-gold-200 bg-gradient-to-b from-white to-gold-50/40 p-10 text-center shadow-xl dark:border-gold-700/40 dark:from-zinc-900 dark:to-zinc-900/50">
        <span className="grid h-20 w-20 animate-[bounceIn_0.6s_ease-out] place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-lg">
          <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
        </span>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-ink-950 dark:text-zinc-100">
            سفارش شما با موفقیت ثبت شد
          </h1>
          <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            کارشناسان پدیده تجارت الوند برای تأیید موجودی و هماهنگی ارسال، در
            اولین فرصت با شما تماس می‌گیرند.
          </p>
        </div>
        {orderId && (
          <div
            className="flex items-center gap-2 rounded-xl bg-gold-100/60 px-4 py-2.5 dark:bg-gold-950/40"
            dir="ltr"
          >
            <span className="text-[10px] font-bold text-gold-700 dark:text-gold-300">
              کد پیگیری
            </span>
            <span className="font-mono text-sm font-black text-gold-800 dark:text-gold-200">
              {orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        )}
        <Link href="/products" className="btn-gold mt-1 w-full py-3">
          <ArrowRight className="h-4 w-4" />
          ادامه خرید
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md animate-[fadeIn_0.4s_ease-out] flex-col items-center gap-4 py-20 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-gold-100 to-gold-50 text-gold-500 dark:from-gold-950/60 dark:to-zinc-900">
          <ShoppingBag className="h-11 w-11" strokeWidth={1.5} />
        </span>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-ink-950 dark:text-zinc-100">
            سبد خرید شما خالی است
          </h1>
          <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            هنوز قطعه‌ای انتخاب نکرده‌اید؛ از فروشگاه، قطعه موردنظر خودروی خود
            را پیدا کنید.
          </p>
        </div>
        <Link href="/products" className="btn-gold mt-2">
          <ArrowRight className="h-4 w-4" />
          رفتن به فروشگاه
        </Link>
      </div>
    );
  }

  const showSuggestions = suggested.length > 0 && items.length <= 2;

  // کامپوننت پیشنهادات
  const SuggestionsBlock = (
    <div>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-gold-100 text-gold-600 dark:bg-gold-950/60">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
          پیشنهاد برای شما
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {suggested.map((p) => {
          const isAdded = addedIds.has(p.id);
          const isInCart = items.some((i) => i.id === p.id);
          return (
            <div
              key={p.id}
              className="group relative flex animate-[fadeInUp_0.4s_ease-out] flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all duration-300 hover:border-gold-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold-700/50"
            >
              <Link href={`/products/${p.slug}`} className="flex flex-col p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gold-50">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}

                  {/* دکمه افزودن - روی تصویر */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addSuggested(p);
                    }}
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all duration-300 ${
                      isAdded
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                    }`}
                    aria-label={`افزودن ${p.name} به سبد`}
                  >
                    {isAdded ? (
                      <span className="flex animate-[bounceIn_0.4s_ease-out] items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        اضافه شد
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        افزودن به سبد
                      </span>
                    )}
                  </button>

                  {/* نشان "در سبد" */}
                  {isInCart && (
                    <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      در سبد
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-4 text-ink-950 dark:text-zinc-100">
                  {p.name}
                </p>
                <p className="mt-1 text-[12px] font-black text-gold-700 tnum dark:text-gold-400">
                  {formatPrice(p.price)}
                  <span className="mr-1 text-[9px] font-bold text-zinc-400">
                    تومان
                  </span>
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );

  const TrustBadgesBlock = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-black text-ink-950 dark:text-zinc-100">
            ضمانت اصالت
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            اورجینال و تضمینی
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40">
          <Truck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-black text-ink-950 dark:text-zinc-100">
            ارسال سراسری
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            به تمام نقاط کشور
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40">
          <Headphones className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-black text-ink-950 dark:text-zinc-100">
            پشتیبانی
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            پاسخگوی سوالات شما
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* استایل‌های انیمیشن */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
            max-height: 200px;
          }
          to {
            opacity: 0;
            transform: translateX(30px);
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
        .animate-remove {
          animation: slideOutRight 0.35s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
      `}</style>

      {/* هدر */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold tracking-wider text-gold-600">
            سبد خرید
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-950 sm:text-3xl dark:text-zinc-100">
            بازبینی سفارش
          </h1>
        </div>
        <span className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-bold text-zinc-600 transition-all duration-300 dark:bg-zinc-800 dark:text-zinc-300">
          {toFaDigits(count)} قلم کالا
        </span>
      </header>

      {/* گرید اصلی */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ستون راست: لیست محصولات + پیشنهادات دسکتاپ */}
        <section className="order-1 space-y-3">
          <div className="flex items-center gap-2 px-1 pb-1">
            <Package className="h-4 w-4 text-gold-600" />
            <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
              اقلام سبد
            </h2>
          </div>

          <ul className="space-y-3">
            {items.map((item) => {
              const isRemoving = removingIds.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`group flex gap-3 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-3 transition-all duration-300 hover:border-gold-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold-700/50 ${
                    isRemoving
                      ? "animate-remove"
                      : "animate-[fadeInUp_0.3s_ease-out]"
                  }`}
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gold-50 sm:h-24 sm:w-24"
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.slug}`}
                          className="line-clamp-2 text-[13px] font-extrabold leading-5 text-ink-950 transition hover:text-gold-700 sm:text-sm dark:text-zinc-100"
                        >
                          {item.name}
                        </Link>
                        {item.partNumber ? (
                          <p
                            className="mt-1 inline-flex rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            dir="ltr"
                          >
                            OEM: {item.partNumber}
                          </p>
                        ) : null}
                      </div>
                      <button
                        onClick={() => removeWithAnimation(item.id)}
                        className="shrink-0 rounded-lg p-1.5 text-zinc-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                        aria-label="حذف از سبد"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="grid h-8 w-8 place-items-center rounded-full text-zinc-600 transition hover:bg-gold-100 hover:text-gold-700 active:scale-90 dark:text-zinc-300 dark:hover:bg-gold-950/50"
                          aria-label="افزایش"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-black tnum transition-all duration-200 dark:text-zinc-100">
                          {toFaDigits(item.qty)}
                        </span>
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="grid h-8 w-8 place-items-center rounded-full text-zinc-600 transition hover:bg-zinc-100 active:scale-90 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          aria-label="کاهش"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-left">
                        <p className="text-base font-black text-ink-950 tnum transition-all duration-200 dark:text-zinc-100">
                          {formatPrice(item.price * item.qty)}
                          <span className="mr-1 text-[10px] font-bold text-zinc-400">
                            تومان
                          </span>
                        </p>
                        {item.qty > 1 && (
                          <p className="text-[10px] font-bold text-zinc-400 tnum">
                            {formatPrice(item.price)} × {toFaDigits(item.qty)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* پیشنهادات + باکس اعتماد - فقط دسکتاپ */}
          <div className="hidden space-y-6 lg:block">
            {showSuggestions && SuggestionsBlock}
            {TrustBadgesBlock}
          </div>
        </section>

        {/* ستون چپ: خلاصه + فرم */}
        <aside className="order-2 space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* خلاصه سفارش */}
          <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <ShoppingBag className="h-4 w-4 text-gold-600" />
              <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
                خلاصه سفارش
              </h2>
            </div>
            <dl className="space-y-3 p-4 text-[12px]">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 font-bold text-zinc-500 dark:text-zinc-400">
                  <Package className="h-3.5 w-3.5" />
                  جمع اقلام
                </dt>
                <dd className="font-extrabold text-zinc-800 tnum transition-all duration-300 dark:text-zinc-200">
                  {formatPrice(total)} تومان
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 font-bold text-zinc-500 dark:text-zinc-400">
                  <Truck className="h-3.5 w-3.5" />
                  هزینه ارسال
                </dt>
                <dd className="rounded-md bg-gold-50 px-2 py-0.5 text-[10px] font-bold text-gold-700 dark:bg-gold-950/40 dark:text-gold-300">
                  پس‌کرایه
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-700">
                <dt className="font-black text-ink-950 dark:text-zinc-100">
                  مبلغ قابل پرداخت
                </dt>
                <dd className="text-lg font-black text-gold-700 tnum transition-all duration-300 dark:text-gold-400">
                  {formatPrice(total)}
                  <span className="mr-1 text-[10px] font-bold text-zinc-400">
                    تومان
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* فرم */}
          <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border border-gold-200 bg-gradient-to-b from-gold-50/60 to-white dark:border-gold-700/40 dark:from-zinc-900/60 dark:to-zinc-900"
          >
            <div className="flex items-center gap-2 border-b border-gold-200/60 px-4 py-3 dark:border-gold-700/30">
              <User className="h-4 w-4 text-gold-600" />
              <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
                اطلاعات گیرنده
              </h2>
            </div>

            <div className="space-y-3 p-4">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input
                  name="name"
                  required
                  placeholder="نام و نام خانوادگی *"
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <input
                  name="phone"
                  required
                  placeholder="شماره موبایل *"
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
                <input
                  name="province"
                  required
                  placeholder="استان *"
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <input
                  name="city"
                  required
                  placeholder="شهر *"
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <MapPin className="h-3.5 w-3.5 text-gold-600" />
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                  آدرس پستی
                </span>
              </div>

              <textarea
                name="address"
                required
                rows={2}
                placeholder="خیابان، کوچه، پلاک، واحد *"
                className="field resize-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input
                  name="postalCode"
                  required
                  placeholder="کد پستی (۱۰ رقم) *"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="\d{10}"
                  title="کد پستی باید ۱۰ رقم باشد"
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
                <input
                  name="plateNumber"
                  placeholder="پلاک خودرو (اختیاری)"
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              <textarea
                name="note"
                rows={2}
                placeholder="توضیحات (اختیاری)"
                className="field resize-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />

              {status === "err" && (
                <p className="animate-[fadeInUp_0.3s_ease-out] rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-gold w-full py-3.5 text-sm transition-transform active:scale-[0.98]"
              >
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {status === "sending" ? "در حال ثبت..." : "ثبت نهایی سفارش"}
              </button>

              <p className="text-center text-[10px] leading-5 text-zinc-400 dark:text-zinc-500">
                با ثبت سفارش، کارشناسان ما با شما تماس می‌گیرند.
              </p>
            </div>
          </form>
        </aside>

        {/* پیشنهادات + باکس اعتماد - فقط موبایل (بعد از فرم) */}
        <div className="order-3 space-y-6 lg:hidden">
          {showSuggestions && SuggestionsBlock}
          {TrustBadgesBlock}
        </div>
      </div>
    </div>
  );
}
