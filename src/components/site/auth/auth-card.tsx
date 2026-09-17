"use client";

import type { ReactNode } from "react";

function BrandMark() {
  return (
    <span className="flex items-center justify-center gap-2.5">
      <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)]">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-zinc-950"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <path d="M12 4v3.5M12 16.5V20M4 12h3.5M16.5 12H20" />
        </svg>
      </span>
      <span className="text-start leading-tight">
        <span className="block text-[15px] font-black tracking-tight text-ink-950 dark:text-zinc-100">
          پدیده تجارت الوند
        </span>
        <span
          className="block text-[8.5px] font-bold tracking-[0.28em] text-gold-600 dark:text-gold-400"
          dir="ltr"
        >
          PADIDEH TEJARAT ALVAND
        </span>
      </span>
    </span>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-[0_30px_70px_-40px_rgba(120,84,39,0.5)] sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BrandMark />
          <div>
            <h1 className="text-lg font-black text-ink-950 dark:text-zinc-100">
              {title}
            </h1>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {subtitle}
            </p>
          </div>
        </div>
        {children}
      </div>
      {footer ? (
        <div className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {footer}
        </div>
      ) : null}
    </div>
  );
}