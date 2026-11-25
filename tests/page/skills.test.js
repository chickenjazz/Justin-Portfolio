import test from "node:test";
import assert from "node:assert/strict";
import { skills, skillIcons } from "../../src/content/site.js";
import { text, section, count, builtCss } from "./page.js";

test("skills: giant heading, icon row with tooltips, categories on a decorative tile wall", () => {
  const s = section("skills");
  assert.match(s, /<h2[^>]*class="skills-title"[^>]*>SKILLS<\/h2>/);
  assert.equal(count(s, 'class="skill-icon"'), skillIcons.length);
  assert.equal(count(s, 'role="tooltip"'), skillIcons.length);
  for (const { blurb } of skillIcons) assert.ok(blurb && text(s).includes(blurb.slice(0, 20)));
  for (const c of skills) assert.ok(text(s).includes(c.category));
  assert.match(s, /class="tilted-tiles[^"]*"[^>]*aria-hidden="true"/);
  assert.equal(count(s, 'class="tilted-tiles-row'), 3);
  // Not inert (that would block hover-to-pause), so the wall must hold nothing focusable.
  const wall = s.slice(s.indexOf('class="tilted-tiles'));
  assert.doesNotMatch(wall.slice(0, wall.indexOf('class="visually-hidden"')), /<(a|button|input)|tabindex=/i);
});

test("tilted tile rows stop under reduced motion", () => {
  assert.match(builtCss(), /prefers-reduced-motion:\s*reduce\)[^{]*\{[^@]*\.tilted-tiles-row\{[^}]*animation:\s*none/);
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
