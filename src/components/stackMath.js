// Layout of one project card in the bottom-up stack (see MOTION.md, "Project stack").
// d is the card's offset from the visual progress: > 0 still to come, 0 current,
// < 0 already covered by later cards.

// Rounds to 4 decimals; "+ 0" turns -0 into 0.
const round = (value) => Math.round(value * 1e4) / 1e4 + 0;

export function stackLayer(d) {
  if (d > 0) {
    // Incoming: rises from one viewport below, lifted while in flight.
    return { yVh: round(d * 100), scale: 1, dim: 0, lift: round(Math.min(d, 1)), hidden: d >= 1 };
  }
  // Covered: recedes up, smaller and dimmer, clamped at two steps.
  const a = Math.min(-d, 2);
  return {
    yVh: round(-4 * a),
    scale: round(1 - 0.05 * a),
    dim: round(Math.min(a, 1) * 0.45),
    lift: 0,
    hidden: -d >= 2.5,
  };
}
