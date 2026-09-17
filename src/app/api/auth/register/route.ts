import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  PHONE_RE,
  hashUserPassword,
  normalizePhone,
  publicUser,
  setUserSessionCookie,
} from "@/lib/user-auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      phone?: string;
      password?: string;
      confirmPassword?: string;
    };

    const phone = normalizePhone(String(body.phone ?? ""));
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!PHONE_RE.test(phone)) {
      return NextResponse.json(
        { ok: false, error: "شماره موبایل معتبر نیست (مثال: 09123456789)" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "رمز عبور باید حداقل ۸ کاراکتر باشد" },
        { status: 400 },
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: "تکرار رمز عبور با رمز عبور مطابقت ندارد" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "این شماره موبایل قبلاً ثبت‌نام کرده است؛ وارد شوید" },
        { status: 409 },
      );
    }

    const passwordHash = await hashUserPassword(password);
    const [user] = await db
      .insert(users)
      .values({ phone, passwordHash })
      .returning();

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
