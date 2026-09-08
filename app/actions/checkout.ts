"use server";

import { cookies } from "next/headers";
import { getProductById } from "@/lib/data/products";
import {
  createKomojuSession,
  getKomojuSecretKey,
  getKomojuSession,
  describePaymentOutcome,
  type KomojuSession,
} from "@/lib/komoju";
import { calculateOrderPricing } from "@/lib/pricing";
import { getPublicAssetBaseUrl, getRequestBaseUrl } from "@/lib/site-url";
import type { CheckoutFormData } from "@/lib/types";
import { saveCheckoutProfile, refreshSessionCookies } from "@/app/actions/auth";

export type CheckoutResult =
  | { success: true; checkoutUrl: string; orderId: string }
  | { success: false; error: string };

export type CheckoutSessionView = {
  kind: "paid" | "awaiting" | "cancelled" | "failed" | "missing";
  orderId: string | null;
  paymentType: string | null;
  amount: number | null;
  email: string | null;
};

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

function createOrderId(): string {
  return `PLT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function submitCheckout(
  cartItems: { productId: string; quantity: number }[],
  formData: CheckoutFormData,
): Promise<CheckoutResult> {
  const validationError = validateCheckoutForm(formData);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const secretKey = getKomojuSecretKey();
  if (!secretKey) {
    return {
      success: false,
      error:
        "KOMOJU_SECRET_KEY が未設定です。ローカルは .env.local、本番は Netlify の環境変数（Functions スコープ）を入れて再デプロイしてください。",
    };
  }

  const pricing = calculateOrderPricing(cartItems, getProductById);
  if (!pricing) {
    return { success: false, error: "カート内容が無効です。再度お試しください。" };
  }

  const orderId = createOrderId();
  const returnUrl = `${await getRequestBaseUrl()}/checkout/complete`;

  const session = await createKomojuSession({
    secretKey,
    returnUrl,
    imageBaseUrl: await getPublicAssetBaseUrl(),
    orderId,
    pricing,
    form: formData,
  });

  if (!session.data?.session_url) {
    return {
      success: false,
      error: session.error ?? "決済セッションを作成できませんでした。",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("plantia-last-order", orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  await saveCheckoutProfile({
    name: formData.name,
    phone: formData.phone,
    postalCode: formData.postalCode,
    address: formData.address,
  });
  await refreshSessionCookies();

  return { success: true, checkoutUrl: session.data.session_url, orderId };
}

export async function resolveCheckoutSession(
  sessionId: string | undefined,
): Promise<CheckoutSessionView> {
  const secretKey = getKomojuSecretKey();

  if (!sessionId || !secretKey) {
    return {
      kind: "missing",
      orderId: null,
      paymentType: null,
      amount: null,
      email: null,
    };
  }

  const result = await getKomojuSession(secretKey, sessionId);
  if (!result.data) {
    return {
      kind: "missing",
      orderId: null,
      paymentType: null,
      amount: null,
      email: null,
    };
  }

  const session: KomojuSession = result.data;
  const outcome = describePaymentOutcome(session);

  return {
    kind: outcome.kind,
    orderId: outcome.orderId,
    paymentType: session.payment?.payment_details?.type ?? session.metadata?.payment_method ?? null,
    amount: session.amount ?? null,
    email: session.email ?? session.metadata?.email ?? null,
  };
}

export async function getCheckoutPricing(
  cartItems: { productId: string; quantity: number }[],
) {
  return calculateOrderPricing(cartItems, getProductById);
}
