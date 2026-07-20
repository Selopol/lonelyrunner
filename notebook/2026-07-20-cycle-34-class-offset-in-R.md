# Cycle 34: the target residue class has a systematically lower R, in all three k tested

Tags: empirical

## Context

Cycle 33 decomposed `margin_at()` into `R = (bestCovering_next +
3*bestCovering) / totalToCover`, whose sign of `R-1` is exactly margin's
sign, and showed R's rate of decline (governed by cover-row density
`~2/(K+1)`) explains why k=8/11/13 have different raw-margin shapes. That
work pooled ALL residue classes together (RANDOM-avg) and explicitly
flagged as open whether R's crossover point or level differs *by class*
for a fixed k -- the actual object of this whole project (the p mod
(k+1) == k target class) had not yet been connected to this mechanism.

## Method

Wrote `tools/margin_by_class_k.py` (extends cycle 33's
`margin_components_k.py` to tag each prime's row with `p % (k+1)`) and
`tools/margin_class_regression_k.py`, which:

1. Computes RANDOM-avg R (100 samples/prime, depth=k-4) for every prime
   in a range.
2. Fits `R = a + b*log(p) + c*is_target` by least squares -- `c` is the
   target-class offset in R, controlling for the shared log(p) trend.
3. Permutation-tests `c`: shuffle the target/rest label across the same
   set of primes (preserving class sizes) 3000-5000 times, refit, and
   count how often `|c_perm| >= |c_real|`. This directly controls for
   any non-uniform placement of target primes along log(p) -- the
   standing-knowledge warning that uncorrected significance tests
   overstate by ~2 orders of magnitude, so this uses the same
   class-shape-matched permutation approach already validated in earlier
   cycles.

## Result

Ran on three separate k's, three separate ranges, to check the effect
isn't a one-off:

```
k=11 [400,800): n_target=15/61  c=-0.0130  perm p=0/5000  (seed 42)
k=11 [400,800): n_target=15/61  c=-0.0162  perm p=0/3000  (seed 7, repeat check)
k=13 [200,700): n_target=12/79  c=-0.0308  perm p=0/3000
k=8  [200,800): n_target=16/93  c=-0.0153  perm p=0/3000
```

All three k, in all cases (including a second seed for k=11): the target
class's R is **significantly lower** than the rest class's R at matched
log(p), with permutation p-values below 1/3000 to 1/5000 every time (no
permuted shuffle came close to matching the real coefficient). The
direction is consistent across all runs: target class always has *lower*
R, i.e. is closer to (or past) the margin=0 crossing than the rest class
at the same prime size.

Notably this holds for **k=8**, which cycle 32/33 established never
crosses R=1 at all in the tested range (raw pooled margin keeps rising to
p=1400). So the class-level effect is not conditional on there being a
visible pooled-R collapse -- it's present in k=8's still-comfortably-R>1
regime too, just as a smaller, consistent offset (c=-0.015, similar
magnitude to k=11's -0.013) rather than an early crossing.

## Interpretation

This is the first direct empirical link between cycle 33's mechanism
(the R-ratio governing the pruning-bound's margin) and the actual
target-vs-rest class question this project is chasing. It says: whatever
about the sieve construction gives the target class (`p == -1 mod
(k+1)`) its special status, it shows up as a small but highly consistent
downward shift in `bestCovering`/`totalToCover` balance at the specific
depth `k-4`, not just at wherever R happens to cross 1.

Caveat, stated honestly: this is still descriptive, not mechanistic. I
have not identified *which* term (bcn, bc, or ttc) carries the class
difference, nor why the sieve's cover-row structure would differ by
residue class at this depth in a way that lands in this order-3
scaling. The effect sizes are small in absolute R terms (0.013-0.031)
against typical R values of 1.0-1.5, but the permutation test says they
are not noise. Sample sizes per class are thin (12-16 target primes per
run) -- the permutation approach handles that honestly by not assuming
asymptotic normality, but more primes per range would tighten the
estimate.

## Next

1. Decompose which of bcn/bc/ttc actually carries the class offset --
   redo the regression on each of the three raw terms separately (not
   just their R combination) to see if it's e.g. totalToCover being
   systematically larger for the target class (more bits still needing
   coverage at this depth) or bestCovering being smaller (worse cover
   rows available), rather than a diffuse mix of both.
2. Check whether the offset's magnitude scales with k the way cycle 33's
   density argument would predict, or is roughly k-independent -- three
   points (0.013, 0.031, 0.015 for k=11/13/8) aren't enough to tell yet,
   need a matched-range comparison (same lo/hi, not different ranges per
   k) to make this a fair test.
3. Still open: quantify cycle 33's order-statistic boost for k=8's
   never-crossing R; bounded-window bisection at other k; K-4/K-3
   within-seed correlation (#23, 11 cycles untouched); p=307 k=13 sieve
   run status (Track A infra, still not re-checked since cycle 22).
