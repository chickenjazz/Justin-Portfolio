import { aboutStory, education } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  { sprite: "knot-b", x: "96%", y: "19%", size: "clamp(120px, 16vw, 260px)", depth: 0.6, turn: 8 },
  { sprite: "sphere", x: "3%", y: "88%", size: "clamp(54px, 6vw, 104px)", depth: 0.25, fade: 0.85 },
  { sprite: "cube-b", x: "46%", y: "6%", size: "clamp(40px, 4vw, 70px)", depth: 0.12, fade: 0.7, mobile: false },
];

export default function About() {
  return (
    <section className="about has-backdrop" id="about" aria-labelledby="about-label">
      <BackdropShapes shapes={SHAPES} />
      <div className="about-grid">
        <div className="about-portrait">
          <div className="about-disc parallax" style={{ "--depth": -0.15 }} aria-hidden="true" />
          <div className="parallax" style={{ "--depth": 0.25 }}>
            <img
              src={`${import.meta.env.BASE_URL}me/justin.webp`}
              alt="Portrait of Justin Manuzon"
              width="1080"
              height="1350"
              loading="lazy"
            />
          </div>
        </div>
        <div className="about-copy">
          <h2 className="eyebrow" id="about-label" data-reveal="fade">ABOUT</h2>
          <p className="about-story" data-reveal="rise" style={{ "--i": 1 }}>{aboutStory}</p>
          <p className="about-education" data-reveal="rise" style={{ "--i": 2 }}>
            {education.degree} · {education.institution} · Expected {education.graduation}
          </p>
        </div>
      </div>
    </section>
  );
}
