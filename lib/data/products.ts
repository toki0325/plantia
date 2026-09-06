import type { ProductDetail, ProductOption, ProductSummary } from "@/lib/types";
import outdoorStorageHandoff from "@/data/handoff/outdoor-storage.json";
import gardenFurnitureHandoff from "@/data/handoff/garden-furniture.json";
import shadeParasolHandoff from "@/data/handoff/shade-parasol.json";
import gardenOrnamentHandoff from "@/data/handoff/garden-ornament.json";
import grassTileStoneHandoff from "@/data/handoff/grass-tile-stone.json";
import planterHandoff from "@/data/handoff/planter.json";
import flowerStandHandoff from "@/data/handoff/flower-stand.json";
import fenceHandoff from "@/data/handoff/fence.json";
import acCoverHandoff from "@/data/handoff/ac-cover.json";
import outdoorTrashHandoff from "@/data/handoff/outdoor-trash.json";
import greenhouseHandoff from "@/data/handoff/greenhouse.json";
import gardenArchHandoff from "@/data/handoff/garden-arch.json";
import jointTileHandoff from "@/data/handoff/joint-tile.json";
import gardenLightHandoff from "@/data/handoff/garden-light.json";
import soilHandoff from "@/data/handoff/soil.json";
import hoseReelHandoff from "@/data/handoff/hose-reel.json";

type RawProduct = {
  id: string;
  folder: string;
  name: string;
  price: number;
  categorySlug: string;
  parentCategorySlug?: string;
  freeShipping?: boolean;
  isNew?: boolean;
  conditionTags?: string[];
  imageFiles?: string[];
  colors?: string[];
};

const GARDENING_TAGS = ["初心者向け", "水やり少なめ", "通年"];

function poolImagePath(categorySlug: string, file: string): string {
  return `/images/products/${categorySlug}/${file}`;
}

function fromCategoryHandoff(
  handoff: {
    categorySlug: string;
    products: {
      id: string;
      name: string;
      price: number;
      images: string[];
      colors?: string[];
    }[];
  },
  parentCategorySlug: string,
  freeShipping = false,
): RawProduct[] {
  return handoff.products.map((product) => ({
    id: product.id,
    folder: handoff.categorySlug,
    name: product.name,
    price: product.price,
    categorySlug: handoff.categorySlug,
    parentCategorySlug,
    imageFiles: product.images,
    colors: product.colors,
    freeShipping,
  }));
}

function buildBatch(
  folder: string,
  parentCategorySlug: string,
  names: string[],
  prices: number[],
  freeShipping = false,
  conditionTags?: string[],
): RawProduct[] {
  return names.map((name, i) => ({
    id: `${folder}-${String(i + 1).padStart(2, "0")}`,
    folder,
    name,
    price: prices[i] ?? 1000,
    categorySlug: folder,
    parentCategorySlug,
    freeShipping,
    conditionTags,
  }));
}

const rawProducts: RawProduct[] = [
  { id: "weed-sand-01", folder: "weed-sand", name: "撒くだけで防草できる人工砂 約15kg", price: 698, categorySlug: "weed-sand", parentCategorySlug: "weeding", isNew: true },
  { id: "flower-bed-01", folder: "flower-bed", name: "箱庭ガーデンフレームセット 100cm", price: 5980, categorySlug: "flower-bed", parentCategorySlug: "gardening", freeShipping: true },
  { id: "artificial-grass-01", folder: "artificial-grass", name: "丸巻リアル人工芝 20mm 1x10m", price: 9800, categorySlug: "artificial-grass", parentCategorySlug: "grass-tile-stone", freeShipping: true },
  { id: "storage-bench-01", folder: "storage-bench", name: "静かに開閉できるアルミ収納ベンチ ブラック 幅150cm", price: 34800, categorySlug: "storage-bench", parentCategorySlug: "furniture", freeShipping: true },
  { id: "storage-bench-02", folder: "storage-bench", name: "静かに開閉できるアルミ収納ベンチ ベージュ 幅120cm", price: 29800, categorySlug: "storage-bench", parentCategorySlug: "furniture", freeShipping: true },
  ...buildBatch("artificial-grass", "grass-tile-stone", ["防草リアル人工芝 30mm 1m×5m", "防草リアル人工芝 30mm 1m×10m", "防草リアル人工芝 30mm 1m×1m", "防草リアル人工芝 30mm 2m×10m", "丸巻リアル人工芝 30mm 1×1m", "丸巻リアル人工芝 30mm 1×2m"], [14800, 27800, 3480, 52800, 1780, 3480], true),
  ...buildBatch("stones", "grass-tile-stone", ["ジョイントクリエーション オレンジ", "ジョイント平板 50×50 石畳 グレー", "木目調 平板 20×90 ダークブラウン", "プレストーン レッド", "防犯ジャリ 60L ホワイト", "崩れにくい防犯砂利20L"], [1980, 2280, 2780, 328, 2780, 1180]),
  ...buildBatch("storage-bench", "furniture", ["静かに開閉できるアルミ収納ベンチ ブラック 幅90cm", "静かに開閉できるアルミ収納ベンチ ベージュ 幅120cm", "静かに開閉できるアルミ収納ベンチ 木目調 幅150cm", "静かに開閉できるアルミ収納ベンチ スリム ブラック 幅90cm", "静かに開閉できるアルミ収納ベンチ 奥行ワイド ブラック 幅180cm", "静かに開閉できるスチール収納ベンチ ブラウン 幅120cm"], [24800, 29800, 34800, 22800, 59800, 27800], true),
  ...buildBatch("flower-bed", "gardening", ["箱庭ガーデンフレームセット 100cm", "スタッキングボーダー グレー ストレート", "花壇ブロック ストレート レッジストーン グレー", "レンガ調花壇材 ブラウン", "レンガ調花壇材 グレー", "レンガ調花壇材 レッド"], [5980, 1080, 1280, 398, 398, 398], true, GARDENING_TAGS),
  ...buildBatch("gardening-misc", "gardening", ["やさお酢 1000ml", "いろいろな植物つよし 1000ml", "持続タイプ 長く効く花と野菜の殺虫スプレー", "速効タイプ 早く効く花と野菜の殺虫スプレー", "みのか 野菜を育てる肥料 800g", "虫を予防するマグァンプD 200g"], [880, 798, 1080, 1080, 798, 698], false, GARDENING_TAGS),
  ...buildBatch("herbicide", "weeding", ["そのまま使える除草剤 4L 液体 家庭用", "お酢を使ったそのまま使える除草液 4L", "エコパシャワー除草剤 3.5L", "撒きやすいクサアタック 除草剤 粒状 3kg", "撒きやすいクサアタック除草剤 5kg", "根まで枯らす草消滅 ジョウロタイプ 4L"], [1080, 1680, 698, 2980, 4780, 2980], true),
  ...buildBatch("weed-sheet", "weeding", ["高密度防草シート 黒 幅1×長さ5m", "高密度防草シート 黒 幅1×長さ10m", "高密度防草シート 黒 幅1m×長さ50m", "高密度防草シート 黒 幅2m×長さ25m", "12年綾織 超高密度防草シート 幅1m 長さ50m"], [980, 1980, 6980, 7480, 17800], true),
  ...buildBatch("weed-sand", "weeding", ["撒くだけで防草できる人工砂 約15kg", "水で固まるマジカルサンド ブラウン 15kg", "水で固まるマジカルサンド グレー 15kg", "水で固まるマジカルサンド ベージュ 15kg"], [698, 698, 698, 698]),
  ...fromCategoryHandoff(outdoorStorageHandoff, "furniture", true),
  ...fromCategoryHandoff(gardenFurnitureHandoff, "furniture", true),
  ...fromCategoryHandoff(shadeParasolHandoff, "furniture", true),
  ...fromCategoryHandoff(gardenOrnamentHandoff, "furniture", true),
  ...fromCategoryHandoff(grassTileStoneHandoff, "grass-tile-stone", true),
  ...fromCategoryHandoff(planterHandoff, "gardening", true),
  ...fromCategoryHandoff(flowerStandHandoff, "gardening", true),
  ...fromCategoryHandoff(fenceHandoff, "furniture", true),
  ...fromCategoryHandoff(acCoverHandoff, "furniture", true),
  ...fromCategoryHandoff(outdoorTrashHandoff, "furniture", true),
  ...fromCategoryHandoff(greenhouseHandoff, "gardening", true),
  ...fromCategoryHandoff(gardenArchHandoff, "furniture", true),
  ...fromCategoryHandoff(jointTileHandoff, "grass-tile-stone", true),
  ...fromCategoryHandoff(gardenLightHandoff, "furniture", true),
  ...fromCategoryHandoff(soilHandoff, "gardening", true),
  ...fromCategoryHandoff(hoseReelHandoff, "gardening", true),
];

export function productImagePath(raw: Pick<RawProduct, "folder" | "id">): string {
  return `/images/products/${raw.folder}/${raw.id}_v1.jpg`;
}

function toProductImages(raw: RawProduct): string[] {
  if (raw.imageFiles?.length) {
    return raw.imageFiles.map((file) => poolImagePath(raw.folder, file));
  }
  return [productImagePath(raw)];
}

function toColorOptions(colors?: string[]): ProductOption[] | undefined {
  if (!colors?.length) return undefined;
  return colors.map((label) => ({
    label,
    value: label.toLowerCase().replace(/\s+/g, "-"),
  }));
}

function toDetail(raw: RawProduct, index: number): ProductDetail {
  const images = toProductImages(raw);
  const image = images[0];

  return {
    id: raw.id,
    name: raw.name,
    price: raw.price,
    image,
    images,
    categorySlug: raw.categorySlug,
    subCategorySlug: raw.categorySlug,
    parentCategorySlug: raw.parentCategorySlug,
    freeShipping: raw.freeShipping,
    isNew: raw.isNew ?? index < 3,
    conditionTags: raw.conditionTags,
    description: `${raw.name}は、PLANTIAがセレクトしたガーデニング用品です。お庭やベランダの空間づくりに合わせて、上質な素材感と使いやすさを両立しました。`,
    features: [
      "PLANTIAセレクトの厳選アイテム",
      "お庭・ベランダのコーディネートに調和",
      "税込価格表示・明朗会計",
    ],
    sizes:
      raw.folder === "artificial-grass" || raw.folder === "storage-bench"
        ? [
            { label: "標準", value: "standard" },
            { label: "ワイド", value: "wide" },
          ]
        : undefined,
    colors:
      toColorOptions(raw.colors) ??
      (raw.folder === "joint-tile" || raw.folder === "storage-bench"
        ? [
            { label: "ブラウン", value: "brown" },
            { label: "グレー", value: "gray" },
          ]
        : undefined),
    createdAt: `2026-0${(index % 6) + 1}-15`,
    reviews: [
      {
        id: `${raw.id}-review-1`,
        author: "庭好き***",
        rating: 5,
        date: "2026-07-20",
        comment: "写真通りの上品な仕上がりで、庭時間が増えました。",
      },
      {
        id: `${raw.id}-review-2`,
        author: "ベランダ派",
        rating: 4,
        date: "2026-06-08",
        comment: "設置も思ったより簡単で、統一感のある空間になりました。",
      },
    ],
  };
}

const productCatalog: ProductDetail[] = dedupeById(rawProducts.map(toDetail));

function dedupeById(products: ProductDetail[]): ProductDetail[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

const productMap = new Map(productCatalog.map((p) => [p.id, p]));

export function getAllProducts(): ProductDetail[] {
  return productCatalog;
}

export function getProductById(id: string): ProductDetail | undefined {
  return productMap.get(id);
}

export function toSummary(product: ProductDetail): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    freeShipping: product.freeShipping,
    isNew: product.isNew,
  };
}

export function getProductsByCategorySlug(slug: string): ProductDetail[] {
  return productCatalog.filter(
    (p) => p.categorySlug === slug || p.parentCategorySlug === slug,
  );
}

export function searchProducts(query: string): ProductDetail[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return productCatalog.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categorySlug.includes(q),
  );
}

export function getPopularProducts(): ProductSummary[] {
  const ids = [
    "weed-sand-01",
    "flower-bed-01",
    "joint-tile-01",
    "artificial-grass-01",
    "storage-bench-01",
    "storage-bench-02",
  ];
  return ids
    .map((id) => productMap.get(id))
    .filter(Boolean)
    .map((p) => toSummary(p!));
}

export function getNewArrivals(limit = 12): ProductSummary[] {
  return [...productCatalog]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(toSummary);
}

export function getRanking(limit = 12): ProductSummary[] {
  return productCatalog
    .slice()
    .sort((a, b) => b.reviews.length - a.reviews.length || b.price - a.price)
    .slice(0, limit)
    .map(toSummary);
}

export function getRelatedProducts(
  productId: string,
  limit = 4,
): ProductSummary[] {
  const product = getProductById(productId);
  if (!product) return [];
  return productCatalog
    .filter(
      (p) =>
        p.id !== productId &&
        (p.categorySlug === product.categorySlug ||
          p.parentCategorySlug === product.parentCategorySlug),
    )
    .slice(0, limit)
    .map(toSummary);
}

export function getProductsByConditionTag(tag: string): ProductDetail[] {
  return productCatalog.filter((p) => p.conditionTags?.includes(tag));
}

/** home.ts 互換: 簡易 Product 型 */
export type LegacyProduct = ProductSummary;

export function legacyProductsFromDetails(
  products: ProductSummary[],
): LegacyProduct[] {
  return products;
}
