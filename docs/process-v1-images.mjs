/**
 * AI生成ソース画像をレイアウト用サイズにクロップ・JPEG出力（アップスケールなし）
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const ASSETS = path.resolve(
  "C:/Users/riku-/.cursor/projects/c-Users-riku-projects-novagrace/assets",
);
const PUBLIC = path.resolve(process.cwd(), "public");

const CATEGORY_JOBS = [
  {
    src: "grass_tile_stone_v1_source.png",
    out: "images/categories/grass_tile_stone_v1.jpg",
    w: 1200,
    h: 900,
  },
  {
    src: "furniture_v1_source.png",
    out: "images/categories/furniture_v1.jpg",
    w: 1200,
    h: 900,
  },
  {
    src: "gardening_v1_source.png",
    out: "images/categories/gardening_v1.jpg",
    w: 1200,
    h: 900,
  },
  {
    src: "weeding_v1_source.png",
    out: "images/categories/weeding_v1.jpg",
    w: 1200,
    h: 900,
  },
];

const PRODUCT_FOLDERS = [
  ["artificial-grass", "artificial_grass"],
  ["joint-tile", "joint_tile"],
  ["stones", "stones"],
  ["storage-bench", "storage_bench"],
  ["garden-furniture", "garden_furniture"],
  ["fence", "fence"],
  ["garden-light", "garden_light"],
  ["flower-bed", "flower_bed"],
  ["planter", "planter"],
  ["soil", "soil"],
  ["gardening-misc", "gardening_misc"],
  ["herbicide", "herbicide"],
  ["weed-sheet", "weed_sheet"],
  ["weed-sand", "weed_sand"],
];

const PRODUCT_JOBS = PRODUCT_FOLDERS.flatMap(([folder, prefix]) =>
  [1, 2, 3].map((n) => ({
    src: `${prefix}_main_0${n}_v1_source.png`,
    out: `images/products/${folder}/main_0${n}_v1.jpg`,
    w: 1024,
    h: 1024,
  })),
);

const FEATURE_JOBS = [
  {
    src: "feature_01_v1_source.png",
    out: "images/features/feature_01_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_02_v1_source.png",
    out: "images/features/feature_02_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_03_v1_source.png",
    out: "images/features/feature_03_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_04_v1_source.png",
    out: "images/features/feature_04_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_05_v1_source.png",
    out: "images/features/feature_05_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_06_v1_source.png",
    out: "images/features/feature_06_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_07_v1_source.png",
    out: "images/features/feature_07_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_08_v1_source.png",
    out: "images/features/feature_08_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_09_v1_source.png",
    out: "images/features/feature_09_v1.jpg",
    w: 1200,
    h: 675,
  },
  {
    src: "feature_10_v1_source.png",
    out: "images/features/feature_10_v1.jpg",
    w: 1200,
    h: 675,
  },
];

const COMMON_JOBS = [
  {
    src: "about_v1_source.png",
    out: "images/common/about_v1.jpg",
    w: 1200,
    h: 900,
  },
  {
    src: "empty_cart_v1_source.png",
    out: "images/common/empty-cart_v1.jpg",
    w: 800,
    h: 800,
  },
];

const ICON_JOBS = [
  {
    src: "icon_v1_source.png",
    out: "images/icon_v1.png",
    w: 64,
    h: 64,
    format: "png",
  },
  {
    src: "icon_v1_source.png",
    out: "../app/icon.png",
    w: 32,
    h: 32,
    format: "png",
  },
  {
    src: "icon_v1_source.png",
    out: "../app/apple-icon.png",
    w: 180,
    h: 180,
    format: "png",
  },
];

async function processOne({ src, out, w, h, format = "jpeg" }) {
  const inPath = path.join(ASSETS, src);
  const outPath = path.join(PUBLIC, out);
  await mkdir(path.dirname(outPath), { recursive: true });

  const meta = await sharp(inPath).metadata();
  const srcW = meta.width ?? w;
  const srcH = meta.height ?? h;
  const outW = Math.min(w, srcW);
  const outH = Math.min(h, srcH);

  let pipeline = sharp(inPath).resize(outW, outH, {
    fit: "cover",
    position: "centre",
    withoutEnlargement: true,
  });

  if (format === "png") {
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  } else {
    await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(outPath);
  }

  console.log(`OK ${out} (${outW}x${outH}) from ${srcW}x${srcH}`);
}

async function main() {
  for (const job of [
    ...CATEGORY_JOBS,
    ...PRODUCT_JOBS,
    ...FEATURE_JOBS,
    ...COMMON_JOBS,
    ...ICON_JOBS,
  ]) {
    await processOne(job);
  }
  const total =
    CATEGORY_JOBS.length +
    PRODUCT_JOBS.length +
    FEATURE_JOBS.length +
    COMMON_JOBS.length +
    ICON_JOBS.length;
  console.log(`\n完了: ${total}件`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
