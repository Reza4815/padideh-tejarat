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
      className="mx-auto w-full max-w-xs sm:max-w-sm"
    >
      <div className="relative flex items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50/80 p-1 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
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
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-extrabold transition-all duration-300 sm:text-[12px]",
                active
                  ? "bg-gold-500 text-white shadow-[0_8px_20px_-8px_rgba(207,163,56,0.8)]"
                  : "text-zinc-500 hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              )}
            >
              <t.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              <span className="whitespace-nowrap">{t.label}</span>
              {t.key === "orders" && ordersCount > 0 && (
                <span
                  className={cn(
                    "grid h-4 min-w-4 shrink-0 place-items-center rounded-full px-1 text-[9px] font-black tnum",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-gold-500/15 text-gold-600 dark:bg-gold-500/25 dark:text-gold-400",
                  )}
                >
                  {toFaDigits(ordersCount)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
