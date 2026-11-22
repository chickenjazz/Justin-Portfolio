import { build } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
await build();
await build({
  build: { ssr: "src/render.jsx", outDir: ".prerender", emptyOutDir: true },
});
const { render } = await import(
  pathToFileURL(`${process.cwd()}/.prerender/render.js`)
);
const template = await readFile("dist/index.html", "utf8");
await writeFile(
  "dist/index.html",
  template.replace("<!--app-html-->", () => render()),
);
console.log("Prerendered portfolio content into dist/index.html.");
