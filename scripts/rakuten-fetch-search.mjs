#!/usr/bin/env node
/**
 * 楽天検索結果ページから商品 URL を抽出し、一括で画像取得する。
 *
 * 例:
 *   npm run rakuten:search -- --search-url "https://search.rakuten.co.jp/search/mall/..." --limit 8
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function parseArgs(argv) {
  const args = {
    searchUrl: "",
    shopCode: "",
    limit: 8,
    maxImages: 8,
    skipExisting: true,
    delayMs: 1200,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--search-url" && argv[i + 1]) args.searchUrl = argv[++i];
    else if (arg === "--shop-code" && argv[i + 1]) args.shopCode = argv[++i];
    else if (arg === "--limit" && argv[i + 1]) args.limit = Number(argv[++i]) || args.limit;
    else if (arg === "--max-images" && argv[i + 1]) {
      args.maxImages = Number(argv[++i]) || args.maxImages;
    } else if (arg === "--no-skip-existing") args.skipExisting = false;
    else if (arg === "--delay-ms" && argv[i + 1]) {
      args.delayMs = Number(argv[++i]) || args.delayMs;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/rakuten-fetch-search.mjs --search-url <URL> [--limit 8] [--max-images 8]

Options:
  --shop-code       店舗コードで URL を絞る（例: sumai-style）
  --no-skip-existing  既に imports.json にある ID も再取得
  --delay-ms        商品間の待機（default: 1200）
`);
      process.exit(0);
    }
  }
  if (!args.searchUrl) {
    console.error("Error: --search-url is required");
    process.exit(1);
  }
  return args;
}

function normalizeItemUrl(url) {
  let u = url.split("?")[0].split("#")[0];
  if (!u.endsWith("/")) u += "/";
  return u;
}

function itemSlug(itemUrl) {
  return itemUrl.replace(/\/$/, "").split("/").pop() ?? "";
}

export async function extractItemUrlsFromSearch(searchUrl, shopCode = "") {
  const res = await fetch(searchUrl, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Search page HTTP ${res.status}`);
  const html = await res.text();
  const pattern = shopCode
    ? new RegExp(
        `https://item\\.rakuten\\.co\\.jp/${shopCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[a-z0-9_-]+/?`,
        "gi",
      )
    : /https:\/\/item\.rakuten\.co\.jp\/[a-z0-9_-]+\/[a-z0-9_-]+\/?/gi;

  const seen = new Set();
  const urls = [];
  for (const match of html.matchAll(pattern)) {
    const url = normalizeItemUrl(match[0]);
    const slug = itemSlug(url);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    urls.push(url);
  }
  return urls;
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
  const fetchOpts = defaultFetchOptions({
    maxImages: args.maxImages,
    syncCatalog: false,
  });

  console.log("=== PLANTIA 楽天 検索一括取得 ===");
  console.log(`searchUrl : ${args.searchUrl}`);
  console.log(`limit     : ${args.limit}`);
  console.log(`maxImages : ${args.maxImages}`);

  let urls = await extractItemUrlsFromSearch(args.searchUrl, args.shopCode);
  console.log(`検出      : ${urls.length} 件`);

  if (args.skipExisting) {
    const existing = existingImportIds(fetchOpts.manifestPath);
    urls = urls.filter((u) => !existing.has(itemSlug(u)));
    console.log(`未取込    : ${urls.length} 件（スキップ: ${existing.size} 件）`);
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
