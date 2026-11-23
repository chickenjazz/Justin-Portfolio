import { useEffect, useState } from "react";
export default function ProjectProgress({ id }) {
  const [viewed, setViewed] = useState(null);
  useEffect(() => {
    let ids = [];
    try {
      const data = JSON.parse(
        sessionStorage.getItem("justin-portfolio:project-progress:v1") || "{}",
      );
      if (data.version === 1 && Array.isArray(data.viewedIds))
        ids = data.viewedIds.filter((x) => typeof x === "string");
    } catch {}
    setViewed(ids.includes(id));
    const target = document.getElementById(`${id}-end`);
    if (!target || !("IntersectionObserver" in window)) {
      setViewed(null);
      return;
    }
    const check = () => {
      const r = target.getBoundingClientRect();
      if (
        document.visibilityState === "visible" &&
        r.bottom > 0 &&
        r.top < innerHeight
      ) {
        setViewed(true);
        try {
          const old = JSON.parse(
            sessionStorage.getItem("justin-portfolio:project-progress:v1") ||
              "{}",
          );
          const list =
            old.version === 1 && Array.isArray(old.viewedIds)
              ? old.viewedIds.filter((x) => typeof x === "string")
              : [];
          sessionStorage.setItem(
            "justin-portfolio:project-progress:v1",
            JSON.stringify({
              version: 1,
              viewedIds: [...new Set([...list, id])],
            }),
          );
        } catch {}
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0))
          check();
      },
      { threshold: 0.01 },
    );
    observer.observe(target);
    document.addEventListener("visibilitychange", check);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", check);
    };
  }, [id]);
  return viewed === null ? null : (
    <span className="progress">{viewed ? "✓ Viewed" : "Not yet viewed"}</span>
  );
}
