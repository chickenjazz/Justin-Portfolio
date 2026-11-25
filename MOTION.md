---
archetype: scenic
intensity: moderate
engine: css
easing_budget: 7
duration_scale: [90, 160, 200, 260, 320, 420, 560, 700, 900, 1100]
loop_budget: 7
signature: "scroll-driven two-state mascot composition"
---

# Motion

Budgets as built: easings are smoothstep, ease-out `(.22,1,.36,1)`, snap `(.34,1.56,.64,1)`, easeOutBack, ease-in-out, `ease`, linear and the intro hop's gravity curve `(.33,0,.67,1)`; loops are counted by family (7, the budget): the hero scene (chick, 3D name, shapes and background, which pause together off-screen), the CTA word bands, the Honors carousel autoplay, the Skills tile wall, the entry-intro hop, the backdrop-shape float and the project-card demos (7, raised from 6 when the cards' demos became loops).

The rule above all: **never stuck mid-transition.** Every scene change (hero morph, project
stack, CTA colour change) is time-based and always runs to its end, from wherever it was
interrupted. It also never lags behind the scroll that caused it: once the scroll reaches the
destination (the Description's position, the destination card, the full CTA, or the top of
the page on the way back) while the change is still running, the rest of it is compressed into
at most 280ms (`hurryTiming` in `motion.js`: the clock is re-timed, so the value stays continuous
and only the remainder speeds up). A fast flick or an anchor jump therefore never leaves a scene
half-changed as it scrolls away. Gestures follow the same rule: an Honors drag that loses its
pointer capture springs back to rest, and hover-pauses apply only to real hovering pointers,
because a tap leaves `:hover` stuck on touch screens.

Audit exceptions (`tools/audit.mjs` cannot see these, so it still reports them):
- **engine `three`**: three.js is the hero's WebGL renderer, not an animation library; every
  motion in it is driven by the scene weights on its own rAF loop, and CSS stays the only
  animation engine.
- **loops**: the script counts declarations (18), not families (7): the intro hop is three
  declarations (hop, shadow, blink), the CTA bands and backdrop float each restate their
  loop inside `@supports (animation-timeline: view())`, and the project-card demos are nine
  declarations on one shared 8s / 9s clock (the parts of the two device demos).
- **durations off the scale**: loop periods (8s / 9s project demos, 70s tiles, 38s/52s bands, 7-10.2s float, 5s hero
  float, 4.8s letters, 1.5s blink) and the intro's timing gates (2.3s minimum, 3.5s fallback)
  are periods and gates, not transition durations.
- **layout reads near rAF**: `App.jsx` reads once after load; `HeroAbout.jsx` reads only on
  resize, font load and scene readiness (mobile word heights are cached, never read per frame);
  `Cta.jsx` measures its track on resize of the body, never on scroll.

Native scroll drives two states of one scene: the Hero (Introduction) and the
Description. A sticky scene stays within its own scroll track (1.6 viewports of travel);
there are no wheel/touch overrides and the page never snaps or glides: wherever native
scrolling rests, it stays. Scroll position only selects the destination state; the morph
itself is time-based (1100ms, smoothstep), so the scene never rests between the two.
Selection follows the direction of travel: scrolling down 18% of a viewport past the Hero
commits to the Description; scrolling up 18% back from it returns to the Hero.
Interrupted morphs restart from the current blend; scrolling back reverses the same
weights, and the first placement after load (deep link, mid-page reload) jumps without
morphing: a first-load `#description` or `#top` is applied instantly once the track is
measured; on a reload or back/forward the browser's restored position is kept instead.
Afterwards `#description` smooth-scrolls to its state's exact position and `#top` (brand,
"Back to top") to the very top of the page, header included. Both use
the hero's own path (not the realign below). Other section links (`#work`, `#skills`, `#contact`) re-align once after load,
when the sticky tracks have sized themselves, unless the visitor has already started
scrolling or the browser is restoring a position (reload, back/forward). All scene
geometry and materials share these weights. While the Description holds, a scroll-linked
drift (0 at the 18% commit, 1 at the track's end, scaled by the Description's weight)
lifts the chick by 12% of the stage height, each crystal pop shape by 18% + 10%·i, and
the Description copy by 5%, so the hold reads as parallax rather than a frozen slide.
Entering panel copy fades and rises 14px (700ms, cubic-bezier(.22,1,.36,1), 380ms
delay, 80ms stagger); leaving copy fades in 260ms. Reduced motion snaps the morph,
drops the hold drift and keeps only the opacity fade.

The Stats section follows the hero and its white gradient overlaps the last 40svh of the
scene track (opaque only at the track's end); the cards themselves start min(15svh, 5.5rem)
before the track ends (2rem on the two-column layout, ≤900px), so they rise over the
still-pinned chick on the white Description background instead of sliding in under a hard
edge. The overlap is capped so no card covers the Description copy or the hero's social
links, with or without the parallax and reveal offsets. Cards rise with a 90ms stagger (reveal `rise`), drift at
parallax depths .15 / .3 / .2 / .35, and their numbers count up over 1000ms (smoothstep)
as the grid enters view. Reduced motion shows static numbers and no rise.

One full-stage WebGL layer (`SceneCanvas.jsx` + `sceneRenderer.js`) draws the chick, the
3D name and the shapes, as render targets of the same scene weights. The chick: `glass`
blends lavender to crystal pearl, `turn` tilts, `hue` tints, with a 5s float and a slow
perspective drift (11s yaw, 15s pitch). Character life (off under reduced motion): the tuft
bobs (1.7s stretch + sway), the wings give a double flap every 3s (0.64s), and the eyes blink
every 4.2s (every third a double blink). The chick is lit by a warm key from above-left, a
cool lavender rim and a lilac/deep-violet sky/ground fill (so shadows fall to purple, like the
reference) over a dimmed room environment; its beak is warm apricot, the lavender's
complement. The name: extruded DM Sans letters placed from the
hidden DOM letters, each with a staggered 4.8s bob and slow 3D tilt. Shapes (black knot,
mint torus, black rounded cube) spin slowly around the Introduction position.
Leaving the Introduction follows the chick down: the name and shapes are left behind,
rising by depart² × 1.15 stage heights (deeper objects up to 35% faster), while the chick
dips (sin(π·depart) × 8% of the stage) on its way to the Description. There only the
chick remains, joined on desktop by three crystal shapes that pop in one after another;
the h1 stays in the DOM, visually hidden. Ambient loops pause off-screen and are
off under reduced motion (states snap). Until WebGL is ready, or if it fails, the flat
DOM name and the Blender poster show instead, and the name rises away the same way.

Hero social links (GitHub, LinkedIn, Email) sit centred along the bottom of the scene. On hover or keyboard focus an underline draws in from the left (scaleX, 320ms, ease-out `(.22,1,.36,1)`) and retracts to the right on leave, while the ↗ nudges 2px up-right with the snap easing (240ms). Reduced motion: the underline fades in, the arrow stays put.

Header and section navigation (`Header.jsx`, styles in `styles.css`; the "Quiet glide" option from the prototype): a floating frosted pill (dark glass at 80%, 14px backdrop blur, fixed 14px from the top, centred) holds the brand, the header links and Résumé ↗. It hides by direction of travel: 12px of downward scroll slides it up out of view (`translate` -130% of its height, 320ms, ease-out `(.22,1,.36,1)`), and 4px of upward scroll brings it back the same way. It always shows within 40px of the top and whenever keyboard focus is inside it. The scroll handler reads only `scrollY`, once per frame, and toggles a class. The current section comes from an IntersectionObserver line 40% down the viewport (the later section in page order wins where sticky tracks overlap; Contact counts only once the CTA scene has turned dark, and Milestones holds until then). A lavender lozenge behind the current header link glides between links by `clip-path: inset(... round 999px)` (420ms, ease-out), lands without gliding the first time, and fades out (200ms) on sections without a header link (Home, Milestones). On desktop (≥1000px) a rail of seven section dots sits on the right edge: the current dot stretches from 6px to 22px by `clip-path` (320ms, ease-out); names show on hover or focus as a small tag that fades in and slides 6px (200ms, ease-out, the Skills tooltip timing); the rail switches to light ink over the dark CTA. Over the project stack, which has its own progress rail on the right, the dots fade out (200ms). On narrow screens (≤800px) the pill spans the width and wraps onto two rows instead of scrolling sideways; the hero's stacked mobile name and the Description start 100px down the stage to clear it. Reduced motion: the header fades instead of sliding, and the lozenge and dots change without travel.

Viewport containment fix: the sticky track uses explicit content height (stage +
scroll distance), never padding for scroll travel. The stage is 100svh at top: 0.
Anchor destinations share the same track origin. The Description panel never
scrolls: its tagline is sized by width and height (min(4.6vw, 8svh)), and on short
stages the panel rises until it clears the bottom bar, staying below the header.

Project stack (after the React Bits Pro "Scroll Stack" reference): a sticky 100svh dark
stage (#08070b) inside an explicit-height track (`useScrollStack`: 0.6 viewport of
scroll per card, half-viewport hold on the last card before release). Native page scroll
is never corrected; scroll only chooses the card, with the same direction-of-travel rule
as the hero (`nextCard` in `stackMath.js`): a scroll of 15% of a card step either way
commits to the neighbour, so one scroll switches projects. The change itself is
time-based (750ms smoothstep, interruptions restart from the current state; first
placement jumps; instant under reduced motion), so the stack never rests between two
cards wherever the scroll stops. Each card gets an offset d from the animated progress
(`stackLayer` in `stackMath.js`). The incoming card rises from 100svh below over the
current one. Covered cards slide up 26px per step so their top edge peeks out above the
next, shrink 7% per step, blur up to 4px and darken 28% per step under black, three
steps deep; a fourth fades out and hides. Cards are centred flat-colour panels
(68svh tall, 22px corners, hairline border, no gradients) spanning the section width
with a 4vw gutter; each shows its own counter (01/02) top-right, and a thin progress
rail on the right fills as the stack advances. Cards use the "Poster" composition, picked
from a three-way prototype (`ProjectDemo.jsx` + `ProjectCard.css`): a wall-sized Anton title
(min(19.5cqw, 35cqh)) across the top, the device demo stepping in front of it, the one-liner and
an Anton headline number (Promptee 85%, Vertex 7 LIVE) bottom-left, the tech chips centred at
the bottom and View project / Visit site bottom-right; small DM Mono labels against the huge
title carry the scale contrast. Phones and the no-JS track stack it into one centred column,
device first. Arrival plays once as a card arrives (`.is-ahead` holds cards still below the
stack in the start frame; covered cards keep their content): the title masks up from 105%,
then the device rises 42px, the details and then the chips and links rise 28px, each 900ms
ease-out, 240ms apart; the 85% counts up from 0 (1100ms, 480ms delay). The demos are one loop
family, running only on the current card (`.is-current`), restarting on each arrival and
paused while the section is off screen (`.demos-live`, IntersectionObserver). Promptee (8s):
"make me a website" types in by `clip-path` steps (2-20%), a scan bar sweeps (22-32%), the
Role / Task / Format lines rise 14px (from 32%, 4% apart), the ring fills and the score counts
26 → 67 (45-65%, ease-out, an `@property` integer shown as a CSS counter), it holds, then
everything resets (90-98%). Vertex 7 (9s): the monitor scrolls the full-page capture of the
live site down and back (ease-in-out, 8-55% and 64-95%), while the crane's trolley runs out
along the jib, pays out cable and lowers its load, then winds back. Documented exceptions to
transform/opacity: `clip-path` on the typed prompt, `stroke-dashoffset` on the ring and the
`--score` counter, all paint-only inside the phone. Reduced motion: arrival is a 200ms fade,
the demos hold their finished frame. Without JS the finished frame shows. ←/→←/→ on the focused track scroll to a
card's exact position. Without JS the cards fall back to a horizontal scroll-snap
track. "View project" opens a modal dialog that fades in and rises 15px (240ms, ease-out
`(.22,1,.36,1)`); it closes instantly. Reduced motion shows only the current card (opacity), with no rise, scale or blur.

Entry intro (`Intro.jsx` + `Intro.css`): a full-screen overlay on first paint (prerendered,
pure CSS, so it plays before JS). A line drawing of the chick hops (760ms loop: squash on
landing, stretch on take-off, 38px rise) over a shadow that shrinks and fades at the top,
and blinks every 1.5s. "JM" draws in stroke by stroke (900ms each, 300ms / 650ms delays).
The chick keeps hopping until the landing page is ready: fonts, the window load event and
the hero's 3D scene painting its first frame (or failing, `sceneReady.js`), for at least
2.3s and at most 7s from navigation start. Then the overlay fades out (700ms ease-in-out; "JM" also draws with ease-in-out, the hop uses its own gravity curve `(.33,0,.67,1)`)
while the chick fades and settles to 94% scale (ease-out), revealing the page. Without JS
the overlay fades out by itself at 3.5s (600ms).
Reduced motion skips the intro entirely.

About (`About.jsx` + `About.css`): two columns on white, portrait first when stacked. The portrait drifts with parallax depth .25 over a lavender disc at depth -.15; the eyebrow fades in and the story and education line rise in sequence. Reduced motion: static.

Skills (`Skills.jsx` + `Skills.css`, `TiltedTiles.jsx` + `.css`): a giant centred Anton SKILLS heading rises in with parallax depth .2, then the centred tech-stack icon row pops in with a scale stagger. Each icon is focusable; on hover or focus its face lifts 4px (snap easing, 240ms) and a dark tooltip with the tool's role in the work rises 6px and fades in above it (200ms fade, ease-out). Below, filling the bottom three quarters of the section, a tilted tile wall (after React Bits Pro "Tilted Tiles", turned sideways): a 260%-wide plane leaned back 40deg, turned 16deg and spun -20deg at 1600px perspective, whose three rows of category tiles loop horizontally, every other row in the opposite direction, 70s per loop with a 13% head start per row. Every tile shares one look: a warm light-grey card with a small purple monospace eyebrow (number and skill count), the category as a bold DM Sans title, and its items in muted monospace at the bottom. Its top fades up behind the icon row. Resting the pointer on any tile pauses every row; moving off resumes them. A fine pointer steers the tilt by up to 8deg (900ms ease-out). Loops pause off-screen. The wall is decorative (aria-hidden; not inert, so hover can reach it, and it holds nothing focusable); a visually hidden list carries the categories. Reduced motion: rows stand still and the tilt ignores the pointer.

Honors (`Honors.jsx` + `Honors.css`, images in `public/honors/`): a centred Anton "HONORS & CERTIFICATIONS" heading rises in ("Certifications" in accent ink) above a prism coverflow sized to fit one viewport, set off from the Skills wall by a clamp(5rem, 16svh, 12rem) top margin (active card min(80vw, 46svh×1.3, 700px), 1.3:1). The active certificate sits centred in colour; up to two neighbours per side are 0.66-scale, 55%-width monochrome crops (dimmed to 80%; hover lets some colour in), laid out by `transform` + `clip-path` only (760ms, ease-out). A newly active card takes its colour left to right behind a soft mask edge with a spectrum band riding that edge (1100ms, ease-out); while the carousel moves or is dragged only the showcased card splits into magenta/cyan drop-shadow ghosts (650ms). Autoplay steps every 3s, looping, only while the carousel is ≥35% on screen, the tab is visible and the pointer or focus is not inside. Navigation: prev/next buttons with a counter, arrow keys, drag/swipe (one step per neighbour width), click a neighbour. The caption (kind, title, meta) crossfades and rises 10px. Reduced motion: no autoplay, no sweep, no dispersion, instant steps.

Closing sections (`Gallery.jsx` milestones, `Cta.jsx`, `Footer.jsx`, `Closing.css`): the milestones heading and sub-line rise in, then five empty dashed frames (three on narrow screens) fade in tilted via `rotate` (-4/3/-2/5/-3deg) and drift with varied parallax depths. The CTA echoes the hero's morph: it is two states of one pinned scene (`Cta.jsx`), a sticky 100svh stage inside an explicit-height track (stage + 1.5 viewports: one morph step plus half a viewport of hold). Arriving from the white Milestones, the stage is still all white and transparent, so its track slides 65svh up under the end of Milestones (pointer events pass through while white): the stage pins with the milestone frames still in view, and the colour change commits as their lower edge reaches the upper third of the screen, so there is no screen of empty white between the two. The same direction-of-travel rule as the hero (`nextScene`, 18% commit) selects the state, and the colour change is time-based (1100ms, smoothstep, interruptions restart from the current blend; first placement jumps): two stacked opacity layers take the stage from white through the site's lavender (in by the halfway point) to a dark purple gradient (#2c1a52 → #1d1138 → #140b24 with a #3c2770 glow). Then the scene enters in sequence: the chick pops in (scale .4 → 1, 560ms snap easing, 600ms delay), followed by the word bands (850ms), the crystal shapes (970ms) and the buttons (1090ms), each rising in over 700ms ease-out (bands and shapes 40px, buttons 14px). Leaving, everything fades out in 260ms while the gradient fades back to white. The buttons stay focusable while hidden and keyboard focus inside the scene commits to the full state; `#contact` links and first-load deep links land on the full state. The footer continues the same dark purple, so the scene runs straight into it. Without JS the scene is simply full-bleed. Behind the chick, two oversized word bands (one solid white, one outlined, tilted -5/3deg) move constantly: a linear marquee loop on `transform` (one run of the repeated words per cycle, 38s for the solid band, 52s reversed for the outlined one), paused while the stage is off-screen, plus a scroll-linked drift on `translate` (`view()` timeline, -4% → -20%) where supported. The loop belongs to the marquee family in the loop budget. The stage clips with `overflow: clip`, not `hidden`, so it does not capture the view() timelines. The chick holds still once it has popped in (no float loop: the bands already keep the stage moving). Reduced motion: the colour change snaps, the chick, bands, shapes and buttons only fade, and the bands stand still.

Backdrop shapes (`BackdropShapes.jsx` + `.css`, sprites in `public/shapes/`): every white section after the hero (Stats, About, Skills, Honors, Milestones, CTA) carries exactly three crystal shapes, still renders of the hero's crystal material (knot, torus, rounded cube, sphere). They sit on two layers: one near shape per section floats in front of the copy (z-index 20, depth .7-.85, 1.5px soft focus; no drop shadow, which would outline the sprite's square), the others sit behind it (depth ~.15-.55, far ones fainter). Each is a `.parallax` element, so it drifts with the section at its depth, and each also bobs on a slow float loop (transform: 22px rise and a 9deg rock, ease-in-out, alternating, 7-10.2s with staggered phase) that runs only while its section is within 20% of the viewport; parallax owns `translate`, the float owns `transform`, the static tilt owns `rotate`. Front shapes hug the edges and drop out on narrow screens. Reduced motion: static, no float.

Section seams (Stats → About → Projects → Skills → Honors → Milestones → CTA → footer): Stats' backdrop bleeds, so its small sphere crosses into About's top padding. About ends in a mirrored gradient band (`--seam`, white through lavender and violet to #08070b) whose colour meets the project stage exactly; a rounded cube floats in it. On the other side the dark project stage hands over to white through a gradient band at the top of Skills (`--seam`, clamp(9rem, 34svh, 22rem)) running from the stage's #08070b through the deep violet of the cards and lavender to white; Skills' first shape floats inside that band, so the crystal reads against dark at first and against white as it scrolls up. From Skills on, sections have no background of their own (the page is white) and clip only sideways (`overflow-x: clip`), and their backdrops `bleed`: one back shape per section crosses its bottom or top edge, so the shapes cross from one section into the next instead of being cut at a hard line. The Honors band keeps 5.5rem below its cards so their shadows are not clipped into a grey edge.

Hover rule: hover effects never target an element carrying `data-reveal`, because the revealed state sets `transform`; put the hover on a child or wrapper instead (as the CTA buttons sit inside the revealed `.cta-actions`).
