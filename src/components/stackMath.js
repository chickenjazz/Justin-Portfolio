// Layout of one project card in the scroll stack (see MOTION.md, "Project stack").
// d is the card's offset from the scroll progress: > 0 still to come, 0 current,
// < 0 already covered by later cards.

// Rounds to 4 decimals; "+ 0" turns -0 into 0.
const round = (value) => Math.round(value * 1e4) / 1e4 + 0;

// peek: px a covered card slides up per step so its top edge shows above the next.
// scaleStep: shrink per step. blur: px at one full step. dim: black overlay per step.
// depth: covered steps that stay visible; the next one fades out.
export const STACK = { peek: 26, scaleStep: 0.07, blur: 4, dim: 0.28, depth: 3 };

export function stackLayer(d, options = STACK) {
  const { peek, scaleStep, blur, dim, depth } = options;
  if (d > 0) {
    // Incoming: rises from one stage height below.
    return { yVh: round(Math.min(d, 1) * 100), peekPx: 0, scale: 1, blur: 0, dim: 0, opacity: 1, hidden: d >= 1 };
  }
  const covered = -d;
  const steps = Math.min(covered, depth);
  return {
    yVh: 0,
    peekPx: round(-peek * steps),
    scale: round(1 - scaleStep * steps),
    blur: round(blur * Math.min(covered, 1)),
    dim: round(Math.min(1, dim * steps)),
    opacity: round(Math.max(0, Math.min(1, depth + 1 - covered))),
    hidden: covered >= depth + 1,
  };
}

// Share of a card step past the current card that commits to its neighbour.
export const CARD_COMMIT = 0.15;

// Picks the card the stack should settle on for a scroll position (in cards). Before the
// first placement the nearest card wins; after that the card only moves in the direction
// of travel, so a short scroll switches cards and the stack never rests between two.
export function nextCard(current, position, direction, count, settled = true) {
  let index = current;
  if (!settled) index = Math.round(position);
  else if (direction > 0) index = Math.max(current, Math.ceil(position - CARD_COMMIT));
  else if (direction < 0) index = Math.min(current, Math.floor(position + CARD_COMMIT));
  return Math.max(0, Math.min(count - 1, index));
}
