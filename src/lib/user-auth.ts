// ─────────────────────────────────────────────────────────────
// احراز هویت کاربران فروشگاه — کاملاً جدا از احراز هویت ادمین.
// (ادمین: src/lib/auth.ts با کوکی "pta_admin" — این فایل به آن دست نمی‌زند)
// کاربران: کوکی "session" + JWT (jose) + هش bcryptjs — انقضا ۳۰ روز.
// ─────────────────────────────────────────────────────────────
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { users, type UserRow } from "@/db/schema";

export const USER_COOKIE = "session";
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 روز

function jwtSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "pta-local-auth");
}

export const PHONE_RE = /^09[0-9]{9}$/;

export function normalizePhone(input: string) {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return input
    .trim()
    .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
    .replace(/[\s-]/g, "");
}

export function publicUser(u: UserRow) {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
  };
}

export async function hashUserPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyUserPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** ساخت توکن JWT حاوی شناسه کاربر (۳۰ روزه) */
export async function createUserSession(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecret());
}

/** اعتبارسنجی توکن؛ در صورت نامعتبر بودن null */
export async function verifyUserSession(
  token: string,
): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) return null;
    return { userId };
  } catch {
    return null;
  }
}

export async function setUserSessionCookie(userId: number) {
  const token = await createUserSession(userId);
  const store = await cookies();
  store.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearUserSessionCookie() {
  const store = await cookies();
  store.set(USER_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyUserSession(token);
  if (!session) return null;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  return user ?? null;
}

export async function requireUser(): Promise<UserRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED_USER");
  return user;
}
