"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Loader2,
  LogOut,
  Package,
  Save,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import type { OrderRow } from "@/db/schema";
import {
  AccountHeader,
  type AccountUser,
} from "@/components/site/account/account-header";
import {
  AccountTabs,
  type AccountTab,
} from "@/components/site/account/account-tabs";
import { OrderCard } from "@/components/site/account/order-card";
import { EmptyOrders } from "@/components/site/account/empty-orders";
import { ConfirmLogoutModal } from "@/components/site/account/confirm-logout-modal";

export function AccountView({
  user,
  orders,
  initialTab = "profile",
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

  // محاسبات خلاصه
  const totalSpent = useMemo(
    () => orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
    [orders],
  );
  const signupDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
      <AccountHeader user={user} />

      <AccountTabs tab={tab} onChange={setTab} ordersCount={orders.length} />

      {/* پروفایل — دو ستونه در دسکتاپ */}
      {tab === "profile" && (
        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {/* ستون اصلی: فرم */}
          <form
            onSubmit={saveProfile}
            className="overflow-hidden rounded-2xl border border-zinc-100 bg-white lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
                اطلاعات پروفایل
              </h2>
              <p className="mt-1 text-[11px] font-bold text-zinc-400">
                اطلاعات حساب خود را ویرایش کنید
              </p>
            </div>

            <div className="space-y-4 p-5">
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

              <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gold h-11 w-full py-3 text-xs"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  ذخیره تغییرات
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-100 p-5 dark:border-zinc-800">
              <p className="mb-3 text-[11px] font-bold text-zinc-400">
                با خروج، برای مشاهده سفارش‌ها باید دوباره وارد شوید.
              </p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={loggingOut}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-6 py-2.5 text-xs font-extrabold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                خروج از حساب
              </button>
            </div>
          </form>

          {/* ستون کناری: خلاصه */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* کارت خلاصه فعالیت */}
            <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <h3 className="text-sm font-black text-ink-950 dark:text-zinc-100">
                  خلاصه فعالیت
                </h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* تاریخ عضویت */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40 dark:text-gold-400">
                    <Calendar className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-zinc-400">
                      تاریخ عضویت
                    </p>
                    <p className="mt-0.5 truncate text-[12px] font-black text-ink-950 dark:text-zinc-100">
                      {signupDate}
                    </p>
                  </div>
                </div>

                {/* تعداد سفارش */}
                <button
                  type="button"
                  onClick={() => setTab("orders")}
                  className="flex w-full items-center gap-3 px-5 py-4 text-right transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40 dark:text-gold-400">
                    <Package className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-zinc-400">
                      تعداد سفارش‌ها
                    </p>
                    <p className="mt-0.5 text-[12px] font-black text-ink-950 dark:text-zinc-100">
                      {orders.length.toLocaleString("fa-IR")} سفارش
                    </p>
                  </div>
                </button>

                {/* مجموع خرید */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40 dark:text-gold-400">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-zinc-400">
                      مجموع خرید
                    </p>
                    <p className="mt-0.5 truncate text-[12px] font-black text-ink-950 tnum dark:text-zinc-100">
                      {totalSpent > 0
                        ? `${totalSpent.toLocaleString("fa-IR")} تومان`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* کارت دعوت به خرید */}
            <div className="overflow-hidden rounded-2xl border border-gold-200/60 bg-gradient-to-br from-gold-50 to-white p-5 dark:border-gold-900/40 dark:from-gold-950/30 dark:to-zinc-900">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500 text-white shadow-[0_8px_20px_-8px_rgba(207,163,56,0.8)]">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-[13px] font-black text-ink-950 dark:text-zinc-100">
                خرید بعدی شما
              </h3>
              <p className="mt-1 text-[11px] font-medium leading-5 text-zinc-500 dark:text-zinc-400">
                قطعات یدکی اصل با ضمانت اصالت و ارسال سراسری
              </p>
              <a
                href="/products"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-[12px] font-extrabold text-white transition hover:bg-gold-400 active:scale-95"
              >
                مشاهده محصولات
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* سفارش‌ها */}
      {tab === "orders" && (
        <section className="space-y-3">
          {orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            orders.map((o) => {
              const first = o.items?.[0]?.productId;
              const image = first ? images[first] : undefined;
              return <OrderCard key={o.id} order={o} image={image} />;
            })
          )}
        </section>
      )}

      <ConfirmLogoutModal
        open={confirmOpen}
        loading={loggingOut}
        onClose={() => setConfirmOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
}
