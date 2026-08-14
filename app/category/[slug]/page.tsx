import { notFound } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import {
  allCategories,
  getCategoryBySlug,
  getSubCategories,
  resolveCategorySlug,
} from "@/lib/data/categories";
import { getProductsByCategorySlug, toSummary } from "@/lib/data/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "カテゴリが見つかりません" };
  return { title: category.name };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveCategorySlug(slug);
  if (!resolved) notFound();

  const { category, isParent } = resolved;
  const subCats = isParent ? getSubCategories(slug) : [];
  const products = getProductsByCategorySlug(slug).map(toSummary);

  return (
    <>
      <PageHeader
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: category.name },
        ]}
      />

      {subCats.length > 0 && (
        <PageSection className="py-8 border-b border-[var(--color-border,#EAE6DD)]">
          <SectionTitle>サブカテゴリ</SectionTitle>
          <div className="flex flex-wrap gap-3">
            {subCats.map((sub) => (
              <Link
                key={sub.slug}
                href={`/category/${sub.slug}`}
                className="text-sm px-4 py-2 border border-[var(--color-border,#EAE6DD)] rounded-[2px] hover:bg-[var(--color-ivory,#F5F1E8)]"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </PageSection>
      )}

      <PageSection>
        <SectionTitle>
          {isParent ? "すべての商品" : category.name}
          <span className="text-sm font-normal text-[var(--color-text-muted,#666666)] ml-2">
            {products.length}件
          </span>
        </SectionTitle>
        <ShopProductGrid products={products} />
      </PageSection>
    </>
  );
}
