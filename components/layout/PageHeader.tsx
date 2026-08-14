import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <div className="bg-[var(--color-ivory,#F5F1E8)] border-b border-[var(--color-border,#EAE6DD)]">
      <div className="content-width py-6 md:py-8 lg:py-12">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4 -mt-2">
            <Breadcrumb items={breadcrumbs} embedded />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-primary,#2F4B3C)]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-sm md:text-base text-[var(--color-text-muted,#666666)] max-w-2xl">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export function PageSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-8 md:py-12 lg:py-16 ${className}`}>
      <div className="content-width">{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-lg md:text-xl font-bold text-[var(--color-primary,#2F4B3C)] mb-6 ${className}`}
    >
      {children}
    </h2>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="text-center py-16 px-4">
      <h2 className="text-lg font-bold text-[var(--color-text,#333333)] mb-2">
        {title}
      </h2>
      <p className="text-sm text-[var(--color-text-muted,#666666)] mb-6">
        {description}
      </p>
      <Link
        href={actionHref}
        className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-primary,#2F4B3C)] text-white text-sm rounded-[2px] hover:bg-[#263D30] transition-colors"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
