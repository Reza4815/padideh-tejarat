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
      return NextResponse.json(
        { ok: false, error: "سبد خرید خالی است" },
        { status: 400 },
      );
    }

    // فقط id محصولات رو از کلاینت می‌گیریم (به بقیه فیلدها اعتماد نمی‌کنیم)
    const ids = rawItems
      .map((i) => i.id)
      .filter((x): x is string => Boolean(x));

    if (ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "شناسه محصولات نامعتبر است" },
        { status: 400 },
      );
    }

    const dbRows = await db
      .select()
      .from(products)
      .where(inArray(products.id, ids));
    const byId = new Map(dbRows.map((r) => [r.id, r]));

    // ⚠️ همه چیز از دیتابیس خونده میشه، نه از کلاینت
    const items = rawItems
      .map((i) => {
        const dbp = i.id ? byId.get(i.id) : undefined;

        // اگه محصول توی DB نبود → کاملاً رد کن
        if (!dbp) return null;

        // اگه محصول غیرفعال بود → رد کن
        if (!dbp.active) return null;

        const qty = Math.max(1, Math.min(999, Math.floor(Number(i.qty) || 1)));

        // اگه موجودی کافی نبود → با موجودی موجود ثبت کن (یا کلاً رد کن)
        const safeQty = dbp.stock > 0 ? Math.min(qty, dbp.stock) : qty;

        return {
          productId: dbp.id,
          name: dbp.name,
          partNumber: dbp.partNumber,
          price: dbp.price, // ✅ قیمت همیشه از دیتابیس
          qty: safeQty,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "هیچ محصول معتبری در سبد یافت نشد" },
        { status: 400 },
      );
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
    return NextResponse.json(
      { ok: false, error: "خطای سرور" },
      { status: 500 },
    );
  }
}
