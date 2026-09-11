import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { ensureSeed } from "@/lib/data";

type IncomingItem = {
  id?: string;
  name?: string;
  partNumber?: string;
  price?: number;
  qty?: number;
};

export async function POST(req: Request) {
  try {
    await ensureSeed();
    const body = (await req.json()) as {
      customerName?: string;
      phone?: string;
      note?: string;
      items?: IncomingItem[];
    };
    const customerName = (body.customerName ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 40) : [];

    if (!customerName || !phone || phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json(
        { ok: false, error: "نام و شماره تماس معتبر الزامی است" },
        { status: 400 },
      );
    }
    if (rawItems.length === 0) {
      return NextResponse.json({ ok: false, error: "سبد خرید خالی است" }, { status: 400 });
    }

    const ids = rawItems.map((i) => i.id).filter((x): x is string => Boolean(x));
    const dbRows = ids.length
      ? await db.select().from(products).where(inArray(products.id, ids))
      : [];
    const byId = new Map(dbRows.map((r) => [r.id, r]));

    const items = rawItems
      .map((i) => {
        const qty = Math.max(1, Math.min(999, Math.floor(Number(i.qty) || 1)));
        const dbp = i.id ? byId.get(i.id) : undefined;
        return {
          productId: dbp?.id ?? null,
          name: dbp?.name ?? (i.name ?? "").slice(0, 200),
          partNumber: dbp?.partNumber ?? (i.partNumber ?? "").slice(0, 80),
          price: dbp?.price ?? Math.max(0, Math.floor(Number(i.price) || 0)),
          qty,
        };
      })
      .filter((i) => i.name || i.productId);

    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "اقلام نامعتبر است" }, { status: 400 });
    }
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);

    const [row] = await db
      .insert(orders)
      .values({
        customerName,
        phone,
        note: (body.note ?? "").trim().slice(0, 1000),
        items,
        total,
      })
      .returning({ id: orders.id });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
