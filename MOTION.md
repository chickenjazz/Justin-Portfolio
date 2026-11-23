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
and keeps only the opacity fade. The existing mascot float remains unchanged.

The stage grows with content; when taller than the viewport its sticky offset lets
the viewer read the entire composition. No milestones or education duplication
remains below. Timeline dates are supplied academic dates; project experience
has no invented dates. Header, footer and the project carousel remain intact.

Viewport containment fix: the sticky track uses explicit content height (stage +
scroll distance), never padding for scroll travel. The stage is 100svh at top: 0.
Progress and dot destinations share the same track origin. Short screens keep
the mascot visible and provide native scrolling inside longer content panels.
