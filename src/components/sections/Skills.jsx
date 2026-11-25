import { skills, skillIcons } from "../../content/site.js";
import { icons } from "../../content/icons.js";
import BackdropShapes from "../BackdropShapes.jsx";
import TiltedTiles from "../TiltedTiles.jsx";

const SHAPES = [
  // Floats in the dark-to-white seam under the project stack.
  { sprite: "torus-b", x: "91%", y: "11%", size: "clamp(120px, 17vw, 280px)", depth: 0.55, turn: -6 },
  { sprite: "knot-a", x: "6%", y: "34%", size: "clamp(80px, 10vw, 170px)", depth: 0.85, layer: "front", mobile: false },
  // Crosses the bottom edge into Honors.
  { sprite: "knot-b", x: "36%", y: "103%", size: "clamp(64px, 7vw, 120px)", depth: 0.25, fade: 0.85, turn: 12 },
];

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function Skills() {
  return (
    <section className="skills has-backdrop" id="skills">
      <BackdropShapes shapes={SHAPES} bleed />
      <div className="skills-head parallax" data-reveal="rise" style={{ "--depth": 0.2 }}>
        <h2 className="skills-title">SKILLS</h2>
      </div>
      <ul className="skill-icons" aria-label="Tech stack">
        {skillIcons.map(({ name, blurb, icon }, i) => (
          <li key={name} className="skill-icon" data-reveal="scale" style={{ "--i": i }}>
            <span className="skill-icon-face" tabIndex={0} aria-describedby={`tip-${slug(name)}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={icons[icon]} fill="currentColor" />
              </svg>
              <span className="visually-hidden">{name}</span>
            </span>
            <span className="skill-tip" role="tooltip" id={`tip-${slug(name)}`}>
              <strong>{name}</strong>
              {blurb}
            </span>
          </li>
        ))}
      </ul>
      <div className="skills-wall">
        <TiltedTiles
          className="skills-tiles"
          items={skills}
          renderTile={(s) => (
            <>
              <span className="tile-eyebrow">
                {String(skills.indexOf(s) + 1).padStart(2, "0")} · {s.items.length} skills
              </span>
              <h3>{s.category}</h3>
              <p>{s.items.join(" · ")}</p>
            </>
          )}
        />
      </div>
      {/* The tile wall is decorative; this list carries the categories for assistive tech. */}
      <ul className="visually-hidden" aria-label="Skills by category">
        {skills.map((s) => (
          <li key={s.category}>
            <h3>{s.category}</h3>
            <p>{s.items.join(", ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
