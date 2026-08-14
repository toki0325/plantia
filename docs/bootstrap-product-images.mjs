/**
 * 旧 main_0X_v1 画像を商品IDパスへコピー（固有画像生成までのブートストrap）
 */
import { copyFile, mkdir, access } from "fs/promises";
import path from "path";

const PUBLIC = path.resolve(process.cwd(), "public");

const { getAllProducts } = await import("../lib/data/products.ts");

function legacyImageIndex(id) {
  if (id === "storage-bench-02") return 2;
  const num = Number(id.match(/-(\d+)$/)?.[1] ?? 1);
  return ((num - 1) % 3) + 1;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

let copied = 0;
for (const product of getAllProducts()) {
  const idx = legacyImageIndex(product.id);
  const src = path.join(
    PUBLIC,
    "images/products",
    product.categorySlug,
    `main_0${idx}_v1.jpg`,
  );
  const dest = path.join(
    PUBLIC,
    "images/products",
    product.categorySlug,
    `${product.id}_v1.jpg`,
  );
  if (!(await exists(src))) {
    console.warn(`SKIP missing source: ${src}`);
    continue;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
  copied++;
}

console.log(`Copied ${copied} product images to id-based paths.`);
