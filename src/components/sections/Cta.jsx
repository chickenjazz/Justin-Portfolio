import { cta, profile } from "../../content/site.js";

const base = import.meta.env.BASE_URL;

export default function Cta() {
  return (
    <section className="cta" id="contact">
      <div className="cta-inner">
        <div className="cta-mascot" data-reveal="scale">
          <div className="cta-float">
            <img src={`${base}mascot/chick.webp`} alt="" width="720" height="720" />
          </div>
        </div>
        <blockquote className="cta-quote" data-reveal="rise" style={{ "--i": 1 }}>
          {cta.quote}
        </blockquote>
        <div className="cta-actions" data-reveal="rise" style={{ "--i": 2 }}>
          <a className="button dark" href={`${base}resume.pdf`} target="_blank" rel="noopener">
            {cta.resumeLabel} ↗
          </a>
          <a className="button" href={`mailto:${profile.email}`}>
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
