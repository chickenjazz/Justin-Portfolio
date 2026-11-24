import test from "node:test";
import assert from "node:assert/strict";
import { stats } from "../../src/content/site.js";
import { html, text, section, count } from "./page.js";

test("stats section shows four cards with prerendered numbers and titles", () => {
  const s = section("stats");
  assert.equal(count(s, 'class="stat-card'), 4);
  for (const st of stats) {
    assert.ok(text(s).includes(st.title));
    assert.ok(text(s).includes(String(st.value)));
  }
});

test("stats follow the hero directly", () => {
  assert.ok(html.indexOf('id="top"') < html.indexOf('id="stats"'));
  assert.ok(html.indexOf('id="stats"') < html.indexOf('id="about"') || !html.includes('id="about"'));
});
