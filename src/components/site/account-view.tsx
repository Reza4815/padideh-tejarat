"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Package,
  Save,
  ShoppingBag,
  User,
} from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { cn } from "@/lib/utils";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payment";

type PublicUser = {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
};

export function AccountView({
  user,
  orders,
}: {
  user: PublicUser;
  orders: OrderRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold tracking-wider text-gold-600">
          حساب کاربری
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-950 sm:text-3xl dark:text-zinc-100">
          <span className="tnum" dir="ltr">
            {user.phone}
          </span>
        </h1>
      </header>

      {/* تب‌ها */}
      <div
        className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-zinc-100 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900"
        role="tablist"
      >
        {(
          [
            { key: "profile", label: "پروفایل", icon: User },
            { key: "orders", label: "سفارش‌های من", icon: ShoppingBag },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold transition",
              tab === t.key
                ? "bg-gold-500 text-zinc-950 shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)]"
                : "text-zinc-500 hover:text-gold-700 dark:text-zinc-400 dark:hover:text-gold-400",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.key === "orders" && orders.length > 0 && (
              <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-black tnum">
                {toFaDigits(orders.length)}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form
          onSubmit={saveProfile}
          className="overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">
              اطلاعات پروفایل
            </h2>
          </div>
          <div className="space-y-3.5 p-4 sm:p-5">
            <div>
              <label className="label">شماره موبایل (غیرقابل تغییر)</label>
              <input
                value={user.phone}
                disabled
                className="field tnum opacity-60"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>
            <div>
              <label className="label">نام و نام خانوادگی</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام شما"
                className="field"
                maxLength={100}
              />
            </div>
            <div>
              <label className="label">ایمیل (اختیاری)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field"
                dir="ltr"
                style={{ textAlign: "right" }}
                inputMode="email"
              />
            </div>
            <p className="text-[11px] text-zinc-400 tnum">
              عضویت: {formatDateTime(user.createdAt)}
            </p>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                تغییرات ذخیره شد
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="btn-gold flex-1 py-3 text-xs"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                ذخیره تغییرات
              </button>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-6 py-3 text-xs font-extrabold text-red-600 transition hover:bg-red-50 active:scale-[0.98] dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                خروج از حساب
              </button>
            </div>
          </div>
        </form>
      )}

      {tab === "orders" && (
        <section className="space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Package className="h-8 w-8 text-gold-300" />
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                هنوز سفارشی ثبت نکرده‌اید
              </p>
              <Link href="/products" className="btn-gold mt-1 py-2.5 text-xs">
                رفتن به فروشگاه
              </Link>
            </div>
          ) : (
            orders.map((o) => {
              const pm = (o.paymentMethod as PaymentMethod) ?? "online";
              const ps = (o.paymentStatus as PaymentStatus) ?? "pending";
              return (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="block rounded-2xl border border-zinc-100 bg-white p-4 transition hover:border-gold-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold-700/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="font-mono text-[12px] font-extrabold text-gold-700 dark:text-gold-400"
                      dir="ltr"
                    >
                      {o.trackingCode ?? o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-zinc-400 tnum">
                      {formatDateTime(o.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-extrabold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {PAYMENT_METHOD_LABEL[pm] ?? pm}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-extrabold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {PAYMENT_STATUS_LABEL[ps] ?? ps}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] font-black text-ink-950 tnum dark:text-zinc-100">
                    {formatPrice(o.total)}{" "}
                    <span className="text-[10px] font-bold text-zinc-400">
                      تومان
                    </span>
                  </p>
                </Link>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
