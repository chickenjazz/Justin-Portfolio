// Settles once the hero's WebGL scene has painted its first frame (true) or failed to load
// (false), so the entry intro can hold until the landing page is ready to be seen.
let settle;
export const sceneReady = new Promise((resolve) => (settle = resolve));
export const markSceneReady = (ok) => settle(ok);
