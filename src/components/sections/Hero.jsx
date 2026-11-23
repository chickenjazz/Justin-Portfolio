import { profile } from "../../content/site.js";
import Mascot from "../Mascot.jsx";
import Topography from "../Topography.jsx";

export default function Hero({ backgroundPaused = false }) {
  return (
    <section className="hero wrap">
      <div className="hero-topography" aria-hidden="true">
        <Topography paused={backgroundPaused} color="#b9a0ff" brightness={0.8} opacity={0.65} speed={0.18} glow={0.4} dpr={1} />
      </div>
      <div className="hero-copy">
        <p className="eyebrow"><span className="dot" /> A PORTFOLIO IN PROGRESS · 2026</p>
        <h1 aria-label="Justin Manuzon">
          <span className="hero-first-name hero-name" aria-hidden="true">JUSTIN</span>
          <Mascot />
          <em className="hero-name" aria-hidden="true">MANUZON</em>
        </h1>
        <p className="intro">{profile.tagline}</p>
        <div className="actions">
          <a className="button dark" href="#work">Explore my work <span>↗</span></a>
          <a className="text-link" href="#about">A little about me ↓</a>
        </div>
      </div>
      <div className="hero-bottom">
        <span>PERSONAL PORTFOLIO / 01</span>
        <span>SCROLL TO EXPLORE ↓</span>
        <nav className="social-links" aria-label="Social and contact links">
          {profile.links.map((link) => <a key={link.label} href={link.href}>{link.label} ↗</a>)}
        </nav>
      </div>
    </section>
  );
}
