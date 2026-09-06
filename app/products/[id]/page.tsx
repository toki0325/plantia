import { notFound } from "next/navigation";
import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import {
  getAllProducts,
  getProductById,
  getRelatedProducts,
} from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "商品が見つかりません" };
  return { title: product.name };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const related = getRelatedProducts(id);

  return (
    <>
      <PageHeader
        title={product.name}
        breadcrumbs={[
          { label: "トップ", href: "/" },
          ...(category
            ? [{ label: category.name, href: `/category/${category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />
      <PageSection>
        <ProductDetailView product={product} />
      </PageSection>
      {related.length > 0 && (
        <PageSection className="bg-[var(--color-ivory,#F5F1E8)]">
          <SectionTitle>関連商品</SectionTitle>
          <ShopProductGrid products={related} />
        </PageSection>
      )}
    </>
  );
}
