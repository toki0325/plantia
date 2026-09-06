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
];

export const subCategories: Category[] = [
  {
    slug: "joint-tile",
    name: "ウッドデッキ・ジョイントタイル",
    description: "敷くだけ・置くだけで手軽に施工できるジョイントタイル・ウッドデッキ。",
    image: "/images/products/joint-tile/joint-tile-01_01.jpg",
    parentSlug: "grass-tile-stone",
  },
  {
    slug: "garden-furniture",
    name: "ガーデンファニチャー",
    description: "テーブル・チェアセットなどのガーデンファニチャー。",
    image: "/images/products/garden-furniture/garden-furniture-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "fence",
    name: "フェンス",
    description: "アメリカンフェンスやスタンド柱など。",
    image: "/images/products/fence/fence-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "garden-light",
    name: "ガーデンライト",
    description: "ソーラーライトやLEDガーデンライト。",
    image: "/images/products/garden-light/garden-light-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "planter",
    name: "プランター・ハンギング",
    description: "菜園プランター、ハンギングバスケットなど。",
    image: "/images/products/planter/planter-01_01.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "soil",
    name: "培養土・肥料",
    description: "花・野菜向けの培養土・肥料各種。",
    image: "/images/products/soil/soil-01_01.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "outdoor-storage",
    name: "屋外収納庫・物置",
    description: "屋外収納庫、物置などの収納用品。",
    image: "/images/products/outdoor-storage/outdoor-storage-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "shade-parasol",
    name: "日除けシェード・ガーデンパラソル",
    description: "日除けシェード、ガーデンパラソルなど。",
    image: "/images/products/shade-parasol/shade-parasol-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "garden-ornament",
    name: "ガーデンオーナメント・置物",
    description: "ガーデンオーナメント、置物など。",
    image: "/images/products/garden-ornament/garden-ornament-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "flower-stand",
    name: "フラワースタンド・プランタースタンド・花台",
    description: "フラワースタンド、プランタースタンド、花台など。",
    image: "/images/products/flower-stand/flower-stand-01_01.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "ac-cover",
    name: "エアコン室外機カバー",
    description: "エアコン室外機カバーなど。",
    image: "/images/products/ac-cover/ac-cover-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "outdoor-trash",
    name: "屋外ゴミ箱/保管庫",
    description: "屋外ゴミ箱、保管庫など。",
    image: "/images/products/outdoor-trash/outdoor-trash-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "greenhouse",
    name: "温室・ビニール温室",
    description: "温室、ビニール温室など。",
    image: "/images/products/greenhouse/greenhouse-01_01.jpg",
    parentSlug: "gardening",
  },
  {
    slug: "garden-arch",
    name: "ガーデンアーチ・パーゴラ",
    description: "ガーデンアーチ、パーゴラなど。",
    image: "/images/products/garden-arch/garden-arch-01_01.jpg",
    parentSlug: "furniture",
  },
  {
    slug: "hose-reel",
    name: "ホース・ホースリール",
    description: "ホース、ホースリールなど。",
    image: "/images/products/hose-reel/hose-reel-01_01.jpg",
    parentSlug: "gardening",
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
