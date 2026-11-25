import { useEffect, useRef } from "react";
import useInView from "./useInView.js";

// A tilted 3D wall of tiles (after React Bits Pro "Tilted Tiles"), turned sideways: each ROW
// loops left or right (every other row reversed, with a head start), instead of columns
// scrolling up and down. Each row holds the items twice so a -50% translate loops seamlessly.
// The wall is decorative (aria-hidden; not inert, which would block hover, so tiles must hold
// nothing focusable): the page must expose the same content elsewhere.
// Loops pause off-screen and, with `pauseOnHover`, while the pointer rests on a tile; a fine
// pointer steers the tilt by up to `parallaxStrength` degrees. Each tile gets data-tone set to
// its item's index in `items`, so callers can colour tiles per item.
export default function TiltedTiles({
  items,
  renderTile,
  rows = 3,
  perRow = 16,
  duration = 70,
  rotateX = 40,
  rotateY = 16,
  rotateZ = -20,
  parallaxStrength = 8,
  pauseOnHover = true,
  className = "",
}) {
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { threshold: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const host = stage.parentElement;
    let frame = 0;
    const onMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = host.getBoundingClientRect();
        const px = ((event.clientX - box.left) / box.width) * 2 - 1;
        const py = ((event.clientY - box.top) / box.height) * 2 - 1;
        stage.style.setProperty("--tilt-px", Math.max(-1, Math.min(1, px)).toFixed(3));
        stage.style.setProperty("--tilt-py", Math.max(-1, Math.min(1, py)).toFixed(3));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      stage.style.setProperty("--tilt-px", 0);
      stage.style.setProperty("--tilt-py", 0);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Row r starts r items further along, so neighbouring rows never line up the same tile.
  const row = (r) => Array.from({ length: perRow }, (_, i) => (i + r * 2) % items.length);

  return (
    <div
      ref={stageRef}
      className={`tilted-tiles${inView ? "" : " is-paused"}${pauseOnHover ? " pause-on-hover" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      style={{
        "--tilt-x": `${rotateX}deg`,
        "--tilt-y": `${rotateY}deg`,
        "--tilt-z": `${rotateZ}deg`,
        "--tilt-strength": `${parallaxStrength}deg`,
        "--tiles-duration": `${duration}s`,
        "--per-row": perRow,
      }}
    >
      <div className="tilted-tiles-plane">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className={`tilted-tiles-row${r % 2 ? " is-reverse" : ""}`} style={{ "--row": r }}>
            {[0, 1].map((copy) => (
              <ul key={copy} className="tilted-tiles-copy" role="presentation">
                {row(r).map((index, i) => (
                  <li key={i} className="tilted-tile" data-tone={index}>
                    {renderTile(items[index])}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
