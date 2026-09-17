import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, publicUser } from "@/lib/user-auth";

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "وارد نشده‌اید" },
      { status: 401 },
    );
  }
  return NextResponse.json({ ok: true, user: publicUser(user) });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ویرایش پروفایل کاربر (نام و ایمیل) */
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser().catch(() => null);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "وارد نشده‌اید" },
        { status: 401 },
      );
    }
    const body = (await req.json()) as { name?: string; email?: string };
    const name = String(body.name ?? "").trim().slice(0, 100);
    const emailRaw = String(body.email ?? "").trim().slice(0, 150);

    if (emailRaw && !EMAIL_RE.test(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: "ایمیل معتبر نیست" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(users)
      .set({ name: name || null, email: emailRaw || null })
      .where(eq(users.id, user.id))
      .returning();
    return NextResponse.json({ ok: true, user: publicUser(updated) });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "خطای سرور؛ لطفاً دوباره تلاش کنید" },
      { status: 500 },
    );
  }
}
