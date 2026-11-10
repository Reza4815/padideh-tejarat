export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("fa-IR").format(Math.max(0, Math.round(n)));
}

export function toFaDigits(n: number | string) {
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat("fa-IR").format(num);
}

export function formatDateTime(d: Date | string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));
  } catch {
    return String(d);
  }
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

const STORE_PHONE_FALLBACK = "021-33901234";

export function normalizePhone(raw?: string | null) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d+]/g, "");
}

export function resolveStorePhone(phone?: string | null) {
  return (
    normalizePhone(phone) ||
    normalizePhone(process.env.NEXT_PUBLIC_STORE_PHONE) ||
    normalizePhone(STORE_PHONE_FALLBACK)
  );
}
