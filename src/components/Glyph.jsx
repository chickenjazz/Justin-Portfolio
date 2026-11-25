// Inline SVG glyphs. Unicode arrows and ✳ render as colour emoji on iOS,
// so the site draws them itself; they inherit the text colour and size.
const PATHS = {
  "up-right": "M4.5 11.5 11.5 4.5M5.5 4.5h6v6",
  up: "M8 13V3M3.5 7.5 8 3l4.5 4.5",
  down: "M8 3v10M3.5 8.5 8 13l4.5-4.5",
  right: "M3 8h10M8.5 3.5 13 8l-4.5 4.5",
};

export function Arrow({ dir = "up-right", className = "" }) {
  return (
    <svg className={`glyph ${className}`.trim()} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={PATHS[dir]} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Asterisk({ className = "" }) {
  return (
    <svg className={`glyph glyph-asterisk ${className}`.trim()} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M8 2v12M2 8h12M3.76 3.76l8.48 8.48M12.24 3.76l-8.48 8.48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
