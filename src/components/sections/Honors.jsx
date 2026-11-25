import { useCallback, useEffect, useRef, useState } from "react";
import { honors } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  { sprite: "cube-b", x: "92%", y: "12%", size: "clamp(80px, 10vw, 170px)", depth: 0.45, turn: 10 },
  // Drifts across the left end of the carousel, in front of the cards.
  { sprite: "sphere", x: "4%", y: "62%", size: "clamp(60px, 7vw, 120px)", depth: 0.85, layer: "front", mobile: false },
  // Crosses the bottom edge into Milestones.
  { sprite: "torus-a", x: "14%", y: "100%", size: "clamp(60px, 7vw, 120px)", depth: 0.3, fade: 0.85, turn: 18 },
];

// Prism coverflow geometry (Honors.css reads these through custom properties).
const CROP = 0.55; // neighbours show this fraction of the active card's width
const SCALE = 0.66; // neighbour height relative to the active card
const VISIBLE = 2; // neighbours shown on each side
const INTERVAL = 3000; // autoplay step, ms
const MOVING = 650; // how long the spectral dispersion lingers after a step, ms
const SWIPE = 40; // px of drag that counts as a step

const count = honors.length;
const wrap = (i) => ((i % count) + count) % count;
// Signed circular distance of slide i from the active slide.
const offsetOf = (i, active) => {
  const d = wrap(i - active);
  return d > count / 2 ? d - count : d;
};
const meta = (h) => [h.detail, h.issuer, h.detail ? null : h.year].filter(Boolean).join(" · ");
const imageSrc = (h) => `${import.meta.env.BASE_URL}honors/${h.image}`;
const pad = (v) => String(v).padStart(2, "0");

function slideStyle(d) {
  const a = Math.abs(d);
  const sign = Math.sign(d);
  return {
    // x = sign × (half the active card + whole neighbours before this one + half of this one + gaps)
    "--xw": a === 0 ? 0 : sign * (0.5 + (a - 0.5) * CROP * SCALE),
    "--xg": sign * a,
    "--s": a === 0 ? 1 : SCALE,
    "--crop": a === 0 ? "0%" : `${((1 - CROP) / 2) * 100}%`,
    zIndex: 10 - a,
  };
}

function Arrow({ flip }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={flip ? { scale: "-1 1" } : undefined}>
      <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Honors() {
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  // Only whether a drag is on goes through React; the offset itself is written straight to the
  // stage (--drag), so following the finger never re-renders the carousel.
  const [dragging, setDragging] = useState(false);
  const [held, setHeld] = useState(false); // pointer over or focus inside
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const pointer = useRef(null);
  const setDrag = (dx) => {
    stageRef.current?.style.setProperty("--drag", `${dx}px`);
    setDragging(dx !== 0);
  };
  const dragged = useRef(false);

  const step = useCallback((by) => {
    setMoving(true);
    setActive((current) => wrap(current + by));
  }, []);
  const goTo = (i) => step(offsetOf(i, active));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    io.observe(rootRef.current);
    return () => {
      mq.removeEventListener("change", sync);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!moving) return;
    const t = setTimeout(() => setMoving(false), MOVING);
    return () => clearTimeout(t);
  }, [moving, active]);

  // Autoplay: only while on screen, untouched, the tab is visible and motion is welcome.
  const playing = visible && !held && !reduced && !dragging;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (!document.hidden) step(1);
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [playing, active, step]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    pointer.current = { id: e.pointerId, x: e.clientX };
    dragged.current = false;
  };
  const onPointerMove = (e) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    if (!dragged.current && Math.abs(dx) > 6) {
      dragged.current = true;
      stageRef.current.setPointerCapture(e.pointerId);
    }
    if (dragged.current) setDrag(dx);
  };
  const onPointerEnd = (e) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;
    const dx = e.clientX - p.x;
    setDrag(0);
    if (!dragged.current || Math.abs(dx) < SWIPE) return;
    // One neighbour's visible width (plus gap) per step, at least one step.
    const card = stageRef.current.querySelector(".prism-slide")?.offsetWidth ?? 400;
    const pitch = card * CROP * SCALE + 16;
    step(-Math.sign(dx) * Math.max(1, Math.round(Math.abs(dx) / pitch)));
  };

  // Capture lost without a pointerup (window blur, element change): let the drag go back to
  // rest instead of leaving the cards held mid-drag.
  const onPointerLost = (e) => {
    if (pointer.current?.id !== e.pointerId) return;
    pointer.current = null;
    setDrag(0);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };

  return (
    <section className="honors has-backdrop" id="honors" ref={rootRef}>
      <BackdropShapes shapes={SHAPES} bleed />
      <h2 className="honors-title" data-reveal="rise">
        Honors &amp; <span className="honors-title-accent">Certifications</span>
      </h2>
      <div
        className={`honors-prism${moving ? " is-moving" : ""}${dragging ? " is-dragging" : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Honors and certifications"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
        onKeyDown={onKeyDown}
      >
        <div
          className="prism-stage"
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onLostPointerCapture={onPointerLost}
        >
          {honors.map((h, i) => {
            const d = offsetOf(i, active);
            const isActive = d === 0;
            const shown = Math.abs(d) <= VISIBLE;
            return (
              <div
                key={h.image}
                className={`prism-slide${isActive ? " is-active" : ""}${shown ? "" : " is-hidden"}`}
                style={slideStyle(d)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!isActive}
                onClick={() => {
                  if (!dragged.current && !isActive) goTo(i);
                }}
              >
                <div className="prism-face">
                  <img
                    className="prism-mono"
                    src={imageSrc(h)}
                    alt={isActive ? `${h.title}, ${meta(h)}` : ""}
                    loading={Math.abs(d) <= 1 ? "eager" : "lazy"}
                    decoding="async"
                    draggable="false"
                  />
                  <img className="prism-color" src={imageSrc(h)} alt="" aria-hidden="true" decoding="async" draggable="false" />
                  <span className="prism-sweep" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="prism-captions" aria-live={playing ? "off" : "polite"}>
          {honors.map((h, i) => (
            <div key={h.image} className={`prism-caption${i === active ? " is-active" : ""}`} aria-hidden={i !== active}>
              <p className="honor-kind">{h.kind}</p>
              <h3>{h.title}</h3>
              <p className="honor-meta">{meta(h)}</p>
            </div>
          ))}
        </div>

        <div className="prism-controls">
          <button type="button" className="prism-arrow" onClick={() => step(-1)} aria-label="Previous honor">
            <Arrow />
          </button>
          <p className="prism-count" aria-hidden="true">
            <span>{pad(active + 1)}</span> / {pad(count)}
          </p>
          <button type="button" className="prism-arrow" onClick={() => step(1)} aria-label="Next honor">
            <Arrow flip />
          </button>
        </div>
      </div>
    </section>
  );
}
