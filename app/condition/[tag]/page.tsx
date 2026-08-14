import { notFound } from "next/navigation";
import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import {
  conditionTags,
  getConditionTag,
  matchConditionSlug,
} from "@/lib/data/conditions";
import { getAllProducts, toSummary } from "@/lib/data/products";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return conditionTags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const condition = getConditionTag(tag);
  if (!condition) return { title: "条件が見つかりません" };
  return { title: `${condition.label}の商品` };
}

export default async function ConditionTagPage({ params }: Props) {
  const { tag } = await params;
  const condition = getConditionTag(tag);
  if (!condition) notFound();

  const products = getAllProducts()
    .filter((p) =>
      p.conditionTags?.some((label) => matchConditionSlug(label, tag)),
    )
    .map(toSummary);

  return (
    <>
      <PageHeader
        title={`${condition.label}の商品`}
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "条件から探す", href: "/condition" },
          { label: condition.label },
        ]}
      />
      <PageSection>
        <SectionTitle>{products.length}件の商品</SectionTitle>
        <ShopProductGrid products={products} />
      </PageSection>
    </>
  );
}
