import { profile } from "../../content/site.js";
import Topography from "../Topography.jsx";

export default function Hero() {
  return (
    <section className="hero wrap" id="top">
      <div className="hero-topography" aria-hidden="true">
        <Topography color="#b9a0ff" brightness={0.8} opacity={0.65} speed={0.18} glow={0.4} dpr={1} />
      </div>
      <div className="hero-copy">
        <p className="eyebrow"><span className="dot" /> A PORTFOLIO IN PROGRESS · 2026</p>
        <h1 aria-label="Justin Manuzon">
          <span className="hero-first-name">JUSTIN</span>
          <span className="hero-art" aria-hidden="true">
            <span className="orb">
              <span className="eye eye-a" />
              <span className="eye eye-b" />
              <span className="mouth" />
              <span className="chick-feet" />
            </span>
            <span className="shape cube">✳</span>
            <span className="shape ring" />
            <span className="shape square" />
          </span>
          <em>MANUZON</em>
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
