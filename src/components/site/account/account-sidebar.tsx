"use client";

import {
  ChevronLeft,
  Headphones,
  LogOut,
  Package,
  Phone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountTab = "profile" | "orders";

export function AccountSidebar({
  user,
  tab,
  onTabChange,
  onLogout,
}: {
  user: { phone: string; name?: string | null };
  tab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  onLogout: () => void;
}) {
  const initials = user.name?.trim()
    ? user.name.trim()[0]
    : user.phone.slice(-2);

  const items: {
    key: AccountTab;
    label: string;
    icon: typeof User;
  }[] = [
    { key: "orders", label: "سفارش‌های من", icon: Package },
    { key: "profile", label: "اطلاعات حساب", icon: User },
  ];

  return (
    <aside className="sticky top-24 space-y-2.5">
      {/* کارت کاربر */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* کاربر */}
        <div className="flex items-center gap-2.5 bg-gradient-to-br from-gold-500/10 via-gold-500/5 to-transparent p-3 dark:from-gold-500/15 dark:via-gold-500/5">
          <div className="relative shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-[13px] font-black text-zinc-950 shadow-[0_6px_16px_-6px_rgba(207,163,56,0.9)]">
              {initials}
            </span>
            <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-black text-ink-950 dark:text-zinc-100">
              {user.name?.trim() || "کاربر پدیده"}
            </p>
            <p
              className="mt-0.5 text-[10.5px] font-bold text-zinc-400 tnum"
              dir="ltr"
            >
              {user.phone}
            </p>
          </div>
        </div>

        {/* جداکننده */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* منو */}
        <nav className="p-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right text-[11.5px] font-bold transition-all duration-200",
                  active
                    ? "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-md transition-all",
                    active
                      ? "bg-gold-500 text-white"
                      : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700",
                  )}
                >
                  <Icon className="h-3 w-3" strokeWidth={2.5} />
                </span>

                <span className="flex-1 text-right">{item.label}</span>

                <ChevronLeft
                  className={cn(
                    "h-3 w-3 shrink-0 transition-transform",
                    active
                      ? "text-gold-600 dark:text-gold-400"
                      : "text-zinc-300 group-hover:-translate-x-0.5 dark:text-zinc-600",
                  )}
                />
              </button>
            );
          })}

          <div className="my-1.5 border-t border-dashed border-zinc-100 dark:border-zinc-800" />

          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right text-[11.5px] font-bold text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
              <LogOut className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="flex-1 text-right">خروج از حساب</span>
          </button>
        </nav>
      </div>

      {/* کارت پشتیبانی */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-gradient-to-br from-gold-50 via-white to-white p-3 dark:border-zinc-800 dark:from-gold-500/10 dark:via-zinc-900 dark:to-zinc-900">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold-500 text-white">
            <Headphones className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-ink-950 dark:text-zinc-100">
              پشتیبانی
            </p>
            <p className="mt-0.5 text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400">
              ۲۴ ساعته
            </p>
          </div>
        </div>

        <a
          href="tel:02133901234"
          className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-zinc-700 transition hover:border-gold-400 hover:text-gold-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-gold-500 dark:hover:text-gold-400"
          dir="ltr"
        >
          <Phone className="h-2.5 w-2.5" />
          ۰۲۱-۳۳۹۰۱۲۳۴
        </a>
      </div>
    </aside>
  );
}
