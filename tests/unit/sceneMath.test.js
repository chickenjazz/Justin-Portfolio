import test from "node:test";
import assert from "node:assert/strict";
import { TRACK_UNITS, COMMIT, nextScene, holdDrift } from "../../src/components/sceneMath.js";

test("before settling, the nearest state wins", () => { assert.equal(nextScene(0, .4, 0, false), 0); assert.equal(nextScene(0, .6, 0, false), 1); assert.equal(nextScene(0, 1.5, 0, false), 1); });
test("scrolling down commits once 18% past the hero", () => { assert.equal(nextScene(0, .17, 1, true), 0); assert.equal(nextScene(0, .19, 1, true), 1); });
test("scrolling up returns once 18% back from the description", () => { assert.equal(nextScene(1, .83, -1, true), 1); assert.equal(nextScene(1, .81, -1, true), 0); });
test("no movement keeps the state", () => { assert.equal(nextScene(1, .3, 0, true), 1); });
test("hold drift spans commit → track end, clamped", () => { assert.equal(holdDrift(0), 0); assert.equal(holdDrift(COMMIT), 0); assert.equal(holdDrift(TRACK_UNITS), 1); assert.equal(holdDrift(9), 1); });
