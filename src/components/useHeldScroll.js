import { useEffect, useRef, useState } from "react";
import { smoothstep } from "./motion.js";

// A short scroll past a held state commits to its neighbour, as in a slideshow.
const COMMIT = 0.18;
const SETTLE_MS = 140;
// Viewports of hold on the final state before the page releases.
const FINAL_HOLD = 0.5;

/**
 * Native vertical scroll through `count` held states inside a sticky track.
 * Scroll only selects the destination; the visual progress is time-based
 * (`ease` over `duration` ms; smoothstep over 1100ms by default), so it never
 * rests between states. When scrolling rests between states the page glides to
 * the committed one. `onProgress(p, { destination, direction })` gets a float
 * from 0 to count - 1 every frame (beyond that range while an overshooting ease
 * settles), the target state and the tween's direction (+1, -1, or 0 when the
 * placement is instant).
 */
export default function useHeldScroll(
  trackRef,
  count,
  onProgress,
  enabled,
  { ease = smoothstep, duration: morphMs = 1100 } = {},
) {
  const [active, setActive] = useState(0);
  const navigateRef = useRef(() => {});
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;
  const easeRef = useRef(ease);
  easeRef.current = ease;

  useEffect(() => {
    if (!enabled) return;
    const track = trackRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const last = count - 1;
    let trackTop = 0;
    let unit = window.innerHeight;
    let destination = 0;
    let progress = 0;
    let from = 0;
    let tweenStart = 0;
    let duration = 0;
    let tweenDirection = 0;
    let frame = 0;
    let scrollFrame = 0;
    let settleTimer = 0;
    let settled = false;
    let lastScroll = window.scrollY;

    const behavior = () => (preference.matches ? "instant" : "smooth");
    function tween(now) {
      frame = 0;
      const t = duration ? Math.min(1, (now - tweenStart) / duration) : 1;
      progress = from + (destination - from) * easeRef.current(t);
      track.dataset.transitioning = t < 1 ? "true" : "false";
      progressRef.current(progress, { destination, direction: tweenDirection });
      if (t < 1) frame = requestAnimationFrame(tween);
    }
    function goToState(index) {
      if (index === destination) return;
      // Restart from wherever the cards are, so interruptions stay continuous.
      from = progress;
      tweenStart = performance.now();
      // The first placement (e.g. reload mid-track) jumps instead of replaying.
      duration = preference.matches || !settled ? 0 : morphMs;
      destination = index;
      tweenDirection = duration ? Math.sign(destination - from) : 0;
      setActive(index);
      if (!frame) frame = requestAnimationFrame(tween);
    }
    function updateScroll() {
      const position = (window.scrollY - trackTop) / unit;
      const direction = Math.sign(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      // The state only advances in the direction of travel, so it never flickers back.
      let index = destination;
      if (!settled) index = Math.round(position);
      else if (direction > 0)
        index = Math.max(destination, Math.ceil(position - COMMIT));
      else if (direction < 0)
        index = Math.min(destination, Math.floor(position + COMMIT));
      goToState(Math.max(0, Math.min(last, index)));
    }
    // Once native scrolling rests between held states, glide to the committed one.
    function settleScroll() {
      settleTimer = 0;
      const position = (window.scrollY - trackTop) / unit;
      if (position <= 0 || position >= last) return;
      if (Math.abs(position - destination) < 0.01) return;
      window.scrollTo({
        top: trackTop + destination * unit,
        behavior: behavior(),
      });
    }
    function schedule() {
      if (!scrollFrame)
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          updateScroll();
        });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settleScroll, SETTLE_MS);
    }
    function measure() {
      unit = window.innerHeight;
      // Sticky positioning needs scroll room in the track's content box, not padding.
      track.style.setProperty(
        "--scroll-distance",
        `${unit * (last + FINAL_HOLD)}px`,
      );
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      updateScroll();
      settled = true;
    }
    navigateRef.current = (index) => {
      if (index < 0 || index > last) return;
      window.scrollTo({ top: trackTop + index * unit, behavior: behavior() });
    };

    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    progressRef.current(0, { destination: 0, direction: 0 });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      clearTimeout(settleTimer);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      track.style.removeProperty("--scroll-distance");
      navigateRef.current = () => {};
    };
  }, [trackRef, count, enabled, morphMs]);

  return [active, (index) => navigateRef.current(index)];
}
