/**
 * 商品IDごとのソース画像を public/images/products/{folder}/{id}_v1.jpg に出力
 */
import sharp from "sharp";
import { mkdir, readdir } from "fs/promises";
import path from "path";

const ASSETS = path.resolve(
  "C:/Users/riku-/.cursor/projects/c-Users-riku-projects-novagrace/assets",
);
const PUBLIC = path.resolve(process.cwd(), "public");

const FOLDER_MAP = {
  "artificial-grass": "artificial-grass",
  "joint-tile": "joint-tile",
  stones: "stones",
  "storage-bench": "storage-bench",
  "garden-furniture": "garden-furniture",
  fence: "fence",
  "garden-light": "garden-light",
  "flower-bed": "flower-bed",
  planter: "planter",
  soil: "soil",
  "gardening-misc": "gardening-misc",
  herbicide: "herbicide",
  "weed-sheet": "weed-sheet",
  "weed-sand": "weed-sand",
};

async function processOne(id, folder) {
  const src = path.join(ASSETS, `${id}_v1_source.png`);
  const out = path.join(PUBLIC, "images/products", folder, `${id}_v1.jpg`);
  await mkdir(path.dirname(out), { recursive: true });

  const meta = await sharp(src).metadata();
  const srcW = meta.width ?? 1024;
  const srcH = meta.height ?? 1024;
  const outW = Math.min(1024, srcW);
  const outH = Math.min(1024, srcH);

  await sharp(src)
    .resize(outW, outH, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);

  console.log(`OK ${folder}/${id}_v1.jpg (${outW}x${outH})`);
}

async function main() {
  const files = await readdir(ASSETS);
  const sources = files.filter((f) => f.endsWith("_v1_source.png") && f.includes("-"));
  let ok = 0;
  let skip = 0;

  for (const file of sources) {
    const id = file.replace("_v1_source.png", "");
    const folder = id.replace(/-\d+$/, "");
    if (!FOLDER_MAP[folder]) {
      skip++;
      continue;
    }
    try {
      await processOne(id, folder);
      ok++;
    } catch (err) {
      console.error(`FAIL ${id}: ${err.message}`);
    }
  }

  console.log(`\n完了: ${ok}件処理, ${skip}件スキップ`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
