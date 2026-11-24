---
archetype: scenic
intensity: quiet
engine: css
easing_budget: 4
loop_budget: 4
signature: "scroll-driven four-state mascot composition"
---

# Motion

Native scroll drives Introduction, About, Milestones, and Education & Experience.
A sticky scene stays within its own scroll track; there are no wheel/touch overrides.
Scroll position only selects the destination state; the morph itself is time-based
(1100ms, smoothstep), so the scene never rests between two states. Selection follows
the direction of travel: passing 18% of a viewport beyond a held state commits to its
neighbour. When native scrolling rests between held states (140ms idle), the page
glides to the committed state's scroll position. Interrupted morphs restart from the
current blend. The final state holds for half a viewport before release.
Dots and keyboard navigation scroll to each state's exact position. Scrolling back
reverses the same weights. All scene geometry and materials share these weights.
Entering panel copy fades and rises 14px (700ms, cubic-bezier(.22,1,.36,1), 380ms
delay, 80ms stagger); leaving copy fades in 260ms. Reduced motion snaps the morph
and keeps only the opacity fade.

One full-stage WebGL layer (`SceneCanvas.jsx` + `sceneRenderer.js`) draws the chick, the
3D name and the shapes, as render targets of the same scene weights. The chick: `glass`
blends lavender to crystal pearl, `turn` tilts, `hue` tints, with a 5s float and a slow
perspective drift (11s yaw, 15s pitch). Character life (off under reduced motion): the tuft
bobs (1.7s stretch + sway), the wings give a double flap every 3s (0.64s), and the eyes blink
every 4.2s (every third a double blink). The chick is lit by a warm key, a cool lavender rim
and a dim sky/ground fill on top of the room environment. The name: extruded DM Sans letters placed from the
hidden DOM letters, each with a staggered 4.8s bob and slow 3D tilt. Shapes (black knot,
mint torus, black rounded cube) spin slowly around the Introduction position.
Leaving the Introduction follows the chick down: the name and shapes are left behind,
rising by depart² × 1.15 stage heights (deeper objects up to 35% faster), while the chick
dips (sin(π·depart) × 8% of the stage) on its way to About. Later states show only the
chick; the h1 stays in the DOM, visually hidden. Ambient loops pause off-screen and are
off under reduced motion (states snap). Until WebGL is ready, or if it fails, the flat
DOM name and the Blender poster show instead, and the name rises away the same way.

The stage grows with content; when taller than the viewport its sticky offset lets
the viewer read the entire composition. No milestones or education duplication
remains below. Timeline dates are supplied academic dates; project experience
has no invented dates. Header, footer and the project carousel remain intact.

Viewport containment fix: the sticky track uses explicit content height (stage +
scroll distance), never padding for scroll travel. The stage is 100svh at top: 0.
Progress and dot destinations share the same track origin. Short screens keep
the mascot visible and provide native scrolling inside longer content panels.

Project carousel (arc): a sticky 100svh stage inside an explicit-height track
(`useHeldScroll`, the same held-state model as the hero: commit at 18% in the direction
of travel, 1100ms smoothstep, 140ms idle glide to the committed card, half-viewport hold
on the last card before release). Native page scroll only. Each card gets an offset d
from that time-based progress and swings around a pivot 200vw below centre (30° per
step, scale −12%, fading out by one step, corners rounding to 28px). An arc list of
titles (right edge; horizontal above the controls on mobile) follows the same d.
Titles, arrows and ←/→ scroll to a card's exact position. Without JS the cards fall back
to a horizontal scroll-snap track. Reduced motion snaps between cards, opacity only.

Entry intro (`Intro.jsx` + `Intro.css`): a full-screen overlay on first paint (prerendered,
pure CSS, so it plays before JS and always ends by itself). A line drawing of the chick
hops (760ms loop: squash on landing, stretch on take-off, 38px rise) over a shadow that
shrinks and fades at the top, and blinks every 1.5s. "JM" draws in stroke by stroke
(900ms each, 300ms / 650ms delays). At 2.3s the overlay fades out (600ms) and is removed.
Reduced motion skips the intro entirely.
