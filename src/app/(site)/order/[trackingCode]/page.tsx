import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { OrderStatusView } from "@/components/site/order-status-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پیگیری سفارش",
  description: "مشاهده وضعیت سفارش با کد پیگیری.",
};

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = await params;
  const code = decodeURIComponent(trackingCode).trim();
  if (!code) notFound();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.trackingCode, code))
    .limit(1);

  if (!order) notFound();

  return (
    <div className="bg-gold-radial">
      <div className="container-x py-8 sm:py-12">
        <OrderStatusView order={order} />
      </div>
    </div>
  );
}
