import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import { getNewArrivals } from "@/lib/data/products";

export const metadata = { title: "新着商品" };

export default function NewArrivalPage() {
  const products = getNewArrivals(12);

  return (
    <>
      <PageHeader
        title="新着商品"
        description="NOVAGRACEに新しく入荷した商品をご紹介します。"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "新着商品" },
        ]}
      />
      <PageSection>
        <ShopProductGrid products={products} />
      </PageSection>
    </>
  );
}
