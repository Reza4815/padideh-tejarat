"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, LogIn, User } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(fd.get("username") ?? ""),
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        router.replace("/admin");
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
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div>
        <label className="label">نام کاربری</label>
        <div className="relative">
          <User className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
          <input name="username" required autoComplete="username" className="field pr-10" placeholder="admin" />
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
            className="field pr-10"
            placeholder="••••"
            dir="ltr"
            style={{ textAlign: "right" }}
          />
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-gold w-full py-3.5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        ورود به پنل مدیریت
      </button>
      <p className="pt-1 text-center text-[10px] text-zinc-400">
        حساب پیش‌فرض: <span className="font-black text-zinc-600" dir="ltr">admin / 4815</span>
      </p>
    </form>
  );
}
