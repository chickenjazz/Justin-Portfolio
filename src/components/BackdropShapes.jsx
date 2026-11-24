// Decorative crystal shapes behind a section's content. Each sprite is a still render of the
// hero's crystal material (public/shapes/*.webp) and drifts with the shared .parallax system:
// larger, nearer shapes get a higher --depth so they move faster than small, faint ones.
// Positions are fractions of the section box (optional mx/my override them on narrow screens);
// sizes are CSS lengths (use clamp to scale). mobile: false drops a shape on narrow screens.
export default function BackdropShapes({ shapes }) {
  return (
    <div className="backdrop-shapes" aria-hidden="true">
      {shapes.map((shape, i) => (
        <img
          key={i}
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
          }}
        />
      ))}
    </div>
  );
}
