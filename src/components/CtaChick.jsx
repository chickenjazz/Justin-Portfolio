import { useEffect, useRef, useState } from "react";
import SceneCanvas from "./SceneCanvas.jsx";

// The CTA's chick: the hero's 3D chick in its full crystal (chromatic) finish, with the
// renderer's own life (float, drifting turn, tuft bob, wing flaps, blinks). On fine pointers
// it also turns toward the cursor. The flat poster stays as the fallback and the
// no-JS/no-WebGL image. The 3D layer mounts only once the CTA nears the viewport, and stops
// drawing while it is off-screen.
const FOLLOW = { turn: 34, pitch: 14, ease: 0.07 };

export default function CtaChick({ src }) {
  const boxRef = useRef(null);
  const sceneRef = useRef(null);
  const pose = useRef({ turn: 0, pitch: 0, targetTurn: 0, targetPitch: 0 });
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  // Mount the WebGL layer well ahead of the CTA (three screens), in an idle moment, so it has
  // loaded and compiled before the entrance plays.
  useEffect(() => {
    const box = boxRef.current;
    if (!("IntersectionObserver" in window)) return setNear(true);
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        idle(() => setNear(true), { timeout: 600 });
      }
    }, { rootMargin: "300% 0px" });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    const box = boxRef.current;
    const stage = box.closest(".cta-stage") ?? box;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let frame = 0;
    // Measured on resize only, never inside an animation frame.
    let width = 0;
    let height = 0;
    let size = 0;
    const measure = () => {
      const canvasBox = box.querySelector(".scene-canvas");
      width = canvasBox?.clientWidth ?? 0;
      height = canvasBox?.clientHeight ?? 0;
      size = box.clientWidth;
    };

    const paint = () => {
      if (!width || !height) return;
      const { turn, pitch } = pose.current;
      sceneRef.current?.update({
        width,
        height,
        chick: { x: width / 2, y: height / 2, size, glass: 1, turn, hue: 0, pitch },
        letters: [],
        shapes: [],
      });
    };
    // Ease toward the cursor pose, one frame at a time, and stop once settled.
    const follow = () => {
      frame = 0;
      const p = pose.current;
      p.turn += (p.targetTurn - p.turn) * FOLLOW.ease;
      p.pitch += (p.targetPitch - p.pitch) * FOLLOW.ease;
      paint();
      if (Math.abs(p.targetTurn - p.turn) > 0.05 || Math.abs(p.targetPitch - p.pitch) > 0.05) frame = requestAnimationFrame(follow);
    };
    const aim = (event) => {
      const rect = box.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      pose.current.targetTurn = Math.max(-1, Math.min(1, dx)) * FOLLOW.turn;
      pose.current.targetPitch = Math.max(-1, Math.min(1, dy)) * FOLLOW.pitch;
      if (!frame) frame = requestAnimationFrame(follow);
    };
    const center = () => {
      pose.current.targetTurn = 0;
      pose.current.targetPitch = 0;
      if (!frame) frame = requestAnimationFrame(follow);
    };

    const resize = new ResizeObserver(() => {
      measure();
      paint();
    });
    resize.observe(box);
    const onScreen = new IntersectionObserver(([entry]) => sceneRef.current?.setVisible(entry.isIntersecting));
    onScreen.observe(stage);
    if (finePointer && !reduced) {
      stage.addEventListener("pointermove", aim, { passive: true });
      stage.addEventListener("pointerleave", center);
    }
    measure();
    paint();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      onScreen.disconnect();
      stage.removeEventListener("pointermove", aim);
      stage.removeEventListener("pointerleave", center);
    };
  }, [near, ready]);

  return (
    <div className={`cta-mascot${ready ? " is-3d" : ""}`} ref={boxRef}>
      <img className="cta-mascot-poster" src={src} alt="" width="720" height="720" />
      {near && <SceneCanvas ref={sceneRef} onReady={setReady} signalsReady={false} />}
    </div>
  );
}
