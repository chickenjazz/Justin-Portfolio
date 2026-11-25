import { useEffect, useRef, useState } from "react";
import { projects } from "../../content/site.js";
import ProjectDetails from "../ProjectDetails.jsx";
import ProjectDemo from "../ProjectDemo.jsx";
import CountUp from "../CountUp.jsx";
import useInView from "../useInView.js";
import useScrollStack from "../useScrollStack.js";
import { stackLayer } from "../stackMath.js";
import { Arrow } from "../Glyph.jsx";

const pad = (n) => String(n).padStart(2, "0");
// "Featured project · Thesis / AI Engineering" -> "Thesis / AI Engineering"
const kind = (project) => project.category.split("·").pop().trim();

// CSS custom properties for one card's place in the stack.
const layerStyle = (layer) => ({
  "--y": layer.yVh,
  "--peek": layer.peekPx,
  "--s": layer.scale,
  "--blur": layer.blur,
  "--dim": layer.dim,
  "--fade": layer.opacity,
});

export default function Projects() {
  const track = useRef(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const showcase = useRef(null);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  // The demo loops run only while the section is on screen.
  const inView = useInView(showcase, { threshold: 0.2 });

  useEffect(() => {
    setReady(true);
  }, []);
  // Stacks every card for a progress p (0 … count - 1): later cards rise from
  // the bottom over earlier ones, which shrink, blur, dim and peek out above.
  const place = (p) => {
    Array.from(track.current?.children ?? [], (card, index) => {
      const d = index - p;
      const layer = stackLayer(d);
      for (const [name, value] of Object.entries(layerStyle(layer)))
        card.style.setProperty(name, String(value));
      card.style.zIndex = String(index + 1);
      card.style.visibility = layer.hidden ? "hidden" : "";
      card.inert = Math.abs(d) > 0.5;
      card.classList.toggle("is-current", Math.abs(d) < 0.5);
      // Not yet arrived: its content waits below, then plays in on arrival.
      card.classList.toggle("is-ahead", d >= 0.5);
    });
    showcase.current?.style.setProperty(
      "--progress",
      String(projects.length > 1 ? p / (projects.length - 1) : 1),
    );
  };
  const [active, goTo] = useScrollStack(showcase, projects.length, place, ready);
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
      className={`project-showcase${ready ? " stack-ready" : ""}${inView ? " demos-live" : ""}`}
      ref={showcase}
      id="work"
      aria-label="Selected projects"
    >
      <div className="project-stage">
        <div className="showcase-heading">
          <h2>
            Selected work
            <span> / {pad(projects.length)}</span>
          </h2>
          <a href="#skills">Skip projects <Arrow dir="down" /></a>
        </div>
        <div
          className="project-track"
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label="Projects. Scroll down or use the arrow keys."
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
              <p className="slide-counter" aria-hidden="true">
                {pad(index + 1)}/{pad(projects.length)}
              </p>
              <p className="pc-eyebrow pc-in" style={{ "--o": 2 }}>
                {pad(index + 1)} · {kind(project)}
              </p>
              <h3 className="pc-mask">
                <span className="pc-title pc-in" style={{ "--o": 0 }}>
                  {project.shortTitle}
                </span>
              </h3>
              <ProjectDemo id={project.id} className="pc-in" style={{ "--o": 1 }} />
              <p className="pc-one pc-in" style={{ "--o": 2 }}>
                {project.oneLiner}
              </p>
              {project.metric && (
                <p className="pc-metric pc-in" style={{ "--o": 2 }}>
                  <strong>
                    {project.metric.text ?? (
                      <>
                        <CountUp
                          to={project.metric.value}
                          delay={480}
                          duration={1100}
                          play={inView && active === index}
                        />
                        {project.metric.suffix}
                      </>
                    )}
                  </strong>
                  <span>{project.metric.label}</span>
                </p>
              )}
              <ul className="pc-tech pc-in" style={{ "--o": 3 }}>
                {project.keyTechnologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              <div className="pc-actions pc-in" style={{ "--o": 3 }}>
                <details className="project-fallback">
                  <summary onClick={(event) => openDetails(event, project)}>
                    View project <Arrow />
                  </summary>
                  <ProjectDetails project={project} />
                </details>
                {project.liveUrl && (
                  <a className="pc-visit" href={project.liveUrl} target="_blank" rel="noopener">
                    Visit site <Arrow />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        {ready && (
          <>
            <div className="stack-progress" aria-hidden="true">
              <span />
            </div>
            <p className="visually-hidden" aria-live="polite" aria-atomic="true">
              Project {active + 1} of {projects.length}:{" "}
              {projects[active]?.shortTitle}
            </p>
          </>
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
