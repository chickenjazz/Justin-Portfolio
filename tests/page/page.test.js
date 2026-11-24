import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { html } from "./page.js";

test("prerendered page never ships the motion-ready gate", () => {
  assert.ok(!/<html[^>]*motion-ready/.test(html));
});

test("hidden reveal state is scoped under .motion-ready", () => {
  const css = readdirSync("dist/assets")
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(`dist/assets/${f}`, "utf8"))
    .join("");
  const hidden = css.match(/[^{}]*\[data-reveal\][^{}]*\{[^}]*opacity:\s*0/g) ?? [];
  assert.ok(hidden.length > 0);
  for (const rule of hidden) assert.match(rule, /\.motion-ready/);
});
