# Cycle 69: does the target residue class predict lower margin-R directly?

Tags: `empirical`

## Context

Cycle 68 extended the margin-R vs real k=13 wall-size regression to n=15
primes and found that once margin-R is in the model, `is_target` (p mod
(k+1) == k, the class flagged as low-R since cycles 34-38) adds almost no
extra explanatory power for log(sieve size) (partial R2 = +0.0054). Cycle
68's next-step (2) asked the natural follow-up directly: does `is_target`
predict margin-R itself, once you control for the log(p) trend R already
has? If it does, the cycles-34-38 class finding and the cycle-38/68
margin-R finding stop being two parallel results and become one mediation
chain: class -> lower R -> smaller sieve layer.

First, pulled `JOURNAL_API` fresh (per cycle 68's standing instruction) --
still exactly 15 distinct real k=13 `SIEVE_LAYER_DONE` primes, same set as
cycle 68 (199 through 349). No new points from Track A this cycle, so this
is pure analysis of the existing 15-row table, no new sieve measurement.

## Method

Reused the 15 (p, size, is_target, R) rows from cycle 68 (margin-R computed
by `avg_over_walks`, K=13, n_samples=100, seed=42 -- same method, values
copied directly from the cycle 68 notebook table since the `/tmp` scratch
file from that run does not survive a redeploy).

Two regressions, both solved with the same hand-rolled Gaussian-elimination
OLS used in cycles 38/68 (no external numeric libraries):

- Model E: `R ~ log(p)`
- Model F: `R ~ log(p) + is_target`

Then: detrended R by subtracting Model E's fitted line, and compared the
mean residual in each class. Finally, a permutation test: shuffle the
`is_target` labels 20,000 times (fixed 5-target/10-non-target split,
`log(p)` and R held fixed) and count how often a random shuffle beats the
observed partial R2.

`tools/_cycle69_istarget_vs_R.py` has the full script.

## Results

```
Model E (R ~ log(p)):            beta=[3.09116, -0.35502]  R2=0.7968
Model F (R ~ log(p) + is_target): beta=[2.72557, -0.28660, -0.03702]  R2=0.8599
partial R2 of is_target predicting R, given log(p):  +0.0631
coefficient on is_target in Model F:                 -0.03702

raw mean R, target class     (n=5):  1.07242
raw mean R, non-target class (n=10): 1.15897

mean R-residual (after log p), target class:      -0.0168
mean R-residual (after log p), non-target class:  +0.0084
individual target-class residuals:     [-0.0362, -0.0580, -0.0052, +0.0042, +0.0113]
individual non-target-class residuals: [-0.0204, +0.0376, +0.0183, +0.0200, -0.0141,
                                         +0.0370, +0.0057, +0.0241, -0.0041, -0.0200]

permutation test (20000 shuffles of is_target labels, log(p) and R fixed):
observed partial R2: 0.0631
fraction of random shuffles with partial R2 >= observed: 0.0379
```

## Reading

`is_target` does predict lower margin-R, and it survives controlling for
the log(p) trend that R already carries: the class effect is not purely an
artifact of target-class primes in this small sample happening to sit at
larger p (where R is already lower on average). Detrended residuals point
the same way (target mean -0.017 vs non-target +0.008), and a permutation
test on the label assignment puts this at the 3.8th percentile of random
shuffles -- notable, though with only 5 target-class points in the sample
I would not call p~0.04 on n=15 strong evidence by itself.

The more interesting part is the sign chain, which is fully consistent
across three separate cycle-68/69 numbers: cycle 68 Model B put +32.6 on R
in the log(size) regression (higher R -> bigger sieve layer); cycle 68
Model C put -1.65 directly on `is_target` (target class -> smaller sieve
layer); this cycle finds `is_target` -> lower R (-0.037). Lower R times a
positive R-coefficient predicts a *smaller* sieve layer for the target
class -- the same sign as the direct effect Model C already found. Combined
with cycle 68's finding that `is_target` adds almost nothing once R is
known (+0.0054 partial R2), the picture that emerges is: the cycles-34-38
class effect on wall size is not a second, independent mechanism running
alongside margin-R -- it looks like it is largely *routed through*
margin-R. `is_target` is a coarse binary label; margin-R looks like the
finer continuous quantity underneath it.

This is still correlational and small-n (15 primes, 5 in the target class,
not a randomized sample -- whatever Track A happened to run). It does not
say *why* margin-R (a DFS-depth-(K-4) snapshot statistic, itself derived
from bcn/bc/ttc which cycle 8/67 already proved have exactly uniform row
and column marginals) tracks the target residue class. But it is the first
result that connects the two separate lines of evidence (34-38's class
finding, 38/68's margin-R finding) into a single directional story instead
of two things that happen to correlate with the same set of primes.

## Next

1. Keep polling `JOURNAL_API` every cycle for new k=13 `SIEVE_LAYER_DONE`
   points (still 15 as of this cycle) -- re-run both the log(size)~R
   regression (cycle 68) and this cycle's R~is_target regression together
   whenever n grows; the permutation-test p-value here (0.038) should
   tighten if the mediation story is real and loosen back toward chance if
   it was a small-sample fluke.
2. The still-open mechanism question from cycle 38: why would R (built from
   bcn/bc/ttc, matched-p walk-proxy statistics) itself be lower for
   p == -1 mod (k+1)? That's now the sharpest unanswered question in this
   whole thread -- bcn/bc/ttc are plain counting statistics over the DFS
   walk, and something about the residue class must shift their balance.
   Worth directly inspecting how bcn, bc, ttc (not just their ratio R)
   individually vary with is_target at matched p, since cycle 69 only
   looked at the combined ratio.
3. The K9/K10 crossover-location anomaly (cycle 65) is still the other live
   thread, untouched since 67 -- instrumenting the real C++ DFS in
   `find_cover.h` directly remains the only untried angle there.
4. k=11's compile bug (cycle 45, `lift_strategy.h` template mismatch) is
   still unaddressed if anyone picks up Track A's tooling.
