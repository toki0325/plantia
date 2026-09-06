import Link from "next/link";
import { SectionHeading } from "@/components/home/FeatureBanner";
import type { NewsItem } from "@/lib/data/news";

type HomeNewsProps = {
  items: NewsItem[];
};

export function HomeNews({ items }: HomeNewsProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="content-width">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <SectionHeading title="お知らせ" className="mb-0" />
          <Link
            href="/news"
            className="text-sm text-[var(--color-primary,#2F4B3C)] underline shrink-0"
          >
            お知らせ一覧を見る
          </Link>
        </div>
        <ul className="divide-y divide-[var(--color-border,#EAE6DD)] border-y border-[var(--color-border,#EAE6DD)]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/news/${item.id}`}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4 hover:bg-[var(--color-ivory,#F5F1E8)] px-2 -mx-2 rounded-[2px] transition-colors"
              >
                <time className="text-sm text-[var(--color-text-muted,#666666)] shrink-0 sm:w-28">
                  {item.publishedAt}
                </time>
                <span className="text-sm font-medium text-[var(--color-text,#333333)]">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
