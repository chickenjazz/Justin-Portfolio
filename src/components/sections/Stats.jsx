import { useRef } from "react";
import CountUp from "../CountUp.jsx";
import useInView from "../useInView.js";
import { stats } from "../../content/site.js";

const DEPTHS = [0.15, 0.3, 0.2, 0.35];

export default function Stats() {
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, threshold: 0.4 });
  return (
    <section id="stats" className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="visually-hidden">
        Highlights
      </h2>
      <div className="stats-grid" ref={gridRef}>
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
