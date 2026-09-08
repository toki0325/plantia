"use client";

import { useEffect, type ReactNode } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { upsertStoredOrder, getStoredOrdersForEmail } from "@/lib/order-history";
import { formatPrice } from "@/lib/pricing";
import type { CheckoutSessionView } from "@/app/actions/checkout";

function paymentLabel(type: string | null): string {
  if (type === "credit_card") return "クレジットカード";
  if (type === "konbini") return "コンビニ決済";
  if (type === "bank_transfer") return "銀行振込";
  return type ?? "指定のお支払い方法";
}

export function CheckoutCompleteView({ result }: { result: CheckoutSessionView }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (result.kind !== "paid" && result.kind !== "awaiting") return;
    clearCart();

    const email = result.email?.trim();
    const orderId = result.orderId;
    if (!email || !orderId) return;

    const existing = getStoredOrdersForEmail(email).find((order) => order.id === orderId);
    upsertStoredOrder({
      id: orderId,
      email,
      date: existing?.date ?? new Date().toISOString().slice(0, 10),
      total: result.amount ?? existing?.total ?? 0,
      status: result.kind === "paid" ? "支払い済み" : "入金待ち",
      items: existing?.items ?? [],
    });
  }, [result, clearCart]);

  if (result.kind === "paid") {
    return (
      <CompleteShell
        title="ご注文ありがとうございました"
        orderId={result.orderId}
        amount={result.amount}
        extra={`${paymentLabel(result.paymentType)}でのお支払いが完了しました。`}
      />
    );
  }

  if (result.kind === "awaiting") {
    return (
      <CompleteShell
        title="お支払い手続きを受け付けました"
        orderId={result.orderId}
        amount={result.amount}
        extra={`${paymentLabel(result.paymentType)}の案内に沿ってお支払いください。入金が確認でき次第、発送準備に入ります。`}
      />
    );
  }

  if (result.kind === "cancelled") {
    return (
      <CompleteShell
        title="お支払いがキャンセルされました"
        orderId={result.orderId}
        tone="muted"
        extra="お支払いを中止しました。ご注文内容はカートに残っています。"
        actions={
          <>
            <Button href="/checkout">ご購入手続きへ戻る</Button>
            <Button variant="secondary" href="/cart">
              カートを見る
            </Button>
          </>
        }
      />
    );
  }

  return (
    <CompleteShell
      title="お支払いを確認できませんでした"
      tone="muted"
      extra="お支払いが完了していない可能性があります。もう一度ご購入手続きをお試しください。"
      actions={
        <>
          <Button href="/checkout">ご購入手続きへ戻る</Button>
          <Button variant="secondary" href="/">
            トップへ戻る
          </Button>
        </>
      }
    />
  );
}

function CompleteShell({
  title,
  extra,
  orderId,
  amount,
  tone = "success",
  actions,
}: {
  title: string;
  extra: string;
  orderId?: string | null;
  amount?: number | null;
  tone?: "success" | "muted";
  actions?: ReactNode;
}) {
  return (
    <div className="max-w-lg mx-auto text-center py-8">
      <p
        className={`text-lg font-bold mb-4 ${
          tone === "success"
            ? "text-[var(--color-primary,#2F4B3C)]"
            : "text-[var(--color-text,#333333)]"
        }`}
      >
        {title}
      </p>
      {orderId && (
        <p className="text-sm text-[var(--color-text-muted,#666666)] mb-2">
          注文番号: <span className="font-mono">{orderId}</span>
        </p>
      )}
      {typeof amount === "number" && (
        <p className="text-sm text-[var(--color-text-muted,#666666)] mb-4">
          お支払い金額: {formatPrice(amount)}円（税込）
        </p>
      )}
      <p className="text-sm text-[var(--color-text-muted,#666666)] mb-8">{extra}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actions ?? (
          <>
            <Button href="/">トップへ戻る</Button>
            <Button variant="secondary" href="/mypage/orders">
              注文履歴を見る
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
