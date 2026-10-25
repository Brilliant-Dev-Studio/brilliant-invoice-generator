import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "icons");
const logo = path.join(root, "public", "san-pya-logo.svg");

await mkdir(out, { recursive: true });

async function icon(size, name, padding = 0.14) {
  const inner = Math.round(size * (1 - padding * 2));
  const inset = Math.round((size - inner) / 2);
  const mark = await sharp(logo, { density: 400 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 247, b: 231, alpha: 1 },
    },
  })
    .composite([{ input: mark, top: inset, left: inset }])
    .png()
    .toFile(path.join(out, name));
}

await icon(192, "icon-192.png");
await icon(512, "icon-512.png");
await icon(512, "maskable-512.png", 0.22);
await icon(180, "apple-touch-icon.png");

console.log("PWA icons written to public/icons/");
