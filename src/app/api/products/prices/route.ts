import { NextResponse } from "next/server";
import { inArray, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: unknown };
    const rawIds = body?.ids;

    // اعتبارسنجی: باید آرایه باشه
    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return NextResponse.json({ prices: [] });
    }

    // فقط UUID های معتبر و غیرتکراری، حداکثر ۱۰۰ تا
    const cleanIds = Array.from(
      new Set(
        rawIds.filter(
          (id): id is string => typeof id === "string" && id.trim() !== "",
        ),
      ),
    ).slice(0, 100);

    if (cleanIds.length === 0) {
      return NextResponse.json({ prices: [] });
    }

    // قیمت و اطلاعات لحظه‌ای رو از دیتابیس بگیر
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        stock: products.stock,
        partNumber: products.partNumber,
        brand: products.brand,
        images: products.images,
        active: products.active,
      })
      .from(products)
      .where(
        and(
          inArray(products.id, cleanIds),
          eq(products.active, true), // فقط محصولات فعال
        ),
      );

    return NextResponse.json({ prices: rows });
  } catch (error) {
    console.error("PRICES API ERROR:", error);
    return NextResponse.json(
      { error: "خطا در دریافت قیمت‌ها" },
      { status: 500 },
    );
  }
}
