import { notFound } from "next/navigation";
import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { getNewsById, newsItems } from "@/lib/data/news";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return newsItems.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const news = getNewsById(id);
  if (!news) return { title: "お知らせが見つかりません" };
  return { title: news.title };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const news = getNewsById(id);
  if (!news) notFound();

  return (
    <>
      <PageHeader
        title={news.title}
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "お知らせ", href: "/news" },
          { label: news.title },
        ]}
      />
      <PageSection>
        <article className="max-w-2xl">
          <time className="text-sm text-[var(--color-text-muted,#666666)]">
            {news.publishedAt}
          </time>
          <div className="mt-6 space-y-4 text-sm text-[var(--color-text,#333333)] leading-relaxed">
            {news.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </article>
      </PageSection>
    </>
  );
}
