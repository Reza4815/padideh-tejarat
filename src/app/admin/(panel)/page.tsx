import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ClipboardList, FolderTree, Package, Plus, ShoppingBag, TriangleAlert } from "lucide-react";
import { db } from "@/db";
import { categories, orders, products, wholesaleInquiries } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "داشبورد مدیریت" };

export default async function AdminDashboard() {
  await ensureSeed();

  const [productCount, categoryCount, newOrders, newInquiries, latestOrders, latestInquiries, lowStock] =
    await Promise.all([
      db.$count(products),
      db.$count(categories),
      db.$count(orders, eq(orders.status, "new")),
      db.$count(wholesaleInquiries, eq(wholesaleInquiries.status, "new")),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
      db.select().from(wholesaleInquiries).orderBy(desc(wholesaleInquiries.createdAt)).limit(5),
      db
        .select({ id: products.id, name: products.name, stock: products.stock })
        .from(products)
        .where(sql`${products.stock} <= 3`)
        .orderBy(products.stock)
        .limit(6),
    ]);

  const stats = [
    { label: "محصولات", value: productCount, icon: Package, href: "/admin/products" },
    { label: "دسته‌بندی‌ها", value: categoryCount, icon: FolderTree, href: "/admin/categories" },
    { label: "سفارش‌های جدید", value: newOrders, icon: ShoppingBag, href: "/admin/orders", hot: newOrders > 0 },
    { label: "استعلام‌های جدید", value: newInquiries, icon: ClipboardList, href: "/admin/inquiries", hot: newInquiries > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-ink-950">داشبورد</h1>
          <p className="mt-1 text-xs text-zinc-400">نمای کلی فروشگاه پدیده تجارت الوند</p>
        </div>
        <Link href="/admin/products/new" className="btn-gold px-5 py-2.5 text-xs">
          <Plus className="h-4 w-4" />
          افزودن محصول
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border border-zinc-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-[0_20px_40px_-24px_rgba(120,84,39,0.4)]"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-600 transition group-hover:bg-gold-500 group-hover:text-zinc-950">
                <s.icon className="h-5 w-5" />
              </span>
              {s.hot && <span className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />}
            </div>
            <p className="mt-4 text-2xl font-black text-ink-950 tnum">{s.value}</p>
            <p className="mt-1 text-[11px] font-bold text-zinc-400">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* latest orders */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-ink-950">آخرین سفارش‌ها</h2>
            <Link href="/admin/orders" className="text-[11px] font-extrabold text-gold-700 hover:underline">
              مشاهده همه
            </Link>
          </div>
          {latestOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-zinc-400">هنوز سفارشی ثبت نشده است</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {latestOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[13px] font-extrabold text-zinc-800">{o.customerName}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-400 tnum">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-black text-gold-700 tnum">{formatPrice(o.total)} تومان</p>
                    <p className="mt-0.5 text-[10px] font-bold text-zinc-400">
                      {o.status === "new" ? "جدید" : o.status === "processing" ? "در حال پردازش" : o.status === "done" ? "تکمیل شده" : "لغو شده"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* latest inquiries */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-ink-950">آخرین استعلام‌های عمده</h2>
            <Link href="/admin/inquiries" className="text-[11px] font-extrabold text-gold-700 hover:underline">
              مشاهده همه
            </Link>
          </div>
          {latestInquiries.length === 0 ? (
            <p className="py-8 text-center text-xs text-zinc-400">هنوز استعلامی ثبت نشده است</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {latestInquiries.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[13px] font-extrabold text-zinc-800">
                      {w.name} <span className="text-[10px] font-bold text-zinc-400">{w.company}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-400 tnum" dir="ltr">{w.phone}</p>
                  </div>
                  <p className="text-[10px] text-zinc-400 tnum">{formatDateTime(w.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {lowStock.length > 0 && (
        <section className="rounded-2xl border border-gold-200 bg-gold-50/60 p-5">
          <h2 className="flex items-center gap-2 text-sm font-black text-gold-800">
            <TriangleAlert className="h-4 w-4" />
            هشدار موجودی کم
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 text-[12px] font-bold text-zinc-700">
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-500 tnum">
                  {p.stock} عدد
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
