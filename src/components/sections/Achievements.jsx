import { achievements } from "../../content/site.js";

export default function Achievements() {
  return (
    <section className="stats section" id="achievements">
      <div className="wrap">
        <div className="section-head light">
          <p className="eyebrow">02 / THE MILESTONES</p>
          <h2>
            Progress worth
            <br />
            <em>remembering.</em>
          </h2>
          <p>Meaningful milestones, backed by real information.</p>
        </div>
        <div className="stats-grid">
          {achievements.map((a, i) => (
            <div key={a.label}>
              <span
                className={`stat-num ${a.value.length > 3 ? "stat-range" : ""}`}
              >
                {a.value}
                <small>0{i + 1}</small>
              </span>
              <h3>{a.label}</h3>
              <p>{a.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
