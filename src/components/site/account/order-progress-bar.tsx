"use client";

import {
  Check,
  ClipboardList,
  CreditCard,
  Package,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderLifecycle, PaymentMethod } from "@/lib/payment";
import { OrderTimeline } from "@/components/site/order-timeline";

const STEPS = [
  { label: "ثبت سفارش", icon: ClipboardList },
  { label: "تأیید پرداخت", icon: CreditCard },
  { label: "آماده‌سازی", icon: Package },
  { label: "ارسال", icon: Truck },
  { label: "تحویل", icon: PackageCheck },
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
  const progressPercent = (current / (STEPS.length - 1)) * 100;

  return (
    <>
      {/* نسخه دسکتاپ: نوار افقی */}
      <div className="hidden sm:block">
        <div className="relative px-4">
          {/* نوار پس‌زمینه */}
          <div
            aria-hidden
            className="absolute right-[10%] left-[10%] top-7 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
          />

          {/* نوار پیشرفت */}
          <div
            aria-hidden
            className="absolute right-[10%] top-7 h-1.5 rounded-full bg-gradient-to-l from-gold-300 via-gold-500 to-gold-600 shadow-[0_0_12px_rgba(207,163,56,0.5)] transition-all duration-700 ease-out"
            style={{ width: `calc(${progressPercent}% * 0.8 + 10%)` }}
          />

          <ol className="relative flex items-start justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i < current;
              const active = i === current;
              const pending = i > current;

              return (
                <li
                  key={step.label}
                  className="relative flex flex-1 flex-col items-center"
                >
                  {/* دایره */}
                  <span
                    className={cn(
                      "relative z-10 grid h-14 w-14 place-items-center rounded-full border-2 transition-all duration-500",
                      done &&
                        "border-gold-500 bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-[0_8px_20px_-8px_rgba(207,163,56,0.9)]",
                      active &&
                        "border-gold-500 bg-white text-gold-600 shadow-[0_0_0_8px_rgba(207,163,56,0.15),0_8px_20px_-8px_rgba(207,163,56,0.6)] dark:bg-zinc-900 dark:text-gold-400",
                      pending &&
                        "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500",
                    )}
                  >
                    {/* حلقه پالس برای مرحله فعلی */}
                    {active && (
                      <span className="absolute inset-0 animate-ping rounded-full border-2 border-gold-500/40" />
                    )}

                    {done ? (
                      <Check className="h-6 w-6" strokeWidth={3} />
                    ) : (
                      <Icon className="h-6 w-6" strokeWidth={2.2} />
                    )}
                  </span>

                  {/* برچسب */}
                  <span
                    className={cn(
                      "mt-3 text-center text-xs font-extrabold transition-colors duration-300",
                      done && "text-gold-600 dark:text-gold-400",
                      active && "text-ink-950 dark:text-zinc-100",
                      pending && "text-zinc-400 dark:text-zinc-500",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* نسخه موبایل: تایم‌لاین عمودی موجود */}
      <div className="sm:hidden">
        <OrderTimeline status={status} paymentMethod={paymentMethod} />
      </div>
    </>
  );
}
