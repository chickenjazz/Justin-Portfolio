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

const stripHidden = (html) => {
  const re = /<(\/?)(\w+)([^>]*)>/g;
  let out = "", last = 0, m, skip = null, depth = 0;
  while ((m = re.exec(html))) {
    if (skip === null) {
      out += html.slice(last, m.index);
      if (!m[1] && /aria-hidden="true"/.test(m[3]) && !/\/$/.test(m[3])) { skip = m[2]; depth = 1; }
      else out += m[0];
    } else if (m[2] === skip && !/\/$/.test(m[3])) {
      depth += m[1] ? -1 : 1;
      if (depth === 0) skip = null;
    }
    last = re.lastIndex;
  }
  return out;
};

test("skills: each category is announced exactly once outside aria-hidden subtrees", () => {
  const visible = text(stripHidden(section("skills")));
  for (const c of skills) assert.equal(visible.split(c.category).length - 1, 1, c.category);
});
