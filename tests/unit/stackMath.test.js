import test from "node:test";
import assert from "node:assert/strict";
import { stackLayer, nextCard, CARD_COMMIT } from "../../src/components/stackMath.js";

const REST = { yVh: 0, peekPx: 0, scale: 1, blur: 0, dim: 0, opacity: 1, hidden: false };

test("current card rests flat", () => assert.deepEqual(stackLayer(0), REST));
test("incoming card rises from the bottom, untouched", () => { const l = stackLayer(.5); assert.equal(l.yVh, 50); assert.equal(l.scale, 1); assert.equal(l.blur, 0); assert.equal(l.hidden, false); });
test("next card waits fully below and hidden", () => { const l = stackLayer(1); assert.equal(l.yVh, 100); assert.equal(l.hidden, true); });
test("covered card peeks up, shrinks, blurs and dims", () => { const l = stackLayer(-1); assert.equal(l.peekPx, -26); assert.equal(l.scale, .93); assert.equal(l.blur, 4); assert.equal(l.dim, .28); assert.equal(l.opacity, 1); });
test("deeper cards stack further, darker, blur capped", () => { const l = stackLayer(-3); assert.equal(l.peekPx, -78); assert.equal(l.scale, .79); assert.equal(l.blur, 4); assert.equal(l.dim, .84); });
test("cards past the depth fade out, then hide", () => { assert.equal(stackLayer(-3.5).opacity, .5); assert.equal(stackLayer(-3.5).peekPx, -78); assert.equal(stackLayer(-4).hidden, true); });
test("covering is continuous with the rest state", () => { const l = stackLayer(-.5); assert.equal(l.peekPx, -13); assert.equal(l.blur, 2); assert.equal(l.dim, .14); });
test("options override the defaults", () => assert.equal(stackLayer(-1, { peek: 10, scaleStep: .1, blur: 0, dim: 0, depth: 1 }).scale, .9));

test("a short scroll down commits to the next card", () => { assert.equal(nextCard(0, .1, 1, 4), 0); assert.equal(nextCard(0, CARD_COMMIT + .01, 1, 4), 1); });
test("a short scroll up commits to the previous card", () => { assert.equal(nextCard(2, 1.95, -1, 4), 2); assert.equal(nextCard(2, 2 - CARD_COMMIT - .01, -1, 4), 1); });
test("the card never flips back against the direction of travel", () => { assert.equal(nextCard(1, .5, 1, 4), 1); assert.equal(nextCard(1, 1.5, -1, 4), 1); assert.equal(nextCard(1, 1.5, 0, 4), 1); });
test("a long fling follows the scroll position", () => assert.equal(nextCard(0, 2.1, 1, 4), 2));
test("the first placement takes the nearest card", () => { assert.equal(nextCard(0, 1.6, 0, 4, false), 2); assert.equal(nextCard(3, .2, 0, 4, false), 0); });
test("the card stays within the stack", () => { assert.equal(nextCard(3, 3.4, 1, 4), 3); assert.equal(nextCard(0, -.5, -1, 4), 0); });
