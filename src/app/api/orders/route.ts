import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ensureSeed } from "@/lib/data";
import { generateTrackingCode } from "@/lib/payment";

type IncomingItem = {
  id?: string;
  qty?: number;
};

export async function POST(req: Request) {
  try {
    await ensureSeed();
    const body = (await req.json()) as {
      customerName?: string;
      phone?: string;
      province?: string;
      city?: string;
      address?: string;
      postalCode?: string;
      plateNumber?: string;
      note?: string;
      items?: IncomingItem[];
      paymentMethod?: string;
    };

    const paymentMethod = body.paymentMethod === "card" ? "card" : "online";

    const customerName = (body.customerName ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const province = (body.province ?? "").trim();
    const city = (body.city ?? "").trim();
    const address = (body.address ?? "").trim();
    const postalCode = (body.postalCode ?? "").trim();
    const plateNumber = (body.plateNumber ?? "").trim();

    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 40) : [];

    // اعتبارسنجی فیلدهای اجباری
    if (!customerName) {
      return NextResponse.json(
        { ok: false, error: "نام و نام خانوادگی الزامی است" },
        { status: 400 },
      );
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { ok: false, error: "شماره موبایل معتبر الزامی است" },
        { status: 400 },
      );
    }
    if (!province) {
      return NextResponse.json(
        { ok: false, error: "استان الزامی است" },
        { status: 400 },
      );
    }
    if (!city) {
      return NextResponse.json(
        { ok: false, error: "شهر الزامی است" },
        { status: 400 },
      );
    }
    if (address.length < 5) {
      return NextResponse.json(
        { ok: false, error: "آدرس پستی الزامی است (حداقل ۵ کاراکتر)" },
        { status: 400 },
      );
    }
    if (!/^\d{10}$/.test(postalCode.replace(/\D/g, ""))) {
      return NextResponse.json(
        { ok: false, error: "کد پستی باید ۱۰ رقم باشد" },
        { status: 400 },
      );
    }
    if (rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "سبد خرید خالی است" },
        { status: 400 },
      );
    }

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

    const items = rawItems
      .map((i) => {
        const dbp = i.id ? byId.get(i.id) : undefined;
        if (!dbp) return null;
        if (!dbp.active) return null;

        const qty = Math.max(1, Math.min(999, Math.floor(Number(i.qty) || 1)));
        const safeQty = dbp.stock > 0 ? Math.min(qty, dbp.stock) : qty;

        return {
          productId: dbp.id,
          name: dbp.name,
          partNumber: dbp.partNumber,
          price: dbp.price,
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

    // تولید کد پیگیری یکتا با فرمت ORD-YYYYMMDD-XXX
    let trackingCode = generateTrackingCode();
    for (let i = 0; i < 5; i++) {
      const [dup] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.trackingCode, trackingCode))
        .limit(1);
      if (!dup) break;
      trackingCode = generateTrackingCode();
    }

    const [row] = await db
      .insert(orders)
      .values({
        customerName,
        phone,
        province,
        city,
        address,
        postalCode: postalCode.replace(/\D/g, ""),
        plateNumber,
        note: (body.note ?? "").trim().slice(0, 1000),
        items,
        total,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        trackingCode,
      })
      .returning({ id: orders.id });

    return NextResponse.json({ ok: true, id: row.id, trackingCode });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "خطای سرور" },
      { status: 500 },
    );
  }
}
