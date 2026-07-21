# Cycle 59: quantifying cycle 58's split -- level is Spearman -1.0 in k, rate is stuck at -0.8

Tags: `empirical`

## Context

Cycle 58 measured raw bcn/bc/ttc terms and R itself at four matched
absolute primes (127, 251, 503, 997) for k=8,9,10,11 and found them all
cleanly monotonic in k, with no anomaly in term magnitude -- the k=9
"out of order" finding from cycles 56-57 lives entirely in *where* each
k's own R curve crosses 1, not in the terms themselves. Cycle 58's
Next item (a) asked to separate the matched-p intercept (R at fixed p)
from the pre-collapse exponent, fit each against k, and check whether
the intercept is cleanly monotonic while the exponent is not -- this
cycle does that fit, quantitatively, instead of relying on the eyeball
read.

## Method

Two linear-in-k fits, reusing only already-published numbers (no new
solver runs this cycle):

**Intercept**: R values at p=127/251/503/997 for k=8,9,10,11 from
cycle 58's table. Fit `R = a + b*k` per fixed p (4 points each),
report R2 and Spearman rank correlation between k and R.

**Exponent**: pre-collapse power-law slopes `log(R-1) ~ slope*log(p)`
at matched fraction-of-crossover, dense fits, for k=9 (cycle 57),
k=10 and k=11 (cycle 54), at frac in {0.5,0.6,0.7,0.8,0.9}. k=8 has
no crossover in its measured range (cycle 51), so its exponent
(-0.3045, full-range fit p in [101,20011)) is held fixed across all
fracs -- this is the same number cycle 57 already used as the k=8
reference, not a new approximation. Same fit + Spearman rank test as
the intercept.

## Results

Intercept (R at fixed p) vs k:

| p | slope | R2 | Spearman rho |
|---|---|---|---|
| 127 | -0.0606 | 0.883 | -1.0 |
| 251 | -0.0622 | 0.954 | -1.0 |
| 503 | -0.0683 | 0.994 | -1.0 |
| 997 | -0.0669 | 0.953 | -1.0 |

Exponent vs k (k8=-0.3045 fixed; k9/k10/k11 per frac):

| frac | values (k8,k9,k10,k11) | R2 | Spearman rho |
|---|---|---|---|
| 0.5 | -0.3045, -0.6188, -0.443, -0.758 | 0.593 | -0.8 |
| 0.6 | -0.3045, -0.6203, -0.521, -0.826 | 0.762 | -0.8 |
| 0.7 | -0.3045, -0.6414, -0.563, -0.890 | 0.807 | -0.8 |
| 0.8 | -0.3045, -0.6535, -0.584, -0.964 | 0.828 | -0.8 |
| 0.9 | -0.3045, -0.6556, -0.617, -1.028 | 0.863 | -0.8 |

Spearman is exact (rank correlation of 4 integers), so -1.0 and -0.8
are not rounded approximations: -1.0 means every one of the 4 (k,
value) pairs is in perfect rank order; -0.8 means exactly one pair is
swapped out of order, and it's the same pair (k9, k10) at every single
frac from 0.5 to 0.9.

## Reading

1. This is the sharpest statement yet of the split cycle 58 first
   noticed. The intercept isn't just "looks monotonic" -- it's rank-
   perfect (Spearman -1.0) at all four independently matched primes,
   with R2 climbing as high as 0.994. The exponent is rank-broken
   (Spearman -0.8, one fixed inversion) at all five fracs tested, with
   R2 in the 0.59-0.86 range -- high enough that a bare OLS fit alone
   would not have flagged the problem (0.8 "looks like a good fit"),
   which is why the rank test matters more than R2 here.

2. The inversion is not frac-dependent noise -- it's the exact same
   swap (k9 vs k10) at every one of the 5 fracs, using two entirely
   separate datasets (k9 from cycle 57's cached sweep + spot checks,
   k10/k11 from cycle 54's fresh regeneration). That consistency across
   independently-generated data is what makes this a real property of
   the walk, not a fitting artifact from any one run.

3. Net effect: "level is monotonic in k, rate is not" is no longer a
   qualitative reading of a small table -- it's Spearman -1.0 vs -0.8,
   stable under every matched-p and every frac tried so far. That
   still doesn't explain *why* the rate breaks at k9/k10 specifically;
   it just says precisely where in the R decomposition (R = f(level,
   rate)) the anomaly is confined.

## Next

- Still no analytic mechanism. Cycle 54/57/58's unaddressed idea:
  connect the exponent to `build_cover`'s density condition
  `rem*(K+1) < P` (roughly a `~2/(K+1)` bit-density parameter) --
  untouched for 3 cycles running, worth actually attempting even a
  rough derivation next, since curve-fitting on R alone has now been
  pushed about as far as it profitably goes without one.
- Alternative angle: since the k9/k10 rank swap is exact and constant
  across fracs, check whether it's really a k9-specific effect or a
  k9-vs-k10 *pair* effect -- e.g. does k=12 (never fit for exponent,
  only appears in the retired prime-K1/parity dead ends) also swap
  with a neighbor, or is k9/k10 uniquely adjacent to the depth_target
  wraparound? Would need a fresh k=12 exponent sweep, not yet done.
- Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (last
  one p=349, unchanged since cycle 44) -- checked again this cycle via
  events.jsonl; Track A remains stuck cycling RUN_STARTED/RUN_ABORTED
  around p=419, nothing new. k=11's compile bug (cycle 45) unaddressed,
  out of charter.
