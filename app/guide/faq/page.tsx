import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { faqItems } from "@/lib/data/faq";

export const metadata = { title: "よくある質問" };

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="よくある質問"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "ご利用ガイド", href: "/guide" },
          { label: "よくある質問" },
        ]}
      />
      <PageSection>
        <dl className="space-y-6">
          {faqItems.map((item) => (
            <div key={item.question} className="border-b border-[var(--color-border,#EAE6DD)] pb-6">
              <dt className="font-bold text-[var(--color-primary,#2F4B3C)] mb-2">
                Q. {item.question}
              </dt>
              <dd className="text-sm text-[var(--color-text-muted,#666666)]">
                A. {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </PageSection>
    </>
  );
}
