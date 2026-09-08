import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/constants";
import type { ProductDetail } from "@/lib/types";

export type PricedLineItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  freeShipping?: boolean;
  image?: string;
};

export type OrderPricing = {
  items: PricedLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

/** 送料無料対象商品のみ、または合計が閾値以上なら送料0 */
export function shippingFeeForCart(
  subtotal: number,
  items: { freeShipping?: boolean }[],
): number {
  if (items.length === 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (items.every((item) => item.freeShipping)) return 0;
  return SHIPPING_FEE;
}

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
      freeShipping: Boolean(product.freeShipping),
      image: product.image,
    });
  }

  if (items.length === 0) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = shippingFeeForCart(subtotal, items);
  const total = subtotal + shipping;

  return { items, subtotal, shipping, total };
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ja-JP");
}
