"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { formatPrice, toFaDigits } from "@/lib/utils";

export function CartView() {
  const { items, ready, total, count, setQty, remove, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(fd.get("name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          note: String(fd.get("note") ?? ""),
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            partNumber: i.partNumber,
            price: i.price,
            qty: i.qty,
          })),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
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
    return <div className="py-24 text-center text-sm font-bold text-zinc-400">در حال بارگذاری ...</div>;
  }

  if (status === "ok") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-[2rem] border border-gold-200 bg-white p-10 text-center shadow-[0_35px_70px_-35px_rgba(120,84,39,0.5)]">
        <span className="grid h-18 w-18 place-items-center rounded-full bg-gold-100 text-gold-600" style={{ height: 72, width: 72 }}>
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="text-xl font-black text-ink-950">سفارش شما با موفقیت ثبت شد</h1>
        <p className="text-sm leading-8 text-zinc-500">
          کارشناسان پدیده تجارت الوند برای تایید موجودی، هماهنگی پرداخت و ارسال، در اولین فرصت با
          شما تماس می‌گیرند.
        </p>
        {orderId && (
          <p className="rounded-xl bg-gold-50 px-4 py-2 text-[11px] font-bold text-gold-700" dir="ltr">
            کد پیگیری: {orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <Link href="/products" className="btn-gold mt-2">
          ادامه خرید
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-[1.75rem] bg-gold-50 text-gold-400">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <h1 className="text-xl font-black text-ink-950">سبد خرید شما خالی است</h1>
        <p className="text-sm leading-7 text-zinc-500">
          هنوز قطعه‌ای انتخاب نکرده‌اید؛ از فروشگاه، قطعه موردنظر خودروی خود را پیدا کنید.
        </p>
        <Link href="/products" className="btn-gold mt-2">
          <ArrowRight className="h-4 w-4" />
          رفتن به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-[11px] font-extrabold text-gold-600">سبد خرید</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">
          بازبینی سفارش <span className="text-sm font-bold text-zinc-400 tnum">({toFaDigits(count)} قلم)</span>
        </h1>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* items */}
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-zinc-100 bg-white p-3 sm:p-4"
            >
              <Link
                href={`/products/${item.slug}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gold-50 sm:h-24 sm:w-24"
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                ) : null}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/products/${item.slug}`}
                    className="line-clamp-2 text-[13px] font-extrabold leading-6 text-ink-950 transition hover:text-gold-700 sm:text-sm"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => remove(item.id)}
                    className="shrink-0 text-zinc-300 transition hover:text-red-500"
                    aria-label="حذف از سبد"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                {item.partNumber ? (
                  <p className="mt-0.5 text-[10px] text-zinc-400" dir="ltr">
                    OEM: {item.partNumber}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-1">
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      className="grid h-7 w-7 place-items-center rounded-full text-zinc-600 hover:bg-gold-100"
                      aria-label="افزایش"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-black tnum">{toFaDigits(item.qty)}</span>
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      className="grid h-7 w-7 place-items-center rounded-full text-zinc-600 hover:bg-zinc-100"
                      aria-label="کاهش"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[15px] font-black text-ink-950 tnum">
                    {formatPrice(item.price * item.qty)}
                    <span className="mr-1 text-[10px] font-bold text-zinc-400">تومان</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* summary + checkout */}
        <div className="space-y-4 lg:sticky lg:top-32">
          <div className="rounded-3xl border border-zinc-100 bg-white p-6">
            <h2 className="text-sm font-black text-ink-950">خلاصه سفارش</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <dt className="font-bold text-zinc-400">جمع اقلام</dt>
                <dd className="font-extrabold text-zinc-800 tnum">{formatPrice(total)} تومان</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-bold text-zinc-400">هزینه ارسال</dt>
                <dd className="text-[11px] font-bold text-gold-700">پس‌کرایه — طبق مقصد</dd>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-3">
                <dt className="font-black text-ink-950">مبلغ قابل پرداخت</dt>
                <dd className="text-lg font-black text-gold-700 tnum">{formatPrice(total)} تومان</dd>
              </div>
            </dl>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-gold-200 bg-gold-50/60 p-6">
            <h2 className="text-sm font-black text-ink-950">ثبت سفارش</h2>
            <p className="mt-1.5 text-[11px] leading-5 text-zinc-500">
              پس از ثبت، کارشناسان ما برای هماهنگی پرداخت و ارسال با شما تماس می‌گیرند.
            </p>
            <div className="mt-4 space-y-3">
              <input name="name" required placeholder="نام و نام خانوادگی *" className="field" />
              <input
                name="phone"
                required
                placeholder="شماره موبایل *"
                className="field"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              <textarea name="note" rows={2} placeholder="توضیحات (اختیاری)" className="field resize-none" />
            </div>
            {status === "err" && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>
            )}
            <button type="submit" disabled={status === "sending"} className="btn-gold mt-4 w-full py-3.5">
              {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              ثبت نهایی سفارش
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
