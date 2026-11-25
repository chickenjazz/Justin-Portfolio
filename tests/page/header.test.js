import { test } from "node:test";
import assert from "node:assert/strict";
import { navSections } from "../../src/content/site.js";
import { html, builtCss } from "./page.js";

const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
const dots = html.match(/<nav[^>]*class="section-dots[\s\S]*?<\/nav>/)?.[0] ?? "";

test("header links every header section, the résumé and the brand", () => {
  for (const s of navSections.filter((s) => s.inHeader)) assert.ok(header.includes(`href="#${s.id}"`), s.id);
  assert.match(header, /href="#top"/);
  assert.match(header, /resume\.pdf/);
});

test("section dots link every rail section, each with an accessible name", () => {
  for (const s of navSections.filter((s) => s.inRail)) {
    assert.match(dots, new RegExp(`href="#${s.id}"[^>]*aria-label="${s.label}"|aria-label="${s.label}"[^>]*href="#${s.id}"`), s.id);
  }
  assert.match(dots, /aria-label="Section navigation"/);
});

test("header motion stays on transform, opacity and clip-path", () => {
  const css = builtCss();
  assert.match(css, /\.header\.is-hidden\{transform:translate\(-50%,-130%\)\}/);
  assert.doesNotMatch(css, /\.header[^{]*\{[^}]*transition:all/);
});
