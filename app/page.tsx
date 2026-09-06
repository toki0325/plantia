import type { Metadata } from "next";
import Link from "next/link";
import { RelatedFeatures } from "@/components/home/FeatureBanner";
import { SectionHeading } from "@/components/home/FeatureBanner";
import { MainCategoryCards } from "@/components/home/CategoryNav";
import { ProductCarousel } from "@/components/home/ProductCard";
import { TopHero } from "@/components/home/TopHero";
import { browseCategories, GARDEN_DIY_PATH, popularProducts, relatedFeatures } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "庭に、いちばんの居場所を。",
  description:
    "頑張りすぎない、上質な庭時間。人工芝・ジョイントタイル・ガーデンファニチャー・園芸用品・雑草対策まで、統一感のあるおしゃれな庭・ベランダづくりを提案します。",
};

export default function Home() {
  return (
    <main>
      <TopHero />

      <section className="py-8 md:py-12 lg:py-16">
        <div className="content-width">
          <SectionHeading title="カテゴリから探す" />
          <MainCategoryCards categories={browseCategories} />
          <p className="mt-4 text-center">
            <Link
              href={GARDEN_DIY_PATH}
              className="text-sm text-[var(--color-primary,#2F4B3C)] underline hover:no-underline"
            >
              ガーデニング用品特集をすべて見る
            </Link>
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-[var(--color-ivory,#F5F1E8)]">
        <div className="content-width">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <SectionHeading title="人気のおすすめ商品" className="mb-0" />
            <Link href="/ranking" className="text-sm text-[var(--color-primary,#2F4B3C)] underline shrink-0">
              ランキングを見る
            </Link>
          </div>
          <ProductCarousel products={popularProducts} />
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="content-width">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/condition" className="text-sm px-4 py-2 border rounded-[2px] hover:bg-[var(--color-ivory,#F5F1E8)]">
              育てやすさ・条件から探す
            </Link>
            <Link href="/newarrival" className="text-sm px-4 py-2 border rounded-[2px] hover:bg-[var(--color-ivory,#F5F1E8)]">
              新着商品
            </Link>
            <Link href="/news" className="text-sm px-4 py-2 border rounded-[2px] hover:bg-[var(--color-ivory,#F5F1E8)]">
              お知らせ
            </Link>
          </div>
        </div>
      </section>

      <RelatedFeatures features={relatedFeatures} />
    </main>
  );
}
