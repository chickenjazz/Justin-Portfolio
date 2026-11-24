import test from "node:test";
import assert from "node:assert/strict";
import { skills, skillIcons } from "../../src/content/site.js";
import { text, section, count, builtCss } from "./page.js";

test("skills: giant heading, icon row, six categories in a looping band", () => {
  const s = section("skills");
  assert.match(s, /<h2[^>]*class="skills-title"[^>]*>SKILLS<\/h2>/);
  assert.equal(count(s, 'class="skill-icon"'), skillIcons.length);
  for (const c of skills) assert.ok(text(s).includes(c.category));
  assert.match(s, /class="marquee-copy"[^>]*aria-hidden="true"[^>]*inert/);
});

test("marquee stops under reduced motion", () => {
  assert.match(builtCss(), /prefers-reduced-motion:\s*reduce\)[^{]*\{[^@]*\.marquee-track\{[^}]*animation:\s*none/);
});
