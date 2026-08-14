import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/constants";
import type { ProductDetail } from "@/lib/types";

export type PricedLineItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderPricing = {
  items: PricedLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

/** サーバーサイド専用: 商品マスタから金額を再計算する */
export function calculateOrderPricing(
  lines: { productId: string; quantity: number }[],
  getProduct: (id: string) => ProductDetail | undefined,
): OrderPricing | null {
  const items: PricedLineItem[] = [];

  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product || line.quantity < 1 || line.quantity > 99) {
      return null;
    }
    items.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: line.quantity,
      lineTotal: product.price * line.quantity,
    });
  }

  if (items.length === 0) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  return { items, subtotal, shipping, total };
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ja-JP");
}
