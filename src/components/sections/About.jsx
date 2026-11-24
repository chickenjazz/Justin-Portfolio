import { aboutStory, education } from "../../content/site.js";

export default function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-label">
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
          <p className="eyebrow" id="about-label" data-reveal="fade">ABOUT</p>
          <p className="about-story" data-reveal="rise" style={{ "--i": 1 }}>{aboutStory}</p>
          <p className="about-education" data-reveal="rise" style={{ "--i": 2 }}>
            {education.degree} · {education.institution} · Expected {education.graduation}
          </p>
        </div>
      </div>
    </section>
  );
}
