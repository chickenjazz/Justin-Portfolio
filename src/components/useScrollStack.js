import { useEffect, useRef, useState } from "react";
import { nextCard } from "./stackMath.js";
import { hurryTiming, caughtUp } from "./motion.js";

// Viewports of scroll per card: a short scroll commits, the rest is a buffer before the next.
const STEP = 0.6;
// Viewports of hold on the final card before the page releases.
const FINAL_HOLD = 0.5;
// Duration of one card change (smoothstep), restarted from the current state on interruption.
const SWITCH_MS = 750;

/**
 * Native vertical scroll through `count` cards inside a sticky track. Scroll only chooses
 * the card (a short scroll either way commits to the neighbour, see `nextCard`); the change
 * itself is time-based, so the stack never rests between two cards wherever the scroll stops.
 * `onProgress(p)` gets a float from 0 to count - 1 every frame. Returns the current card and
 * a function that scrolls to a card's position.
 */
export default function useScrollStack(trackRef, count, onProgress, enabled) {
  const [active, setActive] = useState(0);
  const navigateRef = useRef(() => {});
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) return;
    const track = trackRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const last = count - 1;
    let trackTop = 0;
    let unit = window.innerHeight * STEP;
    let destination = 0;
    let origin = 0;
    let progress = 0;
    let from = 0;
    let start = 0;
    let duration = 0;
    let frame = 0;
    let lastScroll = window.scrollY;
    let settled = false;

    const read = () => (window.scrollY - trackTop) / unit;
    function paint(now) {
      frame = 0;
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      progress = from + (destination - from) * t * t * (3 - 2 * t);
      progressRef.current(progress);
      if (t < 1) frame = requestAnimationFrame(paint);
    }
    function goTo(index) {
      if (index === destination) return;
      from = progress;
      origin = destination;
      start = performance.now();
      // The first placement (e.g. reload mid-track) jumps instead of replaying.
      duration = preference.matches || !settled ? 0 : SWITCH_MS;
      destination = index;
      setActive(index);
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function update() {
      const direction = Math.sign(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      const position = read();
      goTo(nextCard(destination, position, direction, count, settled));
      // Scrolled to (or past) the destination card while the change still runs: finish it now,
      // so a fast scroll never leaves the stack between two cards as it moves on.
      if (frame && caughtUp(position, destination, origin)) ({ start, duration } = hurryTiming(start, duration, performance.now()));
    }
    function measure() {
      unit = window.innerHeight * STEP;
      // Sticky positioning needs scroll room in the track's content box, not padding.
      track.style.setProperty(
        "--scroll-distance",
        `${unit * last + window.innerHeight * FINAL_HOLD}px`,
      );
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      update();
      settled = true;
    }
    navigateRef.current = (index) => {
      if (index < 0 || index > last) return;
      window.scrollTo({
        top: trackTop + index * unit,
        behavior: preference.matches ? "instant" : "smooth",
      });
    };

    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    progressRef.current(0);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", update);
      track.style.removeProperty("--scroll-distance");
      navigateRef.current = () => {};
    };
  }, [trackRef, count, enabled]);

  return [active, (index) => navigateRef.current(index)];
}
