import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "exports", "tiktok");
const template = path.join(root, "scripts", "tiktok-brand-template.html");
const logoSvg = path.join(root, "public", "san-pya-logo.svg");
const logoPng = path.join(root, "public", "san-pya-logo.png");
const cream = { r: 255, g: 247, b: 231 };

await mkdir(outDir, { recursive: true });

/** TikTok profile: logo centered on solid black (circle crop keeps black behind icon). */
async function exportCircleProfile(size, logoRatio, name) {
  const logoSize = Math.round(size * logoRatio);
  const inset = Math.round((size - logoSize) / 2);
  const logo = await sharp(logoSvg, { density: 400 })
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();
  const out = path.join(outDir, name);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([{ input: logo, top: inset, left: inset }])
    .png()
    .toFile(out);
  return out;
}

await exportCircleProfile(
  1080,
  0.64,
  "san-pya-tiktok-profile-circle-1080.png",
);
await exportCircleProfile(720, 0.64, "san-pya-tiktok-profile-circle-720.png");

const icon1080 = path.join(outDir, "san-pya-icon-1080-transparent.png");
const icon1024 = path.join(outDir, "san-pya-icon-1024.png");
const square1080 = path.join(outDir, "san-pya-square-1080.png");
const vertical = path.join(outDir, "san-pya-tiktok-vertical-1080x1920.png");

await sharp(logoSvg, { density: 300 })
  .resize(900, 900)
  .png()
  .toFile(icon1080);

await sharp(logoSvg, { density: 300 })
  .resize(880, 880)
  .extend({
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
    background: cream,
  })
  .png()
  .toFile(icon1024);

await sharp(logoPng)
  .resize(720, 720, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: 180,
    bottom: 180,
    left: 180,
    right: 180,
    background: cream,
  })
  .png()
  .toFile(path.join(outDir, "san-pya-logo-on-cream-1080.png"));

const skipPosters = process.env.SKIP_TIKTOK_POSTERS === "1";
if (skipPosters) {
  console.log("TikTok circle profile exports written to:", outDir);
  console.log(
    "  san-pya-tiktok-profile-circle-1080.png\n  san-pya-tiktok-profile-circle-720.png",
  );
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

await page.setViewportSize({ width: 1080, height: 1920 });
await page.goto(`file://${template}`);
await page.locator("#vertical").evaluate((el) => {
  el.style.display = "flex";
});
await page.locator("#square").evaluate((el) => {
  el.style.display = "none";
});
await page.screenshot({ path: vertical, type: "png" });

await page.setViewportSize({ width: 1080, height: 1080 });
await page.locator("#vertical").evaluate((el) => {
  el.style.display = "none";
});
await page.locator("#square").evaluate((el) => {
  el.style.display = "flex";
});
await page.screenshot({ path: square1080, type: "png" });

await browser.close();

console.log("TikTok brand exports written to:", outDir);
console.log(
  [
    "san-pya-tiktok-profile-circle-1080.png",
    "san-pya-tiktok-profile-circle-720.png",
    path.basename(icon1080),
    path.basename(icon1024),
    "san-pya-logo-on-cream-1080.png",
    path.basename(square1080),
    path.basename(vertical),
  ].join("\n  "),
);
