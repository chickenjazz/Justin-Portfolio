import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { html, text, section, count, builtCss } from "./page.js";

test("prerendered page never ships the motion-ready gate", () => {
  assert.ok(!/<html[^>]*motion-ready/.test(html));
});

test("hidden reveal state is scoped under .motion-ready", () => {
  const css = builtCss();
  const hidden = css.match(/[^{}]*\[data-reveal\][^{}]*\{[^}]*opacity:\s*0/g) ?? [];
  assert.ok(hidden.length > 0);
  for (const rule of hidden) assert.match(rule, /\.motion-ready/);
});

test("hero is no longer a slideshow", () => { const top = section("top"); assert.ok(!top.includes("slideshow")); assert.ok(!top.includes("scene-dots")); assert.equal(count(top, "scene-panel "), 2); assert.ok(text(top).includes("Curious by nature")); });
