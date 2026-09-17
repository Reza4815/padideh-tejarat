"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  LogIn,
  LogOut,
  Package,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MeUser = { id: number; phone: string; name: string | null };

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!mounted) return;
        if (res.ok) {
          const data = (await res.json()) as { user?: MeUser };
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  // در حال بارگذاری یا مهمان → دکمه ورود / ثبت‌نام
  if (user === undefined || user === null) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-500 px-4 py-2.5 text-[12px] font-extrabold text-white shadow-[0_8px_24px_-8px_rgba(207,163,56,0.7)] transition-all hover:bg-gold-400 active:scale-95"
      >
        {user === undefined ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4 shrink-0" />
        )}
        <span>ورود / ثبت‌نام</span>
      </Link>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 py-1 pl-1 pr-2.5 transition hover:border-gold-400 dark:border-zinc-700 dark:hover:border-gold-500"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="منوی حساب کاربری"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-zinc-950 shadow-[0_6px_14px_-6px_rgba(207,163,56,0.9)]">
          <User className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 dark:text-zinc-400",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute left-1/2 top-full z-[999] mt-2 w-[calc(100vw-2rem)] max-w-[280px] -translate-x-1/2 origin-top overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl transition-all duration-200 sm:left-auto sm:right-0 sm:w-60 sm:translate-x-0 dark:border-zinc-700 dark:bg-zinc-900",
          open
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0",
        )}
      >
        <div className="px-4 py-3">
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
            حساب کاربری
          </p>
          <p
            className="mt-0.5 text-[13px] font-black text-ink-950 tnum dark:text-zinc-100"
            dir="ltr"
          >
            {user.phone}
          </p>
          {user.name ? (
            <p className="mt-0.5 truncate text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              {user.name}
            </p>
          ) : null}
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800" />

        <Link
          href="/account"
          onClick={() => setOpen(false)}
          role="menuitem"
          className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-zinc-700 transition hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-gold-400"
        >
          <User className="h-4 w-4" />
          پنل کاربری
        </Link>
        <Link
          href="/account?tab=orders"
          onClick={() => setOpen(false)}
          role="menuitem"
          className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-zinc-700 transition hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-gold-400"
        >
          <Package className="h-4 w-4" />
          سفارش‌های من
        </Link>

        <div className="border-t border-zinc-100 dark:border-zinc-800" />

        <button
          type="button"
          onClick={logout}
          role="menuitem"
          className="flex w-full items-center gap-2 px-4 py-3 text-[12px] font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
