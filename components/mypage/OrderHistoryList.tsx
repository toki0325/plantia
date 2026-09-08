"use client";

import { useEffect, useState } from "react";
import { getStoredOrdersForEmail, type StoredOrder } from "@/lib/order-history";
import { formatPrice } from "@/lib/pricing";

export function OrderHistoryList({ email }: { email: string }) {
  const [orders, setOrders] = useState<StoredOrder[] | null>(null);

  useEffect(() => {
    setOrders(getStoredOrdersForEmail(email));
  }, [email]);

  if (orders === null) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted,#666666)] py-8">
        ご注文はまだありません。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border,#EAE6DD)]">
      {orders.map((order) => (
        <li key={order.id} className="py-4 flex flex-wrap justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{order.id}</p>
            <p className="text-xs text-[var(--color-text-muted,#666666)]">{order.date}</p>
            {order.items.length > 0 && (
              <p className="text-xs text-[var(--color-text-muted,#666666)] mt-1">
                {order.items.map((item) => `${item.name} ×${item.quantity}`).join("、")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{formatPrice(order.total)}円（税込）</p>
            <p className="text-xs text-[var(--color-primary,#2F4B3C)]">{order.status}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
