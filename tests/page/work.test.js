import test from "node:test";
import assert from "node:assert/strict";
import { projects } from "../../src/content/site.js";
import { text, section } from "./page.js";

test("work keeps its controls and fallback, drops the arc", () => { const s = section("work"); assert.ok(!s.includes("arc-")); assert.ok(s.includes("project-fallback")); for (const p of projects) assert.ok(text(s).includes(p.shortTitle)); });
