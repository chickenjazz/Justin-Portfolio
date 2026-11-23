import { useEffect, useRef } from "react";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import Mascot from "./Mascot.jsx";

const clamp = (value) => Math.max(0, Math.min(1, value));
const range = (value, start, end) => clamp((value - start) / (end - start));
const smooth = (value) => value * value * (3 - 2 * value);

export default function HeroAbout() {
  const ref = useRef(null);

  useEffect(() => {
    const story = ref.current;
    const stage = story.querySelector(".story-stage");
    const hero = story.querySelector(".hero");
    const about = story.querySelector(".about");
    const anchor = story.querySelector(".story-about-anchor");
    const mascot = story.querySelector(".story-mascot");
    const source = hero.querySelector(".mascot");
    const destination = about.querySelector(".mascot");
    const wordCount = about.querySelectorAll(".reveal-word").length;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const staticLayout = () => window.innerHeight <= 650 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let disposed = false;
    let geometry;
    let lastProgress = -1;
    let needsMeasure = true;

    const measure = () => {
      story.style.setProperty("--stage-height", `${window.innerHeight}px`);
      story.style.setProperty("--hero-shift", "0px");
      const height = Math.max(window.innerHeight, hero.scrollHeight, about.scrollHeight);
      const travel = window.innerHeight * (window.innerWidth <= 800 ? 1 : 1.35);
      story.style.setProperty("--stage-height", `${height}px`);
      story.style.setProperty("--story-travel", `${travel}px`);
      const stageBox = stage.getBoundingClientRect();
      const fromBox = source.getBoundingClientRect();
      const toBox = destination.getBoundingClientRect();
      const fromOrb = source.querySelector(".orb");
      const toOrb = destination.querySelector(".orb");
      geometry = {
        top: story.getBoundingClientRect().top + window.scrollY,
        travel,
        x: fromBox.left - stageBox.left + fromOrb.offsetLeft,
        y: fromBox.top - stageBox.top + fromOrb.offsetTop,
        endX: toBox.left - stageBox.left + toOrb.offsetLeft,
        endY: toBox.top - stageBox.top + toOrb.offsetTop,
        size: fromOrb.offsetWidth,
        endSize: toOrb.offsetWidth,
      };
      mascot.style.width = `${geometry.size}px`;
      needsMeasure = false;
      lastProgress = -1;
    };

    const update = () => {
      frame = 0;
      if (disposed || staticLayout()) return;
      if (needsMeasure) measure();
      const progress = clamp((window.scrollY - geometry.top) / geometry.travel);
      if (progress === lastProgress) return;
      lastProgress = progress;
      const morph = smooth(range(progress, 0.08, 0.8));
      const heroOpacity = 1 - smooth(range(progress, 0.05, 0.38));
      const background = smooth(range(progress, 0.2, 0.76));
      const scale = 1 + (geometry.endSize / geometry.size - 1) * morph;
      const x = geometry.x + (geometry.endX - geometry.x) * morph;
      const y = geometry.y + (geometry.endY - geometry.y) * morph;
      story.style.setProperty("--morph", morph);
      story.style.setProperty("--glass", smooth(range(progress, 0.3, 0.85)));
      story.style.setProperty("--hero-opacity", heroOpacity);
      story.style.setProperty("--paper-opacity", background);
      story.style.setProperty("--hero-shift", `${-36 * morph}px`);
      story.style.setProperty("--word-progress", range(progress, 0.53, 0.97) * (wordCount + 3));
      story.style.setProperty("--roundness", `${23 + Math.sin(morph * Math.PI) * 22}%`);
      mascot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      story.dataset.state = progress < 0.12 ? "hero" : progress < 0.8 ? "morphing" : "about";
      hero.inert = heroOpacity < 0.1;
      about.inert = progress < 0.53;
    };
    const schedule = () => {
      if (!frame && !staticLayout()) frame = requestAnimationFrame(update);
    };
    const resize = () => {
      if (story.classList.contains("story-enhanced") === staticLayout()) setup();
      needsMeasure = true;
      schedule();
    };
    const setup = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      story.classList.toggle("story-enhanced", !staticLayout());
      hero.inert = false;
      about.inert = false;
      if (staticLayout()) {
        anchor.removeAttribute("id");
        about.id = "about";
      } else {
        about.removeAttribute("id");
        anchor.id = "about";
        needsMeasure = true;
        update();
      }
    };
    setup();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    preference.addEventListener("change", setup);
    const observer = new ResizeObserver(resize);
    observer.observe(hero);
    observer.observe(about);
    const restoreAnchor = () => {
      if (disposed) return;
      needsMeasure = true;
      update();
      if (window.location.hash === "#about") document.getElementById("about")?.scrollIntoView({ behavior: "instant" });
    };
    document.fonts.ready.then(restoreAnchor);
    window.addEventListener("pageshow", resize);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", resize);
      preference.removeEventListener("change", setup);
      story.classList.remove("story-enhanced");
      hero.inert = false;
      about.inert = false;
      anchor.removeAttribute("id");
      about.id = "about";
    };
  }, []);

  return (
    <div className="hero-about-story" id="top" ref={ref}>
      <div className="story-about-anchor" aria-hidden="true" />
      <div className="story-stage">
        <div className="story-paper" aria-hidden="true" />
        <Hero />
        <About />
        <div className="story-mascot" aria-hidden="true"><Mascot className="morph-mascot" /></div>
      </div>
    </div>
  );
}
