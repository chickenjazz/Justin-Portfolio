---
archetype: scenic
intensity: quiet
engine: css
easing_budget: 4
loop_budget: 4
signature: "scroll-driven hero-to-About mascot morph"
duration_scale: [160, 240, 500, 600, 1100, 4800, 5000, 6000, 7000]
---

# Motion

Hero and About form one sticky slideshow. Native scrolling drives a reversible
hero → morphing → About sequence over 135vh on desktop and 100vh on mobile.
One shared mascot moves and scales between measured positions: purple cube,
rounded intermediate shape, then clear glass. The dark background crossfades
to white as the hero exits. The requested morph replaces the former static handoff.

About words follow scroll progress individually from 53–97% of the sequence;
the label, heading and paragraph reveal in reading order. Hero copy and later
section headings enter once with IntersectionObserver: 500ms ease-out, 35ms
word spacing (capped after word 24), and 8px travel. Mobile About words only fade.
Native scrolling remains uninterrupted; there are no wheel or touch overrides.
The About anchor points to the completed slide. Hidden hero controls become inert.

Engine: CSS plus one event-scheduled requestAnimationFrame for scroll values;
no new library, no React renders on scroll. Geometry is cached and measured
only on setup, resize, font load and page restoration. Morph uses smoothstep;
words use ease-out. Existing ambient motion remains subordinate to the morph.

Documented paint exceptions: the small mascot's glass colour mixes, shadows,
border radius and satellite saturation change with progress to express its
material and shape states. Position and scale use transforms; the full-screen
background uses opacity. Layout measurement is confined to resize/setup frames.

Reduced motion and prerendered/no-JavaScript HTML retain normal stacked Hero
and About sections with all words visible. Reduced motion disables pinning,
travel and floating loops. Preference changes rebuild the scene live. Mobile
uses a smaller mascot above the copy and a shorter scroll range. Screens at
650px tall or shorter use normal stacked sections so content stays reachable;
word entrances remain enabled there unless reduced motion is requested.
