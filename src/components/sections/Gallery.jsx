import { gallery } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  { sprite: "torus-b", x: "95%", y: "22%", size: "clamp(80px, 10vw, 170px)", depth: 0.5, turn: 14 },
  { sprite: "knot-a", x: "3%", y: "86%", size: "clamp(90px, 11vw, 180px)", depth: 0.4, turn: -10 },
  { sprite: "cube-a", x: "30%", y: "8%", size: "clamp(36px, 3.5vw, 62px)", depth: 0.12, fade: 0.7, mobile: false },
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
      <BackdropShapes shapes={SHAPES} />
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
