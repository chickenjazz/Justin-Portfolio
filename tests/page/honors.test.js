import test from "node:test";
import assert from "node:assert/strict";
import { honors } from "../../src/content/site.js";
import { text, section } from "./page.js";

test("honors: oversized heading and a right-to-left loop of every honor", () => {
  const s = section("honors");
  assert.ok(text(s).includes("Honors & Certifications"));
  for (const h of honors) assert.ok(text(s).includes(h.title));
  assert.ok(!section("credentials"));
});
