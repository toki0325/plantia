#!/usr/bin/env node
/**
 * 楽天商品 URL 1件から画像を取得し、manifest を出力する。
 *
 * 用法:
 *   node scripts/rakuten-fetch-item.mjs --item-url "https://item.rakuten.co.jp/sumai-style/cb-233040ns/"
 *
 * 環境変数 (.env.local):
 *   RAKUTEN_APPLICATION_ID, RAKUTEN_ACCESS_KEY, RAKUTEN_REFERER_URL
 * API キーがなくても商品ページ HTML から画像 URL を抽出してダウンロード可能。
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import iconv from "iconv-lite";
import { rmSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function loadDotEnv(path, override = false) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    itemUrl: "",
    maxImages: 8,
    outDir: join(ROOT, "public/images/products/rakuten-imports"),
    manifestPath: join(ROOT, "data/rakuten/imports.json"),
    imagesWebPath: "/images/products/rakuten-imports",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--item-url" && argv[i + 1]) {
      args.itemUrl = argv[++i];
    } else if (arg === "--max-images" && argv[i + 1]) {
      args.maxImages = Number(argv[++i]) || args.maxImages;
    } else if (arg === "--out-dir" && argv[i + 1]) {
      args.outDir = join(ROOT, argv[++i]);
    } else if (arg === "--manifest" && argv[i + 1]) {
      args.manifestPath = join(ROOT, argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/rakuten-fetch-item.mjs --item-url <rakuten item URL> [--max-images 8]

Options:
  --out-dir       default: public/images/products/rakuten-imports
  --manifest      default: data/rakuten/imports.json
`);
      process.exit(0);
    }
  }
  if (!args.itemUrl) {
    console.error("Error: --item-url is required");
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
  return itemUrl.replace(/\/$/, "").split("/").pop() ?? "item";
}

function shopCodeFromItemUrl(itemUrl) {
  const m = itemUrl.match(/item\.rakuten\.co\.jp\/([^/]+)\//i);
  if (!m) throw new Error(`Invalid Rakuten item URL: ${itemUrl}`);
  return m[1];
}

function decodeHtmlEntities(html) {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function detectHtmlCharset(contentType, buffer) {
  if (/euc-jp|eucjp/i.test(contentType ?? "")) return "euc-jp";
  const head = buffer.slice(0, 8000).toString("latin1");
  if (/charset\s*=\s*EUC-JP/i.test(head)) return "euc-jp";
  if (/charset\s*=\s*Shift_JIS/i.test(head)) return "shift_jis";
  return "utf-8";
}

function decodeHtmlBuffer(buffer, charset) {
  if (charset === "utf-8") return buffer.toString("utf8");
  try {
    return iconv.decode(buffer, charset);
  } catch {
    return buffer.toString("utf8");
  }
}

async function fetchHtml(url, referer) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Referer: referer ?? url },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const charset = detectHtmlCharset(res.headers.get("content-type"), buffer);
  return decodeHtmlEntities(decodeHtmlBuffer(buffer, charset));
}

async function apiGet(params, refererUrl) {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY ?? "";
  if (!applicationId || !accessKey) return null;

  const qs = new URLSearchParams({
    ...params,
    applicationId,
    accessKey,
    format: "json",
  });
  const headers = refererUrl ? { Referer: refererUrl } : {};
  const res = await fetch(`${ENDPOINT}?${qs}`, {
    headers,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    console.warn(`  API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  return res.json();
}

async function lookupItemViaApi(itemUrl, shopCode) {
  const slug = itemSlug(itemUrl);
  const data = await apiGet(
    {
      shopCode,
      keyword: slug,
      hits: "5",
      imageFlag: "1",
    },
    process.env.RAKUTEN_REFERER_URL,
  );
  if (!data?.Items?.length) return null;

  for (const entry of data.Items) {
    const raw = entry.Item ?? {};
    const url = normalizeItemUrl(raw.itemUrl ?? "");
    if (url.includes(`/${slug}/`)) {
      return raw;
    }
  }
  return null;
}

function parseMetadataFromPage(html) {
  const ogTitle = html.match(
    /property="og:title"\s+content="([^"]+)"/i,
  )?.[1];
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  let title = (ogTitle ?? titleMatch?.[1] ?? "").trim();
  title = title.replace(/^【楽天市場】/, "").trim();
  title = title.replace(/\s*[|｜>＞].*$/, "").trim();

  let price = 0;
  const pricePatterns = [
    /itemprop="price"\s+content="(\d+)"/i,
    /"price"\s*:\s*(\d+)/i,
    /data-price="(\d+)"/i,
    /(\d{1,3}(?:,\d{3})*)\s*円(?:\s*\(税込\))?/,
  ];
  for (const pattern of pricePatterns) {
    const m = html.match(pattern);
    if (m) {
      price = Number(String(m[1]).replace(/,/g, ""));
      if (price > 0) break;
    }
  }

  return { name: title, price };
}

const SHOP_IMAGE_NOISE =
  /^(?:slider_|plasir|ecofeel|solideco|review|snk-bana|imgrc|outlet\d+|alt-ro|pt-900|yb-04|pr-860|ipn-|sst-ipn|if-gc|bb-w|des-90|dns-n|spl-9000|kgrs|kspm)/i;

export function slugImageTokens(slug) {
  const s = slug.toLowerCase();
  const tokens = new Set([s]);
  if (s.startsWith("szo-sh-")) tokens.add(s.replace(/^szo-sh-/, "sh-"));
  if (s.startsWith("szo-")) tokens.add(s.replace(/^szo-/, ""));
  if (/-2z$/i.test(s)) tokens.add(s.replace(/-2z$/i, ""));
  return [...tokens];
}

function urlMatchesTokens(url, tokens) {
  const file = (url.split("/").pop() ?? "").replace(/\?.*$/, "").toLowerCase();
  const name = file.replace(/\.(jpe?g|png|webp|gif)$/i, "");
  for (const token of tokens) {
    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`^${esc}(_\\d+)?$`, "i").test(name)) return true;
    if (new RegExp(`^${esc}_[a-z]$`, "i").test(name)) return true;
    if (new RegExp(`^${esc}-[a-z0-9]+$`, "i").test(name)) return true;
  }
  return false;
}

/** ページに商品スラッグの画像が無い場合（訳あり SKU 等）、ギャラリーで最多の商品コードを推定 */
function inferGalleryImageTokens(html, slug, baseTokens) {
  for (const raw of html.match(/cabinet\/[^\s"'<>\\]+\.(?:jpe?g|png|webp)/gi) ?? []) {
    if (urlMatchesTokens(raw, baseTokens)) return [];
  }

  const counts = new Map();
  const variants = new Set();
  for (const raw of html.match(/cabinet\/[^\s"'<>\\]+\.(?:jpe?g|png|webp)/gi) ?? []) {
    const file = raw.split("/").pop()?.replace(/\?.*$/, "") ?? "";
    const name = file.replace(/\.(jpe?g|png|webp|gif)$/i, "").toLowerCase();
    if (!name || SHOP_IMAGE_NOISE.test(name) || /-100$/i.test(name)) continue;

    const seriesKey = name.replace(/_\d+$/, "").replace(/_[a-z]$/i, "");
    counts.set(seriesKey, (counts.get(seriesKey) ?? 0) + 1);

    if (/-[a-z0-9]+$/i.test(name) && !/_\d+$/.test(name) && !/_[a-z]$/i.test(name)) {
      variants.add(name);
    }
  }

  let bestKey = "";
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count < 3) continue;
    if (baseTokens.some((t) => key === t || key.startsWith(`${t}-`))) continue;
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }
  if (!bestKey) return [];

  const inferred = new Set([bestKey]);
  for (const variant of variants) {
    if (variant.startsWith(`${bestKey}-`)) inferred.add(variant);
  }
  return [...inferred];
}

export function effectiveImageTokens(slug, html) {
  const base = slugImageTokens(slug);
  if (!html) return base;
  const inferred = inferGalleryImageTokens(html, slug, base);
  return [...new Set([...base, ...inferred])];
}

/** 商品スラッグと一致する画像ファイルのみ（店舗共通バナーを除外） */
export function urlMatchesProductSlug(url, slug, imageTokens) {
  const tokens = imageTokens ?? slugImageTokens(slug);
  return urlMatchesTokens(url, tokens);
}

function filterUrlsForProduct(urls, slug, imageTokens) {
  const strict = urls.filter((url) => urlMatchesProductSlug(url, slug, imageTokens));
  if (strict.length) return strict;
  const s = slug.toLowerCase();
  return urls.filter((url) => {
    const lower = url.toLowerCase();
    return lower.includes(s) && !lower.includes("spl-9000cb-4ps");
  });
}

function toFullsizeUrl(thumbnailUrl) {
  return thumbnailUrl.replace(/\?_ex=\d+x\d+$/, "");
}

function apiImageUrls(apiItem, slug, imageTokens) {
  const urls = [];
  for (const img of apiItem?.mediumImageUrls ?? []) {
    const url = img?.imageUrl;
    if (!url) continue;
    const full = toFullsizeUrl(url);
    if (
      urlMatchesProductSlug(full, slug, imageTokens) ||
      full.includes("/cabinet/item/")
    ) {
      urls.push(full);
    } else if (full.toLowerCase().includes(slug.toLowerCase())) {
      urls.push(full);
    }
  }
  return urls;
}

function isDetailImageUrl(url) {
  return /_(?:detail|desc|info|banner|logo|icon)/i.test(url);
}

function gallerySortKey(url) {
  const base = url.split("/").pop() ?? url;
  if (isDetailImageUrl(url)) return [2, 9999, url];
  const nums = [...base.matchAll(/\d+/g)].map((m) => Number(m[0]));
  return [0, nums.at(-1) ?? 0, url];
}

function extractPageGalleryUrls(html, shopCode, slug, imageTokens) {
  const esc = shopCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hosts = [
    `https://tshop\\.r10s\\.jp/${esc}/cabinet/[^\\s"'<>\\\\]+`,
    `https://shop\\.r10s\\.jp/${esc}/cabinet/[^\\s"'<>\\\\]+`,
    `https://image\\.rakuten\\.co\\.jp/${esc}/cabinet/[^\\s"'<>\\\\]+`,
    `https://thumbnail\\.image\\.rakuten\\.co\\.jp/@0_mall/${esc}/cabinet/[^\\s"'<>\\\\]+`,
  ];
  const pattern = new RegExp(hosts.join("|"), "gi");
  const thumbPattern = null;
  const found = [];
  const seen = new Set();
  for (const raw of html.match(pattern) ?? []) {
    let url = raw.replace(/\?.*$/, "");
    if (url.endsWith(".gif")) continue;
    if (url.includes("/contentpage/") || url.includes("/tenpo/")) continue;
    if (!urlMatchesProductSlug(url, slug, imageTokens)) continue;
    if (!seen.has(url)) {
      seen.add(url);
      found.push(url);
    }
  }
  found.sort((a, b) => {
    const ka = gallerySortKey(a);
    const kb = gallerySortKey(b);
    return ka[0] - kb[0] || ka[1] - kb[1] || String(ka[2]).localeCompare(String(kb[2]));
  });
  return found;
}

function collectImageSourceUrls(apiItem, pageUrls, maxImages, slug, imageTokens) {
  const urls = [...apiImageUrls(apiItem, slug, imageTokens)];
  const sortedPage = filterUrlsForProduct(pageUrls, slug, imageTokens).sort((a, b) => {
    const ka = gallerySortKey(a);
    const kb = gallerySortKey(b);
    return ka[0] - kb[0] || ka[1] - kb[1] || String(ka[2]).localeCompare(String(kb[2]));
  });
  for (const url of sortedPage) {
    if (!urls.includes(url)) urls.push(url);
  }
  return urls.slice(0, maxImages);
}

function guessExtension(url, contentType) {
  const path = new URL(url).pathname.toLowerCase();
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
    if (path.endsWith(ext)) return ext;
  }
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  return ".jpg";
}

async function downloadImage(url, savePathBase, force = false) {
  if (
    !force &&
    existsSync(savePathBase) &&
    statSync(savePathBase).size > 0
  ) {
    return savePathBase;
  }
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Referer: url },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ext = guessExtension(url, res.headers.get("content-type"));
  const hasExt = /\.(jpe?g|png|webp|gif)$/i.test(savePathBase);
  const savePath = hasExt ? savePathBase : `${savePathBase}${ext}`;
  mkdirSync(dirname(savePath), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(savePath, buf);
  return savePath;
}

function appendManifest(manifestPath, entry) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  let manifest = { generatedAt: new Date().toISOString(), products: [] };
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      /* reset */
    }
  }
  if (!Array.isArray(manifest.products)) manifest.products = [];
  const idx = manifest.products.findIndex((p) => p.id === entry.id);
  if (idx >= 0) {
    const prev = manifest.products[idx];
    manifest.products[idx] = {
      ...prev,
      ...entry,
      categorySlug: entry.categorySlug ?? prev.categorySlug,
      parentCategorySlug: entry.parentCategorySlug ?? prev.parentCategorySlug,
    };
  } else manifest.products.push(entry);
  manifest.generatedAt = new Date().toISOString();
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

export function loadRakutenEnv() {
  loadDotEnv(join(ROOT, ".env"));
  loadDotEnv(join(ROOT, ".env.local"), true);
}

export function defaultFetchOptions(overrides = {}) {
  return {
    maxImages: 8,
    outDir: join(ROOT, "public/images/products/rakuten-imports"),
    manifestPath: join(ROOT, "data/rakuten/imports.json"),
    imagesWebPath: "/images/products/rakuten-imports",
    syncCatalog: true,
    forceDownload: false,
    categorySlug: undefined,
    parentCategorySlug: undefined,
    ...overrides,
  };
}

/** @returns {Promise<object>} manifest entry */
export async function fetchRakutenItem(itemUrlRaw, options = {}) {
  const args = defaultFetchOptions(options);
  const itemUrl = normalizeItemUrl(itemUrlRaw);
  const shopCode = shopCodeFromItemUrl(itemUrl);
  const productId = itemSlug(itemUrl);

  console.log(`\n--- ${productId} ---`);
  console.log(`itemUrl: ${itemUrl}`);

  const html = await fetchHtml(itemUrl);
  const pageMeta = parseMetadataFromPage(html);
  const imageTokens = effectiveImageTokens(productId, html);
  if (imageTokens.length > slugImageTokens(productId).length) {
    console.log(`  画像トークン: ${imageTokens.join(", ")}`);
  }
  const pageUrls = extractPageGalleryUrls(html, shopCode, productId, imageTokens);

  let apiItem = null;
  if (process.env.RAKUTEN_APPLICATION_ID && process.env.RAKUTEN_ACCESS_KEY) {
    apiItem = await lookupItemViaApi(itemUrl, shopCode);
    if (apiItem) console.log("  API: OK");
    else console.warn("  API: ヒットなし（ページ HTML のみ）");
  }

  let name = apiItem?.itemName ?? pageMeta.name ?? productId;
  name = name.replace(/：[^：]+$/u, "").trim();
  const price = Number(apiItem?.itemPrice ?? pageMeta.price ?? 0);
  const sourceUrls = collectImageSourceUrls(
    apiItem,
    pageUrls,
    args.maxImages,
    productId,
    imageTokens,
  );

  if (!sourceUrls.length) {
    throw new Error(`画像 URL が見つかりません: ${itemUrl}`);
  }

  const imageDir = join(args.outDir, productId);
  mkdirSync(imageDir, { recursive: true });
  if (args.forceDownload && existsSync(imageDir)) {
    for (const f of readdirSync(imageDir)) {
      if (/^\d{2}\./.test(f)) rmSync(join(imageDir, f), { force: true });
    }
  }

  const savedImages = [];
  const savedSources = [];
  for (let i = 0; i < sourceUrls.length; i += 1) {
    const url = sourceUrls[i];
    const base = join(imageDir, `${String(i + 1).padStart(2, "0")}`);
    try {
      const saved = await downloadImage(url, base, args.forceDownload);
      const webPath = `${args.imagesWebPath}/${productId}/${saved.split("/").pop()}`;
      savedImages.push(webPath);
      savedSources.push(url);
      console.log(`  保存: ${webPath}`);
    } catch (err) {
      console.warn(`  画像${i + 1} 失敗: ${err.message}`);
    }
  }

  if (!savedImages.length) {
    throw new Error(`ダウンロード失敗: ${productId}`);
  }

  const entry = {
    id: productId,
    name,
    price,
    shopCode,
    itemUrl,
    itemCode: apiItem?.itemCode ?? `${shopCode}:${productId}`,
    images: savedImages,
    sourceUrls: savedSources,
    importedAt: new Date().toISOString(),
    categorySlug: args.categorySlug,
    parentCategorySlug: args.parentCategorySlug,
  };

  appendManifest(args.manifestPath, entry);

  if (args.syncCatalog) {
    const { syncRakutenCatalog } = await import("./rakuten-sync-catalog.mjs");
    syncRakutenCatalog(args.manifestPath);
  }

  console.log(`  完了: ${savedImages.length} 枚 / ¥${price || "?"}`);
  return entry;
}

async function main() {
  loadRakutenEnv();
  const args = parseArgs(process.argv);
  console.log("=== PLANTIA 楽天 1商品画像取得 ===");
  const entry = await fetchRakutenItem(args.itemUrl, {
    maxImages: args.maxImages,
    outDir: args.outDir,
    manifestPath: args.manifestPath,
    imagesWebPath: args.imagesWebPath,
    syncCatalog: true,
  });
  console.log("\n=== 完了 ===");
  console.log(`商品名 : ${entry.name}`);
  console.log(`価格   : ${entry.price || "(未取得)"}`);
  console.log(`画像   : ${entry.images.length} 枚`);
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
