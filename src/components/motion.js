// Shared motion helpers (see MOTION.md): smoothstep for counters and morphs,
// easeOutBack for an overshooting snap.
export const smoothstep = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export const countAt = (t, from, to) => Math.round(from + (to - from) * smoothstep(t));

// Overshoots past 1 and settles back; overshoot 1.2 peaks under 6% past the target.
export const easeOutBack = (t, overshoot = 1.2) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const x = t - 1;
  return 1 + (overshoot + 1) * x * x * x + overshoot * x * x;
};

// A time-based scene change must never lag behind the scroll that caused it. Once the scroll
// reaches the destination while the change is still running, the rest of it is compressed into
// at most `hurryMs`: the clock is re-timed so the current point of the curve (and so the value)
// stays the same and only the remaining part plays faster. Returns the new { start, duration }.
export const HURRY_MS = 280;
export function hurryTiming(start, duration, now, hurryMs = HURRY_MS) {
  if (!duration) return { start, duration };
  const t = Math.min(1, Math.max(0, (now - start) / duration));
  const remaining = (1 - t) * duration;
  if (t >= 1 || remaining <= hurryMs) return { start, duration };
  const next = hurryMs / (1 - t);
  return { start: now - t * next, duration: next };
}

// True once scroll position has reached (or passed) the destination in the direction of travel.
export const caughtUp = (position, destination, origin) =>
  destination >= origin ? position >= destination : position <= destination;
