import test from "node:test";
import assert from "node:assert/strict";
import { aboutStory, stats, skills, skillIcons, honors, description } from "../../src/content/site.js";
import { icons } from "../../src/content/icons.js";

test("about story is the exact supplied copy", () => {
  assert.equal(aboutStory, "I’m fascinated by the little problems people learn to live with. The repetitive tasks, the unnecessary complexity, the things that could simply work better. I enjoy finding ways to make those things easier through thoughtful solutions.");
});
test("four stats with numeric values and one- or two-word titles", () => {
  assert.equal(stats.length, 4);
  for (const s of stats) { assert.equal(typeof s.value, "number"); assert.ok(s.title.split(/\s+/).length <= 2, s.title); }
});
test("skills use the six resume categories, no item listed twice", () => {
  assert.deepEqual(skills.map(s => s.category), ["Programming Languages", "Frontend Development", "Backend Development", "AI & Machine Learning", "Frameworks & Libraries", "Tools & Platforms"]);
  const all = skills.flatMap(s => s.items); assert.equal(new Set(all).size, all.length);
});
test("every skill icon exists in icons.js", () => { for (const s of skillIcons) assert.ok(icons[s.icon], s.name); });
test("honors cover both certifications and both distinctions", () => {
  assert.equal(honors.filter(h => h.kind === "Certification").length, 2);
  assert.equal(honors.filter(h => h.kind === "Honor").length, 2);
});
test("description copy is one or two sentences", () => { assert.ok((description.copy.match(/[.!?](\s|$)/g) ?? []).length <= 2); });
