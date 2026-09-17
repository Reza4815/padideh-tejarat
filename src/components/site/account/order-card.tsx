"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, Package } from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { cn, formatDateTime, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL, type OrderLifecycle } from "@/lib/payment";

const BADGE: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  awaiting_review:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  approved: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  preparing:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  shipped:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = ORDER_STATUS_LABEL[status as OrderLifecycle] ?? status;
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
        BADGE[status] ?? BADGE.pending,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function OrderCard({
  order,
  image,
}: {
  order: OrderRow;
  image?: string;
}) {
  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-[0_20px_40px_-26px_rgba(120,84,39,0.5)] sm:gap-4 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold-700/50"
    >
      <span className="grid h-[60px] w-[60px] shrink-0 place-items-center overflow-hidden rounded-lg border border-zinc-100 bg-gold-50/60 dark:border-zinc-800 dark:bg-zinc-800">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package className="h-6 w-6 text-gold-400" />
        )}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="font-mono text-[11px] font-extrabold tracking-wide text-gold-700 tnum dark:text-gold-400"
            dir="ltr"
          >
            {order.trackingCode ?? order.id.slice(0, 8).toUpperCase()}
          </span>
          <StatusBadge status={order.orderStatus} />
        </div>

        <p className="mt-1.5 text-lg font-black text-gold-700 tnum dark:text-gold-400">
          {formatPrice(order.total)}
          <span className="mr-1 text-[10px] font-bold text-zinc-400">تومان</span>
        </p>

        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 tnum dark:text-zinc-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDateTime(order.createdAt)}
        </p>
      </div>

      <ChevronLeft className="h-5 w-5 shrink-0 text-zinc-300 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:text-gold-600 dark:text-zinc-600 dark:group-hover:text-gold-400" />
    </Link>
  );
}