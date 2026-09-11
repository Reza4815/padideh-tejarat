import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "ویرایش محصول" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    partNumber: product.partNumber,
    categoryId: product.categoryId,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    shortDesc: product.shortDesc,
    description: product.description,
    benefits: product.benefits ?? [],
    specs: product.specs ?? [],
    compatibility: product.compatibility ?? [],
    images: product.images ?? [],
    featured: product.featured,
    active: product.active,
  };

  return <ProductForm categories={cats.map((c) => ({ id: c.id, name: c.name }))} initial={initial} />;
}
