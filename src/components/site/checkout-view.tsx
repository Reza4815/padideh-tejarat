"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UploadCloud,
  Wallet,
} from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { formatPrice, toFaDigits } from "@/lib/utils";
import {
  CARD_HOLDER,
  CARD_NUMBER,
  CHECKOUT_STORAGE_KEY,
  type CheckoutDraft,
  type PaymentMethod,
} from "@/lib/payment";

type ResolvedItem = {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  qty: number;
};

const RECEIPT_ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const RECEIPT_MAX = 2 * 1024 * 1024;

export function CheckoutView() {
  const router = useRouter();
  const { items, ready, clear, refreshPrices } = useCart();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [resolved, setResolved] = useState<ResolvedItem[] | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // خواندن پیش‌نویس ثبت‌شده از صفحه سبد
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) setDraft(JSON.parse(raw) as CheckoutDraft);
    } catch {
      /* ignore */
    }
  }, []);

  // اقلام نمایشی: اول از سبد زنده، وگرنه از روی پیش‌نویس از سرور قیمت بگیر
  useEffect(() => {
    if (!ready) return;
    if (items.length > 0) {
      setResolved(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          partNumber: i.partNumber,
          price: i.price,
          qty: i.qty,
        })),
      );
      return;
    }
    const d = draft;
    if (!d || d.items.length === 0) {
      setResolved([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: d.items.map((i) => i.id) }),
        });
        const data = (await res.json()) as {
          prices?: { id: string; name: string; price: number; partNumber: string }[];
        };
        if (!mounted) return;
        const byId = new Map((data.prices ?? []).map((p) => [p.id, p]));
        setResolved(
          d.items.flatMap((i) => {
            const p = byId.get(i.id);
            return p ? [{ id: p.id, name: p.name, partNumber: p.partNumber, price: p.price, qty: i.qty }] : [];
          }),
        );
      } catch {
        if (mounted) setResolved([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ready, items, draft]);

  const total = useMemo(
    () => (resolved ?? []).reduce((s, i) => s + i.price * i.qty, 0),
    [resolved],
  );

  function pickFile(f: File | undefined) {
    setFileError("");
    if (!f) return;
    if (!RECEIPT_ALLOWED.includes(f.type)) {
      setFileError("فقط فایل jpg/png/webp مجاز است");
      return;
    }
    if (f.size > RECEIPT_MAX) {
      setFileError("حجم رسید باید حداکثر ۲ مگابایت باشد");
      return;
    }
    setReceiptFile(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER.replace(/-/g, ""));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = CARD_NUMBER.replace(/-/g, "");
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function uploadReceipt(): Promise<string> {
    if (!receiptFile) throw new Error("receipt-missing");
    const form = new FormData();
    form.append("file", receiptFile);
    const res = await fetch("/api/receipts/upload", { method: "POST", body: form });
    const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
    if (!res.ok || !data.ok || !data.url) throw new Error(data.error ?? "آپلود رسید ناموفق بود");
    return data.url;
  }

  async function createOrder(paymentMethod: PaymentMethod) {
    const d = draft;
    if (!d) throw new Error("draft-missing");
    try {
      await Promise.race([
        refreshPrices(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
      ]);
    } catch {
      /* ignore */
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, items: (resolved ?? d.items).map((i) => ({ id: i.id, qty: i.qty })), paymentMethod }),
    });
    const data = (await res.json()) as { ok?: boolean; id?: string; trackingCode?: string; error?: string };
    if (!res.ok || !data.ok || !data.id || !data.trackingCode) {
      throw new Error(data.error ?? "ثبت سفارش ناموفق بود");
    }
    return data;
  }

  async function submitOnline() {
    setSubmitting(true);
    setError("");
    try {
      // TODO: اتصال به درگاه زرین‌پال — در این مرحله سفارش با وضعیت pending ثبت
      // می‌شود و کاربر به صفحه پیگیری هدایت می‌گردد. بعداً به‌جای redirect مستقیم،
      // ابتدا درخواست authority از زرین‌پال بگیرید و کاربر را به درگاه بفرستید.
      const order = await createOrder("online");
      clear();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      router.push(`/order/${order.trackingCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطایی رخ داد");
      setSubmitting(false);
    }
  }

  async function submitCard() {
    if (!receiptFile) {
      setFileError("ابتدا تصویر رسید را انتخاب کنید");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const receiptUrl = await uploadReceipt();
      const order = await createOrder("card");
      const res = await fetch(`/api/orders/${order.id}/receipt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptUrl }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "ثبت رسید ناموفق بود");
      clear();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      router.push(`/order/${order.trackingCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطایی رخ داد");
      setSubmitting(false);
    }
  }

  if (!ready || resolved === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        <p className="text-sm font-bold text-zinc-400">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!draft || resolved.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-gold-100 to-gold-50 text-gold-500 dark:from-gold-950/60 dark:to-zinc-900">
          <ShoppingBag className="h-11 w-11" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-black text-ink-950 dark:text-zinc-100">اطلاعات سفارش یافت نشد</h1>
        <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          ابتدا از سبد خرید، اطلاعات گیرنده را تکمیل کنید و روی «ثبت سفارش» بزنید.
        </p>
        <Link href="/cart" className="btn-gold mt-2">
          <ArrowRight className="h-4 w-4" />
          بازگشت به سبد خرید
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold tracking-wider text-gold-600">تکمیل خرید</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-950 sm:text-3xl dark:text-zinc-100">
          انتخاب روش پرداخت
        </h1>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ستون اصلی: روش پرداخت */}
        <section className="order-1 space-y-4">
          {/* خلاصه سفارش */}
          <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <ShoppingBag className="h-4 w-4 text-gold-600" />
              <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">خلاصه سفارش</h2>
            </div>
            <ul className="divide-y divide-zinc-100 px-4 dark:divide-zinc-800">
              {resolved.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 py-2.5 text-[12px]">
                  <span className="min-w-0 flex-1 truncate font-bold text-zinc-700 dark:text-zinc-200">
                    {i.name}
                    <span className="mr-2 font-bold text-zinc-400 tnum">× {toFaDigits(i.qty)}</span>
                  </span>
                  <span className="shrink-0 font-black text-zinc-800 tnum dark:text-zinc-100">
                    {formatPrice(i.price * i.qty)} تومان
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <span className="text-sm font-black text-ink-950 dark:text-zinc-100">مبلغ قابل پرداخت</span>
              <span className="text-lg font-black text-gold-700 tnum dark:text-gold-400">
                {formatPrice(total)}
                <span className="mr-1 text-[10px] font-bold text-zinc-400">تومان</span>
              </span>
            </div>
            <p className="px-4 pb-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              گیرنده: {draft.customerName} — <span dir="ltr">{draft.phone}</span>
            </p>
          </div>

          {/* انتخاب روش */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="روش پرداخت">
            <button
              type="button"
              role="radio"
              aria-checked={method === "online"}
              onClick={() => setMethod("online")}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-start transition active:scale-[0.99] ${
                method === "online"
                  ? "border-gold-400 bg-gold-50/60 shadow-md dark:border-gold-700/60 dark:bg-gold-950/30"
                  : "border-zinc-200 bg-white hover:border-gold-300 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${method === "online" ? "bg-gold-500 text-zinc-950" : "bg-gold-50 text-gold-600 dark:bg-gold-950/40"}`}>
                <Wallet className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-black text-ink-950 dark:text-zinc-100">
                  پرداخت آنلاین (زرین‌پال)
                  {method === "online" && <BadgeCheck className="h-4 w-4 text-gold-600" />}
                </span>
                <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">پرداخت امن با کارت بانکی</span>
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={method === "card"}
              onClick={() => setMethod("card")}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-start transition active:scale-[0.99] ${
                method === "card"
                  ? "border-gold-400 bg-gold-50/60 shadow-md dark:border-gold-700/60 dark:bg-gold-950/30"
                  : "border-zinc-200 bg-white hover:border-gold-300 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${method === "card" ? "bg-gold-500 text-zinc-950" : "bg-gold-50 text-gold-600 dark:bg-gold-950/40"}`}>
                <Landmark className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-black text-ink-950 dark:text-zinc-100">
                  کارت به کارت
                  {method === "card" && <BadgeCheck className="h-4 w-4 text-gold-600" />}
                </span>
                <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">واریز به کارت و آپلود رسید</span>
              </span>
            </button>
          </div>

          {/* پنل کارت به کارت (اینلاین) */}
          {method === "card" && (
            <div className="animate-[fadeInUp_0.3s_ease-out] overflow-hidden rounded-2xl border border-gold-200 bg-gradient-to-b from-gold-50/60 to-white dark:border-gold-700/40 dark:from-zinc-900/60 dark:to-zinc-900">
              <div className="flex items-center gap-2 border-b border-gold-200/60 px-4 py-3 dark:border-gold-700/30">
                <CreditCard className="h-4 w-4 text-gold-600" />
                <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">واریز کارت به کارت</h2>
              </div>
              <div className="space-y-4 p-4">
                <div className="rounded-xl bg-white p-3.5 dark:bg-zinc-800">
                  <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">مبلغ دقیق واریز</p>
                  <p className="mt-1 text-xl font-black text-gold-700 tnum dark:text-gold-400">
                    {formatPrice(total)} <span className="text-[11px] font-bold text-zinc-400">تومان</span>
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3.5 dark:bg-zinc-800">
                  <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">شماره کارت</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-black tracking-wider text-ink-950 tnum dark:text-zinc-100" dir="ltr">
                      {CARD_NUMBER}
                    </span>
                    <button
                      type="button"
                      onClick={copyCard}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-3.5 py-1.5 text-[11px] font-extrabold text-gold-700 transition hover:bg-gold-100 active:scale-95 dark:border-gold-700/50 dark:bg-gold-950/40 dark:text-gold-300"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "کپی شد!" : "کپی"}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    به نام: {CARD_HOLDER}
                  </p>
                </div>

                {/* آپلود رسید */}
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-ink-950 dark:text-zinc-100">
                    <ReceiptText className="h-4 w-4 text-gold-600" />
                    تصویر رسید واریز
                    <span className="text-[10px] font-bold text-zinc-400">(jpg/png/webp تا ۲ مگابایت)</span>
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                  {previewUrl ? (
                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="پیش‌نمایش رسید" className="max-h-64 w-full object-contain bg-zinc-50 dark:bg-zinc-800" />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-2 right-2 rounded-full bg-ink-950/80 px-4 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-ink-950"
                      >
                        انتخاب مجدد
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-gold-300 bg-white/60 px-4 py-8 text-center transition hover:border-gold-500 hover:bg-gold-50/50 dark:border-gold-700/50 dark:bg-zinc-800/60"
                    >
                      <UploadCloud className="h-8 w-8 text-gold-500" />
                      <span className="text-[12px] font-extrabold text-zinc-600 dark:text-zinc-300">انتخاب تصویر رسید</span>
                      <span className="text-[10px] text-zinc-400">برای انتخاب ضربه بزنید</span>
                    </button>
                  )}
                  {fileError && (
                    <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                      {fileError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}

          {/* دکمه نهایی */}
          {method === "online" ? (
            <button onClick={submitOnline} disabled={submitting} className="btn-gold w-full py-3.5 text-sm active:scale-[0.98]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {submitting ? "در حال ثبت..." : "پرداخت"}
            </button>
          ) : (
            <button
              onClick={submitCard}
              disabled={submitting || !receiptFile}
              className="btn-gold w-full py-3.5 text-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
              {submitting ? "در حال ثبت..." : "تأیید و ثبت سفارش"}
            </button>
          )}
          {method === "card" && !receiptFile && (
            <p className="text-center text-[11px] text-zinc-400">دکمه ثبت پس از انتخاب تصویر رسید فعال می‌شود</p>
          )}
        </section>

        {/* ستون کناری */}
        <aside className="order-2 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-600" />
              <h2 className="text-sm font-black text-ink-950 dark:text-zinc-100">پرداخت امن</h2>
            </div>
            <p className="mt-2 text-[11px] leading-6 text-zinc-500 dark:text-zinc-400">
              پس از ثبت سفارش، کد پیگیری اختصاصی دریافت می‌کنید و می‌توانید وضعیت سفارش را لحظه‌ای دنبال کنید.
            </p>
          </div>
          <Link href="/cart" className="btn-outline w-full py-3 text-xs">
            <ArrowRight className="h-4 w-4" />
            بازگشت به سبد خرید
          </Link>
        </aside>
      </div>
    </div>
  );
}
