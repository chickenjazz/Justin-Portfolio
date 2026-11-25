import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { section } from "./page.js";

const sections = ["stats", "about", "skills", "honors", "milestones", "contact"];

test("every white section has exactly three decorative crystal shapes, layered", () => {
  for (const id of sections) {
    const s = section(id);
    assert.match(s, /class="backdrop-shapes[^"]*" aria-hidden="true"/, id);
    // At least one shape floats in front of the copy, the rest sit behind it.
    assert.match(s, /class="backdrop-shapes[^"]* backdrop-shapes-front" aria-hidden="true"/, id);
    const sprites = [...s.matchAll(/<img[^>]*class="backdrop-shape[ "][^>]*>/g)].map((m) => m[0]);
    assert.equal(sprites.length, 3, `${id} has ${sprites.length} shapes`);
    for (const img of sprites) assert.match(img, /alt=""/, id);
  }
});

test("Stats, Skills, Honors and Milestones let their shapes cross the section seams", () => {
  for (const id of ["stats", "skills", "honors", "milestones"]) {
    assert.match(section(id), /class="backdrop-shapes backdrop-shapes-bleed"/, id);
  }
});

test("every referenced shape sprite exists in the build", () => {
  for (const id of sections) {
    for (const [, name] of section(id).matchAll(/src="[^"]*shapes\/([\w-]+\.webp)"/g)) {
      assert.ok(existsSync(new URL(`../../dist/shapes/${name}`, import.meta.url)), name);
    }
  }
});
