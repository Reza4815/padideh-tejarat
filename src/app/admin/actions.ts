"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
  categories,
  orders,
  products,
  siteContents,
  wholesaleInquiries,
} from "@/db/schema";
import { getSessionAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function guard() {
  const admin = await getSessionAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/products");
}

/* --------------------------------- products -------------------------------- */

export type ProductInput = {
  id?: string;
  name: string;
  slug?: string;
  brand: string;
  partNumber: string;
  categoryId: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  shortDesc: string;
  description: string;
  benefits: string[];
  specs: { label: string; value: string }[];
  compatibility: string[];
  images: string[];
  featured: boolean;
  active: boolean;
};

async function uniqueProductSlug(base: string, excludeId?: string) {
  const root = base || `part-${Date.now().toString(36)}`;
  let slug = root;
  for (let i = 1; i <= 20; i++) {
    const [found] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!found || found.id === excludeId) return slug;
    slug = `${root}-${i + 1}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function saveProduct(input: ProductInput) {
  await guard();
  const slug = await uniqueProductSlug(slugify(input.slug?.trim() || "") || slugify(input.name) || slugify(input.partNumber), input.id);

  const values = {
    name: input.name.trim(),
    slug,
    brand: input.brand.trim(),
    partNumber: input.partNumber.trim(),
    categoryId: input.categoryId || null,
    price: Math.max(0, Math.floor(Number(input.price) || 0)),
    compareAtPrice:
      input.compareAtPrice && Number(input.compareAtPrice) > 0
        ? Math.floor(Number(input.compareAtPrice))
        : null,
    stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
    shortDesc: input.shortDesc.trim(),
    description: input.description.trim(),
    benefits: input.benefits.map((b) => b.trim()).filter(Boolean),
    specs: input.specs.filter((s) => s.label.trim() || s.value.trim()),
    compatibility: input.compatibility.map((c) => c.trim()).filter(Boolean),
    images: input.images.filter(Boolean),
    featured: Boolean(input.featured),
    active: Boolean(input.active),
    updatedAt: new Date(),
  };

  if (input.id) {
    await db.update(products).set(values).where(eq(products.id, input.id));
  } else {
    await db.insert(products).values(values);
  }
  revalidateStore();
  return { ok: true as const, slug };
}

export async function deleteProduct(id: string) {
  await guard();
  await db.delete(products).where(eq(products.id, id));
  revalidateStore();
  return { ok: true as const };
}

export async function toggleProductFlag(id: string, field: "featured" | "active", value: boolean) {
  await guard();
  await db
    .update(products)
    .set({ [field]: value, updatedAt: new Date() } as never)
    .where(eq(products.id, id));
  revalidateStore();
  return { ok: true as const };
}

/* -------------------------------- categories ------------------------------- */

export type CategoryInput = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  image: string;
  sort: number;
};

async function uniqueCategorySlug(base: string, excludeId?: string) {
  const root = base || `cat-${Date.now().toString(36)}`;
  let slug = root;
  for (let i = 1; i <= 20; i++) {
    const [found] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (!found || found.id === excludeId) return slug;
    slug = `${root}-${i + 1}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function saveCategory(input: CategoryInput) {
  await guard();
  const slug = await uniqueCategorySlug(slugify(input.slug?.trim() || "") || slugify(input.name), input.id);
  const values = {
    name: input.name.trim(),
    slug,
    description: input.description.trim(),
    image: input.image.trim(),
    sort: Math.floor(Number(input.sort) || 0),
  };
  if (input.id) {
    await db.update(categories).set(values).where(eq(categories.id, input.id));
  } else {
    await db.insert(categories).values(values);
  }
  revalidateStore();
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  await guard();
  await db.delete(categories).where(eq(categories.id, id));
  revalidateStore();
  return { ok: true as const };
}

/* --------------------------------- content --------------------------------- */

export async function saveContent(key: string, value: unknown) {
  await guard();
  await db
    .insert(siteContents)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteContents.key,
      set: { value, updatedAt: new Date() },
    });
  revalidateStore();
  return { ok: true as const };
}

/* ------------------------------ wholesale/orders ---------------------------- */

export async function setInquiryStatus(id: string, status: string) {
  await guard();
  await db.update(wholesaleInquiries).set({ status }).where(eq(wholesaleInquiries.id, id));
  revalidatePath("/admin/inquiries");
  return { ok: true as const };
}

export async function deleteInquiry(id: string) {
  await guard();
  await db.delete(wholesaleInquiries).where(eq(wholesaleInquiries.id, id));
  revalidatePath("/admin/inquiries");
  return { ok: true as const };
}

export async function setOrderStatus(id: string, status: string) {
  await guard();
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  return { ok: true as const };
}

export async function deleteOrder(id: string) {
  await guard();
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  return { ok: true as const };
}

/* --------------------------------- settings -------------------------------- */

export async function changeCredentials(input: {
  currentPassword: string;
  newUsername: string;
  newPassword: string;
}) {
  const admin = await guard();
  if (!verifyPassword(input.currentPassword, admin.passwordHash)) {
    return { ok: false as const, error: "رمز عبور فعلی اشتباه است" };
  }
  const username = input.newUsername.trim();
  if (username.length < 3) return { ok: false as const, error: "نام کاربری باید حداقل ۳ کاراکتر باشد" };
  if (input.newPassword.length < 4)
    return { ok: false as const, error: "رمز عبور جدید باید حداقل ۴ کاراکتر باشد" };

  await db
    .update(admins)
    .set({ username, passwordHash: hashPassword(input.newPassword), updatedAt: new Date() })
    .where(eq(admins.id, admin.id));
  return { ok: true as const };
}
