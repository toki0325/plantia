import { redirect } from "next/navigation";
import { requireSessionUser } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { ShopProductGrid } from "@/components/product/ShopProductCard";
import { getPopularProducts } from "@/lib/data/products";

export const metadata = { title: "お気に入り" };

export default async function FavoritePage() {
  const user = await requireSessionUser();
  if (!user) redirect("/login");

  const favorites = getPopularProducts().slice(0, 4);

  return (
    <>
      <PageHeader
        title="お気に入り"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "お気に入り" },
        ]}
      />
      <PageSection>
        <ShopProductGrid products={favorites} />
        <p className="text-xs text-[var(--color-text-muted,#666666)] mt-6">※ MVPでは人気商品をダミー表示しています。</p>
      </PageSection>
    </>
  );
}
