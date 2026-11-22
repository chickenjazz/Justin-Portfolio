import { education } from "../../content/site.js";

export default function Education() {
  return (
    <section className="education section wrap" id="education">
      <div className="section-head">
        <p className="eyebrow">06 / EDUCATION</p>
        <h2>
          Foundations
          <br />
          <em>for what’s next.</em>
        </h2>
      </div>
      <div className="timeline">
        <div className="timeline-dot" />
        <p className="eyebrow">
          EXPECTED GRADUATION / {education.graduation.toUpperCase()}
        </p>
        <h3>{education.institution}</h3>
        <p>
          {education.degree}
          <br />
          Specializing in {education.specialization}
        </p>
        <ul>
          {education.distinctions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
