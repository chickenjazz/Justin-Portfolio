// Device demos for the project cards (the "Poster" direction, see MOTION.md).
// The markup is the finished frame. The loop (CSS, ProjectCard.css) runs only on
// the current card while the section is on screen; without JS or with reduced
// motion the finished frame stays still.

const PROMPT = "make me a website";

function PrompteePhone() {
  return (
    <div className="ph">
      <div className="ph-screen">
        <span className="ph-notch" />
        <p className="ph-app">Promptee</p>
        <div className="ph-prompt">
          <span className="ph-label">Your prompt</span>
          <span className="ph-typed">{PROMPT}</span>
          <i className="ph-scan" />
        </div>
        <ul className="ph-lines">
          <li>
            <b>Role</b> senior web designer
          </li>
          <li>
            <b>Task</b> one-page bakery site, hours and menu
          </li>
          <li>
            <b>Format</b> sections, copy, palette
          </li>
        </ul>
        <div className="ph-score">
          <div className="ph-ring">
            <svg viewBox="0 0 80 80">
              <circle className="ph-ring-track" cx="40" cy="40" r="36" />
              <circle className="ph-ring-value" cx="40" cy="40" r="36" />
            </svg>
            <strong className="ph-num" />
          </div>
          <p>
            Prompt quality
            <br />
            26 → 67
          </p>
        </div>
      </div>
    </div>
  );
}

function Crane() {
  return (
    <svg className="crane" viewBox="0 0 220 300" fill="none">
      <g stroke="#e8c547" strokeWidth="3" strokeLinejoin="round">
        <path d="M40 296V44M62 296V44" />
        <path d="M40 296L62 270L40 244L62 218L40 192L62 166L40 140L62 114L40 88L62 62L40 44" />
        <path d="M6 44H214M6 30H120M51 10L6 30M51 10L214 44M51 10V44" />
        <path d="M80 30L96 44L112 30L128 44M140 44L152 38" />
      </g>
      <rect x="6" y="44" width="26" height="16" fill="#3a3f2e" />
      <rect x="38" y="292" width="28" height="6" fill="#e8c547" />
      <rect x="66" y="46" width="22" height="14" rx="2" fill="#e8c547" />
      {/* the trolley runs out along the jib, the cable pays out, the load lowers */}
      <g className="crane-trolley">
        <rect x="160" y="42" width="16" height="7" fill="#f3eefa" />
        <path className="crane-cable" d="M168 49V80" stroke="#f3eefa" strokeWidth="1.5" />
        <g className="crane-lift">
          <path d="M168 80c0 8 -8 8 -8 2" stroke="#f3eefa" strokeWidth="3" strokeLinecap="round" />
          <path d="M168 88L154 94M168 88L182 94" stroke="#f3eefa" strokeWidth="1" />
          <rect x="150" y="94" width="36" height="16" rx="2" fill="#a3e635" />
        </g>
      </g>
    </svg>
  );
}

function VertexDesktop() {
  return (
    <div className="desk">
      <Crane />
      <div className="mon">
        <div className="mon-screen">
          <div className="mon-view">
            <img
              src={`${import.meta.env.BASE_URL}projects/vertex7-site.webp`}
              alt=""
              width="900"
              height="2828"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <span className="mon-neck" />
        <span className="mon-foot" />
      </div>
    </div>
  );
}

const demos = { promptee: PrompteePhone, "vertex-7": VertexDesktop };

export default function ProjectDemo({ id, className = "", style }) {
  const Demo = demos[id];
  if (!Demo) return null;
  return (
    <div className={`pc-device ${className}`} style={style} aria-hidden="true">
      <Demo />
    </div>
  );
}
