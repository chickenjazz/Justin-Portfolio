// Shared motion helpers (see MOTION.md): smoothstep for counters and morphs,
// easeOutBack for the project stack's snap.
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
