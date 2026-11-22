import { profile } from "../../content/site.js";
import Mascot from "../Mascot.jsx";
import Topography from "../Topography.jsx";
import WordReveal from "../WordReveal.jsx";

export default function Hero() {
  return (
    <section className="hero wrap">
      <div className="hero-topography" aria-hidden="true">
        <Topography color="#b9a0ff" brightness={0.8} opacity={0.65} speed={0.18} glow={0.4} dpr={1} />
      </div>
      <div className="hero-copy">
        <WordReveal className="eyebrow"><span className="dot" /> A PORTFOLIO IN PROGRESS · 2026</WordReveal>
        <h1 aria-label="Justin Manuzon">
          <span className="hero-first-name hero-name" aria-hidden="true">{"JUSTIN".split("").map((letter, index) => <span className="hero-letter" style={{ "--letter-index": index, "--letter-curve": Math.pow(index - 2.5, 2) }} key={index}>{letter}</span>)}</span>
          <Mascot />
          <em className="hero-name" aria-hidden="true">{"MANUZON".split("").map((letter, index) => <span className="hero-letter" style={{ "--letter-index": index, "--letter-curve": Math.pow(index - 3, 2) }} key={index}>{letter}</span>)}</em>
        </h1>
        <WordReveal className="intro">{profile.tagline}</WordReveal>
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
