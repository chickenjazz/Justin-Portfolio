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
  // Re-align once the layout has settled, unless the visitor has already started scrolling.
  useEffect(() => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target || target.id === "top" || target.id === "description") return;
    let cancelled = false;
    const cancel = () => { cancelled = true; };
    const events = ["wheel", "touchstart", "keydown"];
    events.forEach((name) => window.addEventListener(name, cancel, { once: true, passive: true }));
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!cancelled && Math.abs(target.getBoundingClientRect().top) > 2) target.scrollIntoView({ behavior: "instant" });
    })));
    return () => events.forEach((name) => window.removeEventListener(name, cancel));
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
