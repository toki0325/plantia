import {
  PageHeader,
  PageSection,
  SectionTitle,
} from "@/components/layout/PageHeader";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import { getRanking } from "@/lib/data/products";

export const metadata = { title: "ランキング" };

export default function RankingPage() {
  const products = getRanking(12);

  return (
    <>
      <PageHeader
        title="人気ランキング"
        description="PLANTIAで人気のガーデニング用品ランキング。"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "ランキング" },
        ]}
      />
      <PageSection>
        <ShopProductGrid products={products} />
      </PageSection>
    </>
  );
}
