"use client";

import { useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Loader2, MessageSquareText, Package, Phone, Send, User } from "lucide-react";

const PRODUCT_TYPES = [
  "سیستم ترمز",
  "تعلیق و فرمان",
  "موتور و انتقال قدرت",
  "فیلتر و مصرفی",
  "روشنایی",
  "برق و الکتریک",
  "ترکیبی از چند گروه",
];

export function WholesaleForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      company: String(fd.get("company") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      productType: String(fd.get("productType") ?? ""),
      quantity: String(fd.get("quantity") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("ok");
        form.reset();
      } else {
        setError(data.error ?? "خطایی رخ داد");
        setStatus("err");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center gap-4 rounded-3xl p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-100 text-gold-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="text-lg font-black text-ink-950">درخواست شما ثبت شد</h3>
        <p className="max-w-sm text-sm leading-7 text-zinc-500">
          کارشناسان فروش سازمانی پدیده تجارت الوند حداکثر تا ۲۴ ساعت آینده برای ارائه لیست قیمت
          اختصاصی با شما تماس می‌گیرند.
        </p>
        <button onClick={() => setStatus("idle")} className="btn-outline py-2.5 text-xs">
          ثبت درخواست جدید
        </button>
      </div>
    );
  }

  const inputCls = "field pr-10";

  return (
    <form onSubmit={onSubmit} className="grid gap-3.5 sm:grid-cols-2">
      <div className="relative">
        <User className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
        <input name="name" required placeholder="نام و نام خانوادگی *" className={inputCls} />
      </div>
      <div className="relative">
        <Building2 className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
        <input name="company" placeholder="نام شرکت / تعمیرگاه" className={inputCls} />
      </div>
      <div className="relative">
        <Phone className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
        <input name="phone" required placeholder="شماره تماس *" className={inputCls} dir="ltr" style={{ textAlign: "right" }} />
      </div>
      <div className="relative">
        <Package className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
        <select name="productType" className={`${inputCls} appearance-none`} defaultValue="">
          <option value="" disabled>
            نوع قطعات موردنیاز
          </option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="relative sm:col-span-2">
        <MessageSquareText className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
        <input name="quantity" placeholder="تعداد / حجم تقریبی سفارش (مثلاً ۵۰ عدد)" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <textarea
          name="message"
          rows={3}
          placeholder="توضیحات (مدل خودرو، برند موردنظر، شهر مقصد و ...)"
          className="field resize-none"
        />
      </div>
      {status === "err" && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 sm:col-span-2">{error}</p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn-gold w-full py-3.5">
          {status === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          ارسال درخواست عمده‌فروشی
        </button>
      </div>
    </form>
  );
}
