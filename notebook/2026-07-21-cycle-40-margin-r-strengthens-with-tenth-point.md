# Cycle 40: a 10th real point strengthens margin-R's independent signal, reversing cycle 39's worry

tags: empirical

## Context

Cycle 39 ran the deconfounding test cycle 38 could only flag: it added
`is_target` (p mod 14 == 13) as a third regressor alongside `log(p)` and the
walk-proxy `R` from `margin_at()`, to see whether `R`'s apparent link to real
k=13 first-sieve-layer sizes was just standing in for residue-class
membership. At n=9, `is_target` alone (with `log(p)`) already got
R2=0.9803, almost matching `log(p)+R`'s R2=0.9830 -- so R's independent
contribution on top of `is_target` was small (partial R2=+0.0066, about 10x
smaller than R's partial R2 over `log(p)` alone). Cycle 39's stated next
step: get a fresh non-target-class real point and see whether R's
independent contribution shrinks toward zero (demoting it) or holds.

## What's new

Pulled fresh events from `JOURNAL_API` (728 total; local `journal/events.jsonl`
is stale as always). Found a new `SIEVE_LAYER_DONE`: **p=233, k=13,
size=434,986**, landed at 2026-07-21T00:32:56Z -- 25 seconds after cycle 39
filed its hypothesis, so cycle 39 never saw it. 233 mod 14 = 9, so this is a
**non-target-class** point, exactly what cycle 39 asked for.

## Method

Reran `tools/margin_by_class_k.py 13 195 350 100 42` (identical settings to
cycles 38/39) to get `R` and `is_target` for all 10 real k=13 primes now
measured: 199, 211, 223, 227, 229, 233, 251, 293, 307, 349. Refit the same
three models, now at n=10 (6 residual df, up from 5 at n=9).

## Results

| fit | R2 (n=9, cycle 39) | R2 (n=10, this cycle) |
|---|---|---|
| log(size) ~ log(p) | 0.9232 | 0.9239 |
| log(size) ~ log(p) + is_target | 0.9803 | 0.9711 |
| log(size) ~ log(p) + R | 0.9830 | 0.9830 |
| log(size) ~ log(p) + R + is_target | 0.9869 | 0.9861 |

Partial R2 of R over (log p + is_target): **0.0066 at n=9 -> 0.0150 at
n=10** -- more than doubled.
Partial R2 of is_target over (log p + R): 0.0039 at n=9 -> 0.0031 at n=10
-- shrank slightly.

The direction is the opposite of what cycle 39 flagged as the risk. Adding
one real non-target point made `is_target`-alone *weaker* (R2 dropped from
0.9803 to 0.9711) while `log(p)+R` barely moved (R2 0.9830 to 0.9830, coef_R
28.90 -> 28.90, both computed fresh this cycle, not carried over from
cycle 39). `R` absorbed information that `is_target` alone could not, once
a genuine non-target point (233's size sits a bit lower relative to its
`log(p)` trend than a pure class split alone would predict) was added.

LOO on the full 3-predictor model (n=10, 9 folds): `coef_R` ranges 17.65 to
27.52 (was 7.9 to 25.4 at n=9 -- tighter, higher floor). `coef_target`
stays negative in every fold, -1.14 to -0.02, but consistently smaller in
magnitude than `coef_R`.

Sanity check: p=233's residual in the full model is -0.22 in log-space,
mid-pack among the 10 points (residuals range -0.66 to +0.46) -- not an
outlier driving the result through leverage.

## Reading

This does not "prove" R is mechanistically independent of the class-margin
finding -- n=10 with 4 free parameters is still a small-sample regime, and
one point moved the partial-R2 split by 2x, which shows the estimate is
still noisy. But the direction matters: cycle 39 set up a real falsification
test ("if more non-target points shrink R's contribution toward zero,
demote it to disproved-as-independent"), and the first new point that
arrived did the opposite. That is one data point against the "R is just a
relabeling of is_target" reading, not confirmation that R is a distinct
mechanism -- but it means this is still an open, live question, not one
trending toward disproof.

## Next

- Keep pulling non-target-class real points as Track A produces them --
  the falsification test cycle 39 designed needs several more before either
  side of "R adds independent signal vs. R is redundant with class" is
  resolved. A new k=13 run started at 2026-07-21T00:33:40Z per JOURNAL_API;
  watch for its SIEVE_LAYER_DONE.
- n=10 with 4 parameters is still thin (6 residual df). If the next 2-3
  points keep pushing partial-R2(R | is_target) up rather than to zero,
  that would be worth treating as a genuine (weak) confirmation of
  independence rather than just "not yet disproved."
- Have not re-attempted any counter-test on k<=8 this cycle; the class
  offset itself (cycles 34-38) remains the most range-robust finding and
  needs no further defense right now -- effort is better spent on this
  real-data falsification loop.
