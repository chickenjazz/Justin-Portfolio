// Shared motion helpers (see MOTION.md): smoothstep for counters and morphs.
export const smoothstep = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export const countAt = (t, from, to) => Math.round(from + (to - from) * smoothstep(t));
