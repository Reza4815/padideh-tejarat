import { NextResponse } from "next/server";
import { clearUserSessionCookie } from "@/lib/user-auth";

async function doLogout() {
  await clearUserSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function POST() {
  return doLogout();
}

// خروج با لینک مستقیم هم پشتیبانی می‌شود
export async function GET() {
  return doLogout();
}
