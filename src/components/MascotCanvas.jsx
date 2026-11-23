import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// SSR renders the Blender poster; the live model replaces it once its first frame draws.
// Calls made before the renderer is ready are cached and replayed on ready.
const MascotCanvas = forwardRef(function MascotCanvas({ className = "" }, ref) {
  const boxRef = useRef(null);
  const rendererRef = useRef(null);
  const pending = useRef({ params: null, visible: true });

  useImperativeHandle(ref, () => ({
    update(params) {
      pending.current.params = params;
      rendererRef.current?.update(params);
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
    canvas.className = "mascot-canvas";
    boxRef.current.append(canvas);
    import("./mascotRenderer.js")
      .then(({ createMascotRenderer }) => createMascotRenderer(canvas, { reducedMotion }))
      .then((renderer) => {
        if (disposed) return renderer.dispose();
        rendererRef.current = renderer;
        const { params, visible } = pending.current;
        renderer.setVisible(visible);
        if (params) renderer.update(params);
        requestAnimationFrame(() => { if (!disposed) boxRef.current.dataset.ready = "true"; });
      })
      // No WebGL or a failed download: the poster simply stays.
      .catch(() => {});
    return () => {
      disposed = true;
      rendererRef.current?.dispose();
      rendererRef.current = null;
      canvas.remove();
      if (boxRef.current) delete boxRef.current.dataset.ready;
    };
  }, []);

  return (
    <span className={`mascot-3d ${className}`} ref={boxRef} aria-hidden="true">
      <img className="mascot-poster" src={`${import.meta.env.BASE_URL}mascot/chick.webp`} alt="" width="720" height="720" />
    </span>
  );
});

export default MascotCanvas;
