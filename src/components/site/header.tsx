"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Clock, Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/products" },
  { label: "عمده‌فروشی", href: "/#wholesale" },
  { label: "درباره ما", href: "/#about" },
  { label: "تماس با ما", href: "/#contact" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_8px_20px_-8px_rgba(207,163,56,0.8)]">
        <svg
          viewBox="0 0 24 24"
          className="h-5.5 w-5.5 text-zinc-950"
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
        <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-gold-500 dark:border-zinc-900" />
      </span>
      {!compact && (
        <span className="leading-tight">
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
      )}
    </span>
  );
}
export function Header({ phone, hours }: { phone: string; hours: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, setOpen, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-[60]">
        {/* top strip */}
        <div className="border-b border-gold-100 bg-gold-50/80 backdrop-blur">
          <div className="container-x flex h-8 items-center justify-between text-[11px] font-bold text-gold-800">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              <span className="tnum">{phone}</span>
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Clock className="h-3 w-3" />
              {hours}
            </span>
            <span className="hidden md:block">
              ضمانت اصالت کالا • ارسال سراسری
            </span>
          </div>
        </div>

        {/* main bar */}
        <div
          className={cn(
            "border-b border-zinc-100 bg-white/85 backdrop-blur-xl transition-shadow",
            scrolled && "shadow-[0_16px_40px_-24px_rgba(16,16,20,0.25)]",
          )}
        >
          <div className="container-x flex h-16 items-center justify-between gap-3">
            <Link href="/" aria-label="پدیده تجارت الوند">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => {
                const active =
                  item.href === "/products"
                    ? pathname.startsWith("/products")
                    : pathname === "/" && item.href === "/";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-[13px] font-bold text-zinc-600 transition hover:text-gold-700",
                      active && "text-gold-700",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={() => setSearchOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-gold-400 hover:text-gold-700"
                aria-label="جستجو"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setOpen(true)}
                className="relative grid h-10 w-10 place-items-center rounded-full bg-ink-950 text-white transition hover:bg-zinc-800"
                aria-label="سبد خرید"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {ready && count > 0 && (
                  <span className="absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-black text-zinc-950 tnum">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-gold-400 lg:hidden"
                aria-label="منو"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* mobile menu */}
          <div
            className={cn(
              "overflow-hidden border-zinc-100 transition-all duration-500 lg:hidden",
              menuOpen ? "max-h-96 border-t" : "max-h-0",
            )}
          >
            <nav className="container-x flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-gold-50 hover:text-gold-700"
                >
                  {item.label}
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={(q) => {
          setSearchOpen(false);
          router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
        }}
      />
    </>
  );
}

function SearchOverlay({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] transition-all duration-300",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div
        className="absolute inset-0 bg-white/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="container-x relative pt-24 sm:pt-32">
        <button
          onClick={onClose}
          className="absolute left-4 top-8 grid h-11 w-11 place-items-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-gold-400 hover:text-gold-700 sm:left-8"
          aria-label="بستن جستجو"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="mb-4 text-xs font-extrabold tracking-wide text-gold-600">
          جستجو در فروشگاه
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(q.trim());
          }}
          className="flex items-center gap-3 border-b-2 border-ink-950 pb-4"
        >
          <Search className="h-6 w-6 shrink-0 text-gold-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام قطعه، برند یا کد OEM ..."
            className="w-full bg-transparent text-xl font-extrabold text-ink-950 outline-none placeholder:text-zinc-300 sm:text-3xl"
          />
        </form>
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "دیسک ترمز",
            "لنت ترمز",
            "کمک‌فنر",
            "Brembo",
            "شمع",
            "فیلتر روغن",
          ].map((s) => (
            <button
              key={s}
              onClick={() => onSubmit(s)}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-600 transition hover:border-gold-400 hover:text-gold-700"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
