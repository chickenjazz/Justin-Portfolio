import { profile } from "../../content/site.js";
import Mascot from "../Mascot.jsx";

export default function About() {
  return (
    <section className="about about-slide" id="about" aria-label="About Justin">
      <div className="about-copy">
        <p className="about-label">01 / ABOUT ME</p>
        <h2 className="about-title">Curiosity, put<br />into practice.</h2>
        <p className="about-statement">{profile.introduction}</p>
      </div>
      <Mascot className="about-mascot" />
    </section>
  );
}
