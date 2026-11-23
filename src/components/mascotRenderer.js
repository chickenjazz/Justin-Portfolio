// Live WebGL chick. Client-only: imported lazily from MascotCanvas's effect.
// The scene engine drives every change through update(); this module never animates
// on its own except the idle float, so motion keeps a single source.

const LAVENDER = { body: "#b9a8f0", accent: "#8f78d6" };
const CRYSTAL = { body: "#f4f6ff", accent: "#e8ecff" };
const FLOAT_MS = 5000;
const FLOAT_AMPLITUDE = 0.04;

const lerp = (a, b, t) => a + (b - a) * t;

export async function createMascotRenderer(canvas, { reducedMotion }) {
  const [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  scene.environment = envTarget.texture;
  room.dispose();
  pmrem.dispose();

  // Matches the Blender poster camera (85mm, square frame) so the swap is seamless.
  const camera = new THREE.PerspectiveCamera(23.9, 1, 0.1, 50);
  camera.position.set(-2, 2, 7.2);
  camera.lookAt(0, 0.3, 0);

  let gltf;
  try {
    gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}mascot/chick.glb`);
  } catch (error) {
    envTarget.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }

  const pivot = new THREE.Group();
  pivot.add(gltf.scene);
  scene.add(pivot);

  const physical = (hex) =>
    new THREE.MeshPhysicalMaterial({ color: hex, iridescenceIOR: 1.9, iridescenceThicknessMinimum: 250, iridescenceThicknessMaximum: 900 });
  const body = physical(LAVENDER.body);
  const accent = physical(LAVENDER.accent);
  const tints = [
    [body, new THREE.Color(LAVENDER.body), new THREE.Color(CRYSTAL.body)],
    [accent, new THREE.Color(LAVENDER.accent), new THREE.Color(CRYSTAL.accent)],
  ];
  const owned = [body, accent];
  gltf.scene.traverse((node) => {
    if (!node.isMesh) return;
    const original = node.material;
    if (original && !owned.includes(original)) owned.push(original);
    if (original?.name === "ChickBody") node.material = body;
    else if (original?.name === "ChickAccent") node.material = accent;
  });

  const state = { glass: 0, turn: 0, hue: 0, size: 0 };
  let visible = true;
  let frame = 0;
  let disposed = false;

  function applyMaterials() {
    const g = state.glass;
    for (const [material, from, to] of tints) {
      material.color.copy(from).lerp(to, g).offsetHSL(state.hue / 360, 0, 0);
      // The canvas is transparent, so real transmission has nothing to refract and turns
      // the body invisible. The crystal instead reads as polished, mirror-like pearl:
      // metallic reflections of the environment plus a rainbow iridescent film.
      material.roughness = lerp(0.45, 0.04, g);
      material.metalness = lerp(0, 0.75, g);
      // Never exactly 0: crossing 0 toggles a shader define and recompiles mid-morph.
      material.iridescence = Math.max(g, 0.001);
      material.clearcoat = lerp(0.3, 1, g);
      material.clearcoatRoughness = lerp(0.3, 0.03, g);
      material.envMapIntensity = lerp(0.6, 1.4, g);
    }
  }

  function draw(now) {
    frame = 0;
    if (disposed) return;
    const turn = (state.turn * Math.PI) / 180;
    pivot.rotation.set(0, turn, turn * 0.5);
    pivot.position.y = reducedMotion ? 0 : Math.sin((now / FLOAT_MS) * Math.PI * 2) * FLOAT_AMPLITUDE;
    renderer.render(scene, camera);
    if (visible && !reducedMotion) frame = requestAnimationFrame(draw);
  }

  function request() {
    if (!frame && !disposed) frame = requestAnimationFrame(draw);
  }

  return {
    update({ glass, turn, hue, size }) {
      Object.assign(state, { glass, turn, hue });
      applyMaterials();
      if (size > 0 && size !== state.size) {
        state.size = size;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size, false);
      }
      request();
    },
    setVisible(next) {
      visible = next;
      if (visible) request();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      gltf.scene.traverse((node) => node.isMesh && node.geometry.dispose());
      owned.forEach((material) => material.dispose());
      envTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
