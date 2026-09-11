"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { FolderTree, ImagePlus, Loader2, Pencil, Plus, X } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/table-widgets";
import { slugify } from "@/lib/utils";

export type CatItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort: number;
};

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort: string;
};

const EMPTY: Draft = { name: "", slug: "", description: "", image: "", sort: "0" };

export function CategoryManager({ items }: { items: CatItem[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, startSaving] = useTransition();

  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "آپلود ناموفق بود");
      setDraft((d) => (d ? { ...d, image: data.url! } : d));
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError("نام دسته‌بندی الزامی است");
      return;
    }
    setError("");
    startSaving(async () => {
      await saveCategory({
        id: draft.id,
        name: draft.name,
        slug: draft.slug.trim() || slugify(draft.name),
        description: draft.description,
        image: draft.image,
        sort: Number(draft.sort) || 0,
      });
      setDraft(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-ink-950">دسته‌بندی‌ها</h1>
          <p className="mt-1 text-xs text-zinc-400 tnum">{items.length} دسته‌بندی در فروشگاه</p>
        </div>
        <button onClick={() => { setDraft(EMPTY); setError(""); }} className="btn-gold px-5 py-2.5 text-xs">
          <Plus className="h-4 w-4" />
          افزودن دسته‌بندی
        </button>
      </div>

      {draft && (
        <section className="rounded-2xl border border-gold-300 bg-gold-50/50 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-ink-950">
              {draft.id ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
            </h2>
            <button onClick={() => setDraft(null)} className="text-zinc-400 hover:text-zinc-600" aria-label="بستن">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">نام *</label>
              <input className="field bg-white" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="سیستم ترمز" />
            </div>
            <div>
              <label className="label">اسلاگ</label>
              <input className="field bg-white" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="خودکار" dir="ltr" style={{ textAlign: "right" }} />
            </div>
            <div>
              <label className="label">ترتیب نمایش</label>
              <input className="field bg-white tnum" inputMode="numeric" value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value.replace(/[^\d-]/g, "") })} dir="ltr" style={{ textAlign: "right" }} />
            </div>
            <div>
              <label className="label">توضیح کوتاه</label>
              <input className="field bg-white" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="دیسک، لنت و ..." />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="label">تصویر دسته‌بندی</label>
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  {draft.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FolderTree className="h-5 w-5 text-gold-300" />
                  )}
                </div>
                <label className="btn-outline cursor-pointer px-4 py-2 text-[11px]">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  آپلود تصویر
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
                </label>
                <input
                  className="field max-w-xs bg-white text-[11px]"
                  placeholder="یا آدرس تصویر"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  dir="ltr"
                  style={{ textAlign: "left" }}
                />
              </div>
            </div>
          </div>
          {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDraft(null)} className="btn-outline px-5 py-2.5 text-xs">
              انصراف
            </button>
            <button onClick={submit} disabled={saving} className="btn-gold px-6 py-2.5 text-xs">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              ذخیره دسته‌بندی
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 transition hover:border-gold-300">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gold-50">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <FolderTree className="h-5 w-5 text-gold-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold text-zinc-800">{c.name}</p>
              <p className="mt-0.5 text-[10px] text-zinc-400" dir="ltr">
                /products?cat={c.slug}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400 tnum">ترتیب: {c.sort}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setDraft({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    description: c.description,
                    image: c.image,
                    sort: String(c.sort),
                  });
                  setError("");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-[10px] font-extrabold text-zinc-500 hover:border-gold-300 hover:text-gold-700"
              >
                <Pencil className="h-3 w-3" />
                ویرایش
              </button>
              <DeleteButton id={c.id} label="" onDelete={deleteCategory} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
