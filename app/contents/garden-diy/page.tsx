import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CategorySectionBlock } from "@/components/home/CategorySectionBlock";
import { StickyCategoryNav } from "@/components/home/CategoryNav";
import { HeroCollage } from "@/components/home/HeroCollage";
import { homeSections } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "【おしゃれな庭づくり】おすすめガーデニング用品特集",
  description:
    "ガーデニングには欠かせないNOVAGRACEのおすすめアイテムを取り揃えました。人工芝やジョイントタイルにファニチャー用品。あなただけのおしゃれな庭づくりを。",
};

const breadcrumbItems = [
  { label: "トップ", href: "/" },
  { label: "特集一覧", href: "/feature" },
  { label: "ガーデニング・工具", href: "/category/gardening" },
  { label: "【おしゃれな庭づくり】おすすめガーデニング用品特集" },
];

export default function GardenDiyPage() {
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <main>
        <div className="content-width mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-default)] text-center leading-snug">
            【おしゃれな庭づくり】おすすめガーデニング用品特集
          </h1>
        </div>

        <div className="mb-6 md:mb-8">
          <HeroCollage />
        </div>

        <div className="content-width mb-8 md:mb-10">
          <p className="text-sm md:text-base text-[var(--text-description)] leading-relaxed">
            ガーデニングには欠かせないNOVAGRACEのおすすめアイテムを取り揃えました。人工芝やジョイントタイルにファニチャー用品。庭をさらに彩ってくれる花壇や照明、フェンスなど、豊富なラインナップであなただけのおしゃれな庭づくりをしませんか？
          </p>
        </div>

        <StickyCategoryNav />

        {homeSections.map((section) => (
          <CategorySectionBlock key={section.id} section={section} />
        ))}

        <div className="border-t border-[var(--border-default)] py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </main>
    </>
  );
}
