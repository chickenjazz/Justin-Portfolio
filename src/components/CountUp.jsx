import { useEffect, useState } from "react";
import { countAt } from "./motion.js";

// Renders `to` on the server and first render; counts from → to each time `play` turns true.
export default function CountUp({ to, from = 0, duration = 1000, delay = 0, play }) {
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (!play || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    setValue(from);
    let frame = 0;
    let start = 0;
    const step = (now) => {
      start ||= now;
      const t = Math.min(1, (now - start) / duration);
      setValue(countAt(t, from, to));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [play, to, from, duration, delay]);
  return (
    <>
      <span aria-hidden="true">{value}</span>
      <span className="visually-hidden">{to}</span>
    </>
  );
}
