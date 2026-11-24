import test from "node:test";
import assert from "node:assert/strict";
import { stackLayer } from "../../src/components/stackMath.js";

test("current card rests flat", () => assert.deepEqual(stackLayer(0), { yVh: 0, scale: 1, dim: 0, lift: 0, hidden: false }));
test("incoming card rises from the bottom, lifted in flight", () => { const l = stackLayer(.5); assert.equal(l.yVh, 50); assert.equal(l.lift, .5); assert.equal(l.scale, 1); });
test("next card waits fully below and hidden", () => { const l = stackLayer(1); assert.equal(l.yVh, 100); assert.equal(l.hidden, true); });
test("covered card recedes up, smaller and dimmer", () => { const l = stackLayer(-1); assert.equal(l.yVh, -4); assert.equal(l.scale, .95); assert.equal(l.dim, .45); });
test("deep cards clamp at two steps and hide", () => { const l = stackLayer(-5); assert.equal(l.yVh, -8); assert.equal(l.scale, .9); assert.equal(l.hidden, true); });
test("a backward destination settles without dipping below rest", () => assert.deepEqual(stackLayer(.05, -1), { yVh: 0, scale: 1, dim: 0, lift: 0, hidden: false }));
test("a forward destination overshoots visibly above rest", () => { const l = stackLayer(-.05, 1); assert.equal(l.yVh, -3); assert.equal(l.scale, 1); assert.equal(l.dim, 0); });
test("settling leaves the forward flight unchanged", () => assert.deepEqual(stackLayer(.5, 1), stackLayer(.5)));
test("settling leaves the backward recede unchanged", () => assert.deepEqual(stackLayer(-.5, -1), stackLayer(-.5)));
