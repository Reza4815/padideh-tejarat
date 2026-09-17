"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  CreditCard,
  Hash,
  Landmark,
  Loader2,
  MapPin,
  Package,
  ReceiptText,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payment";
import { OrderProgressBar } from "@/components/site/account/order-progress-bar";
import { StatusBadge } from "@/components/site/account/order-card";

const RECEIPT_ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const RECEIPT_MAX = 2 * 1024 * 1024;

export function OrderStatusView({ order }: { order: OrderRow }) {
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const method = (order.paymentMethod as PaymentMethod) ?? "online";
  const paymentStatus = (order.paymentStatus as PaymentStatus) ?? "pending";
  const isCard = method === "card";

  const rejected = paymentStatus === "rejected";
  const canReupload =
    (rejected || paymentStatus === "pending") && isCard && !done;

  const productIds = useMemo(() => {
    const set = new Set<string>();
    for (const it of order.items ?? []) {
      if (it.productId) set.add(it.productId);
    }
    return [...set];
  }, [order.items]);

  useEffect(() => {
    if (productIds.length === 0) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        });
        const data = (await res.json()) as {
          prices?: { id: string; images?: string[] }[];
        };
        if (!mounted) return;
        const map: Record<string, string> = {};
        for (const p of data.prices ?? []) {
          if (p.images?.[0]) map[p.id] = p.images[0];
        }
        setImages(map);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productIds]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom]);

  async function copyCode() {
    const code = order.trackingCode ?? order.id.slice(0, 8).toUpperCase();
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function pick(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!RECEIPT_ALLOWED.includes(f.type)) {
      setError("فقط فایل jpg/png/webp مجاز است");
      return;
    }
    if (f.size > RECEIPT_MAX) {
      setError("حجم رسید باید حداکثر ۲ مگابایت باشد");
      return;
    }
    setFile(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }

  async function reupload() {
    if (!file) {
      setError("ابتدا تصویر رسید جدید را انتخاب کنید");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/receipts/upload", {
        method: "POST",
        body: form,
      });
      const upData = (await up.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!up.ok || !upData.ok || !upData.url)
        throw new Error(upData.error ?? "آپلود ناموفق بود");
      const res = await fetch(`/api/orders/${order.id}/receipt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptUrl: upData.url }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok)
        throw new Error(data.error ?? "ثبت رسید ناموفق بود");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطایی رخ داد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* خط کوچیک کد پیگیری */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
          <span
            className="text-[11.5px] font-black tracking-wider text-ink-950 tnum dark:text-zinc-100"
            dir="ltr"
          >
            {order.trackingCode ?? order.id.slice(0, 8).toUpperCase()}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-gold-600 active:scale-95 dark:hover:bg-zinc-800 dark:hover:text-gold-400"
            aria-label="کپی کد پیگیری"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
            ) : (
              <Copy className="h-3 w-3" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <StatusBadge status={order.orderStatus} />
      </div>

      {/* پیشرفت سفارش */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-black text-ink-950 dark:text-zinc-100">
          وضعیت سفارش
        </h2>
        <OrderProgressBar
          status={
            (order.orderStatus as
              | "pending"
              | "awaiting_review"
              | "approved"
              | "preparing"
              | "shipped"
              | "delivered"
              | "cancelled") ?? "pending"
          }
          paymentMethod={method}
        />
      </div>

      {/* دلیل رد + آپلود مجدد */}
      {rejected && (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="flex items-center gap-1.5 text-[13px] font-black text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            رسید شما رد شد
          </p>
          {order.rejectionReason && (
            <p className="mt-1.5 text-[12px] leading-6 text-red-600 dark:text-red-400">
              دلیل: {order.rejectionReason}
            </p>
          )}
        </div>
      )}

      {done && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[12px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          رسید جدید با موفقیت ثبت شد و در انتظار بررسی است. صفحه را رفرش کنید تا
          وضعیت به‌روز شود.
        </p>
      )}

      {canReupload && !done && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-1.5 text-[13px] font-black text-ink-950 dark:text-zinc-100">
            <RotateCcw className="h-4 w-4 text-gold-600" />
            {rejected ? "آپلود مجدد رسید" : "آپلود رسید پرداخت"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {preview ? (
            <div className="relative mt-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="پیش‌نمایش رسید جدید"
                className="max-h-64 w-full bg-zinc-50 object-contain dark:bg-zinc-800"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 rounded-full bg-ink-950/80 px-4 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-ink-950"
              >
                انتخاب مجدد
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-gold-300 bg-white/60 px-4 py-6 text-center transition hover:border-gold-500 hover:bg-gold-50/50 dark:border-gold-700/50 dark:bg-zinc-800/60"
            >
              <UploadCloud className="h-7 w-7 text-gold-500" />
              <span className="text-[12px] font-extrabold text-zinc-600 dark:text-zinc-300">
                انتخاب تصویر رسید جدید
              </span>
              <span className="text-[10px] text-zinc-400">
                jpg/png/webp تا ۲ مگابایت
              </span>
            </button>
          )}
          {error && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            onClick={reupload}
            disabled={busy || !file}
            className="btn-gold mt-3 w-full py-3 text-xs disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {busy ? "در حال ارسال..." : "ارسال رسید جدید"}
          </button>
        </div>
      )}

      {/* اقلام سفارش */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
            اقلام سفارش
          </h2>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {order.items.map((it, i) => {
            const image = it.productId ? images[it.productId] : undefined;
            return (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-[60px] w-[60px] shrink-0 place-items-center overflow-hidden rounded-lg border border-zinc-100 bg-gold-50/60 dark:border-zinc-800 dark:bg-zinc-800">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-gold-400" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] font-extrabold leading-5 text-zinc-700 dark:text-zinc-200">
                    {it.name}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-zinc-400 tnum">
                    {formatPrice(it.price)} تومان × {toFaDigits(it.qty)}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] font-black text-ink-950 tnum dark:text-zinc-100">
                  {formatPrice(it.price * it.qty)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <span className="text-sm font-black text-ink-950 dark:text-zinc-100">
            جمع کل
          </span>
          <span className="text-lg font-black text-gold-700 tnum dark:text-gold-400">
            {formatPrice(order.total)}{" "}
            <span className="text-[10px] font-bold text-zinc-400">تومان</span>
          </span>
        </div>
      </div>

      {/* آدرس ارسال */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <MapPin className="h-4 w-4 text-gold-600" />
          <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
            آدرس ارسال
          </h2>
        </div>
        <dl className="space-y-3 p-4 text-[12px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-bold text-zinc-400">استان / شهر</dt>
            <dd className="font-extrabold text-zinc-700 dark:text-zinc-200">
              {order.province || "—"}
              {order.city ? ` • ${order.city}` : ""}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 font-bold text-zinc-400">نشانی</dt>
            <dd className="text-left font-bold leading-6 text-zinc-700 dark:text-zinc-200">
              {order.address || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-bold text-zinc-400">کد پستی</dt>
            <dd
              className="font-mono font-extrabold text-zinc-700 tnum dark:text-zinc-200"
              dir="ltr"
            >
              {order.postalCode || "—"}
            </dd>
          </div>
          {order.plateNumber ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="font-bold text-zinc-400">پلاک</dt>
              <dd className="font-extrabold text-zinc-700 dark:text-zinc-200">
                {order.plateNumber}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      {/* پرداخت */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          {isCard ? (
            <Landmark className="h-4 w-4 text-gold-600" />
          ) : (
            <CreditCard className="h-4 w-4 text-gold-600" />
          )}
          <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
            روش پرداخت
          </h2>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3 text-[12px]">
            <span className="font-bold text-zinc-400">روش</span>
            <span className="font-extrabold text-zinc-700 dark:text-zinc-200">
              {PAYMENT_METHOD_LABEL[method] ?? method}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[12px]">
            <span className="font-bold text-zinc-400">وضعیت</span>
            <StatusBadge
              status={
                rejected
                  ? "cancelled"
                  : paymentStatus === "approved"
                    ? "approved"
                    : paymentStatus === "awaiting_review"
                      ? "awaiting_review"
                      : "pending"
              }
            />
          </div>

          {isCard && order.receiptImage ? (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400">
                <ReceiptText className="h-3.5 w-3.5 text-gold-600" />
                تصویر رسید واریز
              </p>
              <button
                type="button"
                onClick={() => setZoom(true)}
                className="block overflow-hidden rounded-lg border border-zinc-200 transition hover:border-gold-300 dark:border-zinc-700 dark:hover:border-gold-700/50"
                aria-label="نمایش بزرگ تصویر رسید"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.receiptImage}
                  alt="رسید واریز"
                  className="max-h-56 w-full bg-zinc-50 object-contain dark:bg-zinc-800"
                />
              </button>
            </div>
          ) : null}

          {isCard && !order.receiptImage ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              هنوز تصویر رسیدی برای این سفارش ثبت نشده است.
            </p>
          ) : null}
        </div>
      </div>

      <Link href="/products" className="btn-outline w-full py-3 text-xs">
        <ArrowRight className="h-4 w-4" />
        ادامه خرید
      </Link>

      {/* نمایش بزرگ رسید */}
      {zoom && order.receiptImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setZoom(false)}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.receiptImage}
            alt="رسید واریز"
            className="relative max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
