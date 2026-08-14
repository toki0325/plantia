export type ConditionTag = {
  slug: string;
  label: string;
  group: "sunlight" | "care" | "season";
  icon: string;
};

export const conditionGroups = [
  { id: "sunlight", label: "日当たり条件" },
  { id: "care", label: "手入れの手軽さ" },
  { id: "season", label: "季節" },
] as const;

export const conditionTags: ConditionTag[] = [
  { slug: "full-sun", label: "日向向き", group: "sunlight", icon: "/images/icons/condition_sun.svg" },
  { slug: "partial-shade", label: "半日陰向き", group: "sunlight", icon: "/images/icons/condition_sun.svg" },
  { slug: "shade", label: "日陰でも育つ", group: "sunlight", icon: "/images/icons/condition_sun.svg" },
  { slug: "low-water", label: "水やり少なめ", group: "care", icon: "/images/icons/condition_sun.svg" },
  { slug: "beginner", label: "初心者向け", group: "care", icon: "/images/icons/condition_sun.svg" },
  { slug: "advanced", label: "上級者向け", group: "care", icon: "/images/icons/condition_sun.svg" },
  { slug: "spring-summer", label: "春夏", group: "season", icon: "/images/icons/condition_sun.svg" },
  { slug: "autumn-winter", label: "秋冬", group: "season", icon: "/images/icons/condition_sun.svg" },
  { slug: "all-season", label: "通年", group: "season", icon: "/images/icons/condition_sun.svg" },
];

export function getConditionTag(slug: string): ConditionTag | undefined {
  return conditionTags.find((t) => t.slug === slug);
}

/** 商品 conditionTags（日本語ラベル）から slug へ簡易マップ */
export const productTagToSlug: Record<string, string> = {
  初心者向け: "beginner",
  水やり少なめ: "low-water",
  通年: "all-season",
};

export function matchConditionSlug(productLabel: string, slug: string): boolean {
  const mapped = productTagToSlug[productLabel];
  if (mapped) return mapped === slug;
  const tag = getConditionTag(slug);
  return tag?.label === productLabel;
}
