import { useEffect, useRef, useState } from "react";
import { projects } from "../../content/site.js";
import ProjectDetails from "../ProjectDetails.jsx";
import useHeldScroll from "../useHeldScroll.js";
import { easeOutBack } from "../motion.js";
import { stackLayer } from "../stackMath.js";

// CSS custom properties for one card's place in the stack.
const layerStyle = (layer) => ({
  "--y": layer.yVh,
  "--s": layer.scale,
  "--dim": layer.dim,
  "--lift": layer.lift,
});

export default function Projects() {
  const track = useRef(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const showcase = useRef(null);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  // Stacks every card for a progress p (0 … count - 1): later cards rise from
  // the bottom and cover earlier ones.
  const place = (p) => {
    Array.from(track.current?.children ?? [], (card, index) => {
      const d = index - p;
      const layer = stackLayer(d);
      for (const [name, value] of Object.entries(layerStyle(layer)))
        card.style.setProperty(name, String(value));
      card.style.zIndex = String(index + 1);
      card.style.visibility = layer.hidden ? "hidden" : "";
      card.inert = Math.abs(d) > 0.5;
    });
  };
  // Page scroll steps through the projects, then releases after the last.
  // easeOutBack overshoots slightly, so each card snaps into place.
  const [active, goTo] = useHeldScroll(showcase, projects.length, place, ready, {
    ease: easeOutBack,
    duration: 900,
  });
  useEffect(() => {
    if (!selected) return;
    const panel = dialog.current;
    const previous = document.body.style.overflow;
    panel.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (panel.open) panel.close();
      trigger.current?.focus({ preventScroll: true });
    };
  }, [selected]);

  function openDetails(event, project) {
    if (!dialog.current?.showModal) return;
    event.preventDefault();
    trigger.current = event.currentTarget;
    setSelected(project);
  }

  return (
    <section
      className={`project-showcase${ready ? " stack-ready" : ""}`}
      ref={showcase}
      id="work"
      aria-label="Selected projects"
    >
      <div className="project-stage">
        <div className="showcase-heading">
          <h2>
            Selected work
            <span> / {String(projects.length).padStart(2, "0")}</span>
          </h2>
          <a href="#skills">Skip projects ↓</a>
        </div>
        <div
          className="project-track"
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label="Projects. Scroll down or use the arrow buttons."
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(active + (event.key === "ArrowRight" ? 1 : -1));
            }
          }}
        >
          {projects.map((project, index) => (
            <article
              className={`project-slide project-slide-${index}`}
              id={project.id}
              key={project.id}
              style={layerStyle(stackLayer(index))}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${projects.length}: ${project.shortTitle}`}
            >
              <div className="slide-art" aria-hidden="true">
                <div className="sculpture">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="floor-grid" />
              </div>
              <div className="slide-content">
                <p className="eyebrow">
                  {String(index + 1).padStart(2, "0")} / SELECTED PROJECT
                </p>
                <h3>{project.shortTitle}</h3>
                <p className="slide-summary">{project.oneLiner}</p>
                <ul className="slide-tech">
                  {project.keyTechnologies.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
                <details className="project-fallback">
                  <summary onClick={(event) => openDetails(event, project)}>
                    View project <span aria-hidden="true">↗</span>
                  </summary>
                  <ProjectDetails project={project} />
                </details>
              </div>
            </article>
          ))}
        </div>
        {ready && (
          <ol className="stack-list" aria-label="Projects">
            {projects.map((project, index) => (
              <li key={project.id}>
                <button
                  aria-current={active === index ? "true" : undefined}
                  onClick={() => goTo(index)}
                >
                  {project.shortTitle}
                </button>
              </li>
            ))}
          </ol>
        )}
        {ready && (
          <div className="carousel-controls">
            <p aria-live="polite" aria-atomic="true">
              {String(active + 1).padStart(2, "0")}{" "}
              <span>/ {String(projects.length).padStart(2, "0")}</span>
            </p>
            <div className="carousel-arrows">
              <button
                aria-label="Previous project"
                disabled={active === 0}
                onClick={() => goTo(active - 1)}
              >
                ←
              </button>
              <button
                aria-label="Next project"
                disabled={active === projects.length - 1}
                onClick={() => goTo(active + 1)}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
      <dialog
        className="project-dialog"
        ref={dialog}
        aria-label={
          selected
            ? `${selected.shortTitle} project details`
            : "Project details"
        }
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <button
          className="dialog-close"
          autoFocus
          aria-label="Close project details"
          onClick={() => dialog.current.close()}
        >
          Close ×
        </button>
        {selected && <ProjectDetails project={selected} />}
      </dialog>
    </section>
  );
}
