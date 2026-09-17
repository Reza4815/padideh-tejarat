"use client";

import { CalendarDays } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export type AccountUser = {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  createdAt: Date | string;
};

export function AccountHeader({ user }: { user: AccountUser }) {
  const name = user.name?.trim();
  const initial = (name ? name[0] : user.phone.slice(-2)) || "؟";

  return (
    <section className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 transition-all duration-200 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-lg font-black text-zinc-950 shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)] sm:h-16 sm:w-16 sm:text-xl">
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xl font-black tracking-tight text-ink-950 dark:text-zinc-100">
          <span className="tnum" dir="ltr">
            {user.phone}
          </span>
        </p>
        {name ? (
          <p className="mt-0.5 truncate text-sm font-bold text-zinc-500 dark:text-zinc-400">
            {name}
          </p>
        ) : null}
        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 tnum dark:text-zinc-500">
          <CalendarDays className="h-3.5 w-3.5" />
          عضویت از {formatDateTime(user.createdAt)}
        </p>
      </div>
    </section>
  );
}
