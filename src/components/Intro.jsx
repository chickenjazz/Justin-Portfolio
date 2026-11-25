import { useEffect, useState } from "react";
import { sceneReady } from "./sceneReady.js";

const CHICK_MS = 2300; // minimum hop: "JM" has drawn in and the chick has landed a few times
const MAX_MS = 7000; // never hold the page back longer than this, loaded or not
const FADE_MS = 700; // overlay fade-out (Intro.css .is-out)
const FALLBACK_MS = 3500; // CSS fade when JS never takes over (Intro.css)

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
const pageLoaded = () =>
  document.readyState === "complete"
    ? Promise.resolve()
    : new Promise((resolve) =>
        window.addEventListener("load", resolve, { once: true }),
      );

// Entry intro: the chick (line drawing) hops and blinks while "JM" draws in. It keeps
// hopping until the landing page is ready (fonts, images, the hero's 3D scene), for at
// least CHICK_MS and at most MAX_MS, then the overlay fades away to reveal the page.
// The chick part is pure CSS and prerendered, so it plays before JS; without JS the
// overlay fades out by itself.
export default function Intro() {
  // idle (prerendered) -> wait (JS holding) -> out (fading) -> done
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const now = performance.now();
    // Hydrated too late (the CSS fallback is already fading): just remove it.
    if (reduce || now > FALLBACK_MS - 300) {
      setPhase("done");
      return undefined;
    }
    setPhase("wait");
    let cancelled = false;
    const ready = Promise.all([
      wait(CHICK_MS - now),
      document.fonts.ready,
      pageLoaded(),
      sceneReady,
    ]);
    Promise.race([ready, wait(MAX_MS - now)]).then(() => {
      if (!cancelled) setPhase("out");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "out") return undefined;
    // Backstop in case transitionend never fires (tab hidden, style change).
    const timer = setTimeout(() => setPhase("done"), FADE_MS + 200);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;
  return (
    <div
      className={`site-intro${phase !== "idle" ? " site-intro--live" : ""}${phase === "out" ? " is-out" : ""}`}
      aria-hidden="true"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && phase === "out")
          setPhase("done");
      }}
    >
      <div className="site-intro-content">
        <svg className="site-intro-chick" viewBox="0 0 120 112">
          <g className="site-intro-hop">
            <ellipse
              className="site-intro-foot"
              cx="45"
              cy="95"
              rx="9"
              ry="7"
            />
            <ellipse
              className="site-intro-foot"
              cx="75"
              cy="95"
              rx="9"
              ry="7"
            />
            <path d="M20 64c-9 0-11 12-1 14" />
            <path d="M100 64c9 0 11 12 1 14" />
            <path d="M57 34c-11-4-15-12-12-17 6 1 11 8 13 16" />
            <path d="M59 34c-5-10-4-20 1-24 5 4 5 14 1 24" />
            <path d="M62 34c3-9 9-15 15-14 0 6-6 12-14 16" />
            <path
              className="site-intro-body"
              d="M18 82c0-30 18-48 42-48s42 18 42 48c0 6-4 9-10 9H28c-6 0-10-3-10-9Z"
            />
            <g className="site-intro-eyes">
              <ellipse cx="46" cy="66" rx="4.5" ry="6.5" />
              <ellipse cx="74" cy="66" rx="4.5" ry="6.5" />
            </g>
            <ellipse cx="60" cy="77" rx="3" ry="2" />
          </g>
        </svg>
        <span className="site-intro-shadow" />
        <svg className="site-intro-mark" viewBox="0 0 72 42">
          <path
            pathLength="1"
            d="M12 5h18M24 5v21c0 8-5 12-11 12-5 0-8-3-9-7"
          />
          <path pathLength="1" d="M38 38V5l14 20L66 5v33" />
        </svg>
      </div>
    </div>
  );
}
