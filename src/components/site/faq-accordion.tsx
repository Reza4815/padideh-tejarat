"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/content";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
              open ? "border-gold-300 shadow-[0_18px_40px_-24px_rgba(120,84,39,0.3)]" : "border-zinc-100",
            )}
          >
            <button
              onClick={() => setOpenIdx(open ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-black transition tnum",
                    open ? "bg-gold-500 text-zinc-950" : "bg-gold-50 text-gold-600",
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn("text-sm font-extrabold sm:text-[15px]", open ? "text-ink-950" : "text-zinc-700")}>
                  {item.q}
                </span>
              </span>
              <Plus
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-transform duration-300",
                  open ? "rotate-45 text-gold-600" : "text-zinc-400",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)]",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 pr-15 text-[13px] leading-7 text-zinc-500">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
