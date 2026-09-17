import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    brand: text("brand").notNull().default(""),
    partNumber: text("part_number").notNull().default(""),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    price: integer("price").notNull().default(0),
    compareAtPrice: integer("compare_at_price"),
    stock: integer("stock").notNull().default(0),
    shortDesc: text("short_desc").notNull().default(""),
    description: text("description").notNull().default(""),
    benefits: jsonb("benefits")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    specs: jsonb("specs")
      .$type<{ label: string; value: string }[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    compatibility: jsonb("compatibility")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    images: jsonb("images")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    featured: boolean("featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_active_idx").on(t.active),
  ],
);

export const siteContents = pgTable("site_contents", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const wholesaleInquiries = pgTable("wholesale_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull().default(""),
  phone: text("phone").notNull(),
  productType: text("product_type").notNull().default(""),
  quantity: text("quantity").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),

  // ✅ فیلدهای جدید آدرس
  province: text("province").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  plateNumber: text("plate_number").notNull().default(""),

  note: text("note").notNull().default(""),
  items: jsonb("items")
    .$type<
      {
        productId: string | null;
        name: string;
        partNumber: string;
        price: number;
        qty: number;
      }[]
    >()
    .notNull(),
  total: integer("total").notNull().default(0),
  status: text("status").notNull().default("new"),
  // ── فلو پرداخت و پیگیری سفارش (فقط ADD — ستون status دست‌نخورده باقی ماند) ──
  paymentMethod: text("payment_method").notNull().default("online"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  orderStatus: text("order_status").notNull().default("pending"),
  receiptImage: text("receipt_image"),
  rejectionReason: text("rejection_reason"),
  trackingCode: text("tracking_code").unique(),
  // ✅ حساب کاربری مالک سفارش (nullable برای سفارش‌های قدیمی مهمان)
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── احراز هویت کاربران فروشگاه (جدا از admins) ──
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  email: text("email"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type WholesaleRow = typeof wholesaleInquiries.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type AdminRow = typeof admins.$inferSelect;
export type UserRow = typeof users.$inferSelect;
