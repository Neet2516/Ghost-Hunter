# Design System
Inspired by the *language* of b-egg.farm (editorial storytelling, oversized type, color blocking, asymmetry, cinematic scroll). **Not a clone**: no copied text, assets, layouts, branding. Metaphor: a signal-hunting agent — radar, trails, clocks, quiet ghost motifs. Sophisticated, never Halloween.

## Palette (tokens)
- `--ink` #0E0E10 · `--paper` #F3EFE6 (warm off-white) · `--signal` #FF5B2E (alert/action) · `--phantom` #B9B4FF (ghost/waiting) · `--moss` #1F3D2B (replied/safe) · `--bone` #E4DED0 · `--ash` #6B6B70.
- Color blocking: full-bleed sections alternate ink / paper / signal / moss. Status colors: WAITING phantom, GENERATING signal, AWAITING_REVIEW amber #F2B84B, REPLIED moss, CANCELLED ash, FAILED #C2261B.
## Typography
Display: a high-contrast grotesk/condensed (e.g. "Anton" or "Bricolage Grotesque" 800) at clamp(4rem, 14vw, 14rem), tight tracking −0.04em. Body: "Inter"/"Instrument Sans" 16/24. Mono: "JetBrains Mono" for timers, IDs, data. Hierarchy: Display XL / H1 / H2 / Lead / Body / Caption / Mono-data. Giant numerals for days-waiting.
## Spacing / grid
8px base scale (4,8,16,24,40,64,96,160). 12-col grid, 24px gutters desktop; 4-col mobile. Intentional asymmetry: content offset 1–2 columns; oversized elements may bleed off-grid.
## Borders, shadows, radius
1px ink hairlines, 2px for emphasis; no soft drop shadows (use offset hard shadow `4px 4px 0 ink` sparingly); radius 0 default, pill (999px) for status chips only; cards only for draft review and list rows.
## Components
Buttons: primary = solid ink on paper (inverts on hover with wipe fill), secondary = underlined text with arrow, destructive = signal outline. Inputs: bottom-border only, large label above, focus = signal underline thickens. Nav: slim top bar + full-screen overlay menu with oversized links. Grain: SVG noise overlay 4–6% opacity.
## Status/timeline/data viz
Status chip (dot + mono label). Timeline: horizontal "trail" line with nodes (apply → wait → signal → follow-up → reply); waiting segment animates as dashed pulse; fired timer = node burst. Data: oversized numbers, thin-line sparklines, no pie charts.
## Iconography/imagery
Thin 1.5px line icons (Lucide). Illustration: generated SVG radar rings, trails, abstract ghost silhouette made of waveform lines; no stock photos.
## Motion principles & responsive — see ANIMATION_SYSTEM.md. Breakpoints 480/768/1024/1440; mobile stacks asymmetry into single column but keeps giant type (clamped).
