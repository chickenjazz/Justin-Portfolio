import WordReveal from "../WordReveal.jsx";
import { profile } from "../../content/site.js";

export default function Resume() {
  return (
    <section className="resume section" id="resume">
      <div className="wrap resume-inner">
        <p className="eyebrow">08 / THE NEXT STEP</p>
        <WordReveal as="h2">
          Let’s make
          <br />
          <em>something matter.</em>
        </WordReveal>
        <p>
          Interested in AI, cloud, or software engineering opportunities? Let’s
          connect.
        </p>
        <div className="actions">
          <a className="button dark" href={`mailto:${profile.email}`}>
            Get in touch ↗
          </a>
          <span className="placeholder">Resume PDF to be provided</span>
        </div>
      </div>
    </section>
  );
}
