import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "افزودن محصول" };

export default async function NewProductPage() {
  await ensureSeed();
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  return (
    <ProductForm
      categories={cats.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
