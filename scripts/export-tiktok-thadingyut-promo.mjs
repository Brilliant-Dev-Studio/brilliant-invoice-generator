import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "exports", "thadingyut-tiktok-png");
const template = path.join(
  root,
  "scripts",
  "tiktok-thadingyut-promo-template.html",
);

const slides = [
  { id: "slide-1", file: "01-thadingyut-promo-10pct-1080x1920.png" },
  { id: "slide-2", file: "02-plans-promo-price-1080x1920.png" },
  { id: "slide-3", file: "03-what-is-san-pya-1080x1920.png" },
  { id: "slide-4", file: "04-features-1080x1920.png" },
  { id: "slide-5", file: "05-cta-get-started-1080x1920.png" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.setViewportSize({ width: 1080, height: 1920 });
await page.goto(`file://${template}`);

for (const { id, file } of slides) {
  await page.evaluate((activeId) => {
    for (const el of document.querySelectorAll(".slide")) {
      el.classList.remove("active");
      el.style.display = "none";
    }
    const slide = document.getElementById(activeId);
    if (slide) {
      slide.classList.add("active");
      slide.style.display = "flex";
    }
  }, id);
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(outDir, file),
    type: "png",
  });
  console.log("  " + file);
}

await browser.close();
console.log("\n5 TikTok PNGs (1080×1920):\n  " + outDir);
