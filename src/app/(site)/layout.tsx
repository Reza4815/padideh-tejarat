import type { ReactNode } from "react";
import { CartProvider } from "@/components/site/cart-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSiteContent } from "@/lib/content";
import { listCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [contact, footerContent, categories] = await Promise.all([
    getSiteContent("contact"),
    getSiteContent("footer"),
    listCategories().catch(() => []),
  ]);

  return (
    <CartProvider>
      <Header phone={contact.phones[0] ?? ""} hours={contact.hours} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer contact={contact} footer={footerContent} categories={categories} />
    </CartProvider>
  );
}
