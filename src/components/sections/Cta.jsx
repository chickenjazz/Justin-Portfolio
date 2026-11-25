import { useEffect, useRef } from "react";
import { cta, profile } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";
import CtaChick from "../CtaChick.jsx";
import { nextScene, STEP_SCREENS } from "../sceneMath.js";
import { smoothstep, hurryTiming, caughtUp } from "../motion.js";
import { Arrow } from "../Glyph.jsx";
import { icons } from "../../content/icons.js";

// Like the hero, the CTA is two states of one pinned scene: arriving from the white
// Milestones it is still all white (state 0); a short scroll commits to the dark purple
// scene (state 1), which runs on into the dark footer. Scroll only picks the state; the
// gradient's fade is time-based (same duration and smoothstep as the hero), and the chick,
// bands, shapes and buttons enter after it in CSS (Closing.css).
const MORPH_MS = 1100;
// One morph step plus 0.4 of a step of hold before the footer (a step is STEP_SCREENS of a screen).
const TRACK_UNITS = 1.4;

// Crystal shapes float over the dark stage like the reference's stray props.
const SHAPES = [
  { sprite: "knot-b", x: "12%", y: "22%", size: "clamp(70px, 9vw, 160px)", depth: 0.45, turn: -8 },
  { sprite: "torus-a", x: "88%", y: "70%", mx: "88%", my: "10%", size: "clamp(80px, 10vw, 180px)", depth: 0.8, turn: 20, layer: "front" },
  { sprite: "cube-b", x: "93%", y: "34%", size: "clamp(40px, 4vw, 72px)", depth: 0.2, fade: 0.8, mobile: false },
];

const base = import.meta.env.BASE_URL;

const linkTo = (label) => profile.links.find((l) => l.label === label)?.href;

// Line icons for the contact tiles without a brand mark (24x24, stroked).
const LINE_ICONS = {
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
};

// Floating contact tiles around the chick (a 2x2 grid under the buttons on narrow screens).
const CONTACTS = [
  { id: "github", label: "GitHub", value: `@${profile.github}`, href: linkTo("GitHub"), brand: "github", external: true },
  { id: "linkedin", label: "LinkedIn", value: "in/jrmanuzon", href: linkTo("LinkedIn"), brand: "linkedin", external: true },
  { id: "email", label: "Email", value: profile.email, href: `mailto:${profile.email}`, line: "email" },
  { id: "phone", label: "Phone", value: profile.phone.label, href: profile.phone.href, line: "phone" },
];

const ContactTile = ({ contact, index }) => (
  <a
    className={`cta-tile cta-tile-${contact.id}`}
    href={contact.href}
    style={{ "--i": index }}
    {...(contact.external ? { target: "_blank", rel: "noopener" } : {})}
  >
    <span className="cta-tile-float">
      <span className="cta-tile-icon" aria-hidden="true">
        {contact.brand ? (
          <svg viewBox="0 0 24 24" focusable="false">
            <path d={icons[contact.brand]} fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {LINE_ICONS[contact.line]}
          </svg>
        )}
      </span>
      <span className="cta-tile-text">
        <span className="cta-tile-label">{contact.label}</span>
        <span className="cta-tile-value">{contact.value}</span>
      </span>
    </span>
  </a>
);

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
      unit = Math.max(window.innerHeight, root.clientHeight) * STEP_SCREENS;
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
          <CtaChick src={`${base}mascot/chick.webp`} />

          <nav className="cta-tiles" aria-label="Contact links">
            {CONTACTS.map((contact, index) => (
              <ContactTile key={contact.id} contact={contact} index={index} />
            ))}
          </nav>

          <div className="cta-actions">
            <a className="button cta-primary" href={`${base}resume.pdf`} target="_blank" rel="noopener">
              {cta.resumeLabel} <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
