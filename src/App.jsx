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
