import { useEffect, useRef, useState } from "react";
import { projects } from "../../content/site.js";
import ProjectDetails from "../ProjectDetails.jsx";

export default function Projects() {
  const track = useRef(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
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

  function goTo(index) {
    const next = Math.max(0, Math.min(projects.length - 1, index));
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.current.scrollTo({
      left: next * track.current.clientWidth,
      behavior: reduced ? "instant" : "smooth",
    });
  }
  function openDetails(event, project) {
    if (!dialog.current?.showModal) return;
    event.preventDefault();
    trigger.current = event.currentTarget;
    setSelected(project);
  }

  return (
    <section
      className="project-showcase"
      id="work"
      aria-label="Selected projects"
    >
      <div className="showcase-heading">
        <h2>
          Selected work
          <span> / {String(projects.length).padStart(2, "0")}</span>
        </h2>
        <a href="#credentials">Skip projects ↓</a>
      </div>
      <div
        className="project-track"
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects. Swipe horizontally or use the arrow buttons."
        tabIndex={0}
        onScroll={() =>
          setActive(
            Math.round(track.current.scrollLeft / track.current.clientWidth),
          )
        }
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
        <div className="carousel-controls">
          <p aria-live="polite" aria-atomic="true">
            {String(active + 1).padStart(2, "0")}{" "}
            <span>/ {String(projects.length).padStart(2, "0")}</span>
          </p>
          <div className="carousel-dots">
            {projects.map((project, index) => (
              <button
                key={project.id}
                aria-label={`Show ${project.shortTitle}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => goTo(index)}
              >
                <span />
              </button>
            ))}
          </div>
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
