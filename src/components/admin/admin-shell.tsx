"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/header";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { PaletteToggle } from "@/components/admin/palette-toggle"; // ← اضافه شد
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/content", label: "محتوای سایت", icon: FileText },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { href: "/admin/inquiries", label: "استعلام‌های عمده", icon: ClipboardList },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-extrabold transition",
              active
                ? "bg-gold-500 text-zinc-950 shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)]"
                : "text-zinc-500 hover:bg-gold-50 hover:text-gold-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gold-400",
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 flex-col border-l border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-5 dark:border-zinc-800">
          <Logo />
        </div>
        {navContent}
        <div className="space-y-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
          {/* دکمه پالت — فقط تو پنل ادمین */}
          <PaletteToggle />
          <a
            href="/api/admin/logout"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-extrabold text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <LogOut className="h-4.5 w-4.5" />
            خروج از حساب
          </a>
        </div>
      </aside>

      {/* mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink-950/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 right-0 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-900",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Logo compact />
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-500 dark:text-zinc-400"
              aria-label="بستن منو"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {navContent}
          <div className="space-y-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
            {/* دکمه پالت — نسخه موبایل */}
            <PaletteToggle />
            <a
              href="/api/admin/logout"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-extrabold text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <LogOut className="h-4.5 w-4.5" />
              خروج از حساب
            </a>
          </div>
        </aside>
      </div>

      {/* content */}
      <div className="lg:mr-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/85">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 text-zinc-600 lg:hidden dark:border-zinc-700 dark:text-zinc-300"
              aria-label="منو"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-black text-ink-950 dark:text-zinc-100">
                پنل مدیریت
              </p>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                خوش آمدید،{" "}
                <span className="text-gold-700 dark:text-gold-400" dir="ltr">
                  {username}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="btn-outline px-4 py-2 text-[11px]"
            >
              <Store className="h-3.5 w-3.5" />
              مشاهده فروشگاه
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
