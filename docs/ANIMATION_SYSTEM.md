# Animation System
Principle: motion communicates **state, hierarchy, or story**. Nothing animates decoratively on app screens.
| Need | Tool | Spec |
|---|---|---|
| Smooth scroll (landing only) | Lenis | lerp 0.08; disabled in app pages and reduced-motion |
| Scroll story (landing) | GSAP ScrollTrigger | pinned sections: Apply→Wait→Signal→Follow-up→Reply; scrub timeline line |
| Page load | Framer Motion | ink curtain wipe 600ms, then headline line-by-line mask reveal (stagger 80ms) |
| Typography reveal | Framer Motion | translateY 100%→0 inside overflow-hidden lines, ease [0.76,0,0.24,1] |
| Section/image reveal | GSAP | clip-path inset(100% 0 0 0)→inset(0), 900ms |
| Parallax | GSAP | ≤ 12% travel, display type vs. SVG layers, desktop only |
| Horizontal movement | GSAP | "how it works" horizontal pinned scroll on desktop; vertical stack on mobile |
| Hover | Framer Motion | link underline wipe, button fill wipe 250ms; magnetic effect on primary CTA (±8px, desktop only) |
| Nav | Framer Motion | overlay clip-path circle expand from button, links stagger |
| Workflow timeline | Framer Motion | node status change: scale pulse + color tween 400ms; waiting segment dash-offset loop (CSS) ; countdown digits tick (mono, tabular) |
| Status transition | Framer Motion layout | list rows reorder with `layout` |
| AI generation | Framer Motion | "writing" shimmer lines while GENERATING; text streams in by word once ready (≤ 1.2s total) |
| Loading | CSS | radar sweep (conic gradient rotate 3s) |
**Reduced motion:** `prefers-reduced-motion` → disable Lenis, parallax, pinning, magnetic; replace with 150ms opacity fades; keep state color changes.
**Mobile:** no magnetic, no parallax, simplified pins. **Performance:** animate transform/opacity/clip-path only; ≤ 60fps; lazy-load GSAP on landing route; no animation libraries in app routes beyond Framer Motion; kill ScrollTriggers on unmount.
