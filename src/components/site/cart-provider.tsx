"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  partNumber: string;
  qty: number;
};

// چیزی که توی localStorage ذخیره میشه (فقط id و qty)
type StoredCartItem = {
  id: string;
  qty: number;
};

type AddOptions = {
  openDrawer?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (
    item: Omit<CartItem, "qty">,
    qty?: number,
    options?: AddOptions,
  ) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  refreshPrices: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pta-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // گرفتن قیمت‌های لحظه‌ای از سرور و آپدیت سبد
  const refreshPrices = useCallback(async (stored: StoredCartItem[]) => {
    if (stored.length === 0) {
      setItems([]);
      return;
    }
    try {
      const res = await fetch("/api/products/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: stored.map((s) => s.id) }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        prices: {
          id: string;
          name: string;
          slug: string;
          price: number;
          stock: number;
          partNumber: string;
          images: string[];
        }[];
      };

      const fresh = stored
        .map((s) => {
          const p = data.prices.find((x) => x.id === s.id);
          if (!p) return null; // محصول حذف/غیرفعال شده
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.images?.[0] ?? "",
            partNumber: p.partNumber,
            qty: s.qty,
          };
        })
        .filter((x): x is CartItem => x !== null);

      setItems(fresh);
    } catch {
      // اگه سرور خطا داد، حداقل سبد قبلی رو نگه دار (فقط id و qty)
      setItems((prev) => prev);
    }
  }, []);

  // لود اولیه از localStorage + گرفتن قیمت جدید
  useEffect(() => {
    let stored: StoredCartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          stored = parsed
            .filter(
              (i): i is StoredCartItem =>
                !!i && typeof (i as StoredCartItem).id === "string",
            )
            .map((i) => ({
              id: i.id,
              qty: Math.max(1, Math.min(999, Math.floor(Number(i.qty) || 1))),
            }));
        }
      }
    } catch {
      /* ignore */
    }
    refreshPrices(stored).finally(() => setReady(true));
  }, [refreshPrices]);

  // ذخیره توی localStorage (فقط id و qty)
  useEffect(() => {
    if (!ready) return;
    try {
      const toStore: StoredCartItem[] = items.map((i) => ({
        id: i.id,
        qty: i.qty,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1, options?: AddOptions) => {
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id);
        if (found) {
          return prev.map((p) =>
            p.id === item.id ? { ...p, qty: Math.min(999, p.qty + qty) } : p,
          );
        }
        return [...prev, { ...item, qty }];
      });

      // فقط اگه openDrawer !== false باشه، Drawer باز کن
      if (options?.openDrawer !== false) {
        setOpen(true);
      }

      // بعد از اضافه کردن، قیمت‌ها رو رفرش کن تا مطمئن بشی جدیده
      setTimeout(() => {
        const stored: StoredCartItem[] = [];
        setItems((cur) => {
          stored.push(...cur.map((c) => ({ id: c.id, qty: c.qty })));
          return cur;
        });
        refreshPricesFromCurrent();
      }, 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // تابع کمکی که از state فعلی items استفاده می‌کنه
  const refreshPricesFromCurrent = useCallback(() => {
    setItems((cur) => {
      const stored: StoredCartItem[] = cur.map((c) => ({
        id: c.id,
        qty: c.qty,
      }));
      // اجرا کردن رفرش به‌صورت async
      void refreshPrices(stored);
      return cur;
    });
  }, [refreshPrices]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, Math.min(999, qty)) } : p,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, total } = useMemo(
    () => ({
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      count,
      total,
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      refreshPrices: async () => {
        const stored: StoredCartItem[] = items.map((i) => ({
          id: i.id,
          qty: i.qty,
        }));
        await refreshPrices(stored);
      },
    }),
    [
      items,
      ready,
      count,
      total,
      open,
      add,
      remove,
      setQty,
      clear,
      refreshPrices,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/* ---------------------------------- drawer --------------------------------- */

function CartDrawer() {
  const { items, open, setOpen, total, setQty, remove, ready } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!ready) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        className={`absolute inset-y-0 left-0 flex w-[min(94vw,420px)] flex-col bg-white shadow-2xl transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-100 text-gold-700">
              <ShoppingBag className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-ink-950">سبد خرید</p>
              <p className="text-[11px] text-zinc-400 tnum">
                {items.length} قلم کالا
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gold-50 text-gold-400">
                <ShoppingBag className="h-7 w-7" />
              </span>
              <p className="text-sm font-bold text-zinc-700">
                سبد خرید شما خالی است
              </p>
              <p className="text-xs text-zinc-400">
                قطعه موردنظر خود را از فروشگاه انتخاب کنید
              </p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="btn-gold mt-2 px-6 py-2.5 text-xs"
              >
                مشاهده فروشگاه
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-zinc-100 bg-white p-3"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gold-50">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-[13px] font-bold leading-6 text-ink-950 hover:text-gold-700"
                    >
                      {item.name}
                    </Link>
                    {item.partNumber ? (
                      <p className="mt-0.5 text-[10px] text-zinc-400" dir="ltr">
                        OEM: {item.partNumber}
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border border-zinc-200 px-1 py-0.5">
                        <button
                          className="grid h-6 w-6 place-items-center rounded-full text-zinc-600 hover:bg-gold-100 hover:text-gold-700"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label="افزایش"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-xs font-extrabold tnum">
                          {item.qty}
                        </span>
                        <button
                          className="grid h-6 w-6 place-items-center rounded-full text-zinc-600 hover:bg-zinc-100"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="کاهش"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-extrabold text-ink-950 tnum">
                          {formatPrice(item.price * item.qty)}
                          <span className="mr-1 text-[10px] font-bold text-zinc-400">
                            تومان
                          </span>
                        </span>
                        <button
                          className="text-zinc-300 transition hover:text-red-500"
                          onClick={() => remove(item.id)}
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-zinc-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500">جمع کل</span>
              <span className="text-lg font-black text-ink-950 tnum">
                {formatPrice(total)}
                <span className="mr-1 text-[11px] font-bold text-zinc-400">
                  تومان
                </span>
              </span>
            </div>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="btn-gold block w-full py-3 text-xs text-center"
            >
              پرداخت
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
