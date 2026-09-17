"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import type { OrderRow } from "@/db/schema";
import { cn, formatDateTime, formatPrice, toFaDigits } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payment";
import { StatusBadge } from "@/components/site/account/order-card";

export function UserOrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [images, setImages] = useState<Record<string, string>>({});

  const productIds = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) {
      const first = o.items?.[0]?.productId;
      if (first) set.add(first);
    }
    return [...set];
  }, [orders]);

  useEffect(() => {
    if (productIds.length === 0) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products/prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        });
        const data = (await res.json()) as {
          prices?: { id: string; images?: string[] }[];
        };
        if (!mounted) return;
        const map: Record<string, string> = {};
        for (const p of data.prices ?? []) {
          if (p.images?.[0]) map[p.id] = p.images[0];
        }
        setImages(map);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productIds]);

  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 bg-white py-10 text-center text-[13px] font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        سفارشی برای این کاربر ثبت نشده است
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr className="bg-zinc-50/70 text-[10px] font-extrabold text-zinc-400 dark:bg-zinc-800/60">
            <th className="admin-th">محصول</th>
            <th className="admin-th">کد پیگیری</th>
            <th className="admin-th">تاریخ</th>
            <th className="admin-th">مبلغ</th>
            <th className="admin-th">روش پرداخت</th>
            <th className="admin-th">وضعیت پرداخت</th>
            <th className="admin-th">وضعیت سفارش</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {orders.map((o) => {
            const pm = (o.paymentMethod as PaymentMethod) ?? "online";
            const ps = (o.paymentStatus as PaymentStatus) ?? "pending";
            const first = o.items?.[0];
            const image = first?.productId ? images[first.productId] : undefined;
            const extra = (o.items?.length ?? 0) - 1;

            return (
              <tr
                key={o.id}
                onClick={() => router.push(`/admin/orders#order-${o.id}`)}
                className="cursor-pointer transition hover:bg-gold-50/50 dark:hover:bg-zinc-800/60"
              >
                <td className="admin-td">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-zinc-100 bg-gold-50/60 dark:border-zinc-800 dark:bg-zinc-800">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-4.5 w-4.5 text-gold-400" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="max-w-[200px] truncate text-[12px] font-bold text-zinc-700 dark:text-zinc-200">
                        {first?.name ?? "—"}
                      </p>
                      {extra > 0 ? (
                        <p className="mt-0.5 text-[10px] font-bold text-zinc-400 tnum">
                          + {toFaDigits(extra)} قلم دیگر
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="admin-td">
                  <Link
                    href={`/admin/orders#order-${o.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[12px] font-extrabold text-gold-700 hover:underline dark:text-gold-400"
                    dir="ltr"
                  >
                    {o.trackingCode ?? o.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="admin-td text-[12px] tnum">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="admin-td font-extrabold text-gold-700 tnum dark:text-gold-400">
                  {formatPrice(o.total)}
                </td>
                <td className="admin-td text-[12px]">
                  {PAYMENT_METHOD_LABEL[pm] ?? pm}
                </td>
                <td className="admin-td text-[12px]">
                  {PAYMENT_STATUS_LABEL[ps] ?? ps}
                </td>
                <td className="admin-td">
                  <StatusBadge status={o.orderStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}