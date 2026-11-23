import WordReveal from "../WordReveal.jsx";
import { projects, skills } from "../../content/site.js";

export default function Skills() {
  return (
    <section className="skills section" id="skills">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">05 / THE TOOLKIT</p>
          <WordReveal as="h2">
            Skills, in
            <br />
            <em>context.</em>
          </WordReveal>
          <p>Tools and technologies used across my projects.</p>
        </div>
        <div className="skill-grid">
          {skills.map((s, i) => (
            <div key={s.category}>
              <span>0{i + 1} /</span>
              <h3>{s.category}</h3>
              <ul>
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {s.note && <p>{s.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
