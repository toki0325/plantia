import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let parts = [process.platform, process.arch];
if (process.platform === "linux") {
  const { MUSL, familySync } = require("detect-libc");
  const family = familySync();
  if (family === MUSL) {
    parts.push("musl");
  } else if (process.arch === "arm") {
    parts.push("gnueabihf");
  } else {
    parts.push("gnu");
  }
} else if (process.platform === "win32") {
  parts.push("msvc");
} else if (process.platform === "darwin") {
  // darwin uses platform-arch only
} else {
  process.exit(0);
}

const platformPkg = `lightningcss-${parts.join("-")}`;
const nodeFileName = `lightningcss.${parts.join("-")}.node`;
const src = join(root, "node_modules", platformPkg, nodeFileName);
const dest = join(root, "node_modules", "lightningcss", nodeFileName);

if (!existsSync(src)) {
  console.warn(
    `[ensure-lightningcss-native] Skip: ${platformPkg} not installed (${nodeFileName}).`,
  );
  process.exit(0);
}

copyFileSync(src, dest);
