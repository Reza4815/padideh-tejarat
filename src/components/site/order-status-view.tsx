"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Hash,
  Loader2,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type PaymentMethod,
} from "@/lib/payment";
import { OrderTimeline } from "@/components/site/order-timeline";

const RECEIPT_ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const RECEIPT_MAX = 2 * 1024 * 1024;

export function OrderStatusView({ order }: { order: OrderRow }) {
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rejected = order.paymentStatus === "rejected";
  const canReupload =
    (rejected || order.paymentStatus === "pending") &&
    order.paymentMethod === "card" &&
    !done;

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
      const up = await fetch("/api/receipts/upload", { method: "POST", body: form });
      const upData = (await up.json()) as { ok?: boolean; url?: string; error?: string };
      if (!up.ok || !upData.ok || !upData.url) throw new Error(upData.error ?? "آپلود ناموفق بود");
      const res = await fetch(`/api/orders/${order.id}/receipt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptUrl: upData.url }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "ثبت رسید ناموفق بود");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطایی رخ داد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* کد پیگیری */}
      <div className="overflow-hidden rounded-2xl border border-gold-200 bg-gradient-to-b from-gold-50/60 to-white p-5 text-center dark:border-gold-700/40 dark:from-zinc-900/60 dark:to-zinc-900">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold tracking-wider text-gold-600">
          <Hash className="h-3.5 w-3.5" />
          کد پیگیری سفارش
        </p>
        <div className="mt-2 flex items-center justify-center gap-2" dir="ltr">
          <span className="font-mono text-2xl font-black tracking-wider text-ink-950 tnum dark:text-zinc-100">
            {order.trackingCode ?? order.id.slice(0, 8).toUpperCase()}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-1 rounded-full border border-gold-300 bg-white px-3 py-1 text-[11px] font-extrabold text-gold-700 transition hover:bg-gold-50 active:scale-95 dark:border-gold-700/50 dark:bg-zinc-800 dark:text-gold-300"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "کپی شد!" : "کپی"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-zinc-500 tnum dark:text-zinc-400">
          ثبت‌شده در {formatDateTime(order.createdAt)} —{" "}
          {PAYMENT_METHOD_LABEL[(order.paymentMethod as PaymentMethod) ?? "online"]} —{" "}
          {PAYMENT_STATUS_LABEL[(order.paymentStatus as "pending" | "awaiting_review" | "approved" | "rejected") ?? "pending"]}
        </p>
      </div>

      {/* دلیل رد + آپلود مجدد */}
      {rejected && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/30">
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
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          رسید جدید با موفقیت ثبت شد و در انتظار بررسی است. صفحه را رفرش کنید تا وضعیت به‌روز شود.
        </p>
      )}

      {canReupload && !done && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-1.5 text-[13px] font-black text-ink-950 dark:text-zinc-100">
            <RotateCcw className="h-4 w-4 text-gold-600" />
            آپلود مجدد رسید
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {preview ? (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="پیش‌نمایش رسید جدید" className="max-h-64 w-full object-contain bg-zinc-50 dark:bg-zinc-800" />
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
              className="mt-3 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-gold-300 bg-white/60 px-4 py-6 text-center transition hover:border-gold-500 hover:bg-gold-50/50 dark:border-gold-700/50 dark:bg-zinc-800/60"
            >
              <UploadCloud className="h-7 w-7 text-gold-500" />
              <span className="text-[12px] font-extrabold text-zinc-600 dark:text-zinc-300">انتخاب تصویر رسید جدید</span>
              <span className="text-[10px] text-zinc-400">jpg/png/webp تا ۲ مگابایت</span>
            </button>
          )}
          {error && (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}
          <button onClick={reupload} disabled={busy || !file} className="btn-gold mt-3 w-full py-3 text-xs disabled:pointer-events-none disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {busy ? "در حال ارسال..." : "ارسال رسید جدید"}
          </button>
        </div>
      )}

      {/* تایم‌لاین */}
      <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-black text-ink-950 dark:text-zinc-100">وضعیت سفارش</h2>
        <OrderTimeline
          status={(order.orderStatus as "pending" | "awaiting_review" | "approved" | "preparing" | "shipped" | "delivered" | "cancelled") ?? "pending"}
          paymentMethod={(order.paymentMethod as PaymentMethod) ?? "online"}
        />
      </div>

      {/* اقلام */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">اقلام سفارش</h2>
        </div>
        <ul className="divide-y divide-zinc-100 px-4 dark:divide-zinc-800">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-[12px]">
              <span className="min-w-0 flex-1 truncate font-bold text-zinc-700 dark:text-zinc-200">
                {it.name}
                <span className="mr-2 text-zinc-400 tnum">× {toFaDigits(it.qty)}</span>
              </span>
              <span className="shrink-0 font-black text-zinc-800 tnum dark:text-zinc-100">
                {formatPrice(it.price * it.qty)} تومان
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <span className="text-sm font-black text-ink-950 dark:text-zinc-100">جمع کل</span>
          <span className="text-lg font-black text-gold-700 tnum dark:text-gold-400">
            {formatPrice(order.total)} <span className="text-[10px] font-bold text-zinc-400">تومان</span>
          </span>
        </div>
      </div>

      <Link href="/products" className="btn-outline mt-6 w-full py-3 text-xs">
        <ArrowRight className="h-4 w-4" />
        ادامه خرید
      </Link>
    </div>
  );
}
