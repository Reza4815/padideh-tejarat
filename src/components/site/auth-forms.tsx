"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertTriangle, Loader2, LogIn, Phone, UserPlus } from "lucide-react";
import { AuthCard } from "@/components/site/auth/auth-card";
import { PasswordInput } from "@/components/site/auth/password-input";
import { cn } from "@/lib/utils";

function safeRedirect(raw: string) {
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function PhoneField({ autoComplete }: { autoComplete: string }) {
  return (
    <div>
      <label htmlFor="phone" className="label">
        شماره موبایل
      </label>
      <div className="relative">
        <Phone className="pointer-events-none absolute right-3.5 top-4 h-4 w-4 text-gold-500" />
        <input
          id="phone"
          name="phone"
          required
          dir="ltr"
          inputMode="numeric"
          maxLength={11}
          autoComplete={autoComplete}
          placeholder="09123456789"
          className="field h-12 pr-10 text-start tnum"
        />
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

  const registerHref = `/auth/register${
    redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""
  }`;

  return (
    <AuthCard
      title="ورود به حساب کاربری"
      subtitle="با شماره موبایل و رمز عبور وارد شوید"
      footer={
        <>
          حساب ندارید؟{" "}
          <Link
            href={registerHref}
            className="font-extrabold text-gold-700 hover:text-gold-600 dark:text-gold-400"
          >
            ثبت‌نام کنید
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <ErrorAlert message={error} />}

        <PhoneField autoComplete="username" />

        <PasswordInput
          label="رمز عبور"
          name="password"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className={cn("btn-gold h-12 w-full py-3.5 text-sm")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          ورود
        </button>
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

  const loginHref = `/auth/login${
    redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""
  }`;

  return (
    <AuthCard
      title="ثبت‌نام در پدیده تجارت الوند"
      subtitle="فقط با شماره موبایل و رمز عبور"
      footer={
        <>
          قبلاً ثبتنام کرده‌اید؟{" "}
          <Link
            href={loginHref}
            className="font-extrabold text-gold-700 hover:text-gold-600 dark:text-gold-400"
          >
            وارد شوید
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <ErrorAlert message={error} />}

        <PhoneField autoComplete="username" />

        <PasswordInput
          label="رمز عبور (حداقل ۸ کاراکتر)"
          name="password"
          minLength={8}
          autoComplete="new-password"
        />

        <PasswordInput
          label="تکرار رمز عبور"
          name="confirmPassword"
          minLength={8}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className={cn("btn-gold h-12 w-full py-3.5 text-sm")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          ثبت‌نام
        </button>
      </form>
    </AuthCard>
  );
}