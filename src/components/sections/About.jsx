import { profile } from "../../content/site.js";

export default function About() {
  return (
    <section className="about section wrap" id="about">
      <div className="section-head">
        <p className="eyebrow">01 / THE PERSON</p>
        <h2>
          Curious by nature.
          <br />
          <em>Builder by choice.</em>
        </h2>
      </div>
      <div className="about-grid">
        <div className="big-number">✳</div>
        <div>
          <p className="lead">Software engineering meets AI and cloud.</p>
          <p className="muted">{profile.introduction}</p>
          <p className="muted">{profile.experience}</p>
          <p className="muted">{profile.approach}</p>
          <div className="mini-grid">
            <div>
              <span>01</span>
              <h3>Areas of interest</h3>
              <ul>
                {profile.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </div>
            <div>
              <span>02</span>
              <h3>Target roles</h3>
              <ul>
                {profile.roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
