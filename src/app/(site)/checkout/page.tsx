import type { Metadata } from "next";
import { CheckoutView } from "@/components/site/checkout-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پرداخت سفارش",
  description: "انتخاب روش پرداخت و ثبت نهایی سفارش.",
};

export default function CheckoutPage() {
  return (
    <div className="bg-gold-radial">
      <div className="container-x py-8 sm:py-12">
        <CheckoutView />
      </div>
    </div>
  );
}
