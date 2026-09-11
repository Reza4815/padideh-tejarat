import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-gold-radial px-6">
      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-gold-100 text-gold-600">
          <Wrench className="h-9 w-9" />
        </span>
        <p className="mt-8 text-6xl font-black text-ink-950" dir="ltr">
          404
        </p>
        <h1 className="mt-3 text-lg font-black text-ink-950">صفحه موردنظر یافت نشد</h1>
        <p className="mt-2 text-sm text-zinc-500">
          ممکن است آدرس تغییر کرده یا قطعه موردنظر از فروشگاه حذف شده باشد.
        </p>
        <Link href="/" className="btn-gold mt-8">
          <ArrowRight className="h-4 w-4" />
          بازگشت به خانه
        </Link>
      </div>
    </main>
  );
}
