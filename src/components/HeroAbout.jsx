import { useEffect, useRef, useState } from "react";
import SceneCanvas from "./SceneCanvas.jsx";
import Topography from "./Topography.jsx";
import { TRACK_UNITS, nextScene, holdDrift } from "./sceneMath.js";
import { hurryTiming, caughtUp } from "./motion.js";
import { profile, description } from "../content/site.js";

// Hero (state 0) and Description (state 1) are two states of one scene, morphed over time.
const MORPH_MS = 1100;
// Space kept between the bottom of the chick and the Introduction's copy, in px.
const INTRO_GAP = 16;
// Highest the Description may rise, in px, so it stays clear of the site header.
const DESCRIPTION_TOP = 84;
// On narrow screens the floating header wraps onto two rows; the stacked name and the Description
// start below it (px from the top of the stage).
const MOBILE_HEADER = 100;

// Fixed, hand-picked offsets (em, deg) so letters sit unevenly but stay readable.
const LETTER_JITTER = [[.06, 4], [-.1, -5], [.12, 3], [-.04, -6], [.09, 5], [-.12, -3], [.05, 6]];

// Each letter floats on its own, staggered, along a shallow arc that rises toward the mascot.
function FloatingWord({ text, towardEnd }) {
  const last = text.length - 1;
  return (
    <span className="scene-word" aria-hidden="true">
      {[...text].map((letter, i) => (
        <span className="scene-letter" key={i} style={{ "--i": i, "--lift": towardEnd ? i / last : 1 - i / last, "--jy": LETTER_JITTER[(i + (towardEnd ? 0 : 3)) % LETTER_JITTER.length][0], "--jr": LETTER_JITTER[(i + (towardEnd ? 0 : 3)) % LETTER_JITTER.length][1] }}>{letter}</span>
      ))}
    </span>
  );
}

// The name and shapes stay behind in the Introduction while the chick travels on.
// Positions are fractions of the stage; size is a fraction of the stage's short side.
// Big pieces bleed off the edges, small ones fill the gaps around the name and chick.
// Depth (0..1) sets parallax: larger, nearer pieces rise faster when the scene leaves.
// Introduction shapes that pop back in, crystal like the chick, in the Description (desktop).
const POP_SHAPES = [
  { kind: "knot", x: .58, y: .2, size: .12 },
  { kind: "torus", x: .93, y: .3, size: .11 },
  { kind: "cube", x: .88, y: .82, size: .14 },
];
// Back-out easing: scales from 0 past 1 and settles, a small pop.
const popScale = (t) => t <= 0 ? 0 : 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

const SHAPES = {
  desktop: [
    { kind: "torus", tone: "mint", x: .11, y: .22, size: .2, depth: .7 },
    { kind: "knot", tone: "ink", x: .84, y: .19, size: .14, depth: .45 },
    { kind: "cube", tone: "ink", x: .94, y: .8, size: .3, depth: 1 },
    { kind: "sphere", tone: "mint", x: .05, y: .9, size: .26, depth: .9 },
    { kind: "torus", tone: "ink", x: .64, y: .29, size: .07, depth: .15 },
    { kind: "cube", tone: "mint", x: .23, y: .75, size: .06, depth: .2 },
    { kind: "sphere", tone: "ink", x: .77, y: .65, size: .045, depth: 0 },
  ],
  mobile: [
    { kind: "torus", tone: "mint", x: .12, y: .27, size: .08, depth: .5 },
    { kind: "knot", tone: "ink", x: .86, y: .23, size: .07, depth: .3 },
    { kind: "cube", tone: "ink", x: .93, y: .71, size: .1, depth: .9 },
    { kind: "sphere", tone: "mint", x: .05, y: .68, size: .08, depth: .7 },
    { kind: "sphere", tone: "ink", x: .64, y: .21, size: .025, depth: 0 },
  ],
};
// Leaving the Introduction lifts what stays behind by this many stage heights; deeper
// objects (depth 0..1) rise a little faster, for parallax.
const LEAVE_LIFT = 1.15;
// Eased in, so what stays behind visibly lingers while the chick starts to travel away.
const liftOf = (depart, height) => depart * depart * height * LEAVE_LIFT;
const PARALLAX = .35;
const depthOf = (i) => ((i * 37) % 7) / 6;

const scenes = [
  { bg: [10, 9, 14], ink: [245, 242, 255], glass: 0, turn: -8, hue: 0, light: 1, x: .51, y: .41, size: .26, pitch: 0 },
  { bg: [255, 255, 255], ink: [0, 0, 0], glass: 1, turn: 4, hue: 0, light: 0, x: .74, y: .47, size: .36, pitch: 15 },
];

export default function HeroAbout() {
  const trackRef = useRef(null);
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const repaintRef = useRef(() => {});
  const [active, setActive] = useState(0);
  const [backgroundPaused, setBackgroundPausedState] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const mascot = root.querySelector(".scene-character");
    const identity = root.querySelector(".scene-identity");
    const words = [...identity.querySelectorAll(".scene-word")];
    const panels = [...root.querySelectorAll(".scene-panel")];
    const letterNodes = [...root.querySelectorAll(".scene-letter")];
    let letterLayout = [];
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const weights = [1, 0];
    const track = trackRef.current;
    let trackTop = 0;
    let unit = window.innerHeight;
    let position = 0;
    let destination = 0;
    let origin = 0;
    let frame = 0;
    let scrollFrame = 0;
    let from = weights.slice();
    let tweenStart = 0;
    let duration = 0;
    let settled = false;
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    const restoredNavigation = navType === "reload" || navType === "back_forward";
    let lastScroll = window.scrollY;
    let width = root.clientWidth;
    let height = root.clientHeight;
    let visible = true;
    let introHeight = 0;
    let descriptionHeight = 0;
    // The stacked mobile name's two word heights, measured on resize (never read per frame).
    let wordHeights = [0, 0];
    // Only hand React a change, so the morph's frames never queue renders.
    let paused = false;
    const setBackgroundPaused = (next) => {
      if (next === paused) return;
      paused = next;
      setBackgroundPausedState(next);
    };
    let disposed = false;
    const mix = (key) => scenes.reduce((sum, scene, i) => sum + scene[key] * weights[i], 0);
    const color = (key) => `rgb(${[0, 1, 2].map(channel => scenes.reduce((sum, scene, i) => sum + scene[key][channel] * weights[i], 0)).join(" ")})`;

    // Reads the DOM name's letter boxes (minus the current lift) so the 3D letters follow the
    // responsive CSS layout. Only on resize, font load and readiness, never per frame.
    // Word tilt and letter jitter (desktop) plus the per-letter arc, in degrees, as styled in HeroAbout.css.
    function letterTilt(node) {
      const style = getComputedStyle(node);
      const arc = style.getPropertyValue("--arc").trim();
      const arcScale = arc === "" ? 1 : parseFloat(arc);
      return (parseFloat(style.getPropertyValue("--tilt")) || 0) + Number(node.style.getPropertyValue("--jr")) * (parseFloat(style.getPropertyValue("--jitter")) || 0) - 2 * Number(node.style.getPropertyValue("--lift")) * arcScale;
    }
    function measureLetters() {
      const origin = root.getBoundingClientRect();
      const lift = liftOf(1 - weights[0], height);
      // Rotated boxes are taller than the glyphs, so size from layout height times the identity's scale.
      const scale = identity.getBoundingClientRect().width / (identity.offsetWidth || 1);
      letterLayout = letterNodes.map((node, i) => {
        const box = node.getBoundingClientRect();
        return {
          char: node.textContent,
          x: box.left - origin.left + box.width / 2,
          y: box.top - origin.top + box.height / 2 + lift,
          // Line-height is 1, so the box is the font size; DM Sans caps are ~70% of it.
          height: node.offsetHeight * scale * .7,
          rot: letterTilt(node),
          depth: depthOf(i),
        };
      });
    }

    // Pop shapes enter late and staggered; heading back to the Introduction they leave early.
    function popProgress(i) {
      const t = destination === 0 ? (weights[1] - .7) / .3 : (weights[1] - .5) / .5 * 1.4 - i * .2;
      return Math.min(1, Math.max(0, t));
    }
    function paint() {
      const mobile = width <= 800;
      const first = weights[0];
      const depart = 1 - first;
      const lift = liftOf(depart, height);
      // While the Description holds, scroll drifts the chick, pop shapes and copy upward at
      // different rates (parallax). Off under reduced motion, like the page's other parallax.
      const drift = preference.matches ? 0 : holdDrift(position) * weights[1];
      let size = mobile ? Math.min(width * (.32 + depart * .04), height * .22, 165) : Math.min(width * mix("size"), 520);
      const x = mobile ? width * (.5 + weights[1] * .12) : width * mix("x");
      // The chick dips as it leaves the Introduction, as if the camera follows it down.
      let y = (mobile ? Math.min(155, height * .25) : height * mix("y")) + Math.sin(Math.PI * depart) * height * .08;
      // The Introduction's copy never scrolls: it sits fully above the bottom bar, and the chick
      // rises (or, on short stages, shrinks) to stay clear of it.
      let introY = Math.min(mobile ? Math.min(255, height * .43) : height * .66, height - introHeight - (mobile ? 125 : 95));
      // Mobile Introduction: JUSTIN / chick / MANUZON stacked and centred, the group (with the
      // copy below it) spread down the stage; on short stages the chick and gap shrink to fit.
      let nameTop = MOBILE_HEADER;
      let nameGap = 0;
      if (mobile) {
        const [top, bottom] = wordHeights;
        const copyGap = 36;
        const room = height - introHeight - 125 - MOBILE_HEADER - top - bottom - copyGap;
        const introSize = Math.max(56, Math.min(width * .48, height * .27, 240, room / 1.05));
        nameGap = introSize * 1.05;
        nameTop = MOBILE_HEADER + Math.max(0, room - nameGap) * .35;
        introY = nameTop + top + nameGap + bottom + copyGap;
        size += (introSize - size) * first;
        y += (nameTop + top + nameGap / 2 - y) * first;
      }
      const clearance = introY - INTRO_GAP - (y + size / 2);
      if (!mobile && clearance < 0) {
        const minTop = height * (mobile ? .12 : .08);
        const fitSize = Math.max(0, Math.min(size, introY - INTRO_GAP - minTop));
        const fitY = introY - INTRO_GAP - fitSize / 2;
        size += (fitSize - size) * first;
        y += (fitY - y) * first;
      }
      y -= drift * height * .12;
      root.style.backgroundColor = color("bg");
      root.style.color = color("ink");
      root.style.setProperty("--scene-light", mix("light"));
      mascot.style.width = mascot.style.height = `${size}px`;
      mascot.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      // The DOM name stays in its Introduction layout and is left behind, rising away.
      const titleX = mobile ? 0 : width * .05;
      const titleY = mobile ? nameTop : height * .22;
      identity.style.transform = `translate3d(${titleX}px, ${titleY - lift}px, 0)`;
      identity.style.width = `${mobile ? width : width * .9}px`;
      identity.style.setProperty("--name-gap", `${mobile ? nameGap : width * .04}px`);
      identity.style.opacity = first;
      // Height-based so shapes keep their proportions, capped on narrow or tall stages.
      const shapeUnit = Math.min(height, width * (mobile ? 1.6 : .62));
      sceneRef.current?.update({
        width,
        height,
        chick: { x, y, size, glass: mix("glass"), turn: mix("turn"), hue: mix("hue"), pitch: mix("pitch") },
        letters: letterLayout.map(l => ({ ...l, y: l.y - lift * (1 + l.depth * PARALLAX) })),
        shapes: SHAPES[mobile ? "mobile" : "desktop"].map((shape, i) => ({
          kind: shape.kind,
          tone: shape.tone,
          x: width * shape.x,
          y: height * shape.y - lift * (1 + shape.depth * PARALLAX * 2),
          size: shapeUnit * shape.size,
          rot: i * .35,
        })).concat(mobile ? [] : POP_SHAPES.map((shape, i) => ({
          kind: shape.kind,
          tone: "crystal",
          x: width * shape.x,
          y: height * shape.y - drift * height * (.18 + .1 * i),
          // Staggered so the three pop one after another.
          size: shapeUnit * shape.size * popScale(popProgress(i)),
          rot: i * .6,
        }))),
      });
      panels.forEach((panel, i) => {
        const weight = weights[i];
        const displacement = weights.reduce((sum, amount, j) => sum + Math.sign(i - j) * amount, 0);
        // The Introduction's copy and CTAs sit centred under the mascot (panel width matches CSS).
        const baseX = mobile ? width * .07 : i === 0 ? (width - Math.min(width * .4, 620)) / 2 : width * .08;
        let baseY = i === 0 ? introY : mobile ? Math.min(255, height * .43) : height * .34;
        // The Description never scrolls: on short stages it rises until it clears the bottom bar,
        // but stays under the site header.
        if (i === 1) baseY = Math.max(mobile ? MOBILE_HEADER : DESCRIPTION_TOP, Math.min(baseY, height - descriptionHeight - (mobile ? 125 : 95)));
        // The Introduction swings out sideways; the Description floats up from below into place.
        const offset = displacement * (width + 80);
        panel.style.transform = i === 1
          ? `translate3d(${baseX}px, ${baseY + displacement * height * .6 - drift * height * .05}px, 0) scale(${.9 + weight * .1})`
          : `translate3d(${baseX + offset}px, ${baseY}px, 0) rotate(${displacement * 12}deg) scale(${.9 + weight * .1})`;
        // The Description stays in the accessibility tree while hidden (opacity only, no focusable
        // content); the Introduction, which holds links, is hidden once it has swung away.
        if (i === 1) panel.style.opacity = weight;
        panel.style.visibility = i === 1 || weight >= .0001 ? "visible" : "hidden";
      });
    }
    repaintRef.current = () => { if (!disposed) { wordHeights = words.map(word => word.offsetHeight); measureLetters(); paint(); } };

    // Scroll only chooses the destination state; the morph itself is time-based,
    // so the scene never rests between two states, wherever the scroll stops.
    function settle(now) {
      frame = 0;
      const t = duration ? Math.min(1, (now - tweenStart) / duration) : 1;
      const eased = t * t * (3 - 2 * t);
      weights.forEach((_, i) => { weights[i] = from[i] + ((i === destination ? 1 : 0) - from[i]) * eased; });
      root.dataset.transitioning = t < 1 ? "true" : "false";
      setBackgroundPaused(!visible || preference.matches || (t === 1 && destination === 1));
      paint();
      if (t < 1) frame = requestAnimationFrame(settle);
    }
    function goToState(index) {
      if (index === destination) return;
      // Restart from wherever the scene currently is, so interruptions stay continuous.
      from = weights.slice();
      origin = destination;
      tweenStart = performance.now();
      // The first placement (e.g. reload mid-track) jumps instead of replaying the morph.
      duration = preference.matches || !settled ? 0 : MORPH_MS;
      destination = index;
      setActive(index);
      if (!frame) frame = requestAnimationFrame(settle);
    }
    // Native scroll is never corrected: wherever it rests, the scene holds the committed state.
    function updateScroll() {
      position = (window.scrollY - trackTop) / unit;
      const direction = Math.sign(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      goToState(nextScene(destination, position, direction, settled));
      // Scrolled all the way to the destination while the morph still runs (a fast flick or an
      // anchor jump): finish it now, so the scene never leaves the screen half-morphed.
      if (frame && caughtUp(position, destination, origin)) ({ start: tweenStart, duration } = hurryTiming(tweenStart, duration, performance.now()));
      // The hold drift follows scroll directly; during a morph the running frame paints it.
      if (!frame && visible) paint();
    }
    function schedule() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateScroll(); });
    }
    // #top goes to the very top of the page (where the header always shows); #description to its state.
    function navigate(index, instant = false) {
      window.scrollTo({ top: index === 0 ? 0 : trackTop + index * unit, behavior: instant || preference.matches ? "instant" : "smooth" });
    }
    const resize = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
      introHeight = panels[0].offsetHeight;
      descriptionHeight = panels[1].offsetHeight;
      wordHeights = words.map(word => word.offsetHeight);
      unit = Math.max(window.innerHeight, height);
      // Sticky positioning needs scroll room in the parent's content box, not padding.
      track.style.setProperty("--stage-height", `${height}px`);
      track.style.setProperty("--scroll-distance", `${unit * TRACK_UNITS}px`);
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      // A deep link on first load lands in place (no scroll animation, so no morph) once the track is measured.
      if (!settled && !restoredNavigation) followHash(true);
      updateScroll();
      settled = true;
      paint();
      measureLetters();
      paint();
    });
    resize.observe(root);
    panels.forEach(panel => resize.observe(panel));
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sceneRef.current?.setVisible(visible);
      setBackgroundPaused(!visible || preference.matches || (destination === 1 && root.dataset.transitioning !== "true"));
    });
    visibility.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    function followHash(instant = false) {
      if (location.hash === "#description") navigate(1, instant);
      else if (location.hash === "#top") navigate(0, instant);
    }
    const hashChange = () => followHash();
    function anchorClick(event) {
      const link = event.target.closest('a[href="#description"], a[href="#top"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.replaceState(null, "", link.hash);
      navigate(link.hash === "#description" ? 1 : 0);
    }
    const preferenceChange = () => updateScroll();
    root.classList.add("scene-ready");
    paint();
    window.addEventListener("hashchange", hashChange);
    document.addEventListener("click", anchorClick);
    preference.addEventListener("change", preferenceChange);
    document.fonts.ready.then(() => repaintRef.current());
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("hashchange", hashChange);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("click", anchorClick);
      preference.removeEventListener("change", preferenceChange);
      repaintRef.current = () => {};
    };
  }, []);

  return (
    <div className="scene-scroll-track" ref={trackRef}>
    <section className="morph-scene" id="top" ref={rootRef} aria-label="Introduction">
      <span id="description" className="scene-anchor" aria-hidden="true" />
      <div className="scene-environment" aria-hidden="true">
        <Topography paused={backgroundPaused} color="#b9a0ff" brightness={0.8} opacity={0.65} speed={0.18} glow={0.4} dpr={1} />
      </div>
      <h1 className="scene-identity" aria-label="Justin Manuzon"><FloatingWord text="JUSTIN" towardEnd /><FloatingWord text="MANUZON" /></h1>
      <div className="scene-character" aria-hidden="true">
        <img className="mascot-poster" src={`${import.meta.env.BASE_URL}mascot/chick.webp`} alt="" width="720" height="720" />
      </div>
      <SceneCanvas ref={sceneRef} onReady={(ready) => { rootRef.current?.classList.toggle("scene-3d", ready); if (ready) repaintRef.current(); }} />
      <div className="scene-panel scene-panel-0" data-active={active === 0}>
        <p className="scene-label">01 / A PORTFOLIO IN PROGRESS · 2026</p>
        <p className="scene-description">{profile.tagline}</p>
        <div className="scene-actions"><a className="button dark" href="#work">Explore my work <span aria-hidden="true">↗</span></a><a className="button scene-button-ghost" href="#about">A little about me</a></div>
      </div>
      <div className="scene-panel scene-panel-1" data-active={active === 1}>
        <p className="scene-label">02 / IN SHORT</p>
        <h2>{description.tagline}</h2>
        <p className="scene-description">{description.copy}</p>
      </div>
      <div className="scene-bottom">
        <nav className="scene-social" aria-label="Social and contact links">{profile.links.map(link => <a href={link.href} key={link.label}><span className="scene-social-label">{link.label}</span> <span className="scene-social-arrow" aria-hidden="true">↗</span></a>)}</nav>
      </div>
    </section>
    </div>
  );
}
