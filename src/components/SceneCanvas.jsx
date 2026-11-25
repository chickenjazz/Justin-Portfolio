import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { markSceneReady } from "./sceneReady.js";

// Full-stage WebGL layer. Renders nothing on the server; the DOM name and chick poster are
// the fallback until onReady fires (and stay if WebGL or the models fail to load).
// Calls made before the renderer is ready are cached and replayed on ready.
const SceneCanvas = forwardRef(function SceneCanvas({ onReady }, ref) {
  const boxRef = useRef(null);
  const rendererRef = useRef(null);
  const pending = useRef({ frame: null, visible: true });
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useImperativeHandle(ref, () => ({
    update(frame) {
      pending.current.frame = frame;
      rendererRef.current?.update(frame);
    },
    setVisible(visible) {
      pending.current.visible = visible;
      rendererRef.current?.setVisible(visible);
    },
  }), []);

  useEffect(() => {
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Each mount owns its canvas, so a disposed (lost) context never leaks into a remount.
    const canvas = document.createElement("canvas");
    boxRef.current.append(canvas);
    import("./sceneRenderer.js")
      .then(({ createSceneRenderer }) => createSceneRenderer(canvas, { reducedMotion }))
      .then((renderer) => {
        if (disposed) return renderer.dispose();
        rendererRef.current = renderer;
        const { frame, visible } = pending.current;
        renderer.setVisible(visible);
        if (frame) renderer.update(frame);
        requestAnimationFrame(() => {
          if (disposed) return;
          readyRef.current?.(true);
          markSceneReady(true);
        });
      })
      .catch(() => { if (!disposed) markSceneReady(false); });
    return () => {
      disposed = true;
      rendererRef.current?.dispose();
      rendererRef.current = null;
      canvas.remove();
      readyRef.current?.(false);
    };
  }, []);

  return <div className="scene-canvas" ref={boxRef} aria-hidden="true" />;
});

export default SceneCanvas;
