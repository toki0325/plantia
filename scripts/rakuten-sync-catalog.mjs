#!/usr/bin/env node
/**
 * data/rakuten/imports.json → data/handoff/rakuten-imports.json
 * products.ts が読み込むカタログ形式に変換する。
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = join(ROOT, "data/rakuten/imports.json");
const HANDOFF_PATH = join(ROOT, "data/handoff/rakuten-imports.json");

const CATEGORY_RULES = [
  ["joint-tile", ["ジョイント", "タイル", "デッキ", "tile"]],
  ["grass-tile-stone", ["人工芝", "敷石", "砂利", "芝"]],
  ["garden-furniture", ["テーブル", "チェア", "椅子", "ソファ", "ファニチャー"]],
  ["fence", ["フェンス", "fence"]],
  ["garden-light", ["ライト", "ランプ", "照明", "light"]],
  ["planter", ["プランター", "植木鉢", "planter"]],
  ["flower-stand", ["フラワースタンド", "花台", "スタンド"]],
  ["garden-ornament", ["オブジェ", "置物", "オーナメント", "バレル", "樽"]],
  ["outdoor-storage", ["物置", "収納庫", "ストッカー"]],
  ["shade-parasol", ["パラソル", "シェード", "日除け"]],
  ["greenhouse", ["温室", "ビニールハウス"]],
  ["garden-arch", ["アーチ", "パーゴラ"]],
  ["hose-reel", ["ホース", "リール"]],
  ["soil", ["培養土", "肥料", "土"]],
  ["ac-cover", ["エアコン", "室外機"]],
  ["outdoor-trash", ["ゴミ箱", "ダスト"]],
];

const PARENT_BY_CATEGORY = {
  "joint-tile": "grass-tile-stone",
  "grass-tile-stone": "grass-tile-stone",
  "garden-furniture": "furniture",
  fence: "furniture",
  "garden-light": "furniture",
  planter: "gardening",
  "flower-stand": "gardening",
  "garden-ornament": "furniture",
  "outdoor-storage": "furniture",
  "shade-parasol": "furniture",
  greenhouse: "gardening",
  "garden-arch": "furniture",
  "hose-reel": "gardening",
  soil: "gardening",
  "ac-cover": "furniture",
  "outdoor-trash": "furniture",
};

export function guessCategorySlug(name) {
  const lowered = name.toLowerCase();
  for (const [slug, keywords] of CATEGORY_RULES) {
    for (const keyword of keywords) {
      if (lowered.includes(keyword.toLowerCase())) return slug;
    }
  }
  return "garden-ornament";
}

export function shortenProductName(name, maxChars = 48) {
  let cleaned = name.trim();
  cleaned = cleaned.replace(/【[^】]*】/g, " ");
  cleaned = cleaned.replace(/\s+[A-Z]{2,}\d{3,}\s*$/i, "");
  cleaned = cleaned.replace(/[：:][^：:]*$/, "").trim();
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;

  const keyTerms = [
    "コーヒー樽",
    "プランター",
    "人工芝",
    "ジョイント",
    "フェンス",
    "ライト",
    "収納",
    "テーブル",
    "チェア",
  ];
  const picked = [];
  for (const word of cleaned.split(" ")) {
    if (picked.join(" ").length + word.length + 1 > maxChars) break;
    if (word.length < 2) continue;
    picked.push(word);
    if (keyTerms.some((t) => word.includes(t)) && picked.join(" ").length >= 16) break;
  }
  const short = picked.join(" ").trim();
  return short.length >= 8 ? short : cleaned.slice(0, maxChars).trim();
}

export function syncRakutenCatalog(manifestPath = DEFAULT_MANIFEST) {
  if (!existsSync(manifestPath)) {
    console.warn(`manifest がありません: ${manifestPath}`);
    return null;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const imports = manifest.products ?? [];
  if (!imports.length) {
    console.warn("取り込み商品が 0 件です。");
    return null;
  }

  const products = imports.map((entry) => {
    const displayName = shortenProductName(entry.name ?? entry.id);
    const categorySlug =
      entry.categorySlug ?? guessCategorySlug(entry.name ?? displayName);
    const parentCategorySlug =
      entry.parentCategorySlug ??
      PARENT_BY_CATEGORY[categorySlug] ??
      "furniture";

    return {
      id: entry.id,
      name: displayName,
      price: Number(entry.price) || 0,
      categorySlug,
      parentCategorySlug,
      imageWebPaths: entry.images ?? [],
      itemUrl: entry.itemUrl ?? "",
      itemCode: entry.itemCode ?? "",
      shopCode: entry.shopCode ?? "",
      freeShipping: entry.freeShipping ?? false,
      isNew: entry.isNew ?? true,
      conditionTags: ["rakuten-import"],
      importedAt: entry.importedAt ?? new Date().toISOString(),
    };
  });

  const handoff = {
    source: "rakuten",
    generatedAt: new Date().toISOString(),
    manifestPath: manifestPath.replace(`${ROOT}/`, ""),
    products,
  };

  mkdirSync(dirname(HANDOFF_PATH), { recursive: true });
  writeFileSync(HANDOFF_PATH, JSON.stringify(handoff, null, 2), "utf8");
  return { handoffPath: HANDOFF_PATH, count: products.length };
}

function main() {
  const manifestArg = process.argv[2];
  const manifestPath = manifestArg
    ? join(ROOT, manifestArg)
    : DEFAULT_MANIFEST;

  console.log("=== 楽天 → PLANTIA カタログ同期 ===");
  const result = syncRakutenCatalog(manifestPath);
  if (!result) process.exit(1);
  console.log(`handoff : ${result.handoffPath}`);
  console.log(`商品数  : ${result.count}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
