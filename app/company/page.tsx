import Image from "next/image";
import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { companyInfo } from "@/lib/data/company";

export const metadata = { title: "会社概要" };

export default function CompanyPage() {
  return (
    <>
      <PageHeader title="会社概要" breadcrumbs={[{ label: "トップ", href: "/" }, { label: "会社概要" }]} />
      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden">
            <Image src="/images/common/about_v1.jpg" alt="" fill className="object-cover" sizes="50vw" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted,#666666)] mb-6 leading-relaxed">
              {companyInfo.description}
            </p>
            <dl className="text-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">会社名</dt>
                <dd>{companyInfo.name}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">代表者</dt>
                <dd>{companyInfo.representative}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">所在地</dt>
                <dd>{companyInfo.address}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">電話番号</dt>
                <dd>{companyInfo.phone}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">資本金</dt>
                <dd>{companyInfo.capital}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">事業内容</dt>
                <dd>{companyInfo.businessDescription}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                <dt className="text-[var(--color-text-muted,#666666)]">メール</dt>
                <dd className="break-all">{companyInfo.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </PageSection>
    </>
  );
}
