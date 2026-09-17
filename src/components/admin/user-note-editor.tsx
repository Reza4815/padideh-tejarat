"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, PencilLine, StickyNote, X } from "lucide-react";
import { updateUserNote } from "@/app/admin/user-actions";

export function UserNoteEditor({
  userId,
  initialNote,
}: {
  userId: number;
  initialNote: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [savedNote, setSavedNote] = useState(initialNote ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function save() {
    setError("");
    startTransition(async () => {
      try {
        await updateUserNote(userId, note);
        setSavedNote(note.trim());
        setEditing(false);
      } catch {
        setError("ذخیره یادداشت ناموفق بود");
      }
    });
  }

  if (!editing) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-950 dark:text-zinc-100">
            <StickyNote className="h-4 w-4 text-gold-600" />
            یادداشت مدیر
            <span className="text-[10px] font-bold text-zinc-400">
              (فقط ادمین می‌بیند)
            </span>
          </h2>
          <button
            onClick={() => {
              setNote(savedNote);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-extrabold text-zinc-500 transition hover:border-gold-400 hover:text-gold-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-gold-500 dark:hover:text-gold-400"
          >
            <PencilLine className="h-3 w-3" />
            ویرایش
          </button>
        </div>
        {savedNote ? (
          <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-zinc-600 dark:text-zinc-300">
            {savedNote}
          </p>
        ) : (
          <p className="mt-3 text-[12px] text-zinc-400">
            هنوز یادداشتی ثبت نشده؛ برای افزودن، ویرایش را بزنید.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gold-300 bg-white p-5 dark:border-gold-700/50 dark:bg-zinc-900">
      <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-950 dark:text-zinc-100">
        <StickyNote className="h-4 w-4 text-gold-600" />
        یادداشت مدیر
      </h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="یادداشت خصوصی درباره این کاربر..."
        className="field mt-3 resize-none"
      />
      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={save}
          disabled={pending}
          className="btn-gold px-6 py-2 text-xs disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          ذخیره
        </button>
        <button
          onClick={() => {
            setNote(savedNote);
            setEditing(false);
            setError("");
          }}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-5 py-2 text-xs font-extrabold text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
          انصراف
        </button>
      </div>
    </div>
  );
}
