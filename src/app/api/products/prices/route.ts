import { NextResponse } from "next/server";
import { inArray, eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ids?: unknown;
      mode?: "prices" | "suggested";
      excludeIds?: string[];
    };

    // ✅ حالت پیشنهاد محصول
    if (body.mode === "suggested") {
      const excludeIds = Array.isArray(body.excludeIds)
        ? body.excludeIds.filter((x): x is string => typeof x === "string")
        : [];

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
          excludeIds.length > 0
            ? and(
                eq(products.active, true),
                inArray(products.id, excludeIds).not(),
              )
            : eq(products.active, true),
        )
        .orderBy(desc(products.featured), desc(products.createdAt))
        .limit(4);

      return NextResponse.json({ prices: rows });
    }

    // ✅ حالت عادی: گرفتن قیمت‌های لحظه‌ای
    const rawIds = body?.ids;
    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return NextResponse.json({ prices: [] });
    }

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
      .where(and(inArray(products.id, cleanIds), eq(products.active, true)));

    return NextResponse.json({ prices: rows });
  } catch (error) {
    console.error("PRICES API ERROR:", error);
    return NextResponse.json(
      { error: "خطا در دریافت قیمت‌ها" },
      { status: 500 },
    );
  }
}
