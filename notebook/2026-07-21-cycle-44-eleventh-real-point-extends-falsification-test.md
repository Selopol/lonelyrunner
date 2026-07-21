# Cycle 44: an 11th real k=13 point extends the R-vs-class falsification test

tags: empirical

## Context

Cycle 43 was blocked: no new real k=13 or k=11 data existed, so it fell back
to a standard-deviation side check. Standing state going into this cycle
said "stuck at n=10 since p=233." First thing this cycle: pull JOURNAL_API
fresh anyway, per the brief's own rule, rather than trust that note.

## What's new

`JOURNAL_API` now has 758 events (up from 747 at cycle 43). Among the new
ones is a `SIEVE_LAYER_DONE` for **k=13, p=239, size=1,449,830** that was
missing from the standing knowledge's list (which jumped straight from
p=233 to p=251). That gives an 11th real k=13 first-sieve-layer point. Still
confirmed **zero** real k=11 `SIEVE_LAYER_DONE` points in the journal.

## Method

Computed `R` and `is_target` for p=239 at k=13 with the same settings used
for every other point in this series (`tools/margin_by_class_k.py 13 <lo>
<hi> 100 42`): `R=1.18392`, `is_target=0` (239 mod 14 = 1, not 13 -- a
non-target-class point, same as p=233 was at cycle 40).

Added it to the n=10 regression set from cycles 39/40 (`tools/_regress_n10.py`,
now `tools/_regress_n11.py`) and reran the same three-model comparison:
`log(size) ~ log(p)`, `~ log(p)+is_target`, `~ log(p)+R`, `~
log(p)+R+is_target`, plus leave-one-out on the full model. This continues
exactly the falsification test cycles 39/40 designed: does adding real
non-target-class points shrink `R`'s independent contribution over
`is_target` toward zero (demoting it), or hold/grow?

## Results

| fit | n=9 (cyc 39) | n=10 (cyc 40) | n=11 (this cycle) |
|---|---|---|---|
| log(size) ~ log(p) | 0.9232 | 0.9239 | 0.9076 |
| log(size) ~ log(p)+is_target | 0.9803 | 0.9711 | 0.9689 |
| log(size) ~ log(p)+R | 0.9830 | 0.9830 | 0.9829 |
| log(size) ~ log(p)+R+is_target | 0.9869 | 0.9861 | 0.9860 |

Partial R2 of R over (log p + is_target): **0.0066 (n=9) -> 0.0150 (n=10)
-> 0.0172 (n=11)** -- third consecutive real point that pushes this number
up, not toward zero.

Partial R2 of is_target over (log p + R): 0.0039 -> 0.0031 -> 0.0031 --
flat/shrinking, as before.

LOO on the full model (11 folds): `coef_R` ranges 18.39 to 28.39 (was 17.65
to 27.52 at n=10) -- never crosses zero, similar width. `coef_target` stays
negative every fold, -1.18 to -0.08.

Sanity check: p=239's residual in the full 3-predictor model is +0.226,
mid-pack among the 11 points (range -0.687 to +0.431) -- not an outlier
driving the result through leverage, same check cycle 40 ran for p=233.

## Reading

This is not new evidence of a different kind -- it is the third data point
in a row (233 at cycle 40, 239 now, plus the original n=9 baseline) landing
on the same side of the falsification test cycle 39 set up. Each real
non-target-class point that has arrived since has made `R`'s independent
contribution over class membership larger, not smaller. That is now three
strikes against the "R is just a relabeling of is_target" reading, and zero
strikes for it. Still thin -- n=11 with 4 free parameters leaves 7 residual
df, and the underlying `R` proxy is still the reconstructed random-walk
simulation from cycle 35, not the real solver's DFS -- but the trend is
consistent and has never once reversed across four additions (n=9→10→11,
counting cycle 34's original n=8 too, per cycle 41/42/43 notes).

## Next

- Keep pulling fresh real k=13 points every cycle before assuming any
  "stuck" note in the standing knowledge is still true -- it was wrong this
  cycle (n=10 -> n=11 sitting unnoticed in the journal).
- Still zero real k=11 points -- the planned 3-point (k=8/10/11) extension
  of cycle 42/43's beta_R and class-gap trends remains blocked. Keep
  checking.
- If a 12th k=13 point arrives, worth checking whether it's target-class
  (223, 251, 293, 307, 349 are the only target points so far, 6 of 11 are
  non-target) -- the test so far has only been fed non-target points since
  n=9; a fresh target-class point would test the other direction.
