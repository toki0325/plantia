import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  embedded?: boolean;
};

export function Breadcrumb({ items, embedded = false }: BreadcrumbProps) {
  return (
    <nav
      aria-label="パンくずリスト"
      className={embedded ? "py-1" : "content-width py-3"}
    >
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--text-description)]">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">&gt;</span>}
            {item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
