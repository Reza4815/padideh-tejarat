"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import {
  ArrowRight,
  GripVertical,
  ImagePlus,
  Link2,
  Loader2,
  Package,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { Toggle, Toggle as Switch } from "@/components/admin/table-widgets";
import { cn, slugify } from "@/lib/utils";

export type ProductFormInitial = ProductInput & { id: string };

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: Partial<ProductFormInitial>;
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [partNumber, setPartNumber] = useState(initial?.partNumber ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initial?.categoryId ?? "",
  );
  const [price, setPrice] = useState(
    initial?.price ? String(initial.price) : "",
  );
  const [compareAt, setCompareAt] = useState(
    initial?.compareAtPrice ? String(initial.compareAtPrice) : "",
  );
  const [priceOnRequest, setPriceOnRequest] = useState(
    initial?.priceOnRequest ?? false,
  );
  const [stock, setStock] = useState(
    initial?.stock != null ? String(initial.stock) : "0",
  );
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [benefits, setBenefits] = useState<string[]>(
    initial?.benefits?.length ? initial.benefits : [""],
  );
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    initial?.specs?.length ? initial.specs : [{ label: "", value: "" }],
  );
  const [compatibilityText, setCompatibilityText] = useState(
    (initial?.compatibility ?? []).join("\n"),
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json()) as {
          ok?: boolean;
          url?: string;
          error?: string;
        };
        if (!res.ok || !data.url)
          throw new Error(data.error ?? "آپلود ناموفق بود");
        setImages((prev) => [...prev, data.url!]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
    }
  }

  function moveImage(idx: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const [img] = next.splice(idx, 1);
      next.splice(Math.max(0, Math.min(next.length, idx + dir)), 0, img);
      return next;
    });
  }

  function submit() {
    setError("");
    if (!name.trim()) return setError("نام محصول الزامی است");
    if (!priceOnRequest && (!price.trim() || Number(price) <= 0))
      return setError("قیمت معتبر وارد کنید");

    const input: ProductInput = {
      id: initial?.id,
      name,
      slug: slug.trim() || slugify(name) || slugify(partNumber),
      brand,
      partNumber,
      categoryId: categoryId || null,
      price: priceOnRequest ? 0 : Number(price),
      compareAtPrice: priceOnRequest
        ? null
        : compareAt.trim()
          ? Number(compareAt)
          : null,
      priceOnRequest,
      stock: priceOnRequest ? 0 : Number(stock) || 0,
      shortDesc,
      description,
      benefits,
      specs,
      compatibility: compatibilityText
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
      images,
      featured,
      active,
    };
    startSaving(async () => {
      try {
        await saveProduct(input);
        router.push("/admin/products");
        router.refresh();
      } catch {
        setError("ذخیره محصول ناموفق بود؛ دوباره تلاش کنید");
      }
    });
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/products")}
          className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-gold-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
          aria-label="بازگشت"
        >
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-ink-950 dark:text-white">
            {initial?.id ? "ویرایش محصول" : "افزودن محصول جدید"}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            اطلاعات کامل قطعه را وارد کنید
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        {/* main column */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-sm font-black text-ink-950 dark:text-white">
              اطلاعات پایه
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label dark:text-zinc-300">نام محصول *</label>
                <input
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: دیسک ترمز جلو ونتیله برمبو"
                />
              </div>
              <div>
                <label className="label dark:text-zinc-300">
                  اسلاگ (آدرس محصول)
                </label>
                <input
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="به‌صورت خودکار ساخته می‌شود"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="label dark:text-zinc-300">برند</label>
                <input
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brembo, Bosch, ..."
                />
              </div>
              <div>
                <label className="label dark:text-zinc-300">
                  کد فنی / شماره OEM
                </label>
                <input
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="09.A969.21"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="label dark:text-zinc-300">دسته‌بندی</label>
                <select
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label dark:text-zinc-300">توضیح کوتاه</label>
                <input
                  className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="یک جمله خلاصه از محصول"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label dark:text-zinc-300">توضیحات کامل</label>
                <textarea
                  className="field min-h-36 resize-y dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات تخصصی محصول ... (هر پاراگراف در یک خط جدید)"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-ink-950 dark:text-white">
                مزایای محصول
              </h2>
              <button
                onClick={() => setBenefits((b) => [...b, ""])}
                className="btn-outline px-3.5 py-1.5 text-[11px] dark:border-zinc-700 dark:text-zinc-300"
              >
                <Plus className="h-3.5 w-3.5" />
                افزودن مزیت
              </button>
            </div>
            <div className="space-y-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-50 text-[11px] font-black text-gold-600 tnum dark:bg-gold-900/30 dark:text-gold-400">
                    {i + 1}
                  </span>
                  <input
                    className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    value={b}
                    onChange={(e) =>
                      setBenefits((prev) =>
                        prev.map((x, xi) => (xi === i ? e.target.value : x)),
                      )
                    }
                    placeholder="مثلاً: ضمانت اصالت کالا"
                  />
                  <button
                    onClick={() =>
                      setBenefits((prev) => prev.filter((_, xi) => xi !== i))
                    }
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-300 transition hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    aria-label="حذف"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-ink-950 dark:text-white">
                مشخصات فنی
              </h2>
              <button
                onClick={() =>
                  setSpecs((s) => [...s, { label: "", value: "" }])
                }
                className="btn-outline px-3.5 py-1.5 text-[11px] dark:border-zinc-700 dark:text-zinc-300"
              >
                <Plus className="h-3.5 w-3.5" />
                افزودن مشخصه
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
                >
                  <input
                    className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    value={s.label}
                    onChange={(e) =>
                      setSpecs((prev) =>
                        prev.map((x, xi) =>
                          xi === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="عنوان (مثلاً: جنس)"
                  />
                  <input
                    className="field dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    value={s.value}
                    onChange={(e) =>
                      setSpecs((prev) =>
                        prev.map((x, xi) =>
                          xi === i ? { ...x, value: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="مقدار (مثلاً: چدن پرکربن)"
                  />
                  <button
                    onClick={() =>
                      setSpecs((prev) => prev.filter((_, xi) => xi !== i))
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 transition hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    aria-label="حذف"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1.5 text-sm font-black text-ink-950 dark:text-white">
              سازگاری با خودروها
            </h2>
            <p className="mb-3 text-[11px] text-zinc-400">
              هر خودرو را در یک خط بنویسید
            </p>
            <textarea
              className="field min-h-28 resize-y dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={compatibilityText}
              onChange={(e) => setCompatibilityText(e.target.value)}
              placeholder={"پژو ۲۰۶\nپژو ۲۰۷\nرانا"}
            />
          </section>
        </div>

        {/* side column */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-sm font-black text-ink-950 dark:text-white">
              قیمت و موجودی
            </h2>

            {/* سوییچ استعلام قیمت - بدون className روی Switch، با کادر طلایی واضح */}
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-3 py-2.5 dark:border-amber-400/60 dark:bg-amber-500/15">
              <label className="text-[13px] font-extrabold text-zinc-800 dark:text-amber-300">
                استعلام قیمت / تماس بگیرید
              </label>
              <div className="rounded-full ring-2 ring-amber-500/40 dark:ring-amber-400/50">
                <Switch checked={priceOnRequest} onChange={setPriceOnRequest} />
              </div>
            </div>

            {priceOnRequest && (
              <p className="rounded-xl bg-zinc-50 px-3 py-2.5 text-[11px] leading-6 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                مشتری به‌جای قیمت و دکمه خرید، پیام «برای استعلام موجودی تماس
                بگیرید» و دکمه تماس می‌بیند.
              </p>
            )}

            {!priceOnRequest && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="label dark:text-zinc-300">
                      قیمت فروش (تومان) *
                    </label>
                    <input
                      className="field font-black tnum dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      inputMode="numeric"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value.replace(/[^\d]/g, ""))
                      }
                      placeholder="4850000"
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    />
                  </div>
                  <div>
                    <label className="label dark:text-zinc-300">
                      قیمت قبل از تخفیف (اختیاری)
                    </label>
                    <input
                      className="field tnum dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      inputMode="numeric"
                      value={compareAt}
                      onChange={(e) =>
                        setCompareAt(e.target.value.replace(/[^\d]/g, ""))
                      }
                      placeholder="5600000"
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    />
                  </div>
                  <div>
                    <label className="label dark:text-zinc-300">
                      موجودی انبار
                    </label>
                    <input
                      className="field tnum dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      inputMode="numeric"
                      value={stock}
                      onChange={(e) =>
                        setStock(e.target.value.replace(/[^\d]/g, ""))
                      }
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    />
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-sm font-black text-ink-950 dark:text-white">
              وضعیت نمایش
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-extrabold text-zinc-700 dark:text-zinc-300">
                    نمایش در فروشگاه
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    فعال / غیرفعال بودن محصول
                  </p>
                </div>
                <Toggle checked={active} onChange={setActive} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-gold-500" />
                  <div>
                    <p className="text-[13px] font-extrabold text-zinc-700 dark:text-zinc-300">
                      محصول ویژه
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      نمایش در صفحه اصلی
                    </p>
                  </div>
                </div>
                <Toggle checked={featured} onChange={setFeatured} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1.5 text-sm font-black text-ink-950 dark:text-white">
              تصاویر محصول
            </h2>
            <p className="mb-4 text-[10px] text-zinc-400">
              تصویر اول به‌عنوان کاور اصلی نمایش داده می‌شود
            </p>

            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-100 bg-gold-50/50 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-gold-500 px-2 py-0.5 text-[8px] font-black text-zinc-950">
                      کاور
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-ink-950/60 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => moveImage(i, -1)}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white hover:bg-white/40"
                      aria-label="جلو"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((_, xi) => xi !== i))
                      }
                      className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                      aria-label="حذف تصویر"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <label
                className={cn(
                  "grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 transition hover:border-gold-400 hover:bg-gold-50 hover:text-gold-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:border-gold-500 dark:hover:bg-zinc-700 dark:hover:text-gold-400",
                  uploading && "pointer-events-none opacity-50",
                )}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  className="field py-2 pr-9 text-[11px] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="یا آدرس تصویر (URL) را وارد کنید"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  dir="ltr"
                  style={{ textAlign: "left" }}
                />
              </div>
              <button
                onClick={() => {
                  const u = urlInput.trim();
                  if (u) setImages((prev) => [...prev, u]);
                  setUrlInput("");
                }}
                className="btn-outline px-3.5 py-2 text-[11px] dark:border-zinc-700 dark:text-zinc-300"
              >
                افزودن
              </button>
            </div>
          </section>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        <p className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
          <Package className="h-4 w-4 text-gold-500" />
          {initial?.id
            ? "تغییرات محصول ذخیره می‌شود"
            : "محصول جدید به فروشگاه اضافه می‌شود"}
        </p>
        <button
          onClick={submit}
          disabled={saving}
          className="btn-gold px-8 py-2.5 text-xs"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initial?.id ? "ذخیره تغییرات" : "انتشار محصول"}
        </button>
      </div>
    </div>
  );
}
