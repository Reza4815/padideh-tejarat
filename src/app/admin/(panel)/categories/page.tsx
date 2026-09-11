import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ensureSeed } from "@/lib/data";
import { CategoryManager, type CatItem } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "مدیریت دسته‌بندی‌ها" };

export default async function AdminCategoriesPage() {
  await ensureSeed();
  const rows = await db.select().from(categories).orderBy(asc(categories.sort), asc(categories.name));

  const items: CatItem[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    sort: c.sort,
  }));

  return <CategoryManager items={items} />;
}
