"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ClipboardList,
  CreditCard,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderLifecycle, PaymentMethod } from "@/lib/payment";

type StepDef = {
  key: string;
  label: string;
  shortLabel: string;
  icon: typeof Check;
};

const STEPS: StepDef[] = [
  {
    key: "pending",
    label: "ثبت سفارش",
    shortLabel: "ثبت",
    icon: ClipboardList,
  },
  {
    key: "approved",
    label: "تأیید پرداخت",
    shortLabel: "پرداخت",
    icon: CreditCard,
  },
  {
    key: "preparing",
    label: "در حال آماده‌سازی",
    shortLabel: "آماده‌سازی",
    icon: Package,
  },
  { key: "shipped", label: "ارسال شد", shortLabel: "ارسال", icon: Truck },
  {
    key: "delivered",
    label: "تحویل داده شد",
    shortLabel: "تحویل",
    icon: PackageCheck,
  },
];

const STATUS_STEP: Record<OrderLifecycle, number> = {
  pending: 0,
  awaiting_review: 0,
  approved: 1,
  preparing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderTimeline({
  status,
  paymentMethod,
}: {
  status: OrderLifecycle;
  paymentMethod: PaymentMethod;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // لغو شده
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/30">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500 text-white">
            <XCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[12.5px] font-black text-red-700 dark:text-red-300">
              سفارش لغو شده است
            </p>
            <p className="mt-0.5 text-[10.5px] font-bold text-red-500 dark:text-red-400">
              برای اطلاعات بیشتر با پشتیبانی تماس بگیرید
            </p>
          </div>
        </div>
      </div>
    );
  }

  const current = STATUS_STEP[status];
  const progressPercent = (current / (STEPS.length - 1)) * 100;

  // لیبل مخصوص کارت به کارت
  const getStepLabel = (step: StepDef, index: number) => {
    if (
      step.key === "approved" &&
      paymentMethod === "card" &&
      status === "awaiting_review"
    ) {
      return {
        label: "در انتظار تأیید رسید",
        shortLabel: "در انتظار",
      };
    }
    return { label: step.label, shortLabel: step.shortLabel };
  };

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* هدر */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[12.5px] font-black text-ink-950 dark:text-zinc-100">
          وضعیت سفارش
        </h3>
        <span className="rounded-full bg-gold-500/10 px-2.5 py-1 text-[10px] font-black text-gold-600 dark:bg-gold-500/20 dark:text-gold-400">
          {getStepLabel(STEPS[current], current).label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* خط پس‌زمینه */}
        <div className="absolute right-5 left-5 top-[18px] h-1 rounded-full bg-zinc-100 dark:bg-zinc-800" />

        {/* خط پیشرفت */}
        <div
          className="absolute right-5 top-[18px] h-1 rounded-full bg-gradient-to-l from-gold-400 via-gold-500 to-gold-600 shadow-[0_0_12px_rgba(207,163,56,0.5)] transition-all duration-1000 ease-out"
          style={{
            width: mounted
              ? `calc((100% - 40px) * ${progressPercent / 100})`
              : "0%",
          }}
        />

        {/* دایره‌ها */}
        <ol className="relative flex items-start justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < current;
            const active = i === current;
            const pending = i > current;
            const { shortLabel } = getStepLabel(step, i);

            return (
              <li
                key={step.key}
                className="relative z-10 flex flex-col items-center gap-2"
                style={{
                  width: "56px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(4px)",
                  transition: `all 500ms ease-out ${i * 100}ms`,
                }}
              >
                {/* دایره */}
                <span
                  className={cn(
                    "relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all duration-500",
                    done &&
                      "border-gold-500 bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-[0_6px_16px_-6px_rgba(207,163,56,0.9)]",
                    active &&
                      "border-gold-500 bg-white text-gold-600 shadow-[0_0_0_5px_rgba(207,163,56,0.15)] dark:bg-zinc-900 dark:text-gold-400",
                    pending &&
                      "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500",
                  )}
                >
                  {/* حلقه پالس */}
                  {active && (
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-gold-500/40" />
                  )}

                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <Icon
                      className={cn("h-4 w-4", active && "animate-pulse")}
                      strokeWidth={2.5}
                    />
                  )}
                </span>

                {/* برچسب */}
                <span
                  className={cn(
                    "text-center text-[10px] font-extrabold leading-tight transition-colors",
                    done && "text-gold-600 dark:text-gold-400",
                    active && "text-ink-950 dark:text-zinc-100",
                    pending && "text-zinc-400 dark:text-zinc-500",
                  )}
                >
                  {shortLabel}
                </span>

                {/* Badge مرحله فعلی */}
                {active && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold-500/10 px-2 py-0.5 text-[8.5px] font-black text-gold-600 dark:bg-gold-500/20 dark:text-gold-400">
                    ● فعلی
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* درصد پیشرفت */}
      <div className="mt-7 flex items-center justify-between text-[10.5px] font-bold text-zinc-400">
        <span>پیشرفت سفارش</span>
        <span className="text-gold-600 dark:text-gold-400">
          {Math.round(progressPercent)}٪
        </span>
      </div>
    </div>
  );
}
