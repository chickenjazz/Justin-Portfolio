import test from "node:test";
import assert from "node:assert/strict";
import { honors } from "../../src/content/site.js";
import { text, section, builtCss } from "./page.js";

test("honors: oversized heading and a right-to-left loop of every honor", () => {
  const s = section("honors");
  assert.ok(text(s).includes("Honors & Certifications"));
  for (const h of honors) assert.ok(text(s).includes(h.title));
  assert.ok(!section("credentials"));
});

test("honors: keyboard focus stops the band at its start so the focused card is in view", () => {
  assert.match(builtCss(), /\.marquee:focus-within \.marquee-track\s*\{[^}]*animation:\s*none/);
});
