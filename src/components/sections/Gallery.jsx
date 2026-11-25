import { gallery } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  // Reaches up from Honors' side of the seam.
  { sprite: "cube-a", x: "68%", y: "1%", size: "clamp(40px, 4vw, 72px)", depth: 0.15, fade: 0.75, mobile: false },
  // Drifts over the right-hand frames.
  { sprite: "torus-b", x: "95%", y: "58%", size: "clamp(90px, 11vw, 190px)", depth: 0.8, turn: 14, layer: "front", mobile: false },
  { sprite: "knot-a", x: "3%", y: "86%", size: "clamp(90px, 11vw, 180px)", depth: 0.4, turn: -10 },
];

const frames = [
  { rotate: -4, depth: 0.12 },
  { rotate: 3, depth: -0.08 },
  { rotate: -2, depth: 0.18 },
  { rotate: 5, depth: -0.14 },
  { rotate: -3, depth: 0.1 },
];

export default function Gallery() {
  const hasImages = gallery.length > 0;
  return (
    <section className="milestones has-backdrop" id="milestones">
      <BackdropShapes shapes={SHAPES} bleed />
      <div className="milestones-inner">
        <h2 data-reveal="rise">Moments &amp; milestones</h2>
        <p className="milestones-sub" data-reveal="rise" style={{ "--i": 1 }}>
          The people, places and firsts behind the work — gallery coming soon.
        </p>
        <ul className="milestones-row" data-reveal="fade" style={{ "--i": 2 }}>
          {hasImages
            ? gallery.map((g, i) => {
                const f = frames[i % frames.length];
                return (
                  <li
                    key={g.src}
                    className="milestone-frame milestone-photo parallax"
                    style={{ rotate: `${f.rotate}deg`, "--depth": f.depth }}
                  >
                    <img src={g.src} alt={g.alt} loading="lazy" />
                  </li>
                );
              })
            : frames.map((f, i) => (
                <li
                  key={i}
                  className="milestone-frame parallax"
                  aria-hidden="true"
                  style={{ rotate: `${f.rotate}deg`, "--depth": f.depth }}
                />
              ))}
        </ul>
      </div>
    </section>
  );
}
