import Image from "next/image";
import { notFound } from "next/navigation";
import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { features, getFeatureBySlug } from "@/lib/data/features";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return features.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) return { title: "記事が見つかりません" };
  return { title: feature.title };
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) notFound();

  return (
    <>
      <PageHeader
        title={feature.title}
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "特集記事", href: "/feature" },
          { label: feature.title },
        ]}
      />
      <PageSection>
        <article className="max-w-3xl mx-auto">
          <div className="relative aspect-[16/9] mb-8 rounded-[2px] overflow-hidden">
            <Image
              src={feature.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
          <time className="text-sm text-[var(--color-text-muted,#666666)]">
            {feature.publishedAt}
          </time>
          <p className="text-[var(--color-text-muted,#666666)] mt-4 mb-8">
            {feature.description}
          </p>
          <div className="prose prose-sm max-w-none space-y-4 text-[var(--color-text,#333333)]">
            {feature.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </PageSection>
    </>
  );
}
