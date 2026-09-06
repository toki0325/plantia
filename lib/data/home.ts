import { getAllProducts, getPopularProducts } from "@/lib/data/products";
import { getRelatedFeaturesForHome } from "@/lib/data/features";
import { getProductsByCategorySlug, toSummary } from "@/lib/data/products";
import type { ProductSummary } from "@/lib/types";

export type Product = ProductSummary;

export type SubCategory = {
  id: string;
  name: string;
  image: string;
  href: string;
};

export type FeatureArticle = {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  linkText?: string;
};

export type HomeSection = {
  id: string;
  anchorId: string;
  title: string;
  subCategories?: SubCategory[];
  carouselImages?: string[];
  products: Product[];
  moreHref: string;
  feature?: FeatureArticle;
  subSections?: {
    id: string;
    title: string;
    carouselImages?: string[];
    products: Product[];
    moreHref: string;
    feature?: FeatureArticle;
  }[];
};

export const GARDEN_DIY_PATH = "/contents/garden-diy";

export type BrowseCategory = {
  id: string;
  name: string;
  href: string;
  image?: string;
};

/** 指定カテゴリの先頭商品のサムネイル画像パスを返す（トップのカテゴリサムネ用）。 */
function firstCategoryImage(slug: string): string | undefined {
  return getAllProducts().find((p) => p.categorySlug === slug)?.image;
}

/** トップ「カテゴリから探す」用。サムネは各カテゴリの先頭商品画像を使用。 */
const browseCategoryDefs: Omit<BrowseCategory, "image">[] = [
  { id: "outdoor-storage", name: "屋外収納庫・物置", href: "/category/outdoor-storage" },
  { id: "garden-furniture", name: "ガーデンファニチャー", href: "/category/garden-furniture" },
  { id: "shade-parasol", name: "日除けシェード・ガーデンパラソル", href: "/category/shade-parasol" },
  { id: "garden-ornament", name: "ガーデンオーナメント・置物", href: "/category/garden-ornament" },
  { id: "grass-tile-stone", name: "敷石・防草シート・芝", href: "/category/grass-tile-stone" },
  { id: "planter", name: "プランター・植木鉢・鉢カバー", href: "/category/planter" },
  { id: "flower-stand", name: "フラワースタンド・プランタースタンド・花台", href: "/category/flower-stand" },
  { id: "fence", name: "フェンス・ラティス・トレリス", href: "/category/fence" },
  { id: "ac-cover", name: "エアコン室外機カバー", href: "/category/ac-cover" },
  { id: "outdoor-trash", name: "屋外ゴミ箱/保管庫", href: "/category/outdoor-trash" },
  { id: "greenhouse", name: "温室・ビニール温室", href: "/category/greenhouse" },
  { id: "garden-arch", name: "ガーデンアーチ・パーゴラ", href: "/category/garden-arch" },
  { id: "joint-tile", name: "ウッドデッキ・ジョイントタイルパネル", href: "/category/joint-tile" },
  { id: "garden-light", name: "ガーデン/ソーラーライト・庭用照明", href: "/category/garden-light" },
  { id: "soil", name: "園芸土/肥料", href: "/category/soil" },
  { id: "hose-reel", name: "ホース・ホースリール", href: "/category/hose-reel" },
];

export const browseCategories: BrowseCategory[] = browseCategoryDefs.map((c) => ({
  ...c,
  image: firstCategoryImage(c.id),
}));

export const mainCategories = [
  {
    id: "grass-tile-stone",
    name: "人工芝、タイル、砂利",
    image: "/images/categories/grass_tile_stone_v1.jpg",
    href: "/category/grass-tile-stone",
  },
  {
    id: "furniture",
    name: "ベンチ、フェンス、ライトなどのファニチャー用品",
    image: "/images/categories/furniture_v1.jpg",
    href: "/category/furniture",
  },
  {
    id: "gardening",
    name: "花壇材、プランター、土などの園芸用品",
    image: "/images/categories/gardening_v1.jpg",
    href: "/category/gardening",
  },
];

export const stickyNavItems = mainCategories.map((c) => ({
  id: c.id,
  label: c.name,
  href: `${GARDEN_DIY_PATH}#${c.id}`,
}));

export const popularProducts = getPopularProducts();

export const heroImages = {
  a: "/images/categories/furniture_v1.jpg",
  b: "/images/categories/grass_tile_stone_v1.jpg",
  c: "/images/hero/hero_main_v1.jpg",
  d: "/images/products/garden-light/garden-light-01_01.jpg",
  e: "/images/categories/gardening_v1.jpg",
};

export const relatedFeatures = getRelatedFeaturesForHome();

function productsForSlug(slug: string, count = 6): Product[] {
  return getProductsByCategorySlug(slug).slice(0, count).map(toSummary);
}

/** カテゴリ先頭商品のサムネ画像。 */
function categoryThumb(slug: string): string {
  return getProductsByCategorySlug(slug)[0]?.image ?? "";
}

/** カテゴリ先頭商品の画像を数枚（カルーセル用）。 */
function categoryCarousel(slug: string, count = 3): string[] {
  return getProductsByCategorySlug(slug)[0]?.images.slice(0, count) ?? [];
}

type HomeGroup = {
  parent: string;
  title: string;
  subs: { slug: string; title: string }[];
};

/** トップ／garden-diy のセクション定義。handoff の実カテゴリのみで構成。 */
const homeGroups: HomeGroup[] = [
  {
    parent: "grass-tile-stone",
    title: "人工芝、タイル、砂利",
    subs: [
      { slug: "joint-tile", title: "ウッドデッキ・ジョイントタイル" },
      { slug: "grass-tile-stone", title: "敷石・防草シート・芝" },
    ],
  },
  {
    parent: "furniture",
    title: "ベンチ、フェンス、ライトなどのファニチャー用品",
    subs: [
      { slug: "outdoor-storage", title: "屋外収納庫・物置" },
      { slug: "garden-furniture", title: "ガーデンファニチャー" },
      { slug: "fence", title: "フェンス・ラティス・トレリス" },
      { slug: "garden-light", title: "ガーデン/ソーラーライト" },
      { slug: "shade-parasol", title: "日除けシェード・パラソル" },
      { slug: "garden-ornament", title: "ガーデンオーナメント・置物" },
      { slug: "ac-cover", title: "エアコン室外機カバー" },
      { slug: "outdoor-trash", title: "屋外ゴミ箱・保管庫" },
      { slug: "garden-arch", title: "ガーデンアーチ・パーゴラ" },
    ],
  },
  {
    parent: "gardening",
    title: "花壇材、プランター、土などの園芸用品",
    subs: [
      { slug: "planter", title: "プランター・植木鉢・鉢カバー" },
      { slug: "flower-stand", title: "フラワースタンド・花台" },
      { slug: "soil", title: "園芸土・肥料" },
      { slug: "greenhouse", title: "温室・ビニール温室" },
      { slug: "hose-reel", title: "ホース・ホースリール" },
    ],
  },
];

export const homeSections: HomeSection[] = homeGroups.map((group) => ({
  id: group.parent,
  anchorId: group.parent,
  title: group.title,
  subCategories: group.subs.map((s) => ({
    id: s.slug,
    name: s.title,
    image: categoryThumb(s.slug),
    href: `/category/${s.slug}`,
  })),
  products: [],
  moreHref: `/category/${group.parent}`,
  subSections: group.subs.map((s) => ({
    id: s.slug,
    title: s.title,
    carouselImages: categoryCarousel(s.slug),
    products: productsForSlug(s.slug),
    moreHref: `/category/${s.slug}`,
  })),
}));

export { formatPrice } from "@/lib/pricing";
