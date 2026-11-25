import { useEffect, useRef } from "react";
import { cta, profile } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";
import { nextScene } from "../sceneMath.js";
import { smoothstep, hurryTiming, caughtUp } from "../motion.js";

// Like the hero, the CTA is two states of one pinned scene: arriving from the white
// Milestones it is still all white (state 0); a short scroll commits to the dark purple
// scene (state 1), which runs on into the dark footer. Scroll only picks the state; the
// gradient's fade is time-based (same duration and smoothstep as the hero), and the chick,
// bands, shapes and buttons enter after it in CSS (Closing.css).
const MORPH_MS = 1100;
// One morph step plus half a viewport of hold before the footer.
const TRACK_UNITS = 1.5;

// Crystal shapes float over the dark stage like the reference's stray props.
const SHAPES = [
  { sprite: "knot-b", x: "12%", y: "22%", size: "clamp(70px, 9vw, 160px)", depth: 0.45, turn: -8 },
  { sprite: "torus-a", x: "88%", y: "70%", mx: "88%", my: "10%", size: "clamp(80px, 10vw, 180px)", depth: 0.8, turn: 20, layer: "front" },
  { sprite: "cube-b", x: "82%", y: "14%", size: "clamp(40px, 4vw, 72px)", depth: 0.2, fade: 0.8, mobile: false },
];

const base = import.meta.env.BASE_URL;

// One band of oversized words; the run repeats so it never shows an end while it slides.
const Band = ({ words, variant }) => {
  const run = words.join(" · ") + " · ";
  return (
    <div className={`cta-band cta-band-${variant}`}>
      <span className="cta-band-run">{run.repeat(4)}</span>
    </div>
  );
};

export default function Cta() {
  const trackRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const root = rootRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    const restoredNavigation = navType === "reload" || navType === "back_forward";
    let trackTop = 0;
    let unit = window.innerHeight;
    let destination = 0;
    let origin = 0;
    let weight = 0;
    let from = 0;
    let tweenStart = 0;
    let duration = 0;
    let frame = 0;
    let scrollFrame = 0;
    let settled = false;
    let lastScroll = window.scrollY;

    const paint = () => root.style.setProperty("--morph", weight.toFixed(4));
    function settle(now) {
      frame = 0;
      const t = duration ? Math.min(1, (now - tweenStart) / duration) : 1;
      weight = from + (destination - from) * smoothstep(t);
      paint();
      if (t < 1) frame = requestAnimationFrame(settle);
    }
    function goToState(index) {
      if (index === destination) return;
      // Restart from the current blend, so an interrupted morph stays continuous.
      from = weight;
      origin = destination;
      tweenStart = performance.now();
      // The first placement (deep link, mid-page reload) jumps instead of morphing.
      duration = preference.matches || !settled ? 0 : MORPH_MS;
      destination = index;
      root.dataset.state = String(index);
      if (!frame) frame = requestAnimationFrame(settle);
    }
    // Sections above (the project stack, fonts, images) change height after load, so the track's
    // top is re-measured whenever the page resizes, never on scroll (no layout read per frame).
    const measureTop = () => { trackTop = track.getBoundingClientRect().top + window.scrollY; };
    function updateScroll() {
      const position = (window.scrollY - trackTop) / unit;
      const direction = Math.sign(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      goToState(nextScene(destination, position, direction, settled));
      // Scrolled all the way to the destination while the colour change still runs: finish it
      // now, so the stage never slides away half-changed.
      if (frame && caughtUp(position, destination, origin)) ({ start: tweenStart, duration } = hurryTiming(tweenStart, duration, performance.now()));
    }
    function schedule() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateScroll(); });
    }
    // #contact lands on the full scene, not on the inset card.
    function navigate(instant = false) {
      measureTop();
      window.scrollTo({ top: trackTop + unit, behavior: instant || preference.matches ? "instant" : "smooth" });
    }
    const resize = new ResizeObserver(() => {
      unit = Math.max(window.innerHeight, root.clientHeight);
      track.style.setProperty("--cta-stage-height", `${root.clientHeight}px`);
      track.style.setProperty("--cta-scroll-distance", `${unit * TRACK_UNITS}px`);
      measureTop();
      if (!settled && !restoredNavigation && location.hash === "#contact") navigate(true);
      updateScroll();
      settled = true;
    });
    function anchorClick(event) {
      const link = event.target.closest('a[href="#contact"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.replaceState(null, "", "#contact");
      navigate();
    }
    const hashChange = () => { if (location.hash === "#contact") navigate(); };
    // Keyboard focus inside the scene (its buttons) brings in the full state.
    const focusIn = () => goToState(1);

    root.dataset.state = "0";
    paint();
    track.classList.add("cta-ready");
    resize.observe(root);
    // Anything above the track changing height moves it; the body's size catches all of it.
    const pageResize = new ResizeObserver(() => { measureTop(); if (settled) updateScroll(); });
    pageResize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("hashchange", hashChange);
    document.addEventListener("click", anchorClick);
    root.addEventListener("focusin", focusIn);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      resize.disconnect();
      pageResize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", hashChange);
      document.removeEventListener("click", anchorClick);
      root.removeEventListener("focusin", focusIn);
    };
  }, []);

  return (
    <div className="cta-track" ref={trackRef}>
    <section className="cta has-backdrop" id="contact" aria-labelledby="contact-title" ref={rootRef}>
      <h2 id="contact-title" className="visually-hidden">
        Get in touch
      </h2>
      <div className="cta-stage">
        <div className="cta-bands" aria-hidden="true">
          <Band words={cta.bands} variant="a" />
          <Band words={[...cta.bands].reverse()} variant="b" />
        </div>
        <BackdropShapes shapes={SHAPES} bleed />

        <div className="cta-scene">
          <div className="cta-mascot">
            <img src={`${base}mascot/chick.webp`} alt="" width="720" height="720" />
          </div>

          <div className="cta-actions">
            <a className="button cta-primary" href={`${base}resume.pdf`} target="_blank" rel="noopener">
              {cta.resumeLabel} ↗
            </a>
            <a className="button cta-secondary" href={`mailto:${profile.email}`}>
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
