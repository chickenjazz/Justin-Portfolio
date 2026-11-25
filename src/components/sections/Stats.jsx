import { useRef } from "react";
import CountUp from "../CountUp.jsx";
import useInView from "../useInView.js";
import { stats } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  { sprite: "torus-a", x: "3%", y: "80%", size: "clamp(90px, 11vw, 190px)", depth: 0.5, turn: -12 },
  { sprite: "cube-a", x: "97%", y: "80%", size: "clamp(64px, 7vw, 120px)", depth: 0.7, layer: "front", mobile: false },
  { sprite: "sphere", x: "52%", y: "102%", size: "clamp(36px, 3.5vw, 60px)", depth: 0.15, fade: 0.7, mobile: false },
];

const DEPTHS = [0.15, 0.3, 0.2, 0.35];

export default function Stats() {
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, threshold: 0.4 });
  return (
    <section id="stats" className="stats has-backdrop" aria-labelledby="stats-title">
      <BackdropShapes shapes={SHAPES} bleed />
      <h2 id="stats-title" className="visually-hidden">
        Highlights
      </h2>
      <div className="stat-grid" ref={gridRef}>
        {stats.map((stat, i) => (
          <article
            key={stat.title}
            className="stat-card parallax"
            data-reveal="rise"
            style={{ "--i": i, "--depth": DEPTHS[i % DEPTHS.length] }}
          >
            <p className="stat-value">
              <CountUp to={stat.value} play={inView} delay={i * 90} />
            </p>
            <p className="stat-title">{stat.title}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
