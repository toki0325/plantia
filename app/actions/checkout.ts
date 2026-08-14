"use server";

import { cookies } from "next/headers";
import { getProductById } from "@/lib/data/products";
import { calculateOrderPricing } from "@/lib/pricing";
import type { CheckoutFormData } from "@/lib/types";

export type CheckoutResult =
  | { success: true; orderId: string; total: number }
  | { success: false; error: string };

function validateCheckoutForm(data: CheckoutFormData): string | null {
  if (!data.name.trim() || data.name.length > 100) return "お名前を正しく入力してください";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "メールアドレスが正しくありません";
  if (!/^[0-9-]{10,13}$/.test(data.phone)) return "電話番号を正しく入力してください";
  if (!/^\d{3}-?\d{4}$/.test(data.postalCode)) return "郵便番号を正しく入力してください";
  if (!data.address.trim() || data.address.length > 300) return "住所を正しく入力してください";
  if (!["credit_card", "konbini", "bank_transfer"].includes(data.paymentMethod)) {
    return "お支払い方法を選択してください";
  }
  return null;
}

/** MVP: KOMOJU連携前のサーバーサイド注文確定（金額は商品マスタから再計算） */
export async function submitCheckout(
  cartItems: { productId: string; quantity: number }[],
  formData: CheckoutFormData,
): Promise<CheckoutResult> {
  const validationError = validateCheckoutForm(formData);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const pricing = calculateOrderPricing(cartItems, getProductById);
  if (!pricing) {
    return { success: false, error: "カート内容が無効です。再度お試しください。" };
  }

  // MVP: 実際のKOMOJU API呼び出しは環境変数設定後に実装
  const orderId = `NG-${Date.now()}`;

  const cookieStore = await cookies();
  cookieStore.set("novagrace-last-order", orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30,
  });

  return { success: true, orderId, total: pricing.total };
}

export async function getCheckoutPricing(
  cartItems: { productId: string; quantity: number }[],
) {
  return calculateOrderPricing(cartItems, getProductById);
}
