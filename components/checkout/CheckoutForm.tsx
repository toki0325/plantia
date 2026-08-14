"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitCheckout } from "@/app/actions/checkout";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/FormFields";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  TAX_INCLUDED_LABEL,
} from "@/lib/constants";
import { formatPrice } from "@/lib/pricing";
import type { CheckoutFormData } from "@/lib/types";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <p className="text-center text-[var(--color-text-muted,#666666)] py-12">
        カートが空です。<Button href="/cart" className="ml-2">カートへ</Button>
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data: CheckoutFormData = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      postalCode: String(form.get("postalCode")),
      address: String(form.get("address")),
      paymentMethod: String(form.get("paymentMethod")) as CheckoutFormData["paymentMethod"],
    };

    const result = await submitCheckout(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      data,
    );

    setLoading(false);

    if (result.success) {
      clearCart();
      router.push(`/checkout/complete?order=${result.orderId}`);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Input name="name" label="お名前" required />
        <Input name="email" type="email" label="メールアドレス" required />
        <Input name="phone" type="tel" label="電話番号" placeholder="090-1234-5678" required />
        <Input name="postalCode" label="郵便番号" placeholder="123-4567" required />
        <Input name="address" label="住所" required />
        <Select
          name="paymentMethod"
          label="お支払い方法"
          defaultValue="credit_card"
          options={[
            { label: "クレジットカード", value: "credit_card" },
            { label: "コンビニ決済", value: "konbini" },
            { label: "銀行振込", value: "bank_transfer" },
          ]}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "処理中..." : "注文を確定する"}
        </Button>
        <p className="text-xs text-[var(--color-text-muted,#666666)]">
          ※ MVPではKOMOJU連携前のデモ決済です。金額はサーバー側で再計算されます。
        </p>
      </div>

      <div className="border border-[var(--color-border,#EAE6DD)] rounded-[2px] p-6 h-fit">
        <h2 className="font-bold mb-4">ご注文内容</h2>
        <ul className="space-y-2 text-sm mb-4">
          {items.map((line) => (
            <li key={line.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1">{line.product.name} ×{line.quantity}</span>
              <span className="shrink-0">{formatPrice(line.lineTotal)}円</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 text-sm border-t pt-3">
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
            <dd>{formatPrice(total)}円{TAX_INCLUDED_LABEL}</dd>
          </div>
        </dl>
      </div>
    </form>
  );
}
