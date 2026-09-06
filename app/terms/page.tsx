import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export const metadata = { title: "利用規約" };

export default function TermsPage() {
  return (
    <>
      <PageHeader title="利用規約" breadcrumbs={[{ label: "トップ", href: "/" }, { label: "利用規約" }]} />
      <PageSection>
        <div className="max-w-3xl text-sm text-[var(--color-text,#333333)] space-y-4 leading-relaxed">
          <p>本規約は、PLANTIAオンラインショップ（以下「本サービス」）の利用条件を定めるものです。</p>
          <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)]">第1条（適用）</h2>
          <p>本規約は、本サービスを利用するすべてのユーザーに適用されます。</p>
          <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)]">第2条（禁止事項）</h2>
          <p>法令違反、他者の権利侵害、虚偽の情報登録等を禁止します。</p>
          <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)]">第3条（免責）</h2>
          <p>当社は、天災等不可抗力によるサービス中断について責任を負いません。</p>
        </div>
      </PageSection>
    </>
  );
}
