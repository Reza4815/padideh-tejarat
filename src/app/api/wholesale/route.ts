import { NextResponse } from "next/server";
import { db } from "@/db";
import { wholesaleInquiries } from "@/db/schema";
import { ensureSeed } from "@/lib/data";

export async function POST(req: Request) {
  try {
    await ensureSeed();
    const body = (await req.json()) as {
      name?: string;
      company?: string;
      phone?: string;
      productType?: string;
      quantity?: string;
      message?: string;
    };
    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    if (!name || !phone || phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json(
        { ok: false, error: "نام و شماره تماس معتبر الزامی است" },
        { status: 400 },
      );
    }
    await db.insert(wholesaleInquiries).values({
      name,
      company: (body.company ?? "").trim(),
      phone,
      productType: (body.productType ?? "").trim(),
      quantity: (body.quantity ?? "").trim(),
      message: (body.message ?? "").trim().slice(0, 2000),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
