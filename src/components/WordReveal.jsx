import { Children, cloneElement, isValidElement, useEffect, useRef } from "react";

function splitWords(children, counter) {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child).split(/(\s+)/).map((word, index) =>
        /\S/.test(word) ? (
          <span className="reveal-word" style={{ "--word-index": counter.value++ }} key={index}>{word}</span>
        ) : word,
      );
    }
    return isValidElement(child) && child.props.children
      ? cloneElement(child, {}, splitWords(child.props.children, counter))
      : child;
  });
}

export default function WordReveal({ as: Tag = "p", children, className = "", scrub = false, offset = 0, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer;
    const setup = () => {
      observer?.disconnect();
      element.classList.remove("words-ready", "words-visible");
      if (preference.matches) return;
      element.classList.add("words-ready");
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("words-visible");
        observer.disconnect();
      }, { threshold: 0.12 });
      observer.observe(element);
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", setup);
      element.classList.remove("words-ready", "words-visible");
    };
  }, [scrub]);

  return <Tag ref={ref} className={`word-reveal ${scrub ? "words-scrub" : ""} ${className}`} {...props}>{splitWords(children, { value: offset })}</Tag>;
}
