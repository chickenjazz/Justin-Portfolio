import { build } from "vite";
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
await build();
await build({
  build: { ssr: "src/render.jsx", outDir: ".prerender", emptyOutDir: true },
});
const { render } = await import(
  pathToFileURL(`${process.cwd()}/.prerender/render.js`)
);

// Production address for the canonical URL, share image and sitemap.
// Override with `SITE_URL=https://other-domain npm run build`.
const siteUrl = new URL(
  process.env.SITE_URL || "https://justin-manuzon.vercel.app/",
).href.replace(/\/?$/, "/");
const siteMeta = [
  `<link rel="canonical" href="${siteUrl}" />`,
  `<meta property="og:url" content="${siteUrl}" />`,
  `<meta property="og:image" content="${siteUrl}og-image.png" />`,
  `<meta name="twitter:image" content="${siteUrl}og-image.png" />`,
].join("\n    ");

const template = await readFile("dist/index.html", "utf8");
await writeFile(
  "dist/index.html",
  template
    .replace("<!--app-html-->", () => render())
    .replace("<!--site-meta-->", () => siteMeta),
);
console.log("Prerendered portfolio content into dist/index.html.");

const today = new Date().toISOString().slice(0, 10);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}</loc><lastmod>${today}</lastmod></url>
</urlset>
`,
);
await appendFile("dist/robots.txt", `\nSitemap: ${siteUrl}sitemap.xml\n`);
console.log(`Added canonical URL, share image and sitemap for ${siteUrl}`);
