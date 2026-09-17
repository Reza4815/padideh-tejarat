"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, LogOut, X } from "lucide-react";

export function ConfirmLogoutModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="تأیید خروج از حساب"
        className="relative w-full max-w-sm rounded-2xl border border-zinc-100 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label="بستن"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-base font-black text-ink-950 dark:text-zinc-100">
          خروج از حساب کاربری
        </h2>
        <p className="mt-1 text-[13px] leading-6 text-zinc-500 dark:text-zinc-400">
          آیا از خروج مطمئن هستید؟ برای مشاهده سفارش‌ها باید دوباره وارد شوید.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-outline flex-1 py-2.5 text-xs"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}