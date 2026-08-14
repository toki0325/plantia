import Image from "next/image";
import Link from "next/link";
import type { FeatureArticle } from "@/lib/data/home";

type FeatureBannerProps = {
  feature: FeatureArticle;
};

export function FeatureBanner({ feature }: FeatureBannerProps) {
  return (
    <div className="mt-8 bg-[#f5f5f5] flex flex-col md:flex-row overflow-hidden">
      <div className="relative w-full md:w-1/2 aspect-[16/9] md:aspect-auto md:min-h-[200px]">
        <Image
          src={feature.image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
        <h3 className="text-base md:text-lg font-bold text-[var(--text-default)] mb-3 leading-snug">
          {feature.title}
        </h3>
        <p className="text-sm text-[var(--text-description)] mb-4 leading-relaxed">
          {feature.description}
        </p>
        <Link
          href={feature.href}
          className="text-sm text-[var(--text-primary)] underline hover:no-underline self-start"
        >
          {feature.linkText ?? "もっと見る"}
        </Link>
      </div>
    </div>
  );
}

type MoreButtonProps = {
  href: string;
  className?: string;
};

export function MoreButton({ href, className = "" }: MoreButtonProps) {
  return (
    <div className={`flex justify-center mt-6 ${className}`}>
      <Link
        href={href}
        className="inline-flex items-center justify-center w-full sm:w-auto min-w-0 sm:min-w-[200px] md:min-w-[280px] h-11 px-6 md:px-8 text-sm text-[var(--text-default)] bg-white border border-[var(--text-default)] rounded-[22px] hover:bg-[#f5f5f5] transition-colors"
      >
        もっと見る +
      </Link>
    </div>
  );
}

type SectionHeadingProps = {
  title: string;
  as?: "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  title,
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  return (
    <Tag
      className={`text-lg font-bold text-[var(--text-default)] mb-4 md:mb-6 ${className}`}
    >
      {title}
    </Tag>
  );
}

type RelatedFeaturesProps = {
  features: {
    id: string;
    title: string;
    description: string;
    image: string;
    href: string;
  }[];
};

export function RelatedFeatures({ features }: RelatedFeaturesProps) {
  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="content-width">
        <SectionHeading title="関連特集" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="group block border border-[var(--border-default)] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-[var(--text-default)] mb-2 line-clamp-2 group-hover:text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[var(--text-description)] line-clamp-3">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
