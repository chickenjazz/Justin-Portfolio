import { useEffect, useRef } from "react";

// Decorative crystal shapes around a section's content. Each sprite is a still render of the
// hero's crystal material (public/shapes/*.webp) and drifts with the shared .parallax system:
// larger, nearer shapes get a higher --depth so they move faster than small, faint ones.
// Two layers: `layer: "front"` shapes float above the copy (near, fast, slightly soft-focus);
// the rest sit behind it. Every shape also bobs on its own slow float loop (paused off-screen).
// Positions are fractions of the section box (optional mx/my override them on narrow screens);
// sizes are CSS lengths (use clamp to scale). mobile: false drops a shape on narrow screens.
// `bleed` lets shapes cross the section's top and bottom edges into the neighbouring
// sections, so consecutive sections read as one continuous field.
const Shape = ({ shape, index }) => (
  <img
    className={`backdrop-shape parallax${shape.mobile === false ? " backdrop-shape-wide" : ""}`}
    src={`${import.meta.env.BASE_URL}shapes/${shape.sprite}.webp`}
    alt=""
    width="400"
    height="400"
    loading="lazy"
    decoding="async"
    style={{
      "--x": shape.x,
      "--y": shape.y,
      "--xm": shape.mx,
      "--ym": shape.my,
      "--size": shape.size,
      "--depth": shape.depth,
      "--turn": `${shape.turn ?? 0}deg`,
      "--fade": shape.fade ?? 1,
      "--float-delay": `${index * -2.3}s`,
      "--float-time": `${7 + (index % 3) * 1.6}s`,
    }}
  />
);

export default function BackdropShapes({ shapes, bleed = false }) {
  const root = useRef(null);

  // The float loop only runs while the section is near the viewport.
  useEffect(() => {
    const host = root.current?.parentElement;
    if (!host || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => host.classList.toggle("shapes-floating", entry.isIntersecting),
      { rootMargin: "20% 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const layer = (front) =>
    shapes
      .map((shape, index) => ({ shape, index }))
      .filter(({ shape }) => (shape.layer === "front") === front);
  const cls = `backdrop-shapes${bleed ? " backdrop-shapes-bleed" : ""}`;
  return (
    <>
      <div className={cls} aria-hidden="true" ref={root}>
        {layer(false).map(({ shape, index }) => (
          <Shape key={index} shape={shape} index={index} />
        ))}
      </div>
      {layer(true).length > 0 && (
        <div className={`${cls} backdrop-shapes-front`} aria-hidden="true">
          {layer(true).map(({ shape, index }) => (
            <Shape key={index} shape={shape} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
