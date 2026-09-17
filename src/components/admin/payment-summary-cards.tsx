"use client";

import {
  Clock,
  CreditCard,
  Landmark,
  ReceiptText,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn, formatPrice, toFaDigits } from "@/lib/utils";

export type PaymentSummaryItem = {
  count: number;
  total: number;
};

export function PaymentSummaryCards({
  onlineOk,
  cardOk,
  rejected,
  pending,
}: {
  onlineOk: PaymentSummaryItem;
  cardOk: PaymentSummaryItem;
  rejected: PaymentSummaryItem;
  pending: PaymentSummaryItem;
}) {
  const cards: {
    key: string;
    label: string;
    icon: LucideIcon;
    count: number;
    total?: number;
    tone: "green" | "red" | "amber";
  }[] = [
    {
      key: "online",
      label: "پرداخت آنلاین موفق",
      icon: Wallet,
      count: onlineOk.count,
      total: onlineOk.total,
      tone: "green",
    },
    {
      key: "card",
      label: "کارت به کارت تأییدشده",
      icon: Landmark,
      count: cardOk.count,
      total: cardOk.total,
      tone: "green",
    },
    {
      key: "rejected",
      label: "کارت به کارت رد شده",
      icon: ReceiptText,
      count: rejected.count,
      tone: "red",
    },
    {
      key: "pending",
      label: "در انتظار تأیید",
      icon: Clock,
      count: pending.count,
      total: pending.total,
      tone: "amber",
    },
  ];

  const toneRing: Record<string, string> = {
    green: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/25",
    red: "border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/25",
    amber: "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/25",
  };
  const toneIcon: Record<string, string> = {
    green: "bg-emerald-500 text-white",
    red: "bg-red-500 text-white",
    amber: "bg-amber-500 text-white",
  };
  const toneValue: Record<string, string> = {
    green: "text-emerald-700 dark:text-emerald-300",
    red: "text-red-600 dark:text-red-300",
    amber: "text-amber-700 dark:text-amber-300",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.key}
          className={cn(
            "rounded-xl border p-4 transition-all duration-200",
            toneRing[c.tone],
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                toneIcon[c.tone],
              )}
            >
              <c.icon className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400">
              {c.label}
            </p>
          </div>
          <p className={cn("mt-3 text-2xl font-black tnum", toneValue[c.tone])}>
            {toFaDigits(c.count)}
            <span className="mr-1 text-[11px] font-bold text-zinc-400">
              سفارش
            </span>
          </p>
          {typeof c.total === "number" ? (
            <p className="mt-1 text-[12px] font-extrabold text-zinc-600 tnum dark:text-zinc-300">
              {formatPrice(c.total)}{" "}
              <span className="text-[10px] font-bold text-zinc-400">تومان</span>
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-zinc-400">
              <CreditCard className="h-3 w-3" />
              بدون مبلغ تأییدشده
            </p>
          )}
        </div>
      ))}
    </div>
  );
}