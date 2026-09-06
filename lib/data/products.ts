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

const rawProducts: RawProduct[] = [
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
    sizes: undefined,
    colors: toColorOptions(raw.colors),
    createdAt: `2026-0${(index % 6) + 1}-15`,
    reviews: [],
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
    "outdoor-storage-01",
    "garden-furniture-01",
    "shade-parasol-01",
    "joint-tile-01",
    "garden-light-01",
    "planter-01",
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
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.price - a.price)
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
