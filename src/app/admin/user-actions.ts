"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionAdmin } from "@/lib/auth";

async function guard() {
  const admin = await getSessionAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

/** ویرایش یادداشت خصوصی مدیر درباره کاربر (فقط ادمین می‌بیند) */
export async function updateUserNote(id: number, note: string) {
  await guard();
  const adminNote = note.trim().slice(0, 2000) || null;
  await db.update(users).set({ adminNote }).where(eq(users.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true as const };
}
