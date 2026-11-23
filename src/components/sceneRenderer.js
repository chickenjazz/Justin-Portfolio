// Full-stage WebGL layer for the Hero/About scene: the chick, the 3D name and the shapes.
// Client-only (lazy-imported from SceneCanvas's effect). HeroAbout's paint() owns every
// position via update(frame), in CSS px; this module only maps px to world space and adds
// the ambient motion (float, bob, tilt, drift), so motion keeps a single source.

const LAVENDER = { body: "#b9a8f0", accent: "#8f78d6" };
const CRYSTAL = { body: "#f4f6ff", accent: "#e8ecff" };
const FOV = 20;
const CAMERA_Z = 20;
// World height the old per-mascot camera framed; keeps the chick filling its px box the same way.
const CHICK_FRAME = 3.27;
const CHICK_CENTER_Y = 0.3;
// The poster was shot from above-left; the shared front camera matches it by turning the model.
const CHICK_BASE = { pitch: 0.26, yaw: 0.27 };
const FLOAT = { ms: 5000, amount: 0.04 };
// Slow, incommensurate periods so the viewing angle keeps drifting without visibly looping.
const YAW = { ms: 11000, amount: 0.38 };
const PITCH = { ms: 15000, amount: 0.12 };
const LETTER = { bobMs: 4800, bob: 0.06, tiltMs: 7000, tilt: 0.32 };
const MAX_DPR = 1.5;

const lerp = (a, b, t) => a + (b - a) * t;

export async function createSceneRenderer(canvas, { reducedMotion }) {
  const [THREE, { GLTFLoader }, { RoomEnvironment }, { RoundedBoxGeometry }] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/environments/RoomEnvironment.js"),
    import("three/addons/geometries/RoundedBoxGeometry.js"),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
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

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);
  const worldHeight = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360);

  const loader = new GLTFLoader();
  const base = import.meta.env.BASE_URL;
  let chickGltf, lettersGltf;
  try {
    [chickGltf, lettersGltf] = await Promise.all([
      loader.loadAsync(`${base}mascot/chick.glb`),
      loader.loadAsync(`${base}mascot/letters.glb`),
    ]);
  } catch (error) {
    envTarget.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }

  const disposables = [envTarget];
  const track = (thing) => (disposables.push(thing), thing);

  // Chick ------------------------------------------------------------------------------
  const physical = (hex) =>
    track(new THREE.MeshPhysicalMaterial({ color: hex, iridescenceIOR: 1.9, iridescenceThicknessMinimum: 250, iridescenceThicknessMaximum: 900 }));
  const body = physical(LAVENDER.body);
  const accent = physical(LAVENDER.accent);
  const tints = [
    [body, new THREE.Color(LAVENDER.body), new THREE.Color(CRYSTAL.body)],
    [accent, new THREE.Color(LAVENDER.accent), new THREE.Color(CRYSTAL.accent)],
  ];
  chickGltf.scene.traverse((node) => {
    if (!node.isMesh) return;
    track(node.geometry);
    track(node.material);
    if (node.material.name === "ChickBody") node.material = body;
    else if (node.material.name === "ChickAccent") node.material = accent;
  });
  const chickPose = new THREE.Group();
  chickPose.add(chickGltf.scene);
  const chick = new THREE.Group();
  chick.add(chickPose);
  scene.add(chick);

  // Letters ----------------------------------------------------------------------------
  const letterMaterial = track(new THREE.MeshPhysicalMaterial({ color: "#f1f0f5", roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: 0.9 }));
  const glyphs = {};
  lettersGltf.scene.traverse((node) => {
    if (!node.isMesh) return;
    track(node.geometry);
    track(node.material);
    glyphs[node.name.replace(/^L_/, "").replace(/\..*$/, "")] = node.geometry;
  });
  const letters = [];
  function letterAt(i, char) {
    if (letters[i]?.char !== char) {
      if (letters[i]) scene.remove(letters[i].mesh);
      const mesh = new THREE.Mesh(glyphs[char], letterMaterial);
      scene.add(mesh);
      letters[i] = { char, mesh, frame: null };
    }
    return letters[i];
  }

  // Shapes -----------------------------------------------------------------------------
  const ink = track(new THREE.MeshPhysicalMaterial({ color: "#16141c", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 }));
  const mint = track(new THREE.MeshPhysicalMaterial({ color: "#bff0da", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1 }));
  const materials = { ink, mint };
  const geometries = {
    knot: track(new THREE.TorusKnotGeometry(0.32, 0.11, 160, 20)),
    torus: track(new THREE.TorusGeometry(0.36, 0.15, 32, 64)),
    cube: track(new RoundedBoxGeometry(0.7, 0.7, 0.7, 5, 0.14)),
    sphere: track(new THREE.SphereGeometry(0.42, 48, 32)),
  };
  // One mesh per shape entry (geometry and materials shared), rebuilt only if its look changes.
  const shapes = [];
  function shapeAt(i, kind, tone) {
    const key = `${kind}:${tone}`;
    if (shapes[i]?.key !== key) {
      if (shapes[i]) scene.remove(shapes[i].mesh);
      const mesh = new THREE.Mesh(geometries[kind], materials[tone] ?? ink);
      scene.add(mesh);
      shapes[i] = { key, mesh };
    }
    return shapes[i].mesh;
  }

  // Frame ------------------------------------------------------------------------------
  let current = null;
  let size = { width: 0, height: 0 };
  let visible = true;
  let raf = 0;
  let disposed = false;

  // px (top-left origin) → world on the z=0 plane.
  function place(object, x, y, pxSize, worldSize) {
    const unit = worldHeight / size.height;
    object.position.set((x - size.width / 2) * unit, (size.height / 2 - y) * unit, 0);
    object.scale.setScalar((pxSize * unit) / worldSize);
  }
  const onScreen = (y, extent) => y + extent > 0 && y - extent < size.height;

  function applyChickMaterials(c) {
    for (const [material, from, to] of tints) {
      material.color.copy(from).lerp(to, c.glass).offsetHSL(c.hue / 360, 0, 0);
      // A transparent canvas leaves real transmission nothing to refract, so the crystal is
      // polished, mirror-like pearl: metallic reflections plus a rainbow iridescent film.
      material.roughness = lerp(0.45, 0.04, c.glass);
      material.metalness = lerp(0, 0.75, c.glass);
      // Never exactly 0: crossing 0 toggles a shader define and recompiles mid-morph.
      material.iridescence = Math.max(c.glass, 0.001);
      material.clearcoat = lerp(0.3, 1, c.glass);
      material.clearcoatRoughness = lerp(0.3, 0.03, c.glass);
      material.envMapIntensity = lerp(0.6, 1.4, c.glass);
    }
  }

  function draw(now) {
    raf = 0;
    if (disposed || !current) return;
    const wave = (ms, phase = 0) => (reducedMotion ? 0 : Math.sin((now / ms) * Math.PI * 2 + phase));

    const c = current.chick;
    // A zero scale is a degenerate matrix, so hide the chick once it has shrunk away.
    chick.visible = c.size > 0.5;
    place(chick, c.x, c.y, Math.max(c.size, 0.5), CHICK_FRAME);
    chick.position.y -= CHICK_CENTER_Y * chick.scale.y - wave(FLOAT.ms) * FLOAT.amount * chick.scale.y;
    const turn = (c.turn * Math.PI) / 180;
    // Per-scene pitch (deg) raises the apparent camera, e.g. About looks down from ~30°.
    const pitch = ((c.pitch ?? 0) * Math.PI) / 180;
    chickPose.rotation.set(CHICK_BASE.pitch + pitch + wave(PITCH.ms) * PITCH.amount, CHICK_BASE.yaw + turn + wave(YAW.ms) * YAW.amount, turn * 0.5);

    current.letters.forEach((l, i) => {
      const { mesh } = letterAt(i, l.char);
      mesh.visible = onScreen(l.y, l.height) && Boolean(glyphs[l.char]);
      if (!mesh.visible) return;
      place(mesh, l.x, l.y, l.height, 1);
      mesh.position.y += wave(LETTER.bobMs, i * 0.5) * LETTER.bob * mesh.scale.y;
      mesh.rotation.set(wave(LETTER.tiltMs * 1.3, i) * LETTER.tilt * 0.35, wave(LETTER.tiltMs, i * 1.7) * LETTER.tilt, (l.rot * Math.PI) / 180);
    });
    for (let i = current.letters.length; i < letters.length; i++) letters[i].mesh.visible = false;

    current.shapes.forEach((s, i) => {
      const mesh = shapeAt(i, s.kind, s.tone);
      mesh.visible = onScreen(s.y, s.size);
      if (!mesh.visible) return;
      place(mesh, s.x, s.y, s.size, 1);
      // Each shape bobs and spins at its own pace; alternate directions so they never sync.
      mesh.position.y += wave(LETTER.bobMs * (1.2 + (i % 3) * 0.25), i * 1.3) * LETTER.bob * 0.6 * mesh.scale.y;
      const spin = reducedMotion ? 0 : (now / 6000) * (i % 2 ? -1 : 1);
      mesh.rotation.set(0.5 + spin * (0.5 + (i % 4) * 0.15), spin * (0.7 - (i % 3) * 0.12) + i, s.rot ?? 0);
    });
    for (let i = current.shapes.length; i < shapes.length; i++) shapes[i].mesh.visible = false;

    renderer.render(scene, camera);
    if (visible && !reducedMotion) raf = requestAnimationFrame(draw);
  }

  function request() {
    if (!raf && !disposed) raf = requestAnimationFrame(draw);
  }

  return {
    update(frame) {
      current = frame;
      if (frame.width !== size.width || frame.height !== size.height) {
        size = { width: frame.width, height: frame.height };
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
        renderer.setSize(size.width, size.height, false);
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
      applyChickMaterials(frame.chick);
      request();
    },
    setVisible(next) {
      visible = next;
      if (visible) request();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      disposables.forEach((thing) => thing.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
