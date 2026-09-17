import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { CheckoutView } from "@/components/site/checkout-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پرداخت سفارش",
  description: "انتخاب روش پرداخت و ثبت نهایی سفارش.",
};

export default async function CheckoutPage() {
  // ورود فقط در مرحله تسویه الزامی است (میهمان می‌تواند تا سبد خرید پیش برود)
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/auth/login?redirect=/checkout");

  return (
    <div className="bg-gold-radial">
      <div className="container-x py-8 sm:py-12">
        <CheckoutView />
      </div>
    </div>
  );
}
