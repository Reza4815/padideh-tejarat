import { desc } from "drizzle-orm";
import { Phone, ShoppingBag, StickyNote } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { deleteOrder, setOrderStatus } from "@/app/admin/actions";
import { DeleteButton, StatusSelect } from "@/components/admin/table-widgets";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "سفارش‌ها" };

const OPTIONS = [
  { value: "new", label: "جدید" },
  { value: "processing", label: "در حال پردازش" },
  { value: "done", label: "تکمیل شده" },
  { value: "canceled", label: "لغو شده" },
];

export default async function AdminOrdersPage() {
  await ensureSeed();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-ink-950">سفارش‌ها</h1>
        <p className="mt-1 text-xs text-zinc-400 tnum">{rows.length} سفارش ثبت شده</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <ShoppingBag className="h-8 w-8 text-gold-300" />
          <p className="text-sm font-bold text-zinc-500">هنوز سفارشی ثبت نشده است</p>
          <p className="text-xs text-zinc-400">سفارش‌های سبد خرید مشتریان اینجا نمایش داده می‌شود</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <article
              key={o.id}
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

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-zinc-400 tnum">{formatDateTime(o.createdAt)}</p>
                <p className="text-[15px] font-black text-gold-700 tnum">
                  مجموع: {formatPrice(o.total)} تومان
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
