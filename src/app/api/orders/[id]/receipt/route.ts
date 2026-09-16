import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

// PATCH /api/orders/[id]/receipt — اتصال رسید آپلودشده به سفارش
// بدنه: { receiptUrl: string }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { receiptUrl?: string };
    const receiptUrl = (body.receiptUrl ?? "").trim();

    if (!receiptUrl || (!receiptUrl.startsWith("http://") && !receiptUrl.startsWith("https://"))) {
      return NextResponse.json({ ok: false, error: "آدرس رسید معتبر نیست" }, { status: 400 });
    }
    if (receiptUrl.length > 2000) {
      return NextResponse.json({ ok: false, error: "آدرس رسید معتبر نیست" }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) {
      return NextResponse.json({ ok: false, error: "سفارش یافت نشد" }, { status: 404 });
    }
    // آپلود مجدد فقط وقتی مجاز است که پرداخت هنوز نهایی نشده باشد
    if (order.paymentStatus === "approved") {
      return NextResponse.json(
        { ok: false, error: "پرداخت این سفارش تأیید شده و امکان تغییر رسید نیست" },
        { status: 400 },
      );
    }

    await db
      .update(orders)
      .set({
        receiptImage: receiptUrl,
        paymentMethod: "card",
        paymentStatus: "awaiting_review",
        orderStatus: "awaiting_review",
        rejectionReason: null,
      })
      .where(eq(orders.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
