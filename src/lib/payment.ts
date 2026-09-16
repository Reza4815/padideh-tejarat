// مقادیر مشترک فلو پرداخت و پیگیری سفارش
// NOTE: شماره کارت را از اینجا تغییر دهید.

export const CARD_NUMBER = "6037-9911-XXXX-XXXX";
export const CARD_NUMBER_RAW = "60379911XXXXXXXX";
export const CARD_HOLDER = "پدیده تجارت الوند";

export type PaymentMethod = "online" | "card";
export type PaymentStatus = "pending" | "awaiting_review" | "approved" | "rejected";
export type OrderLifecycle =
  | "pending"
  | "awaiting_review"
  | "approved"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  online: "پرداخت آنلاین (زرین‌پال)",
  card: "کارت به کارت",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "در انتظار پرداخت",
  awaiting_review: "در انتظار تأیید رسید",
  approved: "پرداخت تأیید شد",
  rejected: "رسید رد شد",
};

export const ORDER_STATUS_LABEL: Record<OrderLifecycle, string> = {
  pending: "سفارش ثبت شد",
  awaiting_review: "در انتظار تأیید رسید",
  approved: "پرداخت تأیید شد",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شد",
  delivered: "تحویل داده شد",
  cancelled: "لغو شده",
};

export const ORDER_STATUS_OPTIONS: { value: OrderLifecycle; label: string }[] = [
  { value: "pending", label: "سفارش ثبت شد" },
  { value: "awaiting_review", label: "در انتظار تأیید رسید" },
  { value: "approved", label: "پرداخت تأیید شد" },
  { value: "preparing", label: "در حال آماده‌سازی" },
  { value: "shipped", label: "ارسال شد" },
  { value: "delivered", label: "تحویل داده شد" },
  { value: "cancelled", label: "لغو شده" },
];

/** تولید کد پیگیری یکتا با فرمت ORD-YYYYMMDD-XXX */
export function generateTrackingCode() {
  const d = new Date();
  const y = d.getFullYear().toString();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900).toString();
  return `ORD-${y}${m}${day}-${rand}`;
}

/** کلید sessionStorage که اطلاعات سبد/گیرنده از صفحه سبد به چ checkout منتقل می‌شود */
export const CHECKOUT_STORAGE_KEY = "pta-checkout-v1";

export type CheckoutDraft = {
  customerName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  plateNumber: string;
  note: string;
  items: { id: string; qty: number }[];
};
