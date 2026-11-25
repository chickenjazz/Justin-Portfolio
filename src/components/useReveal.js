import { useEffect } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Adds `motion-ready` to <html> and `is-revealed` to each [data-reveal] at 15% visibility.
export default function useReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const media = window.matchMedia(QUERY);
    let observer;

    const stop = () => {
      observer?.disconnect();
      observer = undefined;
    };
    const start = () => {
      stop();
      if (media.matches) {
        root.classList.remove("motion-ready");
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.15 },
      );
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => observer.observe(el));
      root.classList.add("motion-ready");
    };

    start();
    media.addEventListener("change", start);
    return () => {
      media.removeEventListener("change", start);
      stop();
    };
  }, []);
}
