import { useEffect, useRef, useState } from "react";
import SceneCanvas from "./SceneCanvas.jsx";
import Topography from "./Topography.jsx";
import GitHubActivity from "./GitHubActivity.jsx";
import { profile, achievements, milestonesQuote, education, projects } from "../content/site.js";

const slides = [
  { label: "Introduction", title: "", copy: profile.tagline },
  { label: "About me", title: "Curiosity, put into practice.", copy: profile.introduction },
  { label: "Milestones", title: "Progress worth remembering." },
  { label: "Education & experience", title: "Learning. Building. Growing." },
];

// Each row describes the same scene, not a separate rendered slide.
const MORPH_MS = 1100;
// A short scroll past a held state commits to its neighbour, as in a slideshow.
const COMMIT = .18;
const SETTLE_MS = 140;
// Three morph steps plus half a viewport of hold on the final state before release.
const TRACK_UNITS = 3.5;
// Space kept between the bottom of the chick and the Introduction's copy, in px.
const INTRO_GAP = 16;
// Highest the Milestones copy may rise, in px, so it stays clear of the site header.
const MILESTONES_TOP = 84;

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
// Introduction shapes that pop back in, crystal like the chick, on the second slide (desktop).
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
  { bg: [16, 37, 43], ink: [225, 250, 246], glass: .35, turn: -18, hue: 65, light: .3, x: .27, y: .53, size: .25, pitch: 0 },
  { bg: [234, 241, 244], ink: [15, 29, 37], glass: .85, turn: 14, hue: 15, light: .15, x: .73, y: .44, size: .23, pitch: 0 },
];

export default function HeroAbout() {
  const trackRef = useRef(null);
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const repaintRef = useRef(() => {});
  const navigateRef = useRef(() => {});
  const [active, setActive] = useState(0);
  const [backgroundPaused, setBackgroundPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const mascot = root.querySelector(".scene-character");
    const identity = root.querySelector(".scene-identity");
    const panels = [...root.querySelectorAll(".scene-panel")];
    const letterNodes = [...root.querySelectorAll(".scene-letter")];
    let letterLayout = [];
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const weights = [1, 0, 0, 0];
    const track = trackRef.current;
    let trackTop = 0;
    let unit = window.innerHeight;
    let destination = 0;
    let frame = 0;
    let scrollFrame = 0;
    let from = weights.slice();
    let tweenStart = 0;
    let duration = 0;
    let settled = false;
    let lastScroll = window.scrollY;
    let settleTimer = 0;
    let width = root.clientWidth;
    let height = root.clientHeight;
    let visible = true;
    let introHeight = 0;
    let milestonesHeight = 0;
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
      // The chick shrinks into nothing on the way to Milestones and stays gone after it.
      const presence = weights[0] + weights[1];
      let size = mobile ? Math.min(width * (.32 + depart * .04), height * .22, 165) : Math.min(width * mix("size"), 520);
      // While shrinking away it holds its place, so position blends only the scenes it is present in.
      const held = (key) => presence > 0 ? (scenes[0][key] * weights[0] + scenes[1][key] * weights[1]) / presence : scenes[1][key];
      const x = mobile ? width * (.5 + weights[1] * .12 - weights[2] * .1 + weights[3] * .1) : width * held("x");
      // The chick dips as it leaves the Introduction, as if the camera follows it down.
      let y = (mobile ? Math.min(155, height * .25) : height * held("y")) + Math.sin(Math.PI * depart) * height * .08;
      // The Introduction's copy never scrolls: it sits fully above the bottom bar, and the chick
      // rises (or, on short stages, shrinks) to stay clear of it.
      const introY = Math.min(mobile ? Math.min(255, height * .43) : height * .66, height - introHeight - (mobile ? 125 : 95));
      const clearance = introY - INTRO_GAP - (y + size / 2);
      if (clearance < 0) {
        const minTop = height * (mobile ? .12 : .08);
        const fitSize = Math.max(0, Math.min(size, introY - INTRO_GAP - minTop));
        const fitY = introY - INTRO_GAP - fitSize / 2;
        size += (fitSize - size) * first;
        y += (fitY - y) * first;
      }
      size *= presence;
      root.style.backgroundColor = color("bg");
      root.style.color = color("ink");
      root.style.setProperty("--scene-light", mix("light"));
      mascot.style.width = mascot.style.height = `${size}px`;
      mascot.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      // The DOM name stays in its Introduction layout and is left behind, rising away.
      const titleX = width * (mobile ? .07 : .05);
      const titleY = mobile ? 24 : height * .22;
      identity.style.transform = `translate3d(${titleX}px, ${titleY - lift}px, 0) scale(${mobile ? .7 : 1})`;
      identity.style.width = `${mobile ? width * 1.3 : width * .9}px`;
      identity.style.setProperty("--name-gap", `${mobile ? 0 : width * .04}px`);
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
          y: height * shape.y,
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
        const reserve = mobile ? 125 : 95;
        let baseY = i === 0 ? introY : mobile ? Math.min(255, height * .43) : height * (i >= 2 ? .23 : .34);
        // Milestones never scrolls either: it rises until it clears the bottom bar, but stays under the header.
        if (i === 2) baseY = Math.max(MILESTONES_TOP, Math.min(baseY, height - milestonesHeight - reserve));
        // On phones the chick has left by Education, so its copy starts under the header to fit the GitHub graph.
        if (i === 3 && mobile) baseY = MILESTONES_TOP;
        if (i === 1 || i === 3) panel.style.maxHeight = `${Math.max(100, height - baseY - reserve)}px`;
        // Later slides float up: they rise from below into place and leave upward.
        const vertical = i > 0;
        const offset = displacement * (width + 80);
        panel.style.transform = vertical
          ? `translate3d(${baseX}px, ${baseY + displacement * height * .6}px, 0) scale(${.9 + weight * .1})`
          : `translate3d(${baseX + offset}px, ${baseY}px, 0) rotate(${displacement * 12}deg) scale(${.9 + weight * .1})`;
        if (vertical) panel.style.opacity = weight;
        panel.style.visibility = weight < .0001 ? "hidden" : "visible";
      });
    }
    repaintRef.current = () => { if (!disposed) { measureLetters(); paint(); } };

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
      tweenStart = performance.now();
      // The first placement (e.g. reload mid-track) jumps instead of replaying the morph.
      duration = preference.matches || !settled ? 0 : MORPH_MS;
      destination = index;
      setActive(index);
      panels.forEach((panel, i) => { panel.inert = i !== index; });
      if (!frame) frame = requestAnimationFrame(settle);
    }
    function updateScroll() {
      const position = (window.scrollY - trackTop) / unit;
      const direction = Math.sign(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      // The state only advances in the direction of travel, so it never flickers back.
      let index = destination;
      if (!settled) index = Math.round(position);
      else if (direction > 0) index = Math.max(destination, Math.ceil(position - COMMIT));
      else if (direction < 0) index = Math.min(destination, Math.floor(position + COMMIT));
      goToState(Math.max(0, Math.min(3, index)));
    }
    // Once native scrolling rests between held states, glide to the committed one.
    function settleScroll() {
      settleTimer = 0;
      const position = (window.scrollY - trackTop) / unit;
      if (position <= 0 || position >= 3 || Math.abs(position - destination) < .01) return;
      window.scrollTo({ top: trackTop + destination * unit, behavior: preference.matches ? "instant" : "smooth" });
    }
    function schedule() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateScroll(); });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settleScroll, SETTLE_MS);
    }
    function navigate(index) {
      if (index < 0 || index >= slides.length) return;
      window.scrollTo({ top: trackTop + index * unit, behavior: preference.matches ? "instant" : "smooth" });
    }
    navigateRef.current = navigate;
    const resize = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
      introHeight = panels[0].offsetHeight;
      milestonesHeight = panels[2].offsetHeight;
      unit = Math.max(window.innerHeight, height);
      // Sticky positioning needs scroll room in the parent's content box, not padding.
      track.style.setProperty("--stage-height", `${height}px`);
      track.style.setProperty("--scroll-distance", `${unit * TRACK_UNITS}px`);
      trackTop = track.getBoundingClientRect().top + window.scrollY;
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
    function followHash() {
      if (location.hash === "#about") navigate(1);
      else if (location.hash === "#achievements") navigate(2);
      else if (location.hash === "#education") navigate(3);
      else if (location.hash === "#top") navigate(0);
    }
    function anchorClick(event) {
      const link = event.target.closest('a[href="#about"], a[href="#top"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.replaceState(null, "", link.hash);
      navigate(link.hash === "#about" ? 1 : 0);
    }
    const preferenceChange = () => updateScroll();
    root.classList.add("scene-ready");
    paint();
    panels.forEach((panel, i) => { panel.inert = i !== 0; });
    requestAnimationFrame(() => { if (!disposed) followHash(); });
    window.addEventListener("hashchange", followHash);
    document.addEventListener("click", anchorClick);
    preference.addEventListener("change", preferenceChange);
    document.fonts.ready.then(() => repaintRef.current());
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      clearTimeout(settleTimer);
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("click", anchorClick);
      preference.removeEventListener("change", preferenceChange);
      navigateRef.current = () => {};
      repaintRef.current = () => {};
    };
  }, []);

  function goTo(index) { navigateRef.current(index); }
  return (
    <div className="scene-scroll-track" ref={trackRef}>
    <section className="morph-scene" id="top" ref={rootRef} aria-label="About Justin" aria-roledescription="slideshow">
      <span id="achievements" className="scene-anchor" aria-hidden="true" />
      <span id="education" className="scene-anchor" aria-hidden="true" />
      <span id="about" className="scene-anchor" aria-hidden="true" />
      <div className="scene-environment" aria-hidden="true">
        <Topography paused={backgroundPaused} color="#b9a0ff" brightness={0.8} opacity={0.65} speed={0.18} glow={0.4} dpr={1} />
      </div>
      <h1 className="scene-identity" aria-label="Justin Manuzon"><FloatingWord text="JUSTIN" towardEnd /><FloatingWord text="MANUZON" /></h1>
      <div className="scene-character" aria-hidden="true">
        <img className="mascot-poster" src={`${import.meta.env.BASE_URL}mascot/chick.webp`} alt="" width="720" height="720" />
      </div>
      <SceneCanvas ref={sceneRef} onReady={(ready) => { rootRef.current?.classList.toggle("scene-3d", ready); if (ready) repaintRef.current(); }} />
      {slides.map((slide, index) => (
        <div className={`scene-panel scene-panel-${index}`} key={slide.label} id={`intro-panel-${index}`} aria-hidden={active !== index}>
          <p className="scene-label">{String(index + 1).padStart(2, "0")} / {index === 0 ? "A PORTFOLIO IN PROGRESS · 2026" : slide.label.toUpperCase()}</p>
          {slide.title && <h2>{slide.title}</h2>}
          {slide.copy && <p className="scene-description">{slide.copy}</p>}
          {index === 2 && <blockquote className="scene-quote"><p>“{milestonesQuote.text}”</p>{milestonesQuote.cite && <cite>{milestonesQuote.cite}</cite>}</blockquote>}
          {index === 2 && <dl className="scene-milestones">{achievements.map(item => <div key={item.label}><dt>{item.label}</dt><dd className="milestone-value">{String(item.value).padStart(2, "0")}</dd></div>)}</dl>}
          {index === 3 && <ol className="scene-timeline">
            <li><span>2024–2026 · ACADEMIC DISTINCTION</span><h3>Top Performing Student</h3><p>Five Dean’s List terms · {education.institution}</p></li>
            <li><span>PROJECT EXPERIENCE</span><h3>{projects.map(project => project.shortTitle).join(" · ")}</h3><p>Thesis AI system and client website development.</p></li>
            <li><span>EXPECTED · {education.graduation.toUpperCase()}</span><h3>{education.degree}</h3><p>{education.institution} · {education.specialization}</p></li>
          </ol>}
          {index === 3 && <GitHubActivity user={profile.github} href={`https://github.com/${profile.github}`} />}
          {index === 0 && <div className="scene-actions"><a className="button dark" href="#work">Explore my work <span aria-hidden="true">↗</span></a><a className="button scene-button-ghost" href="#about">A little about me</a></div>}
        </div>
      ))}
      <div className="scene-bottom">
        <nav className="scene-dots" aria-label="Choose introduction slide" onKeyDown={event => {
          const key = event.key;
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
          event.preventDefault();
          const next = key === "Home" ? 0 : key === "End" ? 3 : (active + (key === "ArrowRight" ? 1 : 3)) % 4;
          goTo(next);
          event.currentTarget.querySelectorAll("button")[next].focus();
        }}>
          {slides.map((slide, index) => <button key={slide.label} type="button" aria-label={`Slide ${index + 1}: ${slide.label}`} aria-controls={`intro-panel-${index}`} aria-current={active === index ? "true" : undefined} onClick={() => goTo(index)}><span /></button>)}
        </nav>
        <span className="scene-count" aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} / 04 · {slides[active].label}</span>
        <nav className="scene-social" aria-label="Social and contact links">{profile.links.map(link => <a href={link.href} key={link.label}>{link.label} ↗</a>)}</nav>
      </div>
    </section>
    </div>
  );
}
