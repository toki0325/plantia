"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  TAX_INCLUDED_LABEL,
} from "@/lib/constants";
import { formatPrice } from "@/lib/pricing";

export function CartView() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-text-muted,#666666)] mb-6">
          カートに商品がありません。
        </p>
        <Button href="/">お買い物を続ける</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((line) => (
          <div
            key={line.productId}
            className="flex flex-col sm:flex-row gap-4 border border-[var(--color-border,#EAE6DD)] rounded-[2px] p-4"
          >
            <div className="flex gap-4 flex-1 min-w-0">
              <Link
                href={`/products/${line.productId}`}
                className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[2px] overflow-hidden"
              >
                <Image
                  src={line.product.image}
                  alt={line.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${line.productId}`}
                  className="text-sm font-medium line-clamp-2 hover:underline"
                >
                  {line.product.name}
                </Link>
                <p className="text-sm font-bold text-[var(--color-primary,#2F4B3C)] mt-1">
                  {formatPrice(line.product.price)}円{TAX_INCLUDED_LABEL}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                  <label className="text-xs">数量</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={line.quantity}
                    onChange={(e) =>
                      updateQuantity(line.productId, Number(e.target.value))
                    }
                    className="w-16 border rounded-[2px] px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="text-xs text-[var(--color-text-muted,#666666)] hover:underline"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
            <p className="text-sm font-bold shrink-0 self-end sm:self-center sm:ml-auto">
              {formatPrice(line.lineTotal)}円
            </p>
          </div>
        ))}
      </div>

      <div className="border border-[var(--color-border,#EAE6DD)] rounded-[2px] p-6 h-fit">
        <h2 className="font-bold mb-4">ご注文内容</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>小計</dt>
            <dd>{formatPrice(subtotal)}円</dd>
          </div>
          <div className="flex justify-between">
            <dt>送料</dt>
            <dd>{shipping === 0 ? "無料" : `${formatPrice(shipping)}円`}</dd>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <dt>合計</dt>
            <dd className="text-[var(--color-primary,#2F4B3C)]">
              {formatPrice(total)}円{TAX_INCLUDED_LABEL}
            </dd>
          </div>
        </dl>
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <p className="text-xs text-[var(--color-text-muted,#666666)] mt-3">
            あと{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}円で送料無料
          </p>
        )}
        <Button href="/checkout" className="w-full mt-6">
          ご購入手続きへ
        </Button>
      </div>
    </div>
  );
}
