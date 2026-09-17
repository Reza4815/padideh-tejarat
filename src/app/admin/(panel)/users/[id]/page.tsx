import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, users, type OrderRow } from "@/db/schema";
import { UserNoteEditor } from "@/components/admin/user-note-editor";
import { UserDetailTabs } from "@/components/admin/user-detail-tabs";
import { UserOrdersTable } from "@/components/admin/user-orders-table";
import { PaymentSummaryCards } from "@/components/admin/payment-summary-cards";
import { UserAddressesCard } from "@/components/admin/user-addresses-card";
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

  const name = user.name?.trim();
  const initial = (name ? name[0] : user.phone.slice(-2)) || "؟";

  return (
    <div className="space-y-5">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-zinc-500 transition hover:text-gold-700 dark:text-zinc-400 dark:hover:text-gold-400"
      >
        <ArrowRight className="h-4 w-4" />
        بازگشت به فهرست کاربران
      </Link>

      {/* اطلاعات کاربر */}
      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-100 bg-white p-5 sm:flex-nowrap dark:border-zinc-800 dark:bg-zinc-900">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-xl font-black text-zinc-950 shadow-[0_10px_24px_-10px_rgba(207,163,56,0.9)]">
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black tracking-tight text-ink-950 dark:text-zinc-100">
            <span className="tnum" dir="ltr">
              {user.phone}
            </span>
          </h1>
          {name ? (
            <p className="mt-0.5 truncate text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {name}
            </p>
          ) : (
            <p className="mt-0.5 text-[12px] font-bold text-zinc-400">—</p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 tnum dark:text-zinc-500">
            <CalendarDays className="h-3.5 w-3.5" />
            عضویت از {formatDateTime(user.createdAt)}
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between gap-4 rounded-xl bg-gold-50 px-4 py-3 sm:w-auto sm:flex-col sm:items-start dark:bg-gold-950/30">
          <div>
            <p className="text-[10px] font-bold text-zinc-400">
              تعداد سفارش
            </p>
            <p className="text-lg font-black text-ink-950 tnum dark:text-zinc-100">
              {toFaDigits(mine.length)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold text-zinc-400">مجموع خرید</p>
            <p className="text-sm font-black text-gold-700 tnum dark:text-gold-400">
              {formatPrice(sum(mine))}
              <span className="mr-1 text-[10px] font-bold text-zinc-400">
                تومان
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* یادداشت مدیر (ویرایش درون‌خطی) */}
      <UserNoteEditor userId={user.id} initialNote={user.adminNote} />

      {/* تب‌ها */}
      <UserDetailTabs
        ordersCount={mine.length}
        addressesCount={addresses.length}
        orders={<UserOrdersTable orders={mine} />}
        payments={
          <PaymentSummaryCards
            onlineOk={{ count: onlineOk.length, total: sum(onlineOk) }}
            cardOk={{ count: cardOk.length, total: sum(cardOk) }}
            rejected={{ count: rejected.length, total: sum(rejected) }}
            pending={{ count: pending.length, total: sum(pending) }}
          />
        }
        addresses={<UserAddressesCard addresses={addresses} />}
      />
    </div>
  );
}