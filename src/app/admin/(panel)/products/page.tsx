import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Package, Pencil, Plus } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/table-widgets";
import { ProductFlags } from "@/components/admin/product-flags";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "مدیریت محصولات" };

export default async function AdminProductsPage() {
  await ensureSeed();
  const rows = await db
    .select({ p: products, c: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-ink-950">محصولات</h1>
          <p className="mt-1 text-xs text-zinc-400 tnum">{rows.length} محصول در فروشگاه</p>
        </div>
        <Link href="/admin/products/new" className="btn-gold px-5 py-2.5 text-xs">
          <Plus className="h-4 w-4" />
          افزودن محصول جدید
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/60">
              <th className="admin-th">محصول</th>
              <th className="admin-th">دسته‌بندی</th>
              <th className="admin-th">قیمت (تومان)</th>
              <th className="admin-th">موجودی</th>
              <th className="admin-th">ویژه</th>
              <th className="admin-th">فعال</th>
              <th className="admin-th">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(({ p, c }) => (
              <tr key={p.id} className="transition hover:bg-gold-50/40">
                <td className="admin-td">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gold-50">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <Package className="h-5 w-5 text-gold-300" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="max-w-64 truncate text-[13px] font-extrabold text-zinc-800">{p.name}</p>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        <span className="font-extrabold text-gold-700">{p.brand}</span>
                        {" — "}
                        <span dir="ltr">OEM: {p.partNumber || "—"}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="admin-td">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold text-zinc-600">
                    {c?.name ?? "—"}
                  </span>
                </td>
                <td className="admin-td">
                  <span className="font-black text-ink-950 tnum">{formatPrice(p.price)}</span>
                  {p.compareAtPrice ? (
                    <span className="mr-1.5 text-[10px] text-zinc-400 line-through tnum">
                      {formatPrice(p.compareAtPrice)}
                    </span>
                  ) : null}
                </td>
                <td className="admin-td">
                  <span
                    className={
                      p.stock <= 0
                        ? "rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-500 tnum"
                        : p.stock <= 3
                          ? "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-600 tnum"
                          : "font-bold text-zinc-600 tnum"
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="admin-td">
                  <ProductFlags id={p.id} field="featured" value={p.featured} />
                </td>
                <td className="admin-td">
                  <ProductFlags id={p.id} field="active" value={p.active} />
                </td>
                <td className="admin-td">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-extrabold text-zinc-500 transition hover:border-gold-300 hover:text-gold-700"
                    >
                      <Pencil className="h-3 w-3" />
                      ویرایش
                    </Link>
                    <DeleteButton id={p.id} onDelete={deleteProduct} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-xs text-zinc-400">
                  هنوز محصولی ثبت نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
