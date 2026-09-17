"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  LogOut,
  Package,
  Save,
  User,
} from "lucide-react";
import type { OrderRow } from "@/db/schema";
import {
  AccountSidebar,
  type AccountTab,
} from "@/components/site/account/account-sidebar";
import { OrderCard } from "@/components/site/account/order-card";
import { EmptyOrders } from "@/components/site/account/empty-orders";
import { ConfirmLogoutModal } from "@/components/site/account/confirm-logout-modal";
import { cn } from "@/lib/utils";

type AccountUser = {
  id: number;
  phone: string;
  name?: string | null;
  email?: string | null;
  createdAt?: string | Date | null;
};

export function AccountView({
  user,
  orders,
  initialTab = "orders",
}: {
  user: AccountUser;
  orders: OrderRow[];
  initialTab?: AccountTab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<AccountTab>(initialTab);
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  const productIds = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) {
      const first = o.items?.[0]?.productId;
      if (first) set.add(first);
    }
    return [...set];
  }, [orders]);

  useEffect(() => {
    if (productIds.length === 0) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        });
        const data = (await res.json()) as {
          prices?: { id: string; images?: string[] }[];
        };
        if (!mounted) return;
        const map: Record<string, string> = {};
        for (const p of data.prices ?? []) {
          if (p.images?.[0]) map[p.id] = p.images[0];
        }
        setImages(map);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productIds]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(data.error ?? "ذخیره ناموفق بود");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.replace("/");
    router.refresh();
  }

  const initials = user.name?.trim()
    ? user.name.trim()[0]
    : user.phone.slice(-2);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
      {/* دکمه بازگشت — دسکتاپ */}
      <div className="mb-5 hidden lg:block">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[12.5px] font-bold text-zinc-500 transition-colors hover:text-gold-600 dark:text-zinc-400 dark:hover:text-gold-400"
        >
          <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          بازگشت به فروشگاه
        </Link>
      </div>

      {/* ====== موبایل: کارت کاربر + تب‌ها ====== */}
      <div className="lg:hidden">
        {/* کارت کاربر */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-base font-black text-zinc-950 shadow-[0_8px_20px_-8px_rgba(207,163,56,0.9)]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-black text-ink-950 dark:text-zinc-100">
              {user.name?.trim() || "کاربر پدیده"}
            </p>
            <p
              className="mt-0.5 text-[11px] font-bold text-zinc-400 tnum"
              dir="ltr"
            >
              {user.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="خروج از حساب"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 active:scale-95 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* تب‌های افقی */}
        <div className="mb-4 flex gap-2 rounded-full border border-zinc-100 bg-zinc-50/80 p-1 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
          {[
            { key: "profile" as const, label: "اطلاعات حساب", icon: User },
            { key: "orders" as const, label: "سفارش‌ها", icon: Package },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[11.5px] font-extrabold transition-all duration-300",
                  active
                    ? "bg-gold-500 text-white shadow-[0_8px_20px_-8px_rgba(207,163,56,0.8)]"
                    : "text-zinc-500 hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-800",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                <span className="whitespace-nowrap">{t.label}</span>
                {t.key === "orders" && orders.length > 0 && (
                  <span
                    className={cn(
                      "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-black tnum",
                      active
                        ? "bg-white/25 text-white"
                        : "bg-gold-500/15 text-gold-600 dark:bg-gold-500/25 dark:text-gold-400",
                    )}
                  >
                    {orders.length.toLocaleString("fa-IR")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====== گرید دسکتاپ + محتوا ====== */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        {/* سایدبار — فقط دسکتاپ */}
        <div className="hidden lg:block">
          <AccountSidebar
            user={user}
            tab={tab}
            onTabChange={setTab}
            onLogout={() => setConfirmOpen(true)}
          />
        </div>

        {/* محتوا */}
        <main className="min-w-0">
          {/* سفارش‌ها */}
          {tab === "orders" && (
            <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white lg:rounded-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <h1 className="text-sm font-black text-ink-950 dark:text-zinc-100">
                  تاریخچه سفارشات
                </h1>
                <p className="mt-1 text-[11px] font-bold text-zinc-400">
                  {orders.length > 0
                    ? `${orders.length.toLocaleString("fa-IR")} سفارش`
                    : "هنوز سفارشی ثبت نکرده‌اید"}
                </p>
              </div>
              <div className="p-4 lg:p-5">
                {orders.length === 0 ? (
                  <EmptyOrders />
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => {
                      const first = o.items?.[0]?.productId;
                      const image = first ? images[first] : undefined;
                      return <OrderCard key={o.id} order={o} image={image} />;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* پروفایل */}
          {tab === "profile" && (
            <form
              onSubmit={saveProfile}
              className="overflow-hidden rounded-2xl border border-zinc-100 bg-white lg:rounded-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <h1 className="text-sm font-black text-ink-950 dark:text-zinc-100">
                  اطلاعات حساب کاربری
                </h1>
                <p className="mt-1 text-[11px] font-bold text-zinc-400">
                  اطلاعات خود را ویرایش کنید
                </p>
              </div>

              <div className="space-y-4 p-4 lg:p-5">
                <div>
                  <label className="label flex items-center gap-2">
                    شماره موبایل
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-extrabold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      <BadgeCheck className="h-3 w-3" />
                      غیرقابل تغییر
                    </span>
                  </label>
                  <input
                    value={user.phone}
                    disabled
                    className="field h-11 tnum opacity-60"
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  />
                </div>

                <div>
                  <label htmlFor="profile-name" className="label">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام شما"
                    className="field h-11"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" className="label">
                    ایمیل (اختیاری)
                  </label>
                  <input
                    id="profile-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="field h-11"
                    dir="ltr"
                    style={{ textAlign: "right" }}
                    inputMode="email"
                  />
                </div>

                {error && (
                  <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-[12px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}
                {saved && (
                  <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[12px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    تغییرات ذخیره شد
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gold h-11 w-full py-3 text-xs sm:w-auto sm:px-8"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      <ConfirmLogoutModal
        open={confirmOpen}
        loading={loggingOut}
        onClose={() => setConfirmOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
}
