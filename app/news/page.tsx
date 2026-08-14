import Link from "next/link";
import {
  PageHeader,
  PageSection,
} from "@/components/layout/PageHeader";
import { newsItems } from "@/lib/data/news";

export const metadata = { title: "お知らせ" };

export default function NewsListPage() {
  return (
    <>
      <PageHeader
        title="お知らせ"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "お知らせ" },
        ]}
      />
      <PageSection>
        <ul className="divide-y divide-[var(--color-border,#EAE6DD)]">
          {newsItems.map((item) => (
            <li key={item.id}>
              <Link
                href={`/news/${item.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 hover:bg-[var(--color-ivory,#F5F1E8)] px-2 -mx-2 rounded-[2px] transition-colors"
              >
                <time className="text-sm text-[var(--color-text-muted,#666666)] shrink-0 w-28">
                  {item.publishedAt}
                </time>
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageSection>
    </>
  );
}
