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

test("hurryTiming keeps the current progress and shortens only the rest", async () => {
  const { hurryTiming, caughtUp } = await import("../../src/components/motion.js");
  // 1100ms tween, 300ms in: 800ms left, compressed to 280ms.
  const { start, duration } = hurryTiming(0, 1100, 300, 280);
  assert.ok(Math.abs((300 - start) / duration - 300 / 1100) < 1e-9);
  assert.ok(Math.abs((1 - 300 / 1100) * duration - 280) < 1e-9);
  // Already nearly done, finished, or instant: unchanged.
  assert.deepEqual(hurryTiming(0, 1100, 1000, 280), { start: 0, duration: 1100 });
  assert.deepEqual(hurryTiming(0, 1100, 2000, 280), { start: 0, duration: 1100 });
  assert.deepEqual(hurryTiming(5, 0, 10, 280), { start: 5, duration: 0 });
  // Caught up in either direction of travel.
  assert.equal(caughtUp(1.02, 1, 0), true);
  assert.equal(caughtUp(0.7, 1, 0), false);
  assert.equal(caughtUp(0, 0, 1), true);
  assert.equal(caughtUp(0.4, 0, 1), false);
});
