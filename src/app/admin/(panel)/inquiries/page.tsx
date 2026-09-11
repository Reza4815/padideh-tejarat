import { desc } from "drizzle-orm";
import { ClipboardList } from "lucide-react";
import { db } from "@/db";
import { wholesaleInquiries } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { deleteInquiry, setInquiryStatus } from "@/app/admin/actions";
import { DeleteButton, StatusSelect } from "@/components/admin/table-widgets";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "استعلام‌های عمده‌فروشی" };

const OPTIONS = [
  { value: "new", label: "جدید" },
  { value: "contacted", label: "پیگیری شد" },
  { value: "done", label: "تکمیل" },
];

export default async function AdminInquiriesPage() {
  await ensureSeed();
  const rows = await db.select().from(wholesaleInquiries).orderBy(desc(wholesaleInquiries.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-ink-950">استعلام‌های عمده‌فروشی</h1>
        <p className="mt-1 text-xs text-zinc-400 tnum">{rows.length} درخواست ثبت شده</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <ClipboardList className="h-8 w-8 text-gold-300" />
          <p className="text-sm font-bold text-zinc-500">هنوز استعلامی ثبت نشده است</p>
          <p className="text-xs text-zinc-400">فرم عمده‌فروشی صفحه اصلی، درخواست‌ها را اینجا نمایش می‌دهد</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60">
                <th className="admin-th">نام / شرکت</th>
                <th className="admin-th">تماس</th>
                <th className="admin-th">نوع قطعات</th>
                <th className="admin-th">تعداد</th>
                <th className="admin-th">پیام</th>
                <th className="admin-th">تاریخ</th>
                <th className="admin-th">وضعیت</th>
                <th className="admin-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((w) => (
                <tr key={w.id} className={w.status === "new" ? "bg-gold-50/40" : undefined}>
                  <td className="admin-td">
                    <p className="text-[13px] font-extrabold text-zinc-800">{w.name}</p>
                    {w.company && <p className="mt-0.5 text-[10px] text-zinc-400">{w.company}</p>}
                  </td>
                  <td className="admin-td">
                    <span className="text-[12px] font-bold text-zinc-700 tnum" dir="ltr">{w.phone}</span>
                  </td>
                  <td className="admin-td text-[12px]">{w.productType || "—"}</td>
                  <td className="admin-td text-[12px]">{w.quantity || "—"}</td>
                  <td className="admin-td">
                    <p className="max-w-56 truncate text-[12px] text-zinc-500" title={w.message}>
                      {w.message || "—"}
                    </p>
                  </td>
                  <td className="admin-td">
                    <span className="whitespace-nowrap text-[11px] text-zinc-400 tnum">{formatDateTime(w.createdAt)}</span>
                  </td>
                  <td className="admin-td">
                    <StatusSelect id={w.id} value={w.status} options={OPTIONS} onSave={setInquiryStatus} />
                  </td>
                  <td className="admin-td">
                    <DeleteButton id={w.id} label="" onDelete={deleteInquiry} />
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
