import Marquee from "../Marquee.jsx";
import { honors } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  { sprite: "cube-b", x: "92%", y: "16%", size: "clamp(80px, 10vw, 170px)", depth: 0.45, turn: 10 },
  { sprite: "sphere", x: "5%", y: "90%", size: "clamp(50px, 5.5vw, 96px)", depth: 0.2, fade: 0.85 },
  { sprite: "torus-a", x: "70%", y: "4%", size: "clamp(36px, 3.5vw, 62px)", depth: 0.1, fade: 0.7, mobile: false },
];

export default function Honors() {
  return (
    <section className="honors has-backdrop" id="honors">
      <BackdropShapes shapes={SHAPES} />
      <h2 className="honors-title" data-reveal="rise">
        <span>Honors &amp;</span> <span className="honors-title-accent">Certifications</span>
      </h2>
      <Marquee label="Honors and certifications" speed={50} repeat={3} className="honors-band">
        {honors.map((h) => (
          <li key={h.title} className="honor-item">
            <article className={`honor-card${h.image ? " honor-card-image" : ""}`} tabIndex={0}>
              {h.image ? (
                <img
                  src={`${import.meta.env.BASE_URL}certificates/${h.image}`}
                  alt={`${h.title} certificate`}
                  loading="lazy"
                  width="340"
                  height="255"
                />
              ) : (
                <>
                  <p className="honor-kind">{h.kind}</p>
                  <h3>{h.title}</h3>
                  <p className="honor-meta">
                    {h.issuer} · {h.year}
                  </p>
                </>
              )}
            </article>
          </li>
        ))}
      </Marquee>
    </section>
  );
}
