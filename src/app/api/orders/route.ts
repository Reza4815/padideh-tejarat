import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ensureSeed } from "@/lib/data";
import { generateTrackingCode } from "@/lib/payment";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = {
  id?: string;
  qty?: number;
};

type OrderBody = {
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

/**
 * تمام پاسخ‌های این مسیر باید JSON معتبر باشند؛ حتی در خطا.
 * این تابع تضمین می‌کند هیچ مسیری (try/catch، اعتبارسنجی، خطای غیرمنتظره)
 * پاسخ خالی یا غیر JSON برنگرداند.
 */
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    await ensureSeed();

    // ── خواندن امن بدنه ── (بدنه خراب یا خالی نباید کل درخواست را بترکاند)
    let body: OrderBody;
    try {
      body = (await req.json()) as OrderBody;
    } catch {
      return json({ ok: false, error: "داده‌های ارسالی نامعتبر است" }, 400);
    }
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "داده‌های ارسالی نامعتبر است" }, 400);
    }

    const paymentMethod = body.paymentMethod === "card" ? "card" : "online";

    const customerName = (body.customerName ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const province = (body.province ?? "").trim();
    const city = (body.city ?? "").trim();
    const address = (body.address ?? "").trim();
    const postalCode = (body.postalCode ?? "").trim();
    const plateNumber = (body.plateNumber ?? "").trim();
    const normalizedPostalCode = postalCode.replace(/\D/g, "");

    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 40) : [];

    // اعتبارسنجی فیلدهای اجباری
    if (!customerName) {
      return json({ ok: false, error: "نام و نام خانوادگی الزامی است" }, 400);
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return json({ ok: false, error: "شماره موبایل معتبر الزامی است" }, 400);
    }
    if (!province) {
      return json({ ok: false, error: "استان الزامی است" }, 400);
    }
    if (!city) {
      return json({ ok: false, error: "شهر الزامی است" }, 400);
    }
    if (address.length < 5) {
      return json({ ok: false, error: "آدرس پستی الزامی است (حداقل ۵ کاراکتر)" }, 400);
    }
    if (!/^\d{10}$/.test(normalizedPostalCode)) {
      return json({ ok: false, error: "کد پستی باید ۱۰ رقم باشد" }, 400);
    }
    if (rawItems.length === 0) {
      return json({ ok: false, error: "سبد خرید خالی است" }, 400);
    }

    const ids = rawItems
      .map((i) => i.id)
      .filter((x): x is string => Boolean(x));

    if (ids.length === 0) {
      return json({ ok: false, error: "شناسه محصولات نامعتبر است" }, 400);
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
        if (dbp.priceOnRequest) return null;

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
      return json({ ok: false, error: "هیچ محصول معتبری در سبد یافت نشد" }, 400);
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

    // اگر کاربر وارد شده باشد، سفارش به حساب او متصل می‌شود
    // (nullable تا سفارش‌های قدیمی مهمان بدون تغییر بمانند)
    const sessionUser = await getCurrentUser().catch(() => null);

    const [row] = await db
      .insert(orders)
      .values({
        customerName,
        phone,
        province,
        city,
        address,
        postalCode: normalizedPostalCode,
        plateNumber,
        note: (body.note ?? "").trim().slice(0, 1000),
        items,
        total,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        trackingCode,
        userId: sessionUser?.id ?? null,
      })
      .returning({ id: orders.id });

    // ── ذخیره آدرس تحویل روی پروفایل کاربر (برای پیش‌پر کردن خریدهای بعدی) ──
    if (sessionUser) {
      try {
        await db
          .update(users)
          .set({
            address,
            province,
            city,
            postalCode: normalizedPostalCode,
            plateNumber: plateNumber || null,
          })
          .where(eq(users.id, sessionUser.id));
      } catch (e) {
        // ذخیره آدرس نباید باعث شکست ثبت سفارش شود
        console.error("[orders] ذخیره آدرس کاربر ناموفق بود:", e);
      }
    }

    return json({ ok: true, id: row.id, trackingCode });
  } catch (e) {
    console.error("[orders]", e);
    return json({ ok: false, error: "خطای سرور؛ لطفاً دوباره تلاش کنید" }, 500);
  }
}
