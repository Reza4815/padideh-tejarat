"use client";

import { Package, User } from "lucide-react";
import { cn, toFaDigits } from "@/lib/utils";

export type AccountTab = "profile" | "orders";

const TABS: { key: AccountTab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "پروفایل", icon: User },
  { key: "orders", label: "سفارش‌های من", icon: Package },
];

export function AccountTabs({
  tab,
  onChange,
  ordersCount = 0,
}: {
  tab: AccountTab;
  onChange: (tab: AccountTab) => void;
  ordersCount?: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="بخش‌های حساب کاربری"
      className="mx-auto grid w-full max-w-[600px] grid-cols-2 gap-1 rounded-2xl border border-zinc-100 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold transition-all duration-200",
              active
                ? "bg-gold-500 text-white shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)]"
                : "text-zinc-500 hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gold-400",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.key === "orders" && ordersCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-black tnum",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                {toFaDigits(ordersCount)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}