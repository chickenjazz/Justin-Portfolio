import { cta, profile } from "../../content/site.js";
import BackdropShapes from "../BackdropShapes.jsx";

const SHAPES = [
  { sprite: "knot-b", x: "16%", y: "28%", size: "clamp(80px, 11vw, 190px)", depth: 0.45, turn: -8 },
  { sprite: "torus-a", x: "86%", y: "64%", mx: "88%", my: "12%", size: "clamp(90px, 12vw, 200px)", depth: 0.4, turn: 20 },
  { sprite: "cube-b", x: "78%", y: "16%", size: "clamp(44px, 4.5vw, 80px)", depth: 0.2, fade: 0.8, mobile: false },
  { sprite: "sphere", x: "24%", y: "82%", size: "clamp(36px, 3.5vw, 62px)", depth: 0.12, fade: 0.7, mobile: false },
];

const base = import.meta.env.BASE_URL;

export default function Cta() {
  return (
    <section className="cta has-backdrop" id="contact" aria-labelledby="contact-title">
      <BackdropShapes shapes={SHAPES} />
      <h2 id="contact-title" className="visually-hidden">
        Get in touch
      </h2>
      <div className="cta-inner">
        <div className="cta-mascot" data-reveal="scale">
          <div className="cta-float">
            <img src={`${base}mascot/chick.webp`} alt="" width="720" height="720" />
          </div>
        </div>
        <blockquote className="cta-quote" data-reveal="rise" style={{ "--i": 1 }}>
          {cta.quote}
        </blockquote>
        <div className="cta-actions" data-reveal="rise" style={{ "--i": 2 }}>
          <a className="button cta-primary" href={`${base}resume.pdf`} target="_blank" rel="noopener">
            {cta.resumeLabel} ↗
          </a>
          <a className="button cta-secondary" href={`mailto:${profile.email}`}>
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
