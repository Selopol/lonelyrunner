# Cycle 66: pairwise-Jaccard candidate-redundancy idea disproved as an explanation for the K9/K10 exponent inversion

Tags: `disproved`

## Context

Cycle 65 quantified the k9-outlier claim (crossover location ~7-11x the
k10-13 cluster's own log-spread away). That leaves the *why* question
open, and cycle 60/62's Next list named exactly one untested mechanism
candidate for the underlying raw-term inversion (K9's bc/ttc decays
toward its analytic floor with a *steeper*, more iid-extreme-value-like
exponent than K10's, despite matched-p terms otherwise being monotonic
in k -- cycles 58/59/60): pairwise Jaccard overlap / residue clustering
of the top-bc candidates at the `early_return_bound` snapshot. Cycle 61
already ruled out one candidate-structure metric (marginal variance /
"overdispersion ratio" of c_i across the whole candidate pool) -- this
cycle tests a different, more targeted metric: mutual overlap among
specifically the *top* competitors for bc/bcn, which is what actually
drives the exponent.

Checked the journal first: still 9 k=13 `SIEVE_LAYER_DONE` events, last
one still p=349 (unchanged since cycle 44/47). No new wall data this
cycle.

## Method

New script `tools/_cycle66_jaccard.py`, built on
`margin_by_class_k.py`'s `build_cover`/walk logic (unmodified). At the
depth_target snapshot (same point `early_return_bound` fires), for each
walk: compute `c_i = popcount(nextC & cover[i])` for every remaining
candidate i, take the top-10 by c_i, and compute the average pairwise
Jaccard similarity of their `(cover[i] & nextC)` bitsets.

Matched K9 (crossover ~5660, cycle 56) and K10 (crossover ~425, cycle
50) at the *same fraction of each K's own crossover* -- the method
cycle 54 validated for exponent comparisons, reused here for the same
reason (matching absolute p across different-scale k's is the
already-invalid method from cycle 49/55/61/62). Fracs tested: 0.3, 0.6,
0.9. n_samples=12 walks per (K, frac), seed=42, top_m=10.

First pass measured raw mean pairwise Jaccard only. That showed K9
consistently lower than K10 (~0.14 vs ~0.15-0.16) -- promising at
first glance, since *less* mutual overlap among top candidates would
mean less correlation, which would push K9 closer to true-iid
extreme-value behavior and could explain its steeper decay exponent.
But candidate-pool sizes differ hugely between K9 and K10 even at
matched crossover-fraction (measured `ttc` ~276-832 for K9 vs ~17-57
for K10 in this window) and Jaccard is mechanically sensitive to set
size/density regardless of any real correlation structure. So added an
analytic iid null per pair: for two sets of sizes c_a, c_b drawn
uniformly at random from a universe of size ttc, `E[Jaccard] ~=
(c_a*c_b/ttc) / (c_a + c_b - c_a*c_b/ttc)` (the standard
expected-intersection approximation; not an exact expectation of a
ratio, but adequate for a directional comparison, and applied
identically to both K's). Reported `excess = actual - null` alongside
the raw numbers.

## Results

```
K=9  frac=0.3 p=1697 n_walks=12 ttc~276 actual=0.14525 null~0.14405 excess=+0.00120
K=9  frac=0.6 p=3391 n_walks=12 ttc~549 actual=0.14014 null~0.14027 excess=-0.00013
K=9  frac=0.9 p=5099 n_walks=12 ttc~832 actual=0.13825 null~0.13869 excess=-0.00045
K=10 frac=0.3 p=127  n_walks=12 ttc~17  actual=0.16351 null~0.17051 excess=-0.00700
K=10 frac=0.6 p=257  n_walks=12 ttc~37  actual=0.15852 null~0.16110 excess=-0.00258
K=10 frac=0.9 p=383  n_walks=12 ttc~57  actual=0.15204 null~0.15115 excess=+0.00088
```

## Reading

The raw K9-vs-K10 Jaccard gap disappears once corrected for candidate
set size/density: excess is under 0.007 in magnitude for every point,
has no consistent sign (K9: +, -, - across fracs; K10: -, -, + across
fracs), and does not order K9 below or above K10 in any stable way.
What looked like a signal in the raw numbers was just the size
difference between the two K's candidate pools at these matched
windows -- not a genuine difference in mutual overlap/redundancy
structure among the top competitors.

This rules out the specific mechanism cycle 60/62 proposed: top-bc
candidate pairwise redundancy does not appear to explain why K9's
bc/ttc decays toward its floor with a steeper exponent than K10's.
Combined with cycle 61 (marginal variance/overdispersion also doesn't
explain it), that closes off both natural "candidate correlation
structure" metrics I could think of for this question. The mechanism
behind the K9/K10 raw-term inversion (and by extension, the crossover
anomaly) is still unexplained -- the project has now ruled out two
specific correlation-structure hypotheses without finding what does
explain it.

Caveats worth being honest about: the null is an approximation (ratio
of expectations, not expectation of a ratio), n_samples=12 is modest,
top_m=10 and the three fracs are somewhat arbitrary choices, and this
tests only the K9/K10 pair (not K11/K12/K13). None of those change the
core reading -- the effect size is small and inconsistent in sign,
which is a different failure mode than "noisy but directionally
consistent."

## Next

- (a) Both natural candidate-correlation-structure ideas (marginal
  variance, cycle 61; pairwise Jaccard, this cycle) are now ruled out
  for the K9/K10 inversion. No further candidate mechanism is queued.
  Worth stepping back next cycle to ask whether "correlation among
  candidates at depth_target" is the wrong level of the model
  entirely, versus something upstream (e.g. how the candidate set
  itself is built by `build_cover`, or a genuinely k-specific number-
  theoretic property of K=9's residue structure at K+1=10).
- (b) Still watching for a new real k=13 `SIEVE_LAYER_DONE` point (none
  since p=349, checked again this cycle, still 9 total events) and
  k=11's compile bug (cycle 45, unaddressed).
- (c) `tools/_cycle66_jaccard.py` and `tools/tmp_outlier_stat.py`
  (cycle 65) are throwaway analysis scripts, not pipeline additions --
  fine to leave.
