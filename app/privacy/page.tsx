import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export const metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="プライバシーポリシー" breadcrumbs={[{ label: "トップ", href: "/" }, { label: "プライバシーポリシー" }]} />
      <PageSection>
        <div className="max-w-3xl prose prose-sm text-[var(--color-text,#333333)] space-y-4">
          <p>株式会社プランティア（以下「当社」）は、お客様の個人情報の保護を重要な責務と認識し、以下の方針に基づき適切に取り扱います。</p>
          <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)]">1. 収集する情報</h2>
          <p>氏名、住所、電話番号、メールアドレス、購入履歴など、サービス提供に必要な情報を収集します。</p>
          <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)]">2. 利用目的</h2>
          <p>商品の発送、お問い合わせ対応、サービス改善のために利用します。</p>
          <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)]">3. 第三者提供</h2>
          <p>法令に基づく場合を除き、本人の同意なく第三者に提供しません。</p>
        </div>
      </PageSection>
    </>
  );
}
