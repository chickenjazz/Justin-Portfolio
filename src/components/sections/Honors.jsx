import Marquee from "../Marquee.jsx";
import { honors } from "../../content/site.js";

export default function Honors() {
  return (
    <section className="honors" id="honors">
      <h2 className="honors-title" data-reveal="rise">
        <span>Honors &amp;</span> <span className="honors-title-accent">Certifications</span>
      </h2>
      <Marquee label="Honors and certifications" speed={50} repeat={3} className="honors-band">
        {honors.map((h) => (
          <li key={h.title} className="honor-item">
            <article className={`honor-card${h.image ? " honor-card-image" : ""}`} tabIndex={0}>
              {h.image ? (
                <img
                  src={`${import.meta.env.BASE_URL}certificates/${h.image}`}
                  alt={`${h.title} certificate`}
                  loading="lazy"
                  width="340"
                  height="255"
                />
              ) : (
                <>
                  <p className="honor-kind">{h.kind}</p>
                  <h3>{h.title}</h3>
                  <p className="honor-meta">
                    {h.issuer} · {h.year}
                  </p>
                </>
              )}
            </article>
          </li>
        ))}
      </Marquee>
    </section>
  );
}
