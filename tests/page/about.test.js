import test from "node:test";
import assert from "node:assert/strict";
import { aboutStory, education } from "../../src/content/site.js";
import { text, section } from "./page.js";

test("about shows the exact story, the portrait and the education line", () => {
  const s = section("about");
  assert.ok(text(s).includes(aboutStory));
  assert.match(s, /<img[^>]+src="[^"]*me\/justin\.webp"[^>]+alt="Portrait of Justin Manuzon"/);
  assert.ok(text(s).includes(education.institution));
  assert.ok(text(s).includes(education.graduation));
});
