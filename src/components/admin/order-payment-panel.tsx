"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgeCheck, Loader2, XCircle } from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { ORDER_STATUS_OPTIONS, type OrderLifecycle } from "@/lib/payment";
import { approveReceipt, rejectReceipt, setOrderLifecycle } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function OrderPaymentPanel({ order }: { order: OrderRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [msg, setMsg] = useState("");

  const isCard = order.paymentMethod === "card";
  const needsReview = order.paymentStatus === "awaiting_review";

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setMsg("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setMsg(res.error ?? "خطایی رخ داد");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
      {/* رسید کارت‌به‌کارت */}
      {isCard && order.receiptImage && (
        <div>
          <p className="mb-2 text-[11px] font-extrabold text-zinc-500">رسید واریز مشتری</p>
          <a href={order.receiptImage} target="_blank" rel="noreferrer" title="نمایش بزرگ‌تر">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.receiptImage}
              alt="رسید واریز"
              className="max-h-56 rounded-xl border border-zinc-200 object-contain bg-white transition hover:opacity-90"
            />
          </a>
        </div>
      )}

      {/* دکمه‌های تأیید/رد رسید */}
      {isCard && needsReview && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={pending}
            onClick={() => run(() => approveReceipt(order.id))}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-extrabold text-white transition hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
            تأیید رسید
          </button>
          <button
            disabled={pending}
            onClick={() => setRejectMode((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-[11px] font-extrabold text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            رد رسید
          </button>
        </div>
      )}

      {rejectMode && isCard && needsReview && (
        <div className="space-y-2 rounded-xl border border-red-200 bg-white p-3">
          <label className="block text-[11px] font-extrabold text-zinc-600">دلیل رد رسید</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="مثلاً: مبلغ واریزی با فاکتور مغایرت دارد"
            className="field resize-none text-xs"
          />
          <button
            disabled={pending || !reason.trim()}
            onClick={() => run(() => rejectReceipt(order.id, reason))}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-[11px] font-extrabold text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            ثبت رد رسید
          </button>
        </div>
      )}

      {/* تغییر مرحله سفارش */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-extrabold text-zinc-500">مرحله سفارش:</label>
        <span className="relative inline-flex items-center gap-1.5">
          {pending && <Loader2 className="h-3 w-3 animate-spin text-gold-500" />}
          <select
            value={order.orderStatus ?? "pending"}
            disabled={pending}
            onChange={(e) => run(() => setOrderLifecycle(order.id, e.target.value as OrderLifecycle))}
            className={cn(
              "cursor-pointer appearance-none rounded-full border px-3 py-1.5 text-[11px] font-extrabold outline-none transition",
              (order.orderStatus ?? "pending") === "approved" ||
                (order.orderStatus ?? "pending") === "delivered"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : (order.orderStatus ?? "pending") === "cancelled"
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-gold-400 bg-gold-50 text-gold-700",
            )}
          >
            {ORDER_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </span>
      </div>

      {msg && <p className="text-[11px] font-bold text-red-600">{msg}</p>}

      {order.rejectionReason && (
        <p className="text-[11px] leading-5 text-zinc-500">
          دلیل رد قبلی: <span className="font-bold text-red-600">{order.rejectionReason}</span>
        </p>
      )}
    </div>
  );
}
