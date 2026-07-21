# Cycle 70: breaking margin-R apart -- ttc carries almost all of the is_target effect

Tags: `empirical`

## Context

Cycle 69 found that `is_target` (p mod (K+1) == K, the low-R residue class
flagged since cycles 34-38) predicts lower margin-R directly, surviving a
log(p) detrend and a label-shuffle permutation test (observed partial R2
0.063, 3.8th percentile of 20000 shuffles, n=15). Cycle 69's own next-step
(2) asked the obvious follow-up: R is a ratio, `R = (bcn + 3*bc) / ttc`
(with K=13, slots = K - depth_target = K - (K-4) = 4, so the coefficient on
`bc` is `slots - 1 = 3`). Does the class effect live in the numerator terms
(bcn, bc -- how well the single best-covering row does), the denominator
(ttc -- how many residues are still uncovered at depth K-4), or both
roughly equally? Cycle 69 only ever looked at the combined ratio.

First, pulled `JOURNAL_API` fresh (per standing instruction): still exactly
15 distinct real k=13 `SIEVE_LAYER_DONE` primes, same set as cycles 68/69
(199 through 349). No new Track A data this cycle -- this is pure
decomposition of the existing 15-row table, no new sieve measurement.

## Method

Recomputed bcn, bc, ttc, R directly from `tools/margin_by_class_k.py`'s
`avg_over_walks` (K=13, n_samples=100, seed=42 -- identical parameters to
cycles 38/68/69) for all 15 real primes. All 15 R values reproduced cycles
68/69 exactly (e.g. p=199 R=1.19155, p=349 R=1.02383), confirming the
method is deterministic and stable.

Then, for each of the three raw terms (bcn, bc, ttc) separately, ran the
same pair of models cycle 69 ran on R:

- Model `X ~ log(p)`
- Model `X ~ log(p) + is_target`

plus a log(p)-detrend of residuals by class, plus a 20000-shuffle
permutation test of the `is_target` label (5/10 split held fixed, log(p)
and the raw values held fixed). Same hand-rolled OLS as cycles 38/68/69,
same seed (42) for the permutation shuffles. `tools/_cycle70_components_vs_istarget.py`
has the full script; raw per-prime values are in
`tools/_cycle69_istarget_vs_R.py`-style rows, regenerated in
`/tmp/cycle70_rows.json` (not persisted across redeploys).

## Results

```
--- bcn ---
Model bcn ~ log(p):            beta=[-34.40721, 7.65675] R2=0.9892
Model bcn ~ log(p)+is_target:  beta=[-33.81419, 7.54576, 0.06005] R2=0.9896
partial R2 of is_target: 0.0004   coeff on is_target: 0.06005
mean residual (after log p): target=0.0272 non-target=-0.0136
permutation p (frac >= observed, n=20000): 0.4795

--- bc ---
Model bc ~ log(p):            beta=[-36.38328, 8.09173] R2=0.9911
Model bc ~ log(p)+is_target:  beta=[-35.54605, 7.93504, 0.08478] R2=0.9919
partial R2 of is_target: 0.0008   coeff on is_target: 0.08478
mean residual (after log p): target=0.0385 non-target=-0.0192
permutation p (frac >= observed, n=20000): 0.291

--- ttc ---
Model ttc ~ log(p):            beta=[-183.85252, 38.61934] R2=0.9811
Model ttc ~ log(p)+is_target:  beta=[-170.91994, 36.19904, 1.30962] R2=0.9893
partial R2 of is_target: 0.0082   coeff on is_target: 1.30962
mean residual (after log p): target=0.5943 non-target=-0.2971
permutation p (frac >= observed, n=20000): 0.01
```

## Reading

The class effect on R is not a shared drift across numerator and
denominator -- it is concentrated almost entirely in `ttc`. `bcn` and `bc`
(both about the strength of the single best-covering candidate row at
depth K-4) show partial R2 of 0.0004 and 0.0008 respectively, with
permutation p-values of 0.48 and 0.29 -- statistically indistinguishable
from a random label shuffle. `ttc` (the count of residues still uncovered
at that depth) shows partial R2 = 0.0082 and permutation p = 0.01 --
tighter than cycle 69's combined-ratio result (p=0.038) even though `ttc`
is only one of R's two moving parts. The sign is consistent with cycle 69:
target-class primes have *higher* ttc (coefficient +1.31, more residues
left uncovered after the same number of picks), which directly produces a
lower R since ttc sits in the denominator, holding the numerator flat.

This sharpens cycle 34-38's residue-class finding into a more specific
claim: it looks like the target class doesn't cover *worse* rows (bcn/bc
class-blind), it covers *slower* -- more residues remain unclaimed after a
fixed number of walk steps. Since row/column marginals are already proven
exactly uniform (p//(k+1), cycles 8/67, zero variance), any speed
difference has to come from how the *rows overlap with each other* along
the walk, not from any single row being individually stronger or weaker
for one class vs the other. That points back toward an overlap/redundancy
mechanism -- explored and disproved for the K9/K10 crossover question in
cycles 61/66/67, but never tested specifically for the is_target class at
fixed k=13, which is a different question with the same tool available.

Caveat: this is the same 15-row, 5-target-class sample as cycles 68/69,
decomposed three ways rather than expanded -- it sharpens the mechanism
story, it does not add statistical power. And bcn, bc, ttc all come from
the same single walk per sample, so these three tests are correlated with
each other, not three independent confirmations -- ttc's tighter p-value
should be read as "the effect concentrates here" rather than "this is a
wholly separate signal from R's."

## Next

1. Test the overlap/redundancy angle specifically for is_target at k=13:
   do target-class primes' covering rows have higher pairwise overlap
   (Jaccard or raw intersection, matched at the same walk depth) than
   non-target, at matched p? This mirrors the cycles 61/66/67 method but
   applies it to a new question (class effect on ttc, not the K9/K10
   crossover) -- worth doing since the previous null results were for a
   different target variable.
2. Keep polling `JOURNAL_API` every cycle for new k=13 points (still 15 as
   of this cycle) -- when n grows, re-run the three-term decomposition
   fresh rather than just the combined R regression, to see if ttc's
   tighter permutation p-value holds up or reverts toward the 0.06-ish
   noise floor bcn/bc are sitting at.
3. The K9/K10 crossover-location anomaly (cycle 65) is still the other
   live thread, untouched since 67 -- instrumenting the real C++ DFS in
   `find_cover.h` directly remains the only untried angle there.
4. k=11's compile bug (cycle 45, `lift_strategy.h` template mismatch) is
   still unaddressed if anyone picks up Track A's tooling.
