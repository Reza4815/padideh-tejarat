"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, LogIn, Phone, UserPlus } from "lucide-react";

function safeRedirect(raw: string) {
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

function AuthCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[2rem] border border-zinc-100 bg-white/90 p-8 shadow-[0_40px_80px_-40px_rgba(120,84,39,0.5)] backdrop-blur sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-black text-ink-950 dark:text-zinc-100">
            {title}
          </h1>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{desc}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoginForm({ redirect }: { redirect: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: String(fd.get("phone") ?? ""),
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        router.replace(safeRedirect(redirect));
        router.refresh();
      } else {
        setError(data.error ?? "ورود ناموفق بود");
        setLoading(false);
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setLoading(false);
    }
  }

  return (
    <AuthCard title="ورود به حساب کاربری" desc="با شماره موبایل و رمز عبور وارد شوید">
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="label">شماره موبایل</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input
              name="phone"
              required
              inputMode="tel"
              autoComplete="username"
              placeholder="09123456789"
              className="field pr-10 tnum"
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>
        <div>
          <label className="label">رمز عبور</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="field pr-10"
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-gold w-full py-3.5">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          ورود
        </button>
        <p className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
          حساب ندارید؟{" "}
          <Link
            href={`/auth/register${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-extrabold text-gold-700 hover:text-gold-600 dark:text-gold-400"
          >
            ثبت‌نام کنید
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export function RegisterForm({ redirect }: { redirect: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: String(fd.get("phone") ?? ""),
          password: String(fd.get("password") ?? ""),
          confirmPassword: String(fd.get("confirmPassword") ?? ""),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        router.replace(safeRedirect(redirect));
        router.refresh();
      } else {
        setError(data.error ?? "ثبت‌نام ناموفق بود");
        setLoading(false);
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setLoading(false);
    }
  }

  return (
    <AuthCard title="ساخت حساب کاربری" desc="فقط با شماره موبایل و رمز عبور">
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="label">شماره موبایل</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input
              name="phone"
              required
              inputMode="tel"
              autoComplete="username"
              placeholder="09123456789"
              className="field pr-10 tnum"
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>
        <div>
          <label className="label">رمز عبور (حداقل ۸ کاراکتر)</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className="field pr-10"
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>
        <div>
          <label className="label">تکرار رمز عبور</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className="field pr-10"
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-gold w-full py-3.5">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          ثبت‌نام
        </button>
        <p className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href={`/auth/login${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-extrabold text-gold-700 hover:text-gold-600 dark:text-gold-400"
          >
            وارد شوید
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
