"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { stickyNavItems } from "@/lib/data/home";

export function StickyCategoryNav() {
  const [activeId, setActiveId] = useState(stickyNavItems[0]?.id ?? "");

  useEffect(() => {
    const sections = stickyNavItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky-category-nav" aria-label="カテゴリーナビゲーション">
      <div className="content-width flex items-center">
        <button
          type="button"
          className="shrink-0 px-2 py-3 text-[var(--text-description)] hover:text-[var(--text-default)]"
          aria-label="前へ"
          onClick={() => {
            const el = document.querySelector(".sticky-category-nav__scroll");
            el?.scrollBy({ left: -200, behavior: "smooth" });
          }}
        >
          ‹
        </button>
        <div className="sticky-category-nav__scroll flex-1">
          {stickyNavItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`sticky-category-nav__item ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <button
          type="button"
          className="shrink-0 px-2 py-3 text-[var(--text-description)] hover:text-[var(--text-default)]"
          aria-label="次へ"
          onClick={() => {
            const el = document.querySelector(".sticky-category-nav__scroll");
            el?.scrollBy({ left: 200, behavior: "smooth" });
          }}
        >
          ›
        </button>
      </div>
    </nav>
  );
}

type MainCategoryCardsProps = {
  categories: {
    id: string;
    name: string;
    href: string;
    image?: string;
  }[];
};

export function MainCategoryCards({ categories }: MainCategoryCardsProps) {
  return (
    <ul className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-6 sm:gap-x-3 sm:gap-y-8 list-none p-0 m-0">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={category.href}
            className="group flex flex-col items-center text-center"
          >
            <span className="relative block w-full aspect-square bg-[#f4f4f4] overflow-hidden rounded-[4px]">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                />
              ) : null}
            </span>
            <span className="mt-2 text-[11px] sm:text-xs leading-snug text-[var(--text-default)] group-hover:text-[var(--text-primary)] group-hover:underline">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
