import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  PHONE_RE,
  normalizePhone,
  publicUser,
  setUserSessionCookie,
  verifyUserPassword,
} from "@/lib/user-auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      phone?: string;
      password?: string;
    };

    const phone = normalizePhone(String(body.phone ?? ""));
    const password = String(body.password ?? "");

    if (!PHONE_RE.test(phone)) {
      return NextResponse.json(
        { ok: false, error: "شماره موبایل معتبر نیست" },
        { status: 400 },
      );
    }
    if (!password) {
      return NextResponse.json(
        { ok: false, error: "رمز عبور را وارد کنید" },
        { status: 400 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "حسابی با این شماره موبایل یافت نشد؛ ابتدا ثبت‌نام کنید" },
        { status: 401 },
      );
    }

    const valid = await verifyUserPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "رمز عبور اشتباه است" },
        { status: 401 },
      );
    }

    await setUserSessionCookie(user.id);
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "خطای سرور؛ لطفاً دوباره تلاش کنید" },
      { status: 500 },
    );
  }
}
