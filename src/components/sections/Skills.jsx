import Marquee from "../Marquee.jsx";
import { skills, skillIcons } from "../../content/site.js";
import { icons } from "../../content/icons.js";

export default function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="skills-head parallax" data-reveal="rise" style={{ "--depth": 0.2 }}>
        <h2 className="skills-title">SKILLS</h2>
      </div>
      <ul className="skill-icons">
        {skillIcons.map(({ name, icon }, i) => (
          <li key={name} className="skill-icon" title={name} data-reveal="scale" style={{ "--i": i }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={icons[icon]} fill="currentColor" />
            </svg>
            <span className="visually-hidden">{name}</span>
          </li>
        ))}
      </ul>
      <div className="skills-bands">
        <Marquee label="Skills by category" slant={-4} speed={45} className="skills-front">
          {skills.map((s) => (
            <li key={s.category} className="skill-block">
              <h3>{s.category}</h3>
              <p>{s.items.join(" · ")}</p>
            </li>
          ))}
        </Marquee>
        <Marquee decorative slant={3} reverse speed={60} className="skills-back">
          {skills.map((s) => (
            <li key={s.category} className="skill-word">
              {s.category}
            </li>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
