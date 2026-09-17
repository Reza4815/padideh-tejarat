import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser, publicUser } from "@/lib/user-auth";
import { AccountView } from "@/components/site/account-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "حساب کاربری",
  description: "مشاهده پروفایل و سفارش‌های من.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/auth/login?redirect=/account");

  const { tab } = await searchParams;
  const initialTab = tab === "orders" ? "orders" : "profile";

  // سفارش‌های کاربر: هم از طریق user_id و هم شماره موبایل (سفارش‌های قدیمی)
  const rows = await db
    .select()
    .from(orders)
    .where(or(eq(orders.userId, user.id), eq(orders.phone, user.phone)))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="bg-gold-radial">
      <AccountView
        user={publicUser(user)}
        orders={rows}
        initialTab={initialTab}
      />
    </div>
  );
}