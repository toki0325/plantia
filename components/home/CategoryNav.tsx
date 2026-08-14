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
    image: string;
    href: string;
  }[];
};

export function MainCategoryCards({ categories }: MainCategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.href}
          className="group relative aspect-[4/3] overflow-hidden rounded-[4px] border border-[var(--border-default)]"
        >
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <span className="text-white text-xs md:text-sm font-medium leading-snug">
              {category.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
