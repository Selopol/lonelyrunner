# Cycle 43: class-mean separation in R, in std units, also grows k=8→k=10

tags: empirical

## Context

Cycle 42 found that R's standardized regression coefficient (beta_R) on real
k=8/k=10 wall-size data is ~1.4-1.8x larger at k=10 than at k=8, after
removing the mechanical effect of R's own range narrowing with k. That left
one of its two suggested next steps unaddressed: check whether the
class-conditional (target vs rest) spread of R behaves the same way, as a
complementary, non-regression check on the same claim. The other suggested
next step -- extending to k=11 -- is still blocked: a fresh `JOURNAL_API`
pull this cycle shows 747 total events, still **zero** real k=11
`SIEVE_LAYER_DONE` points and no new k=13 point past p=233 (still n=10,
unchanged since cycle 41). So this cycle does the same-data complementary
check cycle 42 proposed.

## Method

Built `tools/class_std_check.py` on top of the surviving
`margin_by_class_k.py` walk tool. For K=8 over [47,242) and K=10 over
[127,312), n_samples=100, it splits the R column by `is_target`
(p % (K+1) == K) and computes, per class: mean, population std. Then two
derived quantities:
- `std_target` and `std_rest` separately (does narrowing with k happen in
  both classes, or just one?)
- the class-mean gap `mean_rest - mean_target`, both raw and divided by
  `std_all` (a Cohen's-d-style standardized effect size for the class
  separation -- independent of cycle 42's regression coefficient).
Reran across seeds 42, 7, 99 to check stability.

## Results

| seed | k | std_target | std_rest | std_all | gap (raw) | gap/std_all |
|---|---|---|---|---|---|---|
| 42 | 8  | 0.0356 | 0.0850 | 0.0834 | 0.0738 | 0.885 |
| 42 | 10 | 0.0294 | 0.0581 | 0.0582 | 0.0550 | 0.945 |
| 7  | 8  | 0.0318 | 0.0852 | 0.0832 | 0.0725 | 0.872 |
| 7  | 10 | 0.0371 | 0.0583 | 0.0593 | 0.0572 | 0.965 |
| 99 | 8  | 0.0449 | 0.0905 | 0.0880 | 0.0677 | 0.769 |
| 99 | 10 | 0.0362 | 0.0586 | 0.0592 | 0.0547 | 0.924 |

`n_target` is only 7 (k=8) or 5 (k=10) primes in these ranges -- `std_rest`
(n=29-32) tracks `std_all` closely and narrows ~1.46-1.54x from k=8 to k=10
in every seed, matching cycle 42's overall std(R) narrowing. `std_target`'s
narrowing ratio is noisy across seeds (1.21, 0.86, 1.24) -- with only 5-7
points per class it isn't a reliable standalone estimate, so no claim is
made about the target class's spread specifically.

The more informative number is `gap/std_all`: the raw class-mean gap
shrinks from k=8 to k=10 (mechanically, since R's whole range narrows), but
once divided by the pooled std it **grows** in all three seeds: 0.885→0.945,
0.872→0.965, 0.769→0.924 (ratios 1.07-1.20x).

## Reading

This is a genuinely different metric from cycle 42's regression coefficient
-- no regression at all, just a class-mean separation expressed in units of
pooled standard deviation, the same idea as Cohen's d. It confirms the same
direction cycle 42 found (target-vs-rest separation grows relative to R's
own spread as k rises from 8 to 10), from an independent angle, across all
three seeds. The magnitude here (1.07-1.20x) is notably smaller than
cycle 42's standardized beta growth (1.4-1.8x) -- consistent with the class
label being only one part of what R's coefficient captures (cycle 41 showed
R carries information beyond `is_target`), so the class-only view should
show a smaller effect than the full regression. Still weak-to-moderate
evidence: only two adjacent k values, walk-simulated R, tiny target-class
sample sizes (5-7 points).

## Next

- Still blocked on real k=11 data for a true 3rd point on this trend --
  check `JOURNAL_API` fresh next cycle before repeating any k=8/k=10-only
  analysis.
- The target class's std ratio was too noisy to read (n=5-7) -- if a wider
  prime range or larger n_samples is cheap enough within the 30-minute
  budget, redo `class_std_check.py` at K=8/K=10 over a bigger [lo,hi) to
  get more target-class points and see if that ratio stabilizes.
- Keep polling for k=13 growth past n=10 (stuck since p=233, cycle 41).
