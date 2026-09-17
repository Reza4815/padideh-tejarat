"use client";

import { useState, type ReactNode } from "react";
import { MapPin, ReceiptText, ShoppingBag } from "lucide-react";
import { cn, toFaDigits } from "@/lib/utils";

export type UserDetailTab = "orders" | "payments" | "addresses";

const TABS: { key: UserDetailTab; label: string; icon: typeof ShoppingBag }[] = [
  { key: "orders", label: "سفارش‌ها", icon: ShoppingBag },
  { key: "payments", label: "خلاصه پرداخت", icon: ReceiptText },
  { key: "addresses", label: "آدرس‌ها", icon: MapPin },
];

export function UserDetailTabs({
  ordersCount = 0,
  addressesCount = 0,
  orders,
  payments,
  addresses,
}: {
  ordersCount?: number;
  addressesCount?: number;
  orders: ReactNode;
  payments: ReactNode;
  addresses: ReactNode;
}) {
  const [tab, setTab] = useState<UserDetailTab>("orders");

  const countFor = (key: UserDetailTab) =>
    key === "orders" ? ordersCount : key === "addresses" ? addressesCount : 0;

  return (
    <div className="space-y-6">
      <div className="mx-auto grid w-full max-w-[600px] grid-cols-3 gap-1 rounded-2xl border border-zinc-100 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = countFor(t.key);
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-extrabold transition-all duration-200",
                active
                  ? "bg-gold-500 text-white shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)]"
                  : "text-zinc-500 hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gold-400",
              )}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-black tnum",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
                  )}
                >
                  {toFaDigits(count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "orders" ? orders : tab === "payments" ? payments : addresses}
      </div>
    </div>
  );
}