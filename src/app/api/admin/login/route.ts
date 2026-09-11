import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ADMIN_COOKIE, signToken, verifyPassword } from "@/lib/auth";
import { ensureSeed } from "@/lib/data";

export async function POST(req: Request) {
  try {
    await ensureSeed();
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "نام کاربری و رمز عبور را وارد کنید" }, { status: 400 });
    }
    const [admin] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ ok: false, error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, signToken(admin), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
