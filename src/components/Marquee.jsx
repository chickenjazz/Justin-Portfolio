import { Fragment } from "react";

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
  const copy = () =>
    Array.from({ length: repeat }, (_, i) => <Fragment key={i}>{children}</Fragment>);
  const rootProps = decorative
    ? { "aria-hidden": "true" }
    : { role: "region", "aria-label": label };

  return (
    <div
      className={`marquee${reverse ? " marquee-reverse" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--marquee-speed": `${speed}s`, "--marquee-slant": `${slant}deg` }}
      {...rootProps}
    >
      <div className="marquee-track">
        <ul className="marquee-copy">{copy()}</ul>
        <ul className="marquee-copy" aria-hidden="true" inert>
          {copy()}
        </ul>
      </div>
    </div>
  );
}
