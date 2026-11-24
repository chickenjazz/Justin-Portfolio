import { useEffect, useState } from "react";

// Public, no-auth mirror of GitHub's contribution calendar (GitHub's own API needs a token).
const API = "https://github-contributions-api.jogruber.de/v4/";
const DAYS = 371; // 53 weeks
const EMPTY = Array.from({ length: DAYS }, () => null);

// Pads the first week so every column starts on Sunday, as on GitHub.
function toCells(contributions) {
  const days = contributions.slice(-DAYS + 6);
  const lead = new Date(`${days[0].date}T00:00:00`).getDay();
  return [...Array.from({ length: lead }, () => null), ...days];
}

export default function GitHubActivity({ user, href }) {
  // Server and first client render match: an empty grid holds the space until data arrives.
  const [state, setState] = useState({ status: "loading", cells: EMPTY, total: null });

  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      fetch(`${API}${encodeURIComponent(user)}?y=last`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
        .then((data) => setState({ status: "ready", cells: toCells(data.contributions), total: data.total.lastYear }))
        .catch((error) => { if (!controller.signal.aborted) setState((s) => ({ ...s, status: "error" })); });
    // Off the critical path: the scene and hero render first.
    const idle = window.requestIdleCallback ? requestIdleCallback(load, { timeout: 2000 }) : setTimeout(load, 600);
    return () => {
      controller.abort();
      window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle);
    };
  }, [user]);

  const { status, cells, total } = state;
  return (
    <figure className="github-activity" data-status={status}>
      {status !== "error" && (
        <>
          <p className="github-total">
            <span className="github-count">{total ?? "000"}</span>
            <span className="github-caption">Contributions in the last year</span>
          </p>
          <div className="github-graph" role="img" aria-label={total == null ? "Loading GitHub contributions" : `${total} GitHub contributions in the last year`} aria-busy={status === "loading"}>
            {cells.map((day, i) => (
              <span key={i} className="github-day" data-level={day?.level ?? 0} title={day ? `${day.count} on ${day.date}` : undefined} />
            ))}
          </div>
        </>
      )}
      <figcaption><a href={href}>View @{user} on GitHub ↗</a></figcaption>
    </figure>
  );
}
