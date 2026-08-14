import type { Category } from "@/lib/types";

export const parentCategories: Category[] = [
  {
    slug: "grass-tile-stone",
    name: "人工芝・タイル・砂利",
    description: "人工芝、ジョイントタイル、敷石・砂利のラインナップ。",
    image: "/images/categories/grass_tile_stone_v1.jpg",
  },
  {
    slug: "furniture",
    name: "ガーデンファニチャー",
    description: "収納ベンチ、ガーデンファニチャー、フェンス、ガーデンライト。",
    image: "/images/categories/furniture_v1.jpg",
  },
  {
    slug: "gardening",
    name: "園芸用品",
    description: "花壇材、プランター、培養土などの園芸用品。",
    image: "/images/categories/gardening_v1.jpg",
  },
  {
    slug: "weeding",
    name: "雑草対策用品",
    description: "除草剤、防草シート、防草砂など。",
    image: "/images/categories/weeding_v1.jpg",
  },
];

export const subCategories: Category[] = [
  {
    slug: "artificial-grass",
    name: "人工芝",
    description: "リアルな質感の人工芝。ベランダ・お庭のイメージチェンジに。",
    image: "/images/products/artificial-grass/artificial-grass-01_v1.jpg",
    parentSlug: "grass-tile-stone",
  },
  {
    slug: "joint-tile",
    name: "ジョイントタイル",
    description: "敷くだけ・置くだけで手軽に施工できるジョイントタイル。",
    image: "/images/products/joint-tile/joint-tile-01_v1.jpg",
    parentSlug: "grass-tile-stone",
  },
  {
    slug: "stones",
    name: "敷石・砂利",
    description: "平板、砂利などのアクセント敷材。",
    image: "/images/products/stones/stones-01_v1.jpg",
    parentSlug: "grass-tile-stone",
  },
  {
    slug: "storage-bench",
    name: "収納ベンチ",
    description: "屋外収納と縁台を兼ねる収納ベンチ。",
    image: "/images/products/storage-bench/storage-bench-01_v1.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "garden-furniture",
    name: "ガーデンファニチャー",
    description: "テーブル・チェアセットなどのガーデンファニチャー。",
    image: "/images/products/garden-furniture/garden-furniture-01_v1.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "fence",
    name: "フェンス",
    description: "アメリカンフェンスやスタンド柱など。",
    image: "/images/products/fence/fence-01_v1.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "garden-light",
    name: "ガーデンライト",
    description: "ソーラーライトやLEDガーデンライト。",
    image: "/images/products/garden-light/garden-light-01_v1.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "flower-bed",
    name: "花壇材",
    description: "花壇ブロック、ガーデンフレームなど。",
    image: "/images/products/flower-bed/flower-bed-01_v1.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "planter",
    name: "プランター・ハンギング",
    description: "菜園プランター、ハンギングバスケットなど。",
    image: "/images/products/planter/planter-01_v1.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "soil",
    name: "培養土",
    description: "花・野菜向けの培養土各種。",
    image: "/images/products/soil/soil-01_v1.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "gardening-misc",
    name: "その他園芸用品",
    description: "肥料、殺虫剤、お手入れ用品など。",
    image: "/images/products/gardening-misc/gardening-misc-01_v1.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "herbicide",
    name: "除草剤",
    description: "液体・粒状など用途に合わせた除草剤。",
    image: "/images/products/herbicide/herbicide-01_v1.jpg",
    parentSlug: "weeding",
  },
  {
    slug: "weed-sheet",
    name: "防草シート",
    description: "高密度防草シートなど。",
    image: "/images/products/weed-sheet/weed-sheet-01_v1.jpg",
    parentSlug: "weeding",
  },
  {
    slug: "weed-sand",
    name: "防草砂",
    description: "撒くだけで防草できる人工砂など。",
    image: "/images/products/weed-sand/weed-sand-01_v1.jpg",
    parentSlug: "weeding",
  },
];

export const allCategories: Category[] = [
  ...parentCategories,
  ...subCategories,
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return allCategories.find((c) => c.slug === slug);
}

export function getSubCategories(parentSlug: string): Category[] {
  return subCategories.filter((c) => c.parentSlug === parentSlug);
}

export function resolveCategorySlug(slug: string): {
  category: Category;
  isParent: boolean;
} | null {
  const category = getCategoryBySlug(slug);
  if (!category) return null;
  return { category, isParent: !category.parentSlug };
}
