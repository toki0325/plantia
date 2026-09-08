import { NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import {
  getKomojuSecretKey,
  verifyKomojuWebhookSignature,
} from "@/lib/komoju";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = readEnv("KOMOJU_WEBHOOK_SECRET");
  if (!secret) {
    return NextResponse.json(
      { error: "KOMOJU_WEBHOOK_SECRET is not set" },
      { status: 503 },
    );
  }

  if (!getKomojuSecretKey()) {
    return NextResponse.json(
      { error: "KOMOJU_SECRET_KEY is not set" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-komoju-signature");
  if (!verifyKomojuWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { type?: string; data?: { id?: string; status?: string } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // MVP: DB未導入のためイベントを受け取るだけ。将来ここで注文ステータスを更新する。
  console.info("[komoju webhook]", payload.type, payload.data?.id, payload.data?.status);

  return NextResponse.json({ received: true });
}
