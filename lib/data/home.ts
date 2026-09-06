import Link from "next/link";
import { getAllProducts, getPopularProducts } from "@/lib/data/products";
import { getRelatedFeaturesForHome } from "@/lib/data/features";
import { getProductsByCategorySlug, toSummary } from "@/lib/data/products";
import type { ProductSummary } from "@/lib/types";
import { getFeatureBySlug } from "@/lib/data/features";

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
  {
    id: "weeding",
    name: "雑草対策用品",
    image: "/images/categories/weeding_v1.jpg",
    href: "/category/weeding",
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
  d: "/images/products/garden-light/garden-light-01_v1.jpg",
  e: "/images/categories/gardening_v1.jpg",
};

export const relatedFeatures = getRelatedFeaturesForHome();

function productsForSlug(slug: string, count = 6): Product[] {
  return getProductsByCategorySlug(slug).slice(0, count).map(toSummary);
}

function featureFromSlug(slug: string, overrides?: Partial<FeatureArticle>): FeatureArticle | undefined {
  const f = getFeatureBySlug(slug);
  if (!f) return undefined;
  return {
    id: f.slug,
    title: f.title,
    description: f.description,
    image: f.image,
    href: `/feature/${f.slug}`,
    ...overrides,
  };
}

export const homeSections: HomeSection[] = [
  {
    id: "grass-tile-stone",
    anchorId: "grass-tile-stone",
    title: "人工芝、タイル、砂利",
    subCategories: [
      { id: "artificial-grass", name: "人工芝", image: "/images/products/artificial-grass/artificial-grass-01_v1.jpg", href: "/category/artificial-grass" },
      { id: "joint-tile", name: "ジョイントタイル", image: "/images/products/joint-tile/joint-tile-01_v1.jpg", href: "/category/joint-tile" },
      { id: "stones", name: "敷石・砂利", image: "/images/products/stones/stones-01_v1.jpg", href: "/category/stones" },
    ],
    products: [],
    moreHref: "/category/grass-tile-stone",
    subSections: [
      {
        id: "artificial-grass",
        title: "人工芝",
        carouselImages: ["/images/products/artificial-grass/artificial-grass-01_v1.jpg", "/images/products/artificial-grass/artificial-grass-02_v1.jpg", "/images/products/artificial-grass/artificial-grass-03_v1.jpg"],
        products: productsForSlug("artificial-grass"),
        moreHref: "/category/artificial-grass",
        feature: { id: "grass-guide", title: "初心者の方でも大丈夫！", description: "失敗しない人工芝の貼り方はこちらの特集からチェック", image: "/images/features/feature_01_v1.jpg", href: "/feature/artificial-grass-guide" },
      },
      {
        id: "joint-tile",
        title: "ジョイントタイル",
        carouselImages: ["/images/products/joint-tile/joint-tile-01_v1.jpg", "/images/products/joint-tile/joint-tile-02_v1.jpg", "/images/products/joint-tile/joint-tile-03_v1.jpg"],
        products: productsForSlug("joint-tile"),
        moreHref: "/category/joint-tile",
        feature: featureFromSlug("joint-tile", { title: "ジョイントタイルでベランダ・お庭を手軽にイメージチェンジ", description: "いろんなカラーを組み合わせて自分好みにお庭やベランダをおしゃれにDIY" }),
      },
      {
        id: "stones",
        title: "敷石・砂利",
        carouselImages: ["/images/products/stones/stones-01_v1.jpg", "/images/products/stones/stones-02_v1.jpg"],
        products: productsForSlug("stones"),
        moreHref: "/category/stones",
      },
    ],
  },
  {
    id: "furniture",
    anchorId: "furniture",
    title: "ベンチ、フェンス、ライトなどのファニチャー用品",
    subCategories: [
      { id: "storage-bench", name: "収納ベンチ", image: "/images/products/storage-bench/storage-bench-01_v1.jpg", href: "/category/storage-bench" },
      { id: "garden-furniture", name: "ガーデンファニチャー", image: "/images/products/garden-furniture/garden-furniture-01_v1.jpg", href: "/category/garden-furniture" },
      { id: "fence", name: "フェンス", image: "/images/products/fence/fence-01_v1.jpg", href: "/category/fence" },
      { id: "garden-light", name: "ガーデンライト", image: "/images/products/garden-light/garden-light-01_v1.jpg", href: "/category/garden-light" },
    ],
    products: [],
    moreHref: "/category/furniture",
    subSections: [
      { id: "storage-bench", title: "収納ベンチ", carouselImages: ["/images/products/storage-bench/storage-bench-01_v1.jpg", "/images/products/storage-bench/storage-bench-02_v1.jpg"], products: productsForSlug("storage-bench"), moreHref: "/category/storage-bench", feature: { id: "bench-article", title: "もう庭が汚いと言わせない！ 静かに開閉できるアルミ収納ベンチで庭をスッキリ整理整頓", description: "ムダなものは置かず好きな植物を飾ってコーディネートをし、リラックス空間として有効活用できたら理想です。", image: "/images/products/storage-bench/storage-bench-03_v1.jpg", href: "/feature/storage-bench", linkText: "記事を読む" } },
      { id: "garden-furniture", title: "ガーデンファニチャー", carouselImages: ["/images/products/garden-furniture/garden-furniture-01_v1.jpg", "/images/products/garden-furniture/garden-furniture-02_v1.jpg"], products: productsForSlug("garden-furniture"), moreHref: "/category/garden-furniture", feature: featureFromSlug("garden-furniture") },
      { id: "fence", title: "フェンス", carouselImages: ["/images/products/fence/fence-01_v1.jpg", "/images/products/fence/fence-02_v1.jpg"], products: productsForSlug("fence"), moreHref: "/category/fence" },
      { id: "garden-light", title: "ガーデンライト", carouselImages: ["/images/products/garden-light/garden-light-01_v1.jpg"], products: productsForSlug("garden-light"), moreHref: "/category/garden-light" },
    ],
  },
  {
    id: "gardening",
    anchorId: "gardening",
    title: "花壇材、プランター、土などの園芸用品",
    subCategories: [
      { id: "flower-bed", name: "花壇材", image: "/images/products/flower-bed/flower-bed-01_v1.jpg", href: "/category/flower-bed" },
      { id: "planter", name: "プランター・ハンギング", image: "/images/products/planter/planter-01_v1.jpg", href: "/category/planter" },
      { id: "soil", name: "培養土", image: "/images/products/soil/soil-01_v1.jpg", href: "/category/soil" },
      { id: "gardening-misc", name: "その他用品", image: "/images/products/gardening-misc/gardening-misc-01_v1.jpg", href: "/category/gardening-misc" },
    ],
    products: [],
    moreHref: "/category/gardening",
    subSections: [
      { id: "flower-bed", title: "花壇材", carouselImages: ["/images/products/flower-bed/flower-bed-01_v1.jpg", "/images/products/flower-bed/flower-bed-02_v1.jpg"], products: productsForSlug("flower-bed"), moreHref: "/category/flower-bed" },
      { id: "planter", title: "プランター・ハンギング", carouselImages: ["/images/products/planter/planter-01_v1.jpg"], products: productsForSlug("planter"), moreHref: "/category/planter" },
      { id: "soil", title: "培養土", carouselImages: ["/images/products/soil/soil-01_v1.jpg"], products: productsForSlug("soil"), moreHref: "/category/soil" },
      { id: "gardening-misc", title: "その他用品", products: productsForSlug("gardening-misc"), moreHref: "/category/gardening-misc", feature: featureFromSlug("hose-reel", { title: "ホース・ホースリールで毎日の散水がラクになる", description: "ライフスタイルに合わせて最適な、コスパに優れたアイテムを数多くラインナップ！" }) },
    ],
  },
  {
    id: "weeding",
    anchorId: "weeding",
    title: "雑草対策用品",
    subCategories: [
      { id: "herbicide", name: "除草剤", image: "/images/products/herbicide/herbicide-01_v1.jpg", href: "/category/herbicide" },
      { id: "weed-sheet", name: "防草シート", image: "/images/products/weed-sheet/weed-sheet-01_v1.jpg", href: "/category/weed-sheet" },
      { id: "weed-sand", name: "砂", image: "/images/products/weed-sand/weed-sand-01_v1.jpg", href: "/category/weed-sand" },
    ],
    products: [],
    moreHref: "/category/weeding",
    subSections: [
      { id: "herbicide", title: "除草剤", carouselImages: ["/images/products/herbicide/herbicide-01_v1.jpg"], products: productsForSlug("herbicide"), moreHref: "/category/herbicide", feature: featureFromSlug("herbicide", { title: "おすすめ除草グッズ特集", description: "大変な除草作業を簡単に！おすすめの除草剤や、除草グッズを集めました♪" }) },
      { id: "weed-sheet", title: "防草シート", carouselImages: ["/images/products/weed-sheet/weed-sheet-01_v1.jpg", "/images/products/weed-sheet/weed-sheet-02_v1.jpg"], products: productsForSlug("weed-sheet"), moreHref: "/category/weed-sheet", feature: featureFromSlug("weed-sheet-guide", { title: "防草シートとは？敷き方やメリット・デメリットを解説", linkText: "記事を読む" }) },
      { id: "weed-sand", title: "砂", carouselImages: ["/images/products/weed-sand/weed-sand-01_v1.jpg"], products: productsForSlug("weed-sand"), moreHref: "/category/weed-sand", feature: featureFromSlug("weed-sand", { title: "【防草革命】撒くだけで雑草を抑制できる「砂」を作っちゃいました", linkText: "記事を読む" }) },
    ],
  },
];

export { formatPrice } from "@/lib/pricing";
