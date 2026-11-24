export default function Marquee({
  label,
  speed = 40,
  reverse = false,
  slant = 0,
  repeat = 2,
  decorative = false,
  className = "",
  children,
}) {
  // First copy: one accessible set; extra sets are hidden and inert. Second copy: all hidden.
  const extras = (n) =>
    Array.from({ length: n }, (_, i) => (
      <li key={i} className="marquee-extra" aria-hidden="true" inert>
        <ul role="presentation">{children}</ul>
      </li>
    ));
  // Focus stops the loop at its start (Marquee.css). Native focus scrolling skips an item that
  // is only partly in view, so bring the focused item fully into the band.
  const rootProps = decorative
    ? { "aria-hidden": "true" }
    : {
        role: "region",
        "aria-label": label,
        onFocus: (event) => event.target.scrollIntoView({ block: "nearest", inline: "nearest" }),
      };

  return (
    <div
      className={`marquee${reverse ? " marquee-reverse" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--marquee-speed": `${speed}s`, "--marquee-slant": `${slant}deg` }}
      {...rootProps}
    >
      <div className="marquee-track">
        <ul className="marquee-copy" role="list">
          {children}
          {extras(repeat - 1)}
        </ul>
        <ul className="marquee-copy" aria-hidden="true" inert>
          {children}
          {extras(repeat - 1)}
        </ul>
      </div>
    </div>
  );
}
