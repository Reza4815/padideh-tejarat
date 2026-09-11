"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusOption = { value: string; label: string };

export function StatusSelect({
  id,
  value,
  options,
  onSave,
}: {
  id: string;
  value: string;
  options: StatusOption[];
  onSave: (id: string, status: string) => Promise<unknown>;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    setCurrent(next);
    startTransition(async () => {
      await onSave(id, next);
      router.refresh();
    });
  }

  return (
    <span className="relative inline-flex items-center gap-1.5">
      {pending && <Loader2 className="h-3 w-3 animate-spin text-gold-500" />}
      <select
        value={current}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "cursor-pointer appearance-none rounded-full border px-3 py-1.5 text-[11px] font-extrabold outline-none transition",
          current === "new"
            ? "border-gold-400 bg-gold-50 text-gold-700"
            : current === "done"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-white text-zinc-600",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function DeleteButton({
  id,
  label = "حذف",
  confirmText = "از حذف این مورد مطمئن هستید؟",
  onDelete,
}: {
  id: string;
  label?: string;
  confirmText?: string;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          await onDelete(id);
          router.refresh();
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-extrabold text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      {label}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-gold-500" : "bg-zinc-200",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "right-0.5" : "right-[22px]",
        )}
      />
    </button>
  );
}

export function SaveBar({
  saving,
  saved,
  onSave,
  children,
}: {
  saving: boolean;
  saved?: boolean;
  onSave: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
        {saved && !saving && (
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            ذخیره شد
          </span>
        )}
        {children}
      </div>
      <button onClick={onSave} disabled={saving} className="btn-gold px-8 py-2.5 text-xs">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        ذخیره تغییرات
      </button>
    </div>
  );
}
