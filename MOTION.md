---
archetype: scenic
intensity: quiet
engine: css
easing_budget: 4
loop_budget: 4
signature: "scroll-driven two-state mascot composition"
---

# Motion

Native scroll drives two states of one scene: the Hero (Introduction) and the
Description. A sticky scene stays within its own scroll track (1.6 viewports of travel);
there are no wheel/touch overrides and the page never snaps or glides: wherever native
scrolling rests, it stays. Scroll position only selects the destination state; the morph
itself is time-based (1100ms, smoothstep), so the scene never rests between the two.
Selection follows the direction of travel: scrolling down 18% of a viewport past the Hero
commits to the Description; scrolling up 18% back from it returns to the Hero.
Interrupted morphs restart from the current blend; scrolling back reverses the same
weights, and the first placement after load (deep link, mid-page reload) jumps without
morphing. `#description` and `#top` scroll to each state's exact position. All scene
geometry and materials share these weights. While the Description holds, a scroll-linked
drift (0 at the 18% commit, 1 at the track's end, scaled by the Description's weight)
lifts the chick by 12% of the stage height, each crystal pop shape by 18% + 10%·i, and
the Description copy by 5%, so the hold reads as parallax rather than a frozen slide.
Entering panel copy fades and rises 14px (700ms, cubic-bezier(.22,1,.36,1), 380ms
delay, 80ms stagger); leaving copy fades in 260ms. Reduced motion snaps the morph,
drops the hold drift and keeps only the opacity fade.

The Stats section follows the hero and overlaps the last 40svh of the scene track, so its
cards rise over the still-pinned chick on the white Description background instead of
sliding in under a hard edge. Cards rise with a 90ms stagger (reveal `rise`), drift at
parallax depths .15 / .3 / .2 / .35, and their numbers count up over 1000ms (smoothstep)
as the grid enters view. Reduced motion shows static numbers and no rise.

One full-stage WebGL layer (`SceneCanvas.jsx` + `sceneRenderer.js`) draws the chick, the
3D name and the shapes, as render targets of the same scene weights. The chick: `glass`
blends lavender to crystal pearl, `turn` tilts, `hue` tints, with a 5s float and a slow
perspective drift (11s yaw, 15s pitch). Character life (off under reduced motion): the tuft
bobs (1.7s stretch + sway), the wings give a double flap every 3s (0.64s), and the eyes blink
every 4.2s (every third a double blink). The chick is lit by a warm key from above-left, a cool lavender rim
and a lilac/deep-violet sky/ground fill (so shadows fall to purple, like the reference) over a
dimmed room environment; its beak is warm apricot, the lavender's complement. The name: extruded DM Sans letters placed from the
hidden DOM letters, each with a staggered 4.8s bob and slow 3D tilt. Shapes (black knot,
mint torus, black rounded cube) spin slowly around the Introduction position.
Leaving the Introduction follows the chick down: the name and shapes are left behind,
rising by depart² × 1.15 stage heights (deeper objects up to 35% faster), while the chick
dips (sin(π·depart) × 8% of the stage) on its way to the Description. There only the
chick remains, joined on desktop by three crystal shapes that pop in one after another;
the h1 stays in the DOM, visually hidden. Ambient loops pause off-screen and are
off under reduced motion (states snap). Until WebGL is ready, or if it fails, the flat
DOM name and the Blender poster show instead, and the name rises away the same way.

The stage grows with content; when taller than the viewport its sticky offset lets
the viewer read the entire composition. Header, footer and the project carousel
remain intact.

Viewport containment fix: the sticky track uses explicit content height (stage +
scroll distance), never padding for scroll travel. The stage is 100svh at top: 0.
Progress and anchor destinations share the same track origin. Short screens keep
the mascot visible and provide native scrolling inside the Description panel.

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
pure CSS, so it plays before JS). A line drawing of the chick hops (760ms loop: squash on
landing, stretch on take-off, 38px rise) over a shadow that shrinks and fades at the top,
and blinks every 1.5s. "JM" draws in stroke by stroke (900ms each, 300ms / 650ms delays).
At 2.3s the exit is a HoloMosaic transition (`HoloMosaic.jsx`, React Bits, WebGL):
holographic tiles flip in from the centre over the chick (~1.2s, `introSpeed` 2), hold
250ms, then flip back out from the edges inward (~1.2s) over a now-transparent overlay,
revealing the landing page. Pointer interaction is off. Without JS the overlay fades out
by itself at 3.5s (600ms); without WebGL it is removed when the transition would start.
Reduced motion skips the intro entirely.
