import Link from "next/link";
import Image from "next/image";
import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { features } from "@/lib/data/features";

export const metadata = { title: "特集記事" };

export default function FeatureListPage() {
  return (
    <>
      <PageHeader
        title="特集記事"
        description="お庭・ベランダづくりのヒントや、商品の選び方をご紹介。"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "特集記事" },
        ]}
      />
      <PageSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.slug}
              href={`/feature/${feature.slug}`}
              className="group block border border-[var(--color-border,#EAE6DD)] rounded-[2px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <time className="text-xs text-[var(--color-text-muted,#666666)]">
                  {feature.publishedAt}
                </time>
                <h2 className="text-sm font-bold mt-1 line-clamp-2 group-hover:text-[var(--color-primary,#2F4B3C)]">
                  {feature.title}
                </h2>
                <p className="text-xs text-[var(--color-text-muted,#666666)] mt-2 line-clamp-2">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>
    </>
  );
}
