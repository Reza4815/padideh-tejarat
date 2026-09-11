import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins, type AdminRow } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ADMIN_COOKIE = "pta_admin";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const calc = scryptSync(password, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return calc.length === ref.length && timingSafeEqual(calc, ref);
}

function secretFor(admin: Pick<AdminRow, "passwordHash">) {
  return `${process.env.AUTH_SECRET ?? "pta-local-auth"}:${admin.passwordHash}`;
}

export function signToken(admin: Pick<AdminRow, "username" | "passwordHash">) {
  const payload = Buffer.from(
    JSON.stringify({ u: admin.username, exp: Date.now() + TTL_SECONDS * 1000 }),
  ).toString("base64url");
  const sig = createHmac("sha256", secretFor(admin)).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function getSessionAdmin(): Promise<AdminRow | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      u?: string;
      exp?: number;
    };
    if (!data.u || !data.exp || data.exp < Date.now()) return null;
    const [admin] = await db.select().from(admins).where(eq(admins.username, data.u)).limit(1);
    if (!admin) return null;
    const expected = createHmac("sha256", secretFor(admin))
      .update(payload)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return admin;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
