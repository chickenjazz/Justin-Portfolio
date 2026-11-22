import { profile } from "../../content/site.js";
import Mascot from "../Mascot.jsx";
import WordReveal from "../WordReveal.jsx";

export default function About() {
  return (
    <section className="about about-slide" id="about" aria-label="About Justin">
      <div className="about-copy">
        <WordReveal className="about-label" scrub>01 / ABOUT ME</WordReveal>
        <WordReveal as="h2" className="about-title" scrub offset={4}>Curiosity, put<br />into practice.</WordReveal>
        <WordReveal className="about-statement" scrub offset={8}>{profile.introduction}</WordReveal>
      </div>
      <Mascot className="about-mascot" />
    </section>
  );
}
