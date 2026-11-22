import { useEffect } from "react";
import Header from "./components/sections/Header.jsx";
import Hero from "./components/sections/Hero.jsx";
import About from "./components/sections/About.jsx";
import Achievements from "./components/sections/Achievements.jsx";
import Projects from "./components/sections/Projects.jsx";
import Credentials from "./components/sections/Credentials.jsx";
import Skills from "./components/sections/Skills.jsx";
import Education from "./components/sections/Education.jsx";
import Gallery from "./components/sections/Gallery.jsx";
import Resume from "./components/sections/Resume.jsx";
import Footer from "./components/sections/Footer.jsx";

export default function App() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = document.querySelectorAll(
      ".section-head, .about-grid, .stats-grid, .showcase-heading, .credential-list, .skill-grid, .timeline, .gallery-grid, .resume-inner",
    );
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("scroll-reveal");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.05 });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Achievements />
        <Projects />
        <Credentials />
        <Skills />
        <Education />
        <Gallery />
        <Resume />
      </main>
      <Footer />
    </>
  );
}
