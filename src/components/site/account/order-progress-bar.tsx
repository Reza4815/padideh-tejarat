"use client";

import { Check, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderLifecycle, PaymentMethod } from "@/lib/payment";
import { OrderTimeline } from "@/components/site/order-timeline";

const STEPS = [
  "ثبت سفارش",
  "تأیید پرداخت",
  "آمادهسازی",
  "ارسال",
  "تحویل",
] as const;

const STATUS_STEP: Record<OrderLifecycle, number> = {
  pending: 0,
  awaiting_review: 0,
  approved: 1,
  preparing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderProgressBar({
  status,
  paymentMethod,
}: {
  status: OrderLifecycle;
  paymentMethod: PaymentMethod;
}) {
  if (status === "cancelled") {
    return (
      <>
        <div className="hidden items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3.5 sm:flex dark:border-red-900/50 dark:bg-red-950/30">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500 text-white">
            <XCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black text-red-700 dark:text-red-300">
              سفارش لغو شده است
            </p>
            <p className="mt-0.5 text-[11px] text-red-500 dark:text-red-400">
              برای اطلاعات بیشتر با پشتیبانی در تماس باشید
            </p>
          </div>
        </div>
        <div className="sm:hidden">
          <OrderTimeline status={status} paymentMethod={paymentMethod} />
        </div>
      </>
    );
  }

  const current = STATUS_STEP[status];

  return (
    <>
      {/* نسخه دسکتاپ: نوار افقی */}
      <div className="hidden sm:block">
        <ol className="flex items-start">
          {STEPS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="relative flex flex-1 flex-col items-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-1/2 top-[15px] h-0.5 w-full -translate-x-1/2",
                      i <= current ? "bg-gold-500" : "bg-zinc-200 dark:bg-zinc-700",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 transition",
                    done
                      ? "border-gold-500 bg-gold-500 text-white"
                      : active
                        ? "border-gold-500 bg-white text-gold-600 shadow-[0_0_0_4px_rgba(207,163,56,0.18)] dark:bg-zinc-900 dark:text-gold-400"
                        : "border-zinc-200 bg-white text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600",
                    active && "animate-pulse",
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : active ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 text-center text-[11px] font-extrabold",
                    done || active
                      ? "text-ink-950 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* نسخه موبایل: تایم‌لاین عمودی موجود */}
      <div className="sm:hidden">
        <OrderTimeline status={status} paymentMethod={paymentMethod} />
      </div>
    </>
  );
}