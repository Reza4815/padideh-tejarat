"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  LogOut,
  Save,
} from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { AccountHeader, type AccountUser } from "@/components/site/account/account-header";
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

  // موفقیت: بستن خودکار پس از ۳ ثانیه
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  // تصویر شاخص سفارش‌ها (فقط شناسه محصول در سفارش ذخیره شده است)
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <AccountHeader user={user} />

      <AccountTabs tab={tab} onChange={setTab} ordersCount={orders.length} />

      {tab === "profile" && (
        <form
          onSubmit={saveProfile}
          className="overflow-hidden rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
              اطلاعات پروفایل
            </h2>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
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
                className="field h-12 tnum opacity-60"
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
                className="field h-12"
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
                className="field h-12"
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

            <div className="flex justify-stretch sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-gold h-12 w-full py-3 text-xs sm:w-auto sm:px-8"
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

          <div className="border-t border-zinc-100 p-5 sm:p-6 dark:border-zinc-800">
            <p className="mb-3 text-[11px] font-bold text-zinc-400">
              با خروج، برای مشاهده سفارش‌ها باید دوباره وارد شوید.
            </p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={loggingOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-6 py-3 text-xs font-extrabold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
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
      )}

      {tab === "orders" && (
        <section className="space-y-4">
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