import Link from "next/link";
import { desc } from "drizzle-orm";
import { Phone, Users } from "lucide-react";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "کاربران" };

export default async function AdminUsersPage() {
  const [userRows, orderRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(orders),
  ]);

  // تجمیع سفارش‌ها به‌ازای هر کاربر (user_id + شماره موبایل قدیمی)
  const stats = userRows.map((u) => {
    const mine = orderRows.filter(
      (o) => o.userId === u.id || o.phone === u.phone,
    );
    const total = mine.reduce((s, o) => s + (o.total ?? 0), 0);
    const last = mine.reduce<Date | null>(
      (acc, o) =>
        !acc || (o.createdAt && o.createdAt > acc) ? (o.createdAt ?? acc) : acc,
      null,
    );
    return { user: u, count: mine.length, total, last };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-ink-950 dark:text-zinc-100">
          کاربران
        </h1>
        <p className="mt-1 text-xs text-zinc-400 tnum">
          {toFaDigits(userRows.length)} کاربر ثبت‌نام کرده
        </p>
      </div>

      {userRows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Users className="h-8 w-8 text-gold-300" />
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
            هنوز کاربری ثبت‌نام نکرده است
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-zinc-50/70 text-[10px] font-extrabold text-zinc-400 dark:bg-zinc-800/60">
                <th className="admin-th">موبایل / نام</th>
                <th className="admin-th">تاریخ ثبت‌نام</th>
                <th className="admin-th">تعداد سفارش</th>
                <th className="admin-th">مجموع خرید</th>
                <th className="admin-th">آخرین سفارش</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {stats.map(({ user, count, total, last }) => (
                <tr
                  key={user.id}
                  className="transition hover:bg-gold-50/50 dark:hover:bg-zinc-800/60"
                >
                  <td className="admin-td">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-extrabold text-gold-700 hover:underline dark:text-gold-400"
                    >
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        <span dir="ltr" className="tnum">
                          {user.phone}
                        </span>
                      </span>
                    </Link>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {user.name || "—"}
                    </p>
                  </td>
                  <td className="admin-td text-[12px] tnum">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="admin-td font-extrabold tnum">
                    {toFaDigits(count)}
                  </td>
                  <td className="admin-td font-extrabold tnum">
                    {formatPrice(total)}{" "}
                    <span className="text-[10px] font-bold text-zinc-400">
                      تومان
                    </span>
                  </td>
                  <td className="admin-td text-[12px] tnum">
                    {last ? formatDateTime(last) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
