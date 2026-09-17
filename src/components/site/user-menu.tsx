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
  UserRound,
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
        className="hidden items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2.5 text-[12px] font-extrabold text-zinc-700 transition hover:border-gold-400 hover:text-gold-700 sm:inline-flex dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-gold-500 dark:hover:text-gold-400"
      >
        {user === undefined ? (
          <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        ورود / ثبت‌نام
      </Link>
    );
  }

  return (
    <div ref={boxRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-4 py-2.5 text-[12px] font-extrabold text-gold-800 transition hover:border-gold-400 dark:border-gold-700/60 dark:bg-gold-950/40 dark:text-gold-300"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserRound className="h-4 w-4" />
        <span className="tnum" dir="ltr">
          {user.phone}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full z-[70] mt-2 w-48 origin-top overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900",
          open
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0",
        )}
        role="menu"
      >
        <Link
          href="/account"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-zinc-700 transition hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-gold-400"
          role="menuitem"
        >
          <User className="h-4 w-4" />
          حساب کاربری
        </Link>
        <Link
          href="/account"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-zinc-700 transition hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-gold-400"
          role="menuitem"
        >
          <Package className="h-4 w-4" />
          سفارش‌های من
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-3 text-[12px] font-bold text-red-600 transition hover:bg-red-50 dark:border-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"
          role="menuitem"
        >
          <LogOut className="h-4 w-4" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
