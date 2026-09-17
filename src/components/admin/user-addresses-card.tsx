"use client";

import { MapPin } from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { toFaDigits } from "@/lib/utils";

export function UserAddressesCard({ addresses }: { addresses: OrderRow[] }) {
  if (addresses.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 bg-white py-10 text-center text-[13px] font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        آدرسی ثبت نشده است
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {addresses.map((o) => (
        <li
          key={o.id}
          className="rounded-xl border border-zinc-100 bg-white p-4 transition-all duration-200 hover:border-gold-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold-700/50"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40 dark:text-gold-400">
              <MapPin className="h-4 w-4" />
            </span>
            <p className="text-[13px] font-black text-ink-950 dark:text-zinc-100">
              {o.province || "—"}
              {o.city ? ` • ${o.city}` : ""}
            </p>
          </div>

          <p className="mt-3 text-[12px] leading-6 text-zinc-600 dark:text-zinc-300">
            {o.address || "—"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-zinc-400 tnum">
            <span>
              کد پستی:{" "}
              <span dir="ltr" className="font-mono">
                {o.postalCode || "—"}
              </span>
            </span>
            {o.plateNumber ? <span>پلاک: {o.plateNumber}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}