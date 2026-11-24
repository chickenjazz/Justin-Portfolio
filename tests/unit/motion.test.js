import test from "node:test";
import assert from "node:assert/strict";
import { smoothstep, countAt, easeOutBack } from "../../src/components/motion.js";

test("smoothstep is clamped and symmetric", () => {
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(2), 1);
});

test("countAt rounds along smoothstep from → to", () => {
  assert.equal(countAt(0, 26, 67), 26);
  assert.equal(countAt(1, 26, 67), 67);
  assert.equal(countAt(0.5, 26, 67), 47);
});

test("easeOutBack starts at 0, ends at 1, overshoots by under 6%", () => {
  assert.equal(easeOutBack(0), 0); assert.equal(easeOutBack(1), 1);
  const peak = Math.max(...Array.from({ length: 101 }, (_, i) => easeOutBack(i / 100))); assert.ok(peak > 1 && peak < 1.06);
});
