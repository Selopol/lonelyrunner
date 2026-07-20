# DESIGN.md — The Lonely Runner Experiment

## Aesthetic lane

"University lecture-hall chalkboard after a number theory seminar."
Not neon-crypto, not arXiv-white, not editorial-magazine. The chalkboard is
the literal surface mathematics is done on; the site is one continuous board.

## Color (OKLCH, Drenched strategy)

The surface IS the color: deep chalkboard slate-green. Chalk does the talking.

- `--board:      oklch(0.23 0.02 170)`  page background, the board
- `--board-deep: oklch(0.18 0.018 172)` console wells, hero vignette
- `--chalk:      oklch(0.93 0.006 165)` primary text, strokes
- `--chalk-dim:  oklch(0.72 0.01 168)`  secondary text
- `--chalk-faint:oklch(0.45 0.012 170)` construction lines, rules
- `--ochre:      oklch(0.78 0.13 75)`   the single accent: loneliness arcs,
                                        live markers, links. Chalk ochre.
- `--alarm:      oklch(0.62 0.19 25)`   reserved: COUNTEREXAMPLE events only.

No #000, no #fff. Accent stays under ~10% of surface except the hero arc
moment. Alarm red appears only if the impossible happens; the page earns it.

## Typography

- Display + body: **STIX Two Text** (Google Fonts). The literal typeface of
  mathematical publishing; formulas set natively (‖v·t‖, δ, ≥ 1/14).
- Data + console: **Fragment Mono**. Terminal-manual, not a costume: every
  mono glyph on the page is real data from the journal.
- Scale: fluid clamp, ratio ≥ 1.3. Hero headline clamp(2.8rem, 8vw, 7rem)
  STIX 600. Body 1.06rem/1.65, max 68ch. Light-on-dark: line-height +0.05.
- Caps only for short labels (one kicker, console headers). Never body.

## Layout

Long scroll, one dominant idea per fold. Asymmetric: hero text left third,
circle canvas occupying right two thirds, overlapping the fold. Sections
breathe with clamp(4rem, 12vh, 9rem) separations; console is a full-bleed
dark well. Three tracks are a ledger (rows of different depth), never
identical cards. No side-stripe borders, no gradient text, no glass.

## Imagery

The hero canvas IS the imagery: 14 chalk dots on a drawn circle, replaying
certified tuples with their exact witness moments. Faint construction
geometry (radius, exclusion arc) appears as the animation needs it. A soft
chalk-dust texture (CSS noise, 2% opacity) keeps the board physical.

## Motion

- Page load: three staggered line reveals in the hero (translateY 12px,
  opacity, 600ms, cubic-bezier(0.22, 1, 0.36, 1), 90ms stagger). Nothing else
  moves on load except the circle, which is always running.
- Scroll: single IntersectionObserver, sections fade up once. No parallax.
- Console lines append with a 150ms opacity ease. No typewriter effects.
- Never animate layout properties. transform + opacity only.

## Components

- **Circle canvas**: chalk stroke circle, 13 runner dots + observer at angle
  0 in ochre. Time scrubs continuously; when min distance ≥ 1/14 the ochre
  exclusion arc draws and the caption cites the EXACT certified witness
  (e.g. "lonely at t = 1/14, certified, event #83"). Tuple, δ and event hash
  printed under the canvas in Fragment Mono.
- **Proof console**: full-bleed well, Fragment Mono 0.82rem, real journal
  tail, newest last, each line `seq · type · payload digest · hash[0:8]`.
  Raw log links. Auto-polls /api/events.
- **Ledger rows** (tracks, timeline, papers): baseline-aligned rows with
  chalk-faint 1px rules, generous leading, no boxes.

## Copy

No em dashes. Question headline. Every metric traceable to an event.
