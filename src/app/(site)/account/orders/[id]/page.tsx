import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/user-auth";
import { OrderStatusView } from "@/components/site/order-status-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "جزئیات سفارش",
  description: "مشاهده جزئیات و وضعیت سفارش.",
};

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/auth/login?redirect=/account");

  const { id } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) notFound();

  // فقط مالک سفارش (user_id یا شماره موبایل قدیمی) اجازه مشاهده دارد
  const isOwner =
    (order.userId !== null && order.userId === user.id) ||
    (order.userId === null && order.phone === user.phone);
  if (!isOwner) notFound();

  return (
    <div className="bg-gold-radial">
      <div className="container-x pt-6 sm:pt-8">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-zinc-500 transition hover:text-gold-700 dark:text-zinc-400 dark:hover:text-gold-400"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به حساب کاربری
        </Link>
      </div>
      <div className="container-x py-4 sm:py-6">
        <OrderStatusView order={order} />
      </div>
    </div>
  );
}
