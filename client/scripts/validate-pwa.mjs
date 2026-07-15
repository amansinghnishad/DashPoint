import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve("dist");
const fail = (message) => {
  console.error(`PWA validation failed: ${message}`);
  process.exitCode = 1;
};

for (const file of ["index.html", "manifest.webmanifest", "sw.js"]) {
  if (!existsSync(resolve(dist, file))) fail(`missing dist/${file}`);
}

const manifestPath = resolve(dist, "manifest.webmanifest");
if (!existsSync(manifestPath)) process.exit(1);
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail(`manifest.webmanifest is not valid JSON: ${error.message}`);
  process.exit(1);
}

if (manifest.id !== "/" || manifest.lang !== "en" || manifest.dir !== "ltr") {
  fail("manifest is missing id, lang, or dir");
}
if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) fail("manifest has too few icons");
for (const icon of manifest.icons || []) {
  const iconPath = resolve(dist, icon.src.replace(/^\//, ""));
  if (!existsSync(iconPath)) fail(`manifest icon does not exist: ${icon.src}`);
  if (!/^\d+x\d+$/.test(icon.sizes)) fail(`invalid icon size: ${icon.sizes}`);
  const [width, height] = icon.sizes.split("x").map(Number);
  const svg = readFileSync(iconPath, "utf8");
  if (!svg.includes(`width="${width}"`) || !svg.includes(`height="${height}"`)) {
    fail(`${icon.src} is not a ${width}x${height} square asset`);
  }
  if (!icon.purpose?.includes("maskable")) fail(`${icon.src} is not maskable`);
}

const sw = existsSync(resolve(dist, "sw.js")) ? readFileSync(resolve(dist, "sw.js"), "utf8") : "";
if (!sw.includes("workbox")) fail("service worker does not contain Workbox runtime");
if (/api-cache|NetworkFirst.*api/i.test(sw)) fail("service worker appears to cache API responses");

if (!process.exitCode) console.log("PWA validation passed");
