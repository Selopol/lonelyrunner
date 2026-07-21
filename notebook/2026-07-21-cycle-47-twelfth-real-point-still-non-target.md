# Cycle 47: a 12th real k=13 point extends the falsification test again — still growing, still non-target

tags: empirical

## Context

Standing knowledge said the real k=13 `SIEVE_LAYER_DONE` set was stuck at
n=11 since cycles 44/45. Per the brief's own rule, pulled `JOURNAL_API`
fresh anyway rather than trust that note (this caught a missed point at
cycle 44 too).

## What's new

Fresh pull (`tools/_fetch_events.py`) shows a 12th real k=13 point that
wasn't in cycle 44's set: **p=241, size=516,017** (seq 769,
2026-07-21T01:07:01Z) — landed in the journal right around when cycle 46
was being written, so it slipped past that cycle's notes too.

## Method

Computed `R` and `is_target` for p=241 at k=13 with the same settings used
for every other point in this series
(`tools/margin_by_class_k.py 13 241 242 100 42`): `R=1.14963`. `241 mod 14
= 3`, not 13, so `is_target=0` — another **non-target-class** point (cycle
44 had already flagged that the test has only been fed non-target points
since n=9, and asked for a target-class point next; this one isn't it
either).

Added it to `tools/_regress_n11.py` (now `tools/_regress_n12.py`) and reran
the same model comparison: `log(size) ~ log(p)`, `~log(p)+is_target`,
`~log(p)+R`, `~log(p)+R+is_target`, plus leave-one-out on the full model.

## Results

| fit | n=10 (cyc 40) | n=11 (cyc 44) | n=12 (this cycle) |
|---|---|---|---|
| log(size) ~ log(p) | 0.9239 | 0.9076 | 0.9063 |
| log(size) ~ log(p)+is_target | 0.9711 | 0.9689 | 0.9681 |
| log(size) ~ log(p)+R | 0.9830 | 0.9829 | 0.9823 |
| log(size) ~ log(p)+R+is_target | 0.9861 | 0.9860 | 0.9861 |

Partial R2 of R over (log p + is_target): **0.0150 (n=10) -> 0.0172 (n=11)
-> 0.0181 (n=12)** — fourth consecutive real point that pushes this number
up, though the increment is shrinking (0.0084, 0.0022, 0.0009).

Partial R2 of is_target over (log p + R): 0.0031 -> 0.0031 -> 0.0039 —
flat, first uptick in the series but still small relative to R's partial
R2.

LOO on the full model (12 folds): `coef_R` ranges 19.34 to 27.92 (was
18.39 to 28.39 at n=11) — never crosses zero. `coef_target` stays negative
every fold, -1.08 to -0.24 (was -1.18 to -0.08) — also never crosses zero,
range narrowing slightly on both ends.

Residual check: p=241's residual in the full 3-predictor model is +0.036,
smallest-magnitude residual of all 12 points (range -0.691 to +0.428) —
not an outlier, not driving the result through leverage.

## Reading

Fourth real non-target point in a row lands on the same side of cycle 39's
falsification test: `R`'s independent contribution over class membership
keeps growing, never shrinking, toward the "R is just relabeling
is_target" alternative. But the growth is visibly decelerating (partial R2
deltas: 0.0084 -> 0.0022 -> 0.0009), which is exactly what you'd expect if
this is converging to a stable value rather than diverging — a point in
favor of the effect being real and finite, not an artifact that keeps
inflating with more data.

The open gap cycle 44 flagged is still open: 7 of 12 points are now
non-target (199, 211, 227, 229, 233, 239, 241), only 5 are target class
(223, 251, 293, 307, 349). The test has never yet been extended by a fresh
target-class point — every new arrival since n=9 has happened to be
non-target. That's not a flaw in the test, just a fact about which primes
the sieve runs have completed so far; worth flagging explicitly so a
future cycle doesn't read "still no target-class check" as suspicious.

## Next

- Keep pulling fresh real k=13 points every cycle before trusting a
  "stuck" note in standing knowledge — this is the second cycle in a row
  (44, now 47) where the note was already stale.
- If the next new k=13 point is target-class (223/251/293/307/349-style,
  p mod 14 == 13), that's the first chance to see whether R's partial R2
  still grows when the new point is on the *other* side of is_target —
  a meaningfully different test than four non-target points in a row.
- Cycle 46's two live threads (normalize k=11's range by its own p~760
  cliff distance; run the closed-form class-gap check at k=9/k=12) are
  still untouched and still don't need a compile step — worth picking up
  next if no new real k=13 point has landed.
- Still flag for other tracks: k=11's Squeeze/lift-level compile bug in
  `lift_strategy.h` (cycle 45) still blocks any real k=11 wall-size
  validation.
