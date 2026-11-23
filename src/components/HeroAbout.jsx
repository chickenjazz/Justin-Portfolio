import { useEffect, useRef, useState } from "react";
import Mascot from "./Mascot.jsx";
import Topography from "./Topography.jsx";
import { profile, achievements, education, projects } from "../content/site.js";

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

const scenes = [
  { bg: [10, 9, 14], ink: [245, 242, 255], glass: 0, round: 23, turn: -8, hue: 0, light: 1, x: .51, y: .39, size: .145 },
  { bg: [255, 255, 255], ink: [0, 0, 0], glass: 1, round: 23, turn: 4, hue: 0, light: 0, x: .77, y: .44, size: .24 },
  { bg: [16, 37, 43], ink: [225, 250, 246], glass: .35, round: 44, turn: -18, hue: 65, light: .3, x: .27, y: .53, size: .25 },
  { bg: [234, 241, 244], ink: [15, 29, 37], glass: .85, round: 16, turn: 14, hue: 15, light: .15, x: .73, y: .44, size: .23 },
];

export default function HeroAbout() {
  const trackRef = useRef(null);
  const rootRef = useRef(null);
  const navigateRef = useRef(() => {});
  const [active, setActive] = useState(0);
  const [backgroundPaused, setBackgroundPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const mascot = root.querySelector(".scene-character");
    const identity = root.querySelector(".scene-identity");
    const panels = [...root.querySelectorAll(".scene-panel")];
    const objects = [...root.querySelectorAll(".scene-character .shape")];
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
    let disposed = false;
    const mix = (key) => scenes.reduce((sum, scene, i) => sum + scene[key] * weights[i], 0);
    const color = (key) => `rgb(${[0, 1, 2].map(channel => scenes.reduce((sum, scene, i) => sum + scene[key][channel] * weights[i], 0)).join(" ")})`;

    function paint() {
      const mobile = width <= 800;
      const first = weights[0];
      const size = mobile ? Math.min(width * (.24 + (1 - first) * .04), height * .17, 125) : Math.min(width * mix("size"), 360);
      const x = mobile ? width * (.5 + weights[1] * .12 - weights[2] * .1 + weights[3] * .1) : width * mix("x");
      const y = mobile ? Math.min(155, height * .25) : height * mix("y");
      root.style.backgroundColor = color("bg");
      root.style.color = color("ink");
      root.style.setProperty("--scene-light", mix("light"));
      mascot.style.setProperty("--glass", mix("glass"));
      mascot.style.setProperty("--roundness", `${mix("round")}%`);
      mascot.style.filter = `hue-rotate(${mix("hue")}deg)`;
      mascot.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) scale(${size / 180}) rotate(${mix("turn")}deg)`;
      // The identity remains the same DOM heading, moving from center stage to a signature.
      const titleX = mobile ? width * .07 : width * (.08 + first * .01);
      const titleY = mobile ? 24 : height * (.095 + first * .18);
      identity.style.transform = `translate3d(${titleX}px, ${titleY}px, 0) scale(${mobile ? .53 + first * .17 : .32 + first * .68}) rotate(${weights[2] * -3}deg)`;
      identity.style.width = `${mobile ? width * 1.3 : width * .84}px`;
      identity.style.setProperty("--name-gap", `${first * (mobile ? 0 : width * .21)}px`);
      panels.forEach((panel, i) => {
        const weight = weights[i];
        const displacement = weights.reduce((sum, amount, j) => sum + Math.sign(i - j) * amount, 0);
        const baseX = mobile ? width * .07 : width * (i === 2 ? .53 : .08);
        const baseY = mobile ? Math.min(255, height * .43) : height * (i === 0 ? .66 : i >= 2 ? .23 : .34);
        panel.style.maxHeight = `${Math.max(100, height - baseY - (mobile ? 125 : 95))}px`;
        const offset = displacement * (width + 80);
        panel.style.transform = `translate3d(${baseX + offset}px, ${baseY}px, 0) rotate(${displacement * 12}deg) scale(${.9 + weight * .1})`;
        panel.style.visibility = weight < .0001 ? "hidden" : "visible";
      });
      objects.forEach((object, i) => {
        const orbit = (weights[1] * 35 + weights[2] * 115 + weights[3] * 220) * Math.PI / 180;
        const angle = [-2.3, -.6, 2.3][i] + orbit;
        const radius = 124 + weights[2] * 14;
        object.style.transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) rotate(${orbit * 180 / Math.PI + i * 20}deg)`;
      });
    }

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
      unit = Math.max(window.innerHeight, height);
      // Sticky positioning needs scroll room in the parent's content box, not padding.
      track.style.setProperty("--stage-height", `${height}px`);
      track.style.setProperty("--scroll-distance", `${unit * TRACK_UNITS}px`);
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      updateScroll();
      settled = true;
      paint();
    });
    resize.observe(root);
    panels.forEach(panel => resize.observe(panel));
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
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
    document.fonts.ready.then(() => { if (!disposed) paint(); });
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
      <h1 className="scene-identity" aria-label="Justin Manuzon"><span>JUSTIN</span><span>MANUZON</span></h1>
      <div className="scene-character" aria-hidden="true"><Mascot className="scene-mascot" /></div>
      {slides.map((slide, index) => (
        <div className={`scene-panel scene-panel-${index}`} key={slide.label} id={`intro-panel-${index}`} aria-hidden={active !== index}>
          <p className="scene-label">{String(index + 1).padStart(2, "0")} / {index === 0 ? "A PORTFOLIO IN PROGRESS · 2026" : slide.label.toUpperCase()}</p>
          {slide.title && <h2>{slide.title}</h2>}
          {slide.copy && <p className="scene-description">{slide.copy}</p>}
          {index === 2 && <dl className="scene-milestones">{achievements.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd><p>{item.context}</p></div>)}</dl>}
          {index === 3 && <ol className="scene-timeline">
            <li><span>2024–2026 · ACADEMIC DISTINCTION</span><h3>Top Performing Student</h3><p>Five Dean’s List terms · {education.institution}</p></li>
            <li><span>PROJECT EXPERIENCE</span><h3>{projects.map(project => project.shortTitle).join(" · ")}</h3><p>Thesis AI system and client website development.</p></li>
            <li><span>EXPECTED · {education.graduation.toUpperCase()}</span><h3>{education.degree}</h3><p>{education.institution} · {education.specialization}</p></li>
          </ol>}
          {index === 0 && <div className="scene-actions"><a href="#work">Explore my work ↗</a><a href="#about">A little about me ↗</a></div>}
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
