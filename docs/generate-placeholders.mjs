/**
 * generate-placeholders.mjs (PLANTIA ガーデニングEC用)
 *
 * DESIGN.txtの画像配置リストに基づき、本番と同じファイルパス・ファイル名・
 * アスペクト比のダミー画像を一括生成する。
 *
 * 使い方:
 *   1. Next.js プロジェクトのルートで実行する
 *   2. 依存パッケージをインストール: npm install --save-dev sharp
 *   3. 実行: node generate-placeholders.mjs
 *
 * 後で本番画像に差し替える際は、同じファイル名・パスに実画像を上書きするだけでOK。
 * （アスペクト比を本番画像でも合わせることで、レイアウト崩れを防げる）
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

// 出力先のベースディレクトリ（Next.js の public フォルダ）
const OUTPUT_BASE = path.resolve(process.cwd(), "public");

// カラーパレット（DESIGN.txt のカラーをローテーションして使用）
const PALETTE = ["#2F4B3C", "#C6A45C", "#F5F1E8", "#E4DFD3", "#3E5F4C"];

/**
 * 画像定義リスト（DESIGN.txt「画像配置リスト」に対応）
 */
const IMAGES = [
  // ロゴ類
  { file: "images/logo.png", w: 240, h: 60, label: "logo.png" },
  { file: "images/icon_v1.png", w: 64, h: 64, label: "icon_v1.png" },

  // ヒーロービジュアル（21:9）
  { file: "images/hero/hero_main_v1.jpg", w: 1536, h: 658, label: "hero_main_v1\n1536x658 (21:9)" },

  // カテゴリ画像（4:3）
  { file: "images/categories/grass_tile_stone_v1.jpg", w: 1200, h: 900, label: "人工芝・タイル・砂利\n1200x900 (4:3)" },
  { file: "images/categories/furniture_v1.jpg", w: 1200, h: 900, label: "ガーデンファニチャー\n1200x900 (4:3)" },
  { file: "images/categories/gardening_v1.jpg", w: 1200, h: 900, label: "園芸用品\n1200x900 (4:3)" },
  { file: "images/categories/weeding_v1.jpg", w: 1200, h: 900, label: "雑草対策用品\n1200x900 (4:3)" },

  // 商品画像（4:3、各カテゴリ3枚ずつ生成）
  ...buildProductImages("artificial-grass", "人工芝"),
  ...buildProductImages("joint-tile", "ジョイントタイル"),
  ...buildProductImages("stones", "敷石・砂利"),
  ...buildProductImages("storage-bench", "収納ベンチ"),
  ...buildProductImages("garden-furniture", "ガーデンファニチャー"),
  ...buildProductImages("fence", "フェンス"),
  ...buildProductImages("garden-light", "ガーデンライト"),
  ...buildProductImages("flower-bed", "花壇材"),
  ...buildProductImages("planter", "プランター"),
  ...buildProductImages("soil", "培養土"),
  ...buildProductImages("gardening-misc", "その他園芸用品"),
  ...buildProductImages("herbicide", "除草剤"),
  ...buildProductImages("weed-sheet", "防草シート"),
  ...buildProductImages("weed-sand", "防草砂"),

  // 特集記事サムネイル（16:9）
  { file: "images/features/feature_01_v1.jpg", w: 1200, h: 675, label: "特集記事1\n1200x675 (16:9)" },
  { file: "images/features/feature_02_v1.jpg", w: 1200, h: 675, label: "特集記事2\n1200x675 (16:9)" },
  { file: "images/features/feature_03_v1.jpg", w: 1200, h: 675, label: "特集記事3\n1200x675 (16:9)" },
  { file: "images/features/feature_04_v1.jpg", w: 1200, h: 675, label: "特集記事4\n1200x675 (16:9)" },
  { file: "images/features/feature_05_v1.jpg", w: 1200, h: 675, label: "特集記事5\n1200x675 (16:9)" },

  { file: "images/features/feature_06_v1.jpg", w: 1200, h: 675, label: "特集記事6\n1200x675 (16:9)" },
  { file: "images/features/feature_07_v1.jpg", w: 1200, h: 675, label: "特集記事7\n1200x675 (16:9)" },
  { file: "images/features/feature_08_v1.jpg", w: 1200, h: 675, label: "特集記事8\n1200x675 (16:9)" },
  { file: "images/features/feature_09_v1.jpg", w: 1200, h: 675, label: "特集記事9\n1200x675 (16:9)" },
  { file: "images/features/feature_10_v1.jpg", w: 1200, h: 675, label: "特集記事10\n1200x675 (16:9)" },

  // カート空表示・会社概要等の共通画像
  { file: "images/common/empty-cart_v1.jpg", w: 800, h: 800, label: "empty-cart_v1\n800x800" },
  { file: "images/common/about_v1.jpg", w: 1200, h: 900, label: "about_v1\n1200x900 (4:3)" },
];

function buildProductImages(slug, jpLabel) {
  const items = [];
  for (let i = 1; i <= 3; i++) {
    items.push({
      file: `images/products/${slug}/main_0${i}_v1.jpg`,
      w: 1024,
      h: 1024,
      label: `${jpLabel}\nmain_0${i}_v1\n1024x1024`,
    });
  }
  return items;
}

function buildSvg(width, height, bgColor, label) {
  const lines = label.split("\n");
  const fontSize = Math.max(14, Math.round(Math.min(width, height) / 14));
  const lineHeight = fontSize * 1.3;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  const textNodes = lines
    .map((line, i) => {
      const y = startY + i * lineHeight;
      return `<text x="50%" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="#333333">${escapeXml(
        line
      )}</text>`;
    })
    .join("\n");

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#d1d5db" stroke-width="2" />
  <text x="50%" y="${height - 16}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">${width}×${height} placeholder</text>
  ${textNodes}
</svg>`;
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function generateOne(image, index) {
  const outPath = path.join(OUTPUT_BASE, image.file);
  await mkdir(path.dirname(outPath), { recursive: true });

  const bgColor = PALETTE[index % PALETTE.length];
  const svg = buildSvg(image.w, image.h, bgColor, image.label);
  const buffer = Buffer.from(svg);

  const pipeline = sharp(buffer);
  if (outPath.endsWith(".png")) {
    await pipeline.png().toFile(outPath);
  } else {
    await pipeline.jpeg({ quality: 85 }).toFile(outPath);
  }
  console.log(`generated: ${path.relative(process.cwd(), outPath)} (${image.w}x${image.h})`);
}

async function main() {
  console.log(`出力先: ${OUTPUT_BASE}`);
  for (let i = 0; i < IMAGES.length; i++) {
    await generateOne(IMAGES[i], i);
  }
  console.log(`\n完了: ${IMAGES.length}件のプレースホルダー画像を生成しました。`);
  console.log("本番画像が用意でき次第、同じファイル名・パスに上書きしてください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
