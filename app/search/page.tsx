import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import { searchProducts, toSummary } from "@/lib/data/products";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata = { title: "検索結果" };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const products = searchProducts(query).map(toSummary);

  return (
    <>
      <PageHeader
        title="検索結果"
        description={query ? `「${query}」の検索結果` : "キーワードを入力して検索してください"}
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "検索結果" },
        ]}
      />
      <PageSection>
        <form action="/search" method="get" className="mb-8 flex gap-2 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="商品名で検索"
            className="flex-1 border border-[var(--color-border,#EAE6DD)] rounded-[2px] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--color-primary,#2F4B3C)] text-white text-sm rounded-[2px]"
          >
            検索
          </button>
        </form>
        {query && (
          <SectionTitle>{products.length}件の商品が見つかりました</SectionTitle>
        )}
        <ShopProductGrid products={products} />
      </PageSection>
    </>
  );
}
