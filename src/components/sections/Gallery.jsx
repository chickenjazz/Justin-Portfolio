import { gallery } from "../../content/site.js";

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
    <section className="milestones" id="milestones">
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
