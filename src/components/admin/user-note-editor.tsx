"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [savedNote, setSavedNote] = useState(initialNote ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function save() {
    if (note.trim() === savedNote.trim()) {
      setEditing(false);
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await updateUserNote(userId, note);
        setSavedNote(note.trim());
        setEditing(false);
        router.refresh();
      } catch {
        setError("ذخیره یادداشت ناموفق بود");
      }
    });
  }

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-950 dark:text-zinc-100">
          <StickyNote className="h-4 w-4 text-gold-600" />
          یادداشت مدیر
          <span className="text-[10px] font-bold text-zinc-400">
            (فقط ادمین می‌بیند)
          </span>
        </h2>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setNote(savedNote);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-extrabold text-zinc-500 transition hover:border-gold-400 hover:text-gold-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-gold-500 dark:hover:text-gold-400"
          >
            <PencilLine className="h-3 w-3" />
            ویرایش
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") {
                setNote(savedNote);
                setEditing(false);
                setError("");
              }
            }}
            onBlur={save}
            maxLength={2000}
            placeholder="یادداشت خصوصی درباره این کاربر..."
            className="field h-12"
            disabled={pending}
          />
          <div className="mt-2 flex items-center gap-2">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
            ) : (
              <span className="text-[10px] font-bold text-zinc-400">
                برای ذخیره Enter، برای انصراف Esc
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setNote(savedNote);
                setEditing(false);
                setError("");
              }}
              disabled={pending}
              className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-1.5 text-[11px] font-extrabold text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              <X className="h-3 w-3" />
              انصراف
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {savedNote ? (
            <p className="flex items-start gap-2 whitespace-pre-wrap text-[13px] leading-6 text-zinc-600 dark:text-zinc-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {savedNote}
            </p>
          ) : (
            <p className="text-[12px] text-zinc-400">
              هنوز یادداشتی ثبت نشده؛ برای افزودن، ویرایش را بزنید.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}