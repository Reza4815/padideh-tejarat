import type { Metadata } from "next";
import { CartView } from "@/components/site/cart-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سبد خرید",
  description: "بازبینی و تکمیل سفارش قطعات یدکی.",
};

export default function CartPage() {
  return (
    <div className="bg-gold-radial">
      <div className="container-x py-8 sm:py-12">
        <CartView />
      </div>
    </div>
  );
}
