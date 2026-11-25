import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { honors } from "../../src/content/site.js";
import { text, section, builtCss, count } from "./page.js";

test("honors: centred heading and a prism carousel slide for every honor", () => {
  const s = section("honors");
  assert.ok(text(s).includes("Honors & Certifications"));
  for (const h of honors) assert.ok(text(s).includes(h.title), h.title);
  assert.equal(count(s, 'class="prism-slide'), honors.length);
  assert.equal(count(s, "prism-slide is-active"), 1);
  assert.ok(s.includes('aria-label="Previous honor"') && s.includes('aria-label="Next honor"'));
  assert.ok(!section("credentials"));
});

test("honors: every slide image is published", () => {
  for (const h of honors) assert.ok(existsSync(new URL(`../../public/honors/${h.image}`, import.meta.url)), h.image);
});

test("honors: reduced motion drops the colour sweep", () => {
  assert.match(builtCss(), /prefers-reduced-motion:\s*reduce\)[^{]*\{[^@]*\.prism-slide\.is-active \.prism-color[^{]*\{animation:none/);
});
