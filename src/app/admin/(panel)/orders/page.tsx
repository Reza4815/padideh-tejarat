import { desc, like } from "drizzle-orm";
import { Phone, Search, ShoppingBag, StickyNote } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { deleteOrder, setOrderStatus } from "@/app/admin/actions";
import { DeleteButton, StatusSelect } from "@/components/admin/table-widgets";
import { OrderPaymentPanel } from "@/components/admin/order-payment-panel";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payment";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "سفارش‌ها" };

const OPTIONS = [
  { value: "new", label: "جدید" },
  { value: "processing", label: "در حال پردازش" },
  { value: "done", label: "تکمیل شده" },
  { value: "canceled", label: "لغو شده" },
];

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  pending: "bg-zinc-100 text-zinc-500",
  awaiting_review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  await ensureSeed();
  const { phone: phoneRaw } = await searchParams;
  const phoneFilter = (phoneRaw ?? "").replace(/[%_]/g, "").trim().slice(0, 20);

  const rows = phoneFilter
    ? await db
        .select()
        .from(orders)
        .where(like(orders.phone, `%${phoneFilter}%`))
        .orderBy(desc(orders.createdAt))
    : await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-ink-950 dark:text-zinc-100">سفارش‌ها</h1>
        <p className="mt-1 text-xs text-zinc-400 tnum">{rows.length} سفارش ثبت شده</p>
      </div>

      {/* فیلتر بر اساس شماره موبایل کاربر */}
      <form
        method="GET"
        action="/admin/orders"
        className="flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-white p-3 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-gold-500" />
          <input
            name="phone"
            defaultValue={phoneFilter}
            placeholder="جستجو با شماره موبایل کاربر..."
            inputMode="tel"
            className="field pr-10 tnum"
            dir="ltr"
            style={{ textAlign: "right" }}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-gold flex-1 px-6 py-2.5 text-xs sm:flex-none">
            جستجو
          </button>
          {phoneFilter && (
            <a href="/admin/orders" className="btn-outline px-6 py-2.5 text-xs">
              حذف فیلتر
            </a>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <ShoppingBag className="h-8 w-8 text-gold-300" />
          <p className="text-sm font-bold text-zinc-500">هنوز سفارشی ثبت نشده است</p>
          <p className="text-xs text-zinc-400">سفارش‌های سبد خرید مشتریان اینجا نمایش داده می‌شود</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const pm = (o.paymentMethod as PaymentMethod) ?? "online";
            const ps = (o.paymentStatus as PaymentStatus) ?? "pending";
            return (
            <article
              key={o.id}
              id={`order-${o.id}`}
              className={
                o.status === "new"
                  ? "rounded-2xl border border-gold-300 bg-white p-5"
                  : "rounded-2xl border border-zinc-100 bg-white p-5"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-black text-ink-950">{o.customerName}</p>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-extrabold text-zinc-500" dir="ltr">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    {o.trackingCode && (
                      <span className="rounded-full bg-gold-100 px-2.5 py-1 font-mono text-[10px] font-extrabold text-gold-700" dir="ltr">
                        {o.trackingCode}
                      </span>
                    )}
                  </div>
                  {/* بج‌های روش و وضعیت پرداخت */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-extrabold text-zinc-600">
                      {PAYMENT_METHOD_LABEL[pm] ?? pm}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${PAYMENT_BADGE[ps] ?? PAYMENT_BADGE.pending}`}>
                      {PAYMENT_STATUS_LABEL[ps] ?? ps}
                    </span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 tnum">
                    <Phone className="h-3.5 w-3.5 text-gold-500" />
                    <span dir="ltr">{o.phone}</span>
                  </p>
                  {o.note && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-5 text-zinc-400">
                      <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300" />
                      {o.note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusSelect id={o.id} value={o.status} options={OPTIONS} onSave={setOrderStatus} />
                  <DeleteButton id={o.id} label="" onDelete={deleteOrder} />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-100">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="bg-zinc-50/70 text-[10px] font-extrabold text-zinc-400">
                      <th className="px-3 py-2 text-start">کالا</th>
                      <th className="px-3 py-2 text-start">تعداد</th>
                      <th className="px-3 py-2 text-start">فی</th>
                      <th className="px-3 py-2 text-start">جمع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {o.items.map((it, i) => (
                      <tr key={i} className="text-[12px]">
                        <td className="px-3 py-2.5 font-bold text-zinc-700">
                          {it.name}
                          {it.partNumber && (
                            <span className="mr-2 text-[10px] font-medium text-zinc-400" dir="ltr">
                              OEM: {it.partNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-zinc-700 tnum">{toFaDigits(it.qty)}</td>
                        <td className="px-3 py-2.5 text-zinc-500 tnum">{formatPrice(it.price)}</td>
                        <td className="px-3 py-2.5 font-extrabold text-zinc-800 tnum">
                          {formatPrice(it.price * it.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* پنل پرداخت و تغییر مرحله سفارش */}
              <OrderPaymentPanel order={o} />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-zinc-400 tnum">{formatDateTime(o.createdAt)}</p>
                <p className="text-[15px] font-black text-gold-700 tnum">
                  مجموع: {formatPrice(o.total)} تومان
                </p>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
