// Pure scroll math for the hero scene (HeroAbout.jsx), kept separate so it can be unit tested.

// One state step spans half a screen of scroll, so pinned scenes release quickly instead of
// holding the page for screens at a time (shared by the hero and the CTA).
export const STEP_SCREENS = 0.5;
// One morph step (Hero → Description) plus 0.4 of a step of hold before release.
export const TRACK_UNITS = 1.4;
// A short scroll past a held state commits to its neighbour.
export const COMMIT = .18;

const clamp01 = (value) => Math.min(1, Math.max(0, value)) + 0;

// Picks the state the scene should morph to. Before the first placement the nearest state
// wins; after that the state only advances in the direction of travel, so it never flickers back.
export function nextScene(destination, position, direction, settled) {
  let index = destination;
  if (!settled) index = Math.round(position);
  else if (direction > 0) index = Math.max(destination, Math.ceil(position - COMMIT));
  else if (direction < 0) index = Math.min(destination, Math.floor(position + COMMIT));
  return clamp01(index);
}

// Scroll-linked progress through the Description's hold: 0 at the commit point, 1 at the track's end.
export const holdDrift = (position) => clamp01((position - COMMIT) / (TRACK_UNITS - COMMIT));
