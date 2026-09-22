#!/usr/bin/env node
/** imports.json の全商品を再取得（修正後ロジック適用） */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultFetchOptions,
  fetchRakutenItem,
  loadRakutenEnv,
} from "./rakuten-fetch-item.mjs";
import { syncRakutenCatalog } from "./rakuten-sync-catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "data/rakuten/imports.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadRakutenEnv();
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const products = manifest.products ?? [];
  const opts = defaultFetchOptions({ syncCatalog: false, forceDownload: true });

  console.log(`=== 楽天取込 ${products.length} 件を再取得 ===`);
  let ok = 0;
  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    if (!p.itemUrl) continue;
    try {
      await fetchRakutenItem(p.itemUrl, {
        ...opts,
        ...(p.categorySlug ? { categorySlug: p.categorySlug } : {}),
        ...(p.parentCategorySlug
          ? { parentCategorySlug: p.parentCategorySlug }
          : {}),
      });
      ok += 1;
    } catch (e) {
      console.error(`失敗 ${p.id}: ${e.message}`);
    }
    if (i < products.length - 1) await sleep(1000);
  }
  syncRakutenCatalog(MANIFEST);
  console.log(`\n完了: ${ok}/${products.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
