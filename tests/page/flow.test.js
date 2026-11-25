import test from "node:test";
import assert from "node:assert/strict";
import { navSections, cta } from "../../src/content/site.js";
import { html, text, section } from "./page.js";

test("sections appear in the specified order", () => {
  const ids = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "stats", "about", "work", "skills", "honors", "milestones", "contact"]);
});

test("every footer section link resolves to an id on the page", () => {
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  for (const { id } of navSections) {
    assert.ok(footer.includes(`href="#${id}"`), id);
    assert.ok(html.includes(`id="${id}"`), id);
  }
});

test("CTA shows the mascot, word bands and résumé link", () => {
  const s = section("contact");
  assert.ok(text(s).includes(cta.bands[0]));
  assert.match(s, /href="[^"]*resume\.pdf"/);
  assert.match(s, /mascot\/chick\.webp/);
});

test("milestones is a placeholder", () => {
  assert.ok(text(section("milestones")).length > 0);
});

test("outline: one h1, the Description is exposed, and closing sections carry headings", () => {
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  const panel = html.match(/<div class="scene-panel scene-panel-1"[^>]*>/)[0];
  assert.ok(!/aria-hidden|inert/.test(panel), panel);
  assert.match(section("about"), /<h2[^>]*id="about-label"/);
  assert.match(section("contact"), /aria-labelledby="contact-title"[\s\S]*<h2[^>]*id="contact-title"/);
  assert.match(html.match(/<footer[\s\S]*?<\/footer>/)[0], /<h2[^>]*>Site footer<\/h2>/);
});
