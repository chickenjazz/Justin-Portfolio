import test from "node:test";
import { readdirSync, readFileSync } from "node:fs";
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

test("built CSS carries no legacy stats selectors", () => {
  const css = readdirSync("dist/assets")
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(`dist/assets/${f}`, "utf8"))
    .join("\n");
  assert.ok(!css.includes(".stats-grid"));
  assert.ok(!css.includes(".stat-num"));
});
