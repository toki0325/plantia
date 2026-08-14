import Link from "next/link";
import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { conditionGroups, conditionTags } from "@/lib/data/conditions";

export const metadata = { title: "育てやすさ・条件から探す" };

export default function ConditionPage() {
  return (
    <>
      <PageHeader
        title="育てやすさ・条件から探す"
        description="日当たり、手入れの手軽さ、季節など、条件から商品を絞り込めます。"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "条件から探す" },
        ]}
      />
      <PageSection>
        {conditionGroups.map((group) => (
          <div key={group.id} className="mb-10">
            <SectionTitle>{group.label}</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {conditionTags
                .filter((t) => t.group === group.id)
                .map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/condition/${tag.slug}`}
                    className="px-4 py-2 bg-white border border-[var(--color-border,#EAE6DD)] rounded-[2px] text-sm hover:bg-[var(--color-ivory,#F5F1E8)] transition-colors"
                  >
                    {tag.label}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </PageSection>
    </>
  );
}
