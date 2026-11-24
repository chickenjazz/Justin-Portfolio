import { useEffect, useRef, useState } from "react";
import HoloMosaic from "./HoloMosaic.jsx";

const CHICK_MS = 2300; // chick hop + "JM" draw, measured from first paint
const HOLD_MS = 250; // pause on the full mosaic before it flips out
const FALLBACK_MS = 3500; // CSS fade when JS/WebGL never takes over (Intro.css)

// Entry intro: the chick (line drawing) hops and blinks while "JM" draws in. Then
// HoloMosaic tiles flip in over it from the centre, and flip back out (edges first)
// to reveal the landing page. The chick part is pure CSS and prerendered, so it plays
// before JS; without JS or WebGL the overlay fades out by itself.
export default function Intro() {
  // idle (prerendered) → chick → in (mosaic flips in) → hold → out (flips out) → done
  const [phase, setPhase] = useState("idle");
  const timerRef = useRef(0);

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
    setPhase("chick");
    timerRef.current = setTimeout(
      () => setPhase("in"),
      Math.max(0, CHICK_MS - now),
    );
    return () => clearTimeout(timerRef.current);
  }, []);

  if (phase === "done") return null;
  const live = phase !== "idle";
  const mosaic = phase === "in" || phase === "hold" || phase === "out";
  const covered = phase === "hold" || phase === "out";
  return (
    <div
      className={`site-intro${live ? " site-intro--live" : ""}${covered ? " is-covered" : ""}${phase === "out" ? " is-out" : ""}`}
      aria-hidden="true"
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
      {mosaic && (
        <HoloMosaic
          className="site-intro-mosaic"
          color="#0a090e"
          metalColor="#e8ebf1"
          spectrum="full"
          tileSize={1}
          gap={0.08}
          scatter={0.3}
          tilt={0.35}
          saturation={0.1}
          intensity={1.25}
          ripple={0.6}
          glitter={0.85}
          sheen={0.8}
          grain={0.08}
          speed={0.5}
          intro
          introSpeed={2}
          outro={phase === "out"}
          mouseInteraction={false}
          flipOnClick={false}
          onIntroEnd={() => {
            setPhase("hold");
            timerRef.current = setTimeout(() => setPhase("out"), HOLD_MS);
          }}
          onOutroEnd={() => setPhase("done")}
          onFail={() => setPhase("done")}
        />
      )}
    </div>
  );
}
