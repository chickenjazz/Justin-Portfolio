import { useEffect } from "react";
import useReveal from "./components/useReveal.js";
import Intro from "./components/Intro.jsx";
import Header from "./components/sections/Header.jsx";
import HeroAbout from "./components/HeroAbout.jsx";
import Stats from "./components/sections/Stats.jsx";
import About from "./components/sections/About.jsx";
import Projects from "./components/sections/Projects.jsx";
import Skills from "./components/sections/Skills.jsx";
import Honors from "./components/sections/Honors.jsx";
import Gallery from "./components/sections/Gallery.jsx";
import Cta from "./components/sections/Cta.jsx";
import Footer from "./components/sections/Footer.jsx";

export default function App() {
  useReveal();

  // The sticky tracks size themselves after first paint, so the browser's own hash jump lands short.
  // Re-align once the layout has settled, unless the visitor has already started scrolling
  // or the browser is restoring a previous position (reload, back/forward).
  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    if (navType === "reload" || navType === "back_forward") return;
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* malformed escape: use the raw hash */ }
    const target = id && document.getElementById(id);
    if (!target || target.id === "top" || target.id === "description" || target.id === "contact") return;
    let cancelled = false;
    const events = ["wheel", "touchstart", "keydown"];
    const stop = () => events.forEach((name) => window.removeEventListener(name, cancel));
    function cancel() { cancelled = true; stop(); }
    events.forEach((name) => window.addEventListener(name, cancel, { passive: true }));
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!cancelled && Math.abs(target.getBoundingClientRect().top) > 2) target.scrollIntoView({ behavior: "instant" });
    })));
    return stop;
  }, []);

  return (
    <>
      <Intro />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <HeroAbout />
        <Stats />
        <About />
        <Projects />
        <Skills />
        <Honors />
        <Gallery />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
