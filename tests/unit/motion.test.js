import test from "node:test";
import assert from "node:assert/strict";
import { smoothstep, countAt } from "../../src/components/motion.js";

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
