import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, ReceiptText, ShoppingBag, User } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, users, type OrderRow } from "@/db/schema";
import { UserNoteEditor } from "@/components/admin/user-note-editor";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payment";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "پروفایل کاربر" };

function sum(list: OrderRow[]) {
  return list.reduce((s, o) => s + (o.total ?? 0), 0);
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) notFound();

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));
  const mine = allOrders.filter(
    (o) => o.userId === user.id || o.phone === user.phone,
  );

  // خلاصه پرداخت
  const onlineOk = mine.filter(
    (o) => o.paymentMethod === "online" && o.paymentStatus === "approved",
  );
  const cardOk = mine.filter(
    (o) => o.paymentMethod === "card" && o.paymentStatus === "approved",
  );
  const rejected = mine.filter((o) => o.paymentStatus === "rejected");
  const pending = mine.filter(
    (o) =>
      o.paymentStatus === "pending" || o.paymentStatus === "awaiting_review",
  );

  // آدرس‌های یکتا
  const addrMap = new Map<string, OrderRow>();
  for (const o of mine) {
    const key = [o.province, o.city, o.address, o.postalCode, o.plateNumber]
      .map((x) => (x ?? "").trim())
      .join("|");
    if (!addrMap.has(key)) addrMap.set(key, o);
  }
  const addresses = [...addrMap.values()];

  return (
    <div className="space-y-5">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-zinc-500 transition hover:text-gold-700 dark:text-zinc-400 dark:hover:text-gold-400"
      >
        <ArrowRight className="h-4 w-4" />
        بازگشت به فهرست کاربران
      </Link>

      {/* بخش ۱: اطلاعات کاربر */}
      <section className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="flex items-center gap-1.5 text-base font-black text-ink-950 dark:text-zinc-100">
          <User className="h-4.5 w-4.5 text-gold-600" />
          <span className="tnum" dir="ltr">
            {user.phone}
          </span>
        </h1>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
            <dt className="text-[11px] font-bold text-zinc-400">نام</dt>
            <dd className="mt-0.5 font-extrabold text-zinc-700 dark:text-zinc-200">
              {user.name || "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
            <dt className="text-[11px] font-bold text-zinc-400">ایمیل</dt>
            <dd
              className="mt-0.5 font-extrabold text-zinc-700 dark:text-zinc-200"
              dir="ltr"
              style={{ textAlign: "right" }}
            >
              {user.email || "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
            <dt className="text-[11px] font-bold text-zinc-400">تاریخ ثبت‌نام</dt>
            <dd className="mt-0.5 font-extrabold text-zinc-700 tnum dark:text-zinc-200">
              {formatDateTime(user.createdAt)}
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
            <dt className="text-[11px] font-bold text-zinc-400">
              مجموع خرید / تعداد سفارش
            </dt>
            <dd className="mt-0.5 font-extrabold text-gold-700 tnum dark:text-gold-400">
              {formatPrice(sum(mine))} تومان • {toFaDigits(mine.length)} سفارش
            </dd>
          </div>
        </dl>
      </section>

      {/* یادداشت مدیر (ویرایش درون‌خطی) */}
      <UserNoteEditor userId={user.id} initialNote={user.adminNote} />

      {/* بخش ۲: تاریخچه سفارش‌ها */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-950 dark:text-zinc-100">
          <ShoppingBag className="h-4 w-4 text-gold-600" />
          تاریخچه سفارش‌ها
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-extrabold text-zinc-500 tnum dark:bg-zinc-800 dark:text-zinc-300">
            {toFaDigits(mine.length)}
          </span>
        </h2>
        {mine.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 bg-white py-10 text-center text-[13px] font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            سفارشی برای این کاربر ثبت نشده است
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-zinc-50/70 text-[10px] font-extrabold text-zinc-400 dark:bg-zinc-800/60">
                  <th className="admin-th">کد پیگیری</th>
                  <th className="admin-th">تاریخ</th>
                  <th className="admin-th">مبلغ</th>
                  <th className="admin-th">روش پرداخت</th>
                  <th className="admin-th">وضعیت پرداخت</th>
                  <th className="admin-th">وضعیت سفارش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {mine.map((o) => {
                  const pm = (o.paymentMethod as PaymentMethod) ?? "online";
                  const ps = (o.paymentStatus as PaymentStatus) ?? "pending";
                  return (
                    <tr
                      key={o.id}
                      className="transition hover:bg-gold-50/50 dark:hover:bg-zinc-800/60"
                    >
                      <td className="admin-td">
                        <Link
                          href={`/admin/orders#order-${o.id}`}
                          className="font-mono text-[12px] font-extrabold text-gold-700 hover:underline dark:text-gold-400"
                          dir="ltr"
                        >
                          {o.trackingCode ?? o.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="admin-td text-[12px] tnum">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="admin-td font-extrabold tnum">
                        {formatPrice(o.total)}
                      </td>
                      <td className="admin-td text-[12px]">
                        {PAYMENT_METHOD_LABEL[pm] ?? pm}
                      </td>
                      <td className="admin-td text-[12px]">
                        {PAYMENT_STATUS_LABEL[ps] ?? ps}
                      </td>
                      <td className="admin-td text-[12px]">{o.orderStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* بخش ۳: خلاصه پرداخت */}
      <section className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-950 dark:text-zinc-100">
          <ReceiptText className="h-4 w-4 text-gold-600" />
          خلاصه پرداخت
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50/70 px-4 py-3 dark:bg-emerald-950/30">
            <dt className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              آنلاین موفق (تأییدشده)
            </dt>
            <dd className="mt-0.5 font-extrabold text-zinc-800 tnum dark:text-zinc-100">
              {toFaDigits(onlineOk.length)} سفارش • {formatPrice(sum(onlineOk))}{" "}
              تومان
            </dd>
          </div>
          <div className="rounded-xl bg-emerald-50/70 px-4 py-3 dark:bg-emerald-950/30">
            <dt className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              کارت‌به‌کارت تأییدشده
            </dt>
            <dd className="mt-0.5 font-extrabold text-zinc-800 tnum dark:text-zinc-100">
              {toFaDigits(cardOk.length)} سفارش • {formatPrice(sum(cardOk))}{" "}
              تومان
            </dd>
          </div>
          <div className="rounded-xl bg-red-50/70 px-4 py-3 dark:bg-red-950/30">
            <dt className="text-[11px] font-bold text-red-600 dark:text-red-300">
              رسیدهای ردشده
            </dt>
            <dd className="mt-0.5 font-extrabold text-zinc-800 tnum dark:text-zinc-100">
              {toFaDigits(rejected.length)} مورد
            </dd>
          </div>
          <div className="rounded-xl bg-amber-50/70 px-4 py-3 dark:bg-amber-950/30">
            <dt className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              در انتظار پرداخت/بررسی
            </dt>
            <dd className="mt-0.5 font-extrabold text-zinc-800 tnum dark:text-zinc-100">
              {toFaDigits(pending.length)} سفارش • {formatPrice(sum(pending))}{" "}
              تومان
            </dd>
          </div>
        </dl>
      </section>

      {/* بخش ۴: آدرس‌ها */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-950 dark:text-zinc-100">
          <MapPin className="h-4 w-4 text-gold-600" />
          آدرس‌های استفاده‌شده
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-extrabold text-zinc-500 tnum dark:bg-zinc-800 dark:text-zinc-300">
            {toFaDigits(addresses.length)}
          </span>
        </h2>
        {addresses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 bg-white py-10 text-center text-[13px] font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            آدرسی ثبت نشده است
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {addresses.map((o) => (
              <li
                key={o.id}
                className="rounded-2xl border border-zinc-100 bg-white p-4 text-[12px] leading-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-extrabold text-zinc-700 dark:text-zinc-200">
                  {o.province} • {o.city}
                </p>
                <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                  {o.address}
                </p>
                <p className="mt-1 text-zinc-500 tnum dark:text-zinc-400">
                  کد پستی:{" "}
                  <span dir="ltr" className="tnum">
                    {o.postalCode || "—"}
                  </span>
                  {o.plateNumber ? ` • پلاک: ${o.plateNumber}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
