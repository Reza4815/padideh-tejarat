import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-gold-100 to-gold-50 text-gold-400 dark:from-zinc-800 dark:to-zinc-900">
        <Package className="h-11 w-11" strokeWidth={1.5} />
      </span>
      <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
        هنوز سفارشی ثبت نکرده‌اید
      </p>
      <Link href="/products" className="btn-gold mt-1">
        <ArrowRight className="h-4 w-4" />
        مشاهده محصولات
      </Link>
    </div>
  );
}