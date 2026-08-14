import type { Metadata } from "next";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "ご注文完了" };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutCompletePage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <>
      <PageHeader title="ご注文完了" />
      <PageSection>
        <div className="max-w-lg mx-auto text-center py-8">
          <p className="text-lg font-bold text-[var(--color-primary,#2F4B3C)] mb-4">
            ご注文ありがとうございました
          </p>
          {order && (
            <p className="text-sm text-[var(--color-text-muted,#666666)] mb-6">
              注文番号: <span className="font-mono">{order}</span>
            </p>
          )}
          <p className="text-sm text-[var(--color-text-muted,#666666)] mb-8">
            ご登録のメールアドレスに確認メールをお送りします（MVPでは未送信）。
            通常3〜7営業日以内に発送いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/">トップへ戻る</Button>
            <Button variant="secondary" href="/mypage/orders">
              注文履歴を見る
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  );
}
