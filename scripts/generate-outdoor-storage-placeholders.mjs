import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const dir = path.resolve("public/images/products/outdoor-storage");
const palette = ["#2F4B3C", "#C6A45C", "#E4DFD3", "#3E5F4C"];
const labels = ["01 物置", "02 収納庫", "03 ストッカー", "04 シェッド"];

await mkdir(dir, { recursive: true });

for (let i = 0; i < 4; i++) {
  const n = String(i + 1).padStart(2, "0");
  const fill = i === 2 ? "#333333" : "#ffffff";
  const svg = `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${palette[i]}"/>
    <rect x="20" y="20" width="960" height="960" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.35"/>
    <text x="50%" y="48%" text-anchor="middle" font-family="sans-serif" font-size="42" fill="${fill}">outdoor-storage</text>
    <text x="50%" y="56%" text-anchor="middle" font-family="sans-serif" font-size="36" fill="${fill}">${labels[i]}</text>
    <text x="50%" y="960" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${fill}" opacity="0.7">1000x1000</text>
  </svg>`;
  const out = path.join(dir, `${n}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(out);
  console.log(`generated ${out}`);
}
