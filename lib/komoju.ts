import { createHmac, timingSafeEqual } from "crypto";
import { readEnv } from "@/lib/env";
import type { CheckoutFormData } from "@/lib/types";
import type { OrderPricing } from "@/lib/pricing";
import { toAbsoluteAssetUrl } from "@/lib/site-url";

const KOMOJU_API = "https://komoju.com/api/v1";

const PAYMENT_TYPE_MAP = {
  credit_card: "credit_card",
  konbini: "konbini",
  bank_transfer: "bank_transfer",
} as const;

export type KomojuSessionStatus = "pending" | "completed" | "cancelled";
export type KomojuPaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "cancelled"
  | "expired"
  | "refunded"
  | "failed";

export type KomojuSession = {
  id: string;
  session_url: string;
  status: KomojuSessionStatus;
  amount: number;
  currency: string;
  email?: string;
  payment?: {
    id: string;
    status: KomojuPaymentStatus;
    payment_details?: { type?: string };
  } | null;
  payment_data?: {
    external_order_num?: string;
  };
  metadata?: Record<string, string>;
};

type KomojuErrorBody = {
  error?: { code?: string; message?: string };
};

export function getKomojuSecretKey(): string | null {
  return readEnv("KOMOJU_SECRET_KEY");
}

function authHeader(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

async function komojuFetch<T>(
  path: string,
  init: RequestInit & { secretKey: string },
): Promise<{ data?: T; error?: string }> {
  const { secretKey, ...requestInit } = init;
  try {
    const response = await fetch(`${KOMOJU_API}${path}`, {
      ...requestInit,
      headers: {
        Authorization: authHeader(secretKey),
        Accept: "application/json",
        ...(requestInit.headers ?? {}),
      },
      cache: "no-store",
    });

    const body = (await response.json()) as T & KomojuErrorBody;
    if (!response.ok || body.error) {
      const message =
        body.error?.message ?? `KOMOJU API error (${response.status})`;
      console.error("KOMOJU API error", {
        status: response.status,
        code: body.error?.code,
        message,
      });
      return { error: message };
    }
    return { data: body };
  } catch {
    return { error: "KOMOJUに接続できませんでした。" };
  }
}

export async function createKomojuSession(input: {
  secretKey: string;
  returnUrl: string;
  imageBaseUrl: string;
  orderId: string;
  pricing: OrderPricing;
  form: CheckoutFormData;
}): Promise<{ data?: KomojuSession; error?: string }> {
  const lineItems = [
    ...input.pricing.items.map((item) => ({
      amount: item.unitPrice,
      quantity: item.quantity,
      description: item.name,
      external_product_num: item.productId,
      image: toAbsoluteAssetUrl(input.imageBaseUrl, item.image),
    })),
    ...(input.pricing.shipping > 0
      ? [
          {
            amount: input.pricing.shipping,
            quantity: 1,
            description: "送料",
            external_product_num: "shipping",
          },
        ]
      : []),
  ];

  return komojuFetch<KomojuSession>("/sessions", {
    secretKey: input.secretKey,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.pricing.total,
      currency: "JPY",
      return_url: input.returnUrl,
      email: input.form.email,
      default_locale: "ja",
      payment_types: [PAYMENT_TYPE_MAP[input.form.paymentMethod]],
      payment_data: {
        capture: "auto",
        external_order_num: input.orderId,
        name: input.form.name,
        shipping_address: {
          name: input.form.name,
          zipcode: input.form.postalCode,
          street_address1: input.form.address,
          country: "Japan",
        },
      },
      line_items: lineItems,
      metadata: {
        order_id: input.orderId,
        phone: input.form.phone,
        payment_method: input.form.paymentMethod,
        email: input.form.email,
      },
    }),
  });
}

export async function getKomojuSession(
  secretKey: string,
  sessionId: string,
): Promise<{ data?: KomojuSession; error?: string }> {
  return komojuFetch<KomojuSession>(`/sessions/${encodeURIComponent(sessionId)}`, {
    secretKey,
    method: "GET",
  });
}

export function verifyKomojuWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(computed);
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export function describePaymentOutcome(session: KomojuSession): {
  kind: "paid" | "awaiting" | "cancelled" | "failed";
  orderId: string | null;
} {
  const orderId =
    session.payment_data?.external_order_num ??
    session.metadata?.order_id ??
    null;

  if (session.status === "cancelled") {
    return { kind: "cancelled", orderId };
  }

  const paymentStatus = session.payment?.status;
  if (session.status === "completed" && paymentStatus === "captured") {
    return { kind: "paid", orderId };
  }
  if (session.status === "completed" && paymentStatus === "authorized") {
    return { kind: "awaiting", orderId };
  }

  return { kind: "failed", orderId };
}
