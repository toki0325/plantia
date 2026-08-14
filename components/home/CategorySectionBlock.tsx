import {
  FeatureBanner,
  MoreButton,
  SectionHeading,
} from "@/components/home/FeatureBanner";
import { ProductGrid } from "@/components/home/ProductCard";
import {
  ImageCarousel,
  SubCategoryTabs,
} from "@/components/home/SubCategorySection";
import type { HomeSection } from "@/lib/data/home";

type CategorySectionBlockProps = {
  section: HomeSection;
};

export function CategorySectionBlock({ section }: CategorySectionBlockProps) {
  return (
    <section id={section.anchorId} className="py-8 md:py-12 scroll-mt-[calc(var(--header-height)+8px)]">
      <div className="content-width">
        <SectionHeading title={section.title} />

        {section.subCategories && (
          <SubCategoryTabs items={section.subCategories} />
        )}
      </div>

      {section.subSections?.map((sub) => (
        <div key={sub.id} className="mb-10 md:mb-14">
          <div className="content-width">
            <SectionHeading title={sub.title} as="h3" className="text-base" />

            {sub.carouselImages && sub.carouselImages.length > 0 && (
              <ImageCarousel images={sub.carouselImages} alt={sub.title} />
            )}
          </div>

          <div className="product-section-dark">
            <div className="content-width py-6">
              <ProductGrid products={sub.products} dark />
              <MoreButton href={sub.moreHref} />
            </div>
          </div>

          {sub.feature && (
            <div className="content-width">
              <FeatureBanner feature={sub.feature} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
