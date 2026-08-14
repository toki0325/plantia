import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { legalInfo } from "@/lib/data/company";

export const metadata = { title: "特定商取引法に基づく表記" };

export default function LegalPage() {
  return (
    <>
      <PageHeader
        title="特定商取引法に基づく表記"
        breadcrumbs={[{ label: "トップ", href: "/" }, { label: "特定商取引法に基づく表記" }]}
      />
      <PageSection>
        <dl className="max-w-2xl text-sm space-y-4">
          {[
            ["販売業者", legalInfo.seller],
            ["代表者", legalInfo.representative],
            ["所在地", legalInfo.address],
            ["電話番号", legalInfo.phone],
            ["メールアドレス", legalInfo.email],
            ["販売価格", legalInfo.priceNote],
            ["送料", legalInfo.shipping],
            ["お支払い方法", legalInfo.payment],
            ["引き渡し時期", legalInfo.delivery],
            ["返品・交換", legalInfo.returns],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 border-b pb-4">
              <dt className="font-medium text-[var(--color-primary,#2F4B3C)]">{label}</dt>
              <dd className="text-[var(--color-text-muted,#666666)]">{value}</dd>
            </div>
          ))}
        </dl>
      </PageSection>
    </>
  );
}
