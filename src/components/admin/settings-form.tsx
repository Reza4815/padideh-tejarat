"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, ShieldCheck, User } from "lucide-react";
import { changeCredentials } from "@/app/admin/actions";

export function SettingsForm({ username }: { username: string }) {
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    setError("");
    if (!currentPassword || !newPassword) return setError("رمز فعلی و رمز جدید را وارد کنید");
    if (newPassword !== confirmPassword) return setError("تکرار رمز عبور جدید مطابقت ندارد");
    startTransition(async () => {
      const res = await changeCredentials({ currentPassword, newUsername, newPassword });
      if (res.ok) {
        window.location.href = "/admin/login";
      } else {
        setError(res.error ?? "خطا در ذخیره تنظیمات");
      }
    });
  }

  return (
    <div className="max-w-lg rounded-2xl border border-zinc-100 bg-white p-6">
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-gold-50 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-gold-600" />
        <p className="text-[11px] leading-5 text-gold-800">
          پس از تغییر، نشست فعلی بسته شده و باید با اطلاعات جدید دوباره وارد شوید.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">نام کاربری جدید</label>
          <div className="relative">
            <User className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input className="field pr-10" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">رمز عبور فعلی</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
            <input type="password" className="field pr-10" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} dir="ltr" style={{ textAlign: "right" }} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">رمز عبور جدید</label>
            <input type="password" className="field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div>
            <label className="label">تکرار رمز عبور جدید</label>
            <input type="password" className="field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} dir="ltr" style={{ textAlign: "right" }} />
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>}
        <button onClick={submit} disabled={pending} className="btn-gold w-full py-3">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          ذخیره و خروج از حساب
        </button>
      </div>
    </div>
  );
}
