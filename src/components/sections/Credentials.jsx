import WordReveal from "../WordReveal.jsx";
import { credentials } from "../../content/site.js";

export default function Credentials() {
  return (
    <section className="credentials section wrap" id="credentials">
      <div className="section-head">
        <p className="eyebrow">04 / CREDENTIALS</p>
        <WordReveal as="h2">
          Always
          <br />
          <em>learning.</em>
        </WordReveal>
      </div>
      <div className="credential-list">
        {credentials.map((c) => (
          <div key={c.title}>
            <span>
              {c.issuer} / {c.year}
            </span>
            <h3>{c.title}</h3>
          </div>
        ))}
        <p className="placeholder">
          Credential badges and verification links to be provided.
        </p>
      </div>
    </section>
  );
}
