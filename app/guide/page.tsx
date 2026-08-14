import Link from "next/link";
import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { guideSections } from "@/lib/data/faq";

export const metadata = { title: "ご利用ガイド" };

export default function GuidePage() {
  return (
    <>
      <PageHeader
        title="ご利用ガイド"
        breadcrumbs={[{ label: "トップ", href: "/" }, { label: "ご利用ガイド" }]}
      />
      <PageSection>
        {guideSections.map((section) => (
          <div key={section.title} className="mb-10">
            <SectionTitle>{section.title}</SectionTitle>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--color-text,#333333)]">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-sm">
          <Link href="/guide/faq" className="text-[var(--color-primary,#2F4B3C)] underline">
            よくある質問はこちら
          </Link>
        </p>
      </PageSection>
    </>
  );
}
