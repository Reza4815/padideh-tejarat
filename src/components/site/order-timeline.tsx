"use client";

import {
  BadgeCheck,
  Check,
  Circle,
  ClipboardCheck,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABEL, type OrderLifecycle, type PaymentMethod } from "@/lib/payment";

const STAGE_ICON: Record<OrderLifecycle, typeof Check> = {
  pending: ClipboardCheck,
  awaiting_review: ClipboardCheck,
  approved: BadgeCheck,
  preparing: Package,
  shipped: Truck,
  delivered: Check,
  cancelled: XCircle,
};

/** ترتیب خط زمانی؛ مرحله awaiting_review فقط برای کارت‌به‌کارت نمایش داده می‌شود */
function stagesFor(method: PaymentMethod): OrderLifecycle[] {
  const base: OrderLifecycle[] = ["pending"];
  if (method === "card") base.push("awaiting_review");
  base.push("approved", "preparing", "shipped", "delivered");
  return base;
}

const ORDER_INDEX: Record<OrderLifecycle, number> = {
  pending: 0,
  awaiting_review: 1,
  approved: 2,
  preparing: 3,
  shipped: 4,
  delivered: 5,
  cancelled: -1,
};

export function OrderTimeline({
  status,
  paymentMethod,
}: {
  status: OrderLifecycle;
  paymentMethod: PaymentMethod;
}) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3.5 dark:border-red-900/50 dark:bg-red-950/30">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500 text-white">
          <XCircle className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-black text-red-700 dark:text-red-300">سفارش لغو شده است</p>
          <p className="mt-0.5 text-[11px] text-red-500 dark:text-red-400">
            برای اطلاعات بیشتر با پشتیبانی در تماس باشید
          </p>
        </div>
      </div>
    );
  }

  const stages = stagesFor(paymentMethod);
  const currentIdx = ORDER_INDEX[status];

  return (
    <ol className="relative space-y-0 pr-1">
      {stages.map((stage, i) => {
        const done = i < currentIdx || (stage === status && stage === "delivered");
        const active = stage === status;
        const Icon = done ? Check : active ? STAGE_ICON[stage] : Circle;
        const isLast = i === stages.length - 1;
        return (
          <li key={stage} className="relative flex gap-3 pb-6 last:pb-0">
            {/* خط عمودی سمت راست (RTL) */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-[19px] top-10 h-[calc(100%-2rem)] w-0.5 rounded-full",
                  i < currentIdx ? "bg-gold-500" : "bg-zinc-200 dark:bg-zinc-700",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition",
                done
                  ? "border-gold-500 bg-gold-500 text-white shadow-[0_8px_20px_-8px_rgba(207,163,56,0.9)]"
                  : active
                    ? "border-gold-500 bg-white text-gold-600 shadow-md dark:bg-zinc-900 dark:text-gold-400"
                    : "border-zinc-200 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600",
              )}
            >
              <Icon className={done || active ? "h-5 w-5" : "h-4 w-4"} strokeWidth={done ? 3 : 2} />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p
                className={cn(
                  "text-[13px] font-black",
                  done || active ? "text-ink-950 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500",
                )}
              >
                {ORDER_STATUS_LABEL[stage]}
              </p>
              {active && (
                <p className="mt-1 inline-flex rounded-full bg-gold-100 px-2.5 py-0.5 text-[10px] font-extrabold text-gold-700 dark:bg-gold-950/50 dark:text-gold-300">
                  مرحله فعلی
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
