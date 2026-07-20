# DESIGN.md — The Lonely Runner Experiment (v2, council #2)

## Aesthetic lane

"A living issue of a mathematics journal." Ivory paper, ink, one wax accent.
Not neon-crypto, not arXiv-cosplay, not the competitor's cream curve-shelf.
The page IS the experiment, typeset: title page, figures, specimens, ledger.

## Color (OKLCH)

- `--paper:      oklch(0.97 0.012 90)`   warm ivory, the page
- `--paper-deep: oklch(0.945 0.014 88)`  figure plates (graph-paper wells)
- `--ink:        oklch(0.25 0.02 260)`   text, curve strokes
- `--ink-soft:   oklch(0.45 0.018 258)`  secondary text
- `--ink-faint:  oklch(0.62 0.014 255)`  captions metadata, rules text
- `--hairline:   oklch(0.86 0.012 90)`   rules, graph grid
- `--wax:        oklch(0.55 0.15 30)`    THE accent: stamps, δ values, live
                                         markers, witness dot. ≤10% surface.

Reserved ritual: a certified COUNTEREXAMPLE inverts the page (ink surface,
paper text). The page earns that moment; nothing else may use inversion.

## Typography

- Body + display: **EB Garamond** (400/500/600 + italics), old-style
  numerals via `onum`. Article voice, formulas hand-set in italics.
- Data: **Fragment Mono** for everything traceable: tuples, δ, hashes,
  event numbers, readouts. Mono on this page always means "real data".
- Title clamp(2.5rem, 6vw, 4.4rem); body 1.17rem/1.62 max 62ch.

## Structure ("живая статья", Kimi; tactical moves, Codex)

Single scroll column (max 46rem), right margin rail on ≥1280px:

1. Masthead: mono wordmark, §-anchors, live event № (wax).
2. Ticker strip: latest event one-liner, honest "journal is quiet" state.
3. Title page: kicker, question headline, authors line, ruled Abstract
   with live wax numbers inline.
4. Fig. 1: exponential-sum curve z(t)=Σexp(2πi·v_j·t) of the reigning
   certified tuple, graph-paper plate, stroke-draw animation, wax
   registration stamp, witness dot synced to Fig. 2's clock.
5. Fig. 2: the runners circle (ink restyle), exclusion arc in wax at the
   certified witness; time warps slow near the witness moment.
6. Display equation + timeline ledger (1967 → open).
7. §2 Specimens: shelf grid of certified tuples, each drawn as its own
   curve; caption = tuple, δ, status, event № (links to ledger), hash.
8. §3 The experiment: three tracks as ruled entries with mono readouts.
9. §4 Ledger: the journal as appendix table, hash chain head, download.
10. §5 Do not trust us + papers footer.

Margin rail = plotter: prints incoming events (wax for certification
events), an italic "tight!" note when one lands. Mobile: rail becomes the
ticker strip; no horizontal canvases anywhere.

## Motion

- Curve draw-in via stroke-dashoffset (6s, ease-out); stamp scale-in
  (1.25→1, 280ms); ledger/rail lines fade in; title 3-line stagger.
- The witness dot and runners share one clock; time crawls near the
  witness so the lonely instant reads.
- transform/opacity only; reduced-motion = static witness frame.

## Bans honored

No em dashes in copy. No side-stripes, gradient text, glass, hero-metric
tiles, identical icon-cards. Mono never decorates: if it's mono, it's data.
