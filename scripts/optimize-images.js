import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
// Run once with three source paths: hero, roof detail, full house.
const [hero, detail, project] = process.argv.slice(2);
if (!hero || !detail || !project)
  throw new Error("Usage: node scripts/optimize-images.js HERO DETAIL PROJECT");
await mkdir("assets", { recursive: true });
for (const [name, source, sizes] of [
  ["hero", hero, [640, 960, 1440]],
  ["detail", detail, [640, 960]],
  ["project", project, [640, 960, 1600]],
]) {
  for (const width of sizes) {
    const target = path.join("assets", `${name}-${width}.webp`);
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 83, effort: 6 })
      .toFile(target);
    console.log(target);
  }
}
