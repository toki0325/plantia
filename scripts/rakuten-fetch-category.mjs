#!/usr/bin/env node
/**
 * 楽天ショップカテゴリ URL から商品を一括取得する。
 *
 * 例:
 *   npm run rakuten:category -- --category-url "https://item.rakuten.co.jp/sumai-style/c/0000000255/"
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultFetchOptions,
  fetchRakutenItem,
  loadRakutenEnv,
} from "./rakuten-fetch-item.mjs";
import { syncRakutenCatalog } from "./rakuten-sync-catalog.mjs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function parseArgs(argv) {
  const args = {
    categoryUrl: "",
    shopCode: "",
    limit: 999,
    maxImages: 8,
    skipExisting: true,
    delayMs: 1200,
    categorySlug: "",
    parentCategorySlug: "",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--category-url" && argv[i + 1]) args.categoryUrl = argv[++i];
    else if (arg === "--shop-code" && argv[i + 1]) args.shopCode = argv[++i];
    else if (arg === "--limit" && argv[i + 1]) args.limit = Number(argv[++i]) || args.limit;
    else if (arg === "--max-images" && argv[i + 1]) {
      args.maxImages = Number(argv[++i]) || args.maxImages;
    } else if (arg === "--category-slug" && argv[i + 1]) {
      args.categorySlug = argv[++i];
    } else if (arg === "--parent-category-slug" && argv[i + 1]) {
      args.parentCategorySlug = argv[++i];
    } else if (arg === "--no-skip-existing") args.skipExisting = false;
    else if (arg === "--delay-ms" && argv[i + 1]) {
      args.delayMs = Number(argv[++i]) || args.delayMs;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/rakuten-fetch-category.mjs --category-url <shop category URL>

Options:
  --shop-code sumai-style
  --limit 999
  --max-images 8
  --category-slug garden-furniture   imports.json へ上書き（同期時 handoff に反映）
  --parent-category-slug furniture
  --no-skip-existing
`);
      process.exit(0);
    }
  }
  if (!args.categoryUrl) {
    console.error("Error: --category-url is required");
    process.exit(1);
  }
  return args;
}

function shopCodeFromCategoryUrl(url) {
  const m = url.match(/item\.rakuten\.co\.jp\/([^/]+)\/c\//i);
  if (!m) throw new Error(`Invalid category URL: ${url}`);
  return m[1];
}

function normalizeCategoryUrl(url) {
  let u = url.split("#")[0].split("?")[0];
  if (!u.endsWith("/")) u += "/";
  return u;
}

function itemSlug(itemUrl) {
  return itemUrl.replace(/\/$/, "").split("/").pop() ?? "";
}

/** 店舗カテゴリ一覧の商品リンク（category_itemnamelink）のみ抽出 */
export function extractCategoryListingUrls(html, shopCode) {
  const esc = shopCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `href="(https://item\\.rakuten\\.co\\.jp/${esc}/[a-z0-9_-]+/)"[^>]*class="category_itemnamelink`,
    "gi",
  );
  const seen = new Set();
  const urls = [];
  for (const match of html.matchAll(re)) {
    const url = match[1].toLowerCase();
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url.endsWith("/") ? url : `${url}/`);
    }
  }
  return urls;
}

export async function collectCategoryItemUrls(categoryUrl, shopCode) {
  const base = normalizeCategoryUrl(categoryUrl);
  const all = [];
  const seen = new Set();

  for (let page = 1; page <= 30; page += 1) {
    const pageUrl = page === 1 ? base : `${base}?p=${page}`;
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Category page HTTP ${res.status}: ${pageUrl}`);

    const html = await res.text();
    const pageUrls = extractCategoryListingUrls(html, shopCode);
    if (!pageUrls.length) break;

    let added = 0;
    for (const url of pageUrls) {
      if (!seen.has(url)) {
        seen.add(url);
        all.push(url);
        added += 1;
      }
    }
    console.log(`  p${page}: +${added}（累計 ${all.length}）`);
    if (added === 0) break;
  }

  return all;
}

function existingImportIds(manifestPath) {
  try {
    const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
    return new Set((raw.products ?? []).map((p) => p.id));
  } catch {
    return new Set();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  loadRakutenEnv();
  const args = parseArgs(process.argv);
  const shopCode = args.shopCode || shopCodeFromCategoryUrl(args.categoryUrl);
  const fetchOpts = defaultFetchOptions({
    maxImages: args.maxImages,
    syncCatalog: false,
  });

  console.log("=== PLANTIA 楽天 カテゴリ一括取得 ===");
  console.log(`categoryUrl : ${args.categoryUrl}`);
  console.log(`shopCode    : ${shopCode}`);
  console.log(`maxImages   : ${args.maxImages}`);

  let urls = await collectCategoryItemUrls(args.categoryUrl, shopCode);
  console.log(`検出        : ${urls.length} 件`);

  if (args.skipExisting) {
    const existing = existingImportIds(fetchOpts.manifestPath);
    urls = urls.filter((u) => !existing.has(itemSlug(u)));
    console.log(`未取込      : ${urls.length} 件`);
  }

  const targets = urls.slice(0, args.limit);
  if (!targets.length) {
    console.log("取得対象がありません。");
    process.exit(0);
  }

  const ok = [];
  const failed = [];
  for (let i = 0; i < targets.length; i += 1) {
    const url = targets[i];
    try {
      const entry = await fetchRakutenItem(url, fetchOpts);
      ok.push(entry.id);
    } catch (err) {
      failed.push({ url, error: err.message });
      console.error(`  失敗: ${url} — ${err.message}`);
    }
    if (i < targets.length - 1) await sleep(args.delayMs);
  }

  if (args.categorySlug || args.parentCategorySlug) {
    const { writeFileSync, readFileSync: read } = await import("node:fs");
    const raw = JSON.parse(read(fetchOpts.manifestPath, "utf8"));
    const idSet = new Set(ok);
    for (const product of raw.products ?? []) {
      if (!idSet.has(product.id)) continue;
      if (args.categorySlug) product.categorySlug = args.categorySlug;
      if (args.parentCategorySlug) product.parentCategorySlug = args.parentCategorySlug;
    }
    raw.generatedAt = new Date().toISOString();
    writeFileSync(fetchOpts.manifestPath, JSON.stringify(raw, null, 2), "utf8");
  }

  const synced = syncRakutenCatalog(fetchOpts.manifestPath);
  console.log("\n=== 一括完了 ===");
  console.log(`成功: ${ok.length} — ${ok.join(", ")}`);
  if (failed.length) console.log(`失敗: ${failed.length}`);
  if (synced) console.log(`カタログ: ${synced.count} 件`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
