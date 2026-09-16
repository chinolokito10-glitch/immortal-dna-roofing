import { mkdir, copyFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderSite } from "./render-site.js";
import { metadata, robots, sitemap } from "./metadata.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await mkdir(path.join(root, "dist/assets"), { recursive: true });
const origin = process.env.PUBLIC_ORIGIN || "";
const html = renderSite();
await writeFile(path.join(root, "index.html"), html);
await writeFile(path.join(root, "dist/index.html"), metadata(html, origin));
for (const name of ["styles.css", "script.js", "site.config.js"])
  await copyFile(path.join(root, name), path.join(root, "dist", name));
for (const name of await readdir(path.join(root, "assets")))
  await copyFile(
    path.join(root, "assets", name),
    path.join(root, "dist/assets", name),
  );
await writeFile(path.join(root, "dist/robots.txt"), robots(origin));
if (origin)
  await writeFile(path.join(root, "dist/sitemap.xml"), sitemap(origin));
console.log(
  "Built evidence-first site in dist/. Configure verified content in site.config.js.",
);
